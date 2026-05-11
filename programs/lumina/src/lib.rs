use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("LUMiNAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

// ─── Constants ────────────────────────────────────────────────────────────────

/// Basis-point fee retained by the marketplace on each inference (5 %).
const MARKETPLACE_FEE_BPS: u64 = 500;
/// Minimum stake (in raw LUMINA tokens) a creator must lock to list a model.
const MIN_STAKE_AMOUNT: u64 = 1_000_000_000; // 1 LUMINA (9 decimals)
/// Maximum length of on-chain string fields.
const MAX_NAME_LEN: usize = 64;
const MAX_DESC_LEN: usize = 256;
const MAX_URI_LEN: usize = 128;

// ─── Program ──────────────────────────────────────────────────────────────────

#[program]
pub mod lumina {
    use super::*;

    // ── Admin ──────────────────────────────────────────────────────────────

    /// One-time initialisation of the global marketplace state.
    pub fn initialize_marketplace(
        ctx: Context<InitializeMarketplace>,
        fee_bps: u64,
    ) -> Result<()> {
        require!(fee_bps <= 10_000, LuminaError::InvalidFeeBps);

        let state = &mut ctx.accounts.marketplace_state;
        state.admin = ctx.accounts.admin.key();
        state.lumina_mint = ctx.accounts.lumina_mint.key();
        state.treasury = ctx.accounts.treasury.key();
        state.fee_bps = fee_bps;
        state.total_models = 0;
        state.total_inferences = 0;
        state.total_volume = 0;
        state.bump = ctx.bumps.marketplace_state;

        emit!(MarketplaceInitialized {
            admin: state.admin,
            lumina_mint: state.lumina_mint,
            fee_bps,
        });
        Ok(())
    }

    // ── Creator ────────────────────────────────────────────────────────────

    /// Register a new AI model. Creator must stake ≥ MIN_STAKE_AMOUNT tokens.
    pub fn register_model(
        ctx: Context<RegisterModel>,
        name: String,
        description: String,
        api_endpoint_uri: String,
        price_per_inference: u64,
        stake_amount: u64,
    ) -> Result<()> {
        require!(name.len() <= MAX_NAME_LEN, LuminaError::NameTooLong);
        require!(description.len() <= MAX_DESC_LEN, LuminaError::DescriptionTooLong);
        require!(api_endpoint_uri.len() <= MAX_URI_LEN, LuminaError::UriTooLong);
        require!(price_per_inference > 0, LuminaError::ZeroPrice);
        require!(stake_amount >= MIN_STAKE_AMOUNT, LuminaError::InsufficientStake);

        // Transfer stake from creator → model's stake vault.
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.creator_token_account.to_account_info(),
                    to: ctx.accounts.stake_vault.to_account_info(),
                    authority: ctx.accounts.creator.to_account_info(),
                },
            ),
            stake_amount,
        )?;

        let model = &mut ctx.accounts.model_listing;
        model.creator = ctx.accounts.creator.key();
        model.name = name.clone();
        model.description = description;
        model.api_endpoint_uri = api_endpoint_uri;
        model.price_per_inference = price_per_inference;
        model.staked_amount = stake_amount;
        model.total_inferences = 0;
        model.total_earnings = 0;
        model.is_active = true;
        model.created_at = Clock::get()?.unix_timestamp;
        model.bump = ctx.bumps.model_listing;
        model.stake_vault_bump = ctx.bumps.stake_vault;

        let state = &mut ctx.accounts.marketplace_state;
        state.total_models = state.total_models.checked_add(1).unwrap();

        emit!(ModelRegistered {
            model: ctx.accounts.model_listing.key(),
            creator: ctx.accounts.creator.key(),
            name,
            price_per_inference,
            stake_amount,
        });
        Ok(())
    }

    /// Creator deactivates their model and reclaims their stake.
    pub fn unregister_model(ctx: Context<UnregisterModel>) -> Result<()> {
        let model = &mut ctx.accounts.model_listing;
        require!(model.is_active, LuminaError::ModelNotActive);

        model.is_active = false;
        let stake = model.staked_amount;
        model.staked_amount = 0;

        // Release stake from vault → creator.
        let creator_key = model.creator;
        let seeds: &[&[u8]] = &[
            b"stake_vault",
            creator_key.as_ref(),
            ctx.accounts.model_listing.key().as_ref(),
            &[ctx.accounts.model_listing.stake_vault_bump],
        ];
        let signer = &[seeds];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.stake_vault.to_account_info(),
                    to: ctx.accounts.creator_token_account.to_account_info(),
                    authority: ctx.accounts.stake_vault.to_account_info(),
                },
                signer,
            ),
            stake,
        )?;

        let state = &mut ctx.accounts.marketplace_state;
        state.total_models = state.total_models.saturating_sub(1);

        emit!(ModelUnregistered {
            model: ctx.accounts.model_listing.key(),
            creator: ctx.accounts.creator.key(),
        });
        Ok(())
    }

    // ── User / Inference ───────────────────────────────────────────────────

    /// User opens an escrow for exactly one inference call.
    /// Tokens are locked; the backend validates payment before routing the request.
    pub fn request_inference(ctx: Context<RequestInference>) -> Result<()> {
        let model = &ctx.accounts.model_listing;
        require!(model.is_active, LuminaError::ModelNotActive);

        let price = model.price_per_inference;

        // Transfer price from user → escrow.
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.escrow_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            price,
        )?;

        let escrow = &mut ctx.accounts.inference_escrow;
        escrow.user = ctx.accounts.user.key();
        escrow.model = ctx.accounts.model_listing.key();
        escrow.creator = model.creator;
        escrow.amount = price;
        escrow.requested_at = Clock::get()?.unix_timestamp;
        escrow.is_fulfilled = false;
        escrow.bump = ctx.bumps.inference_escrow;
        escrow.vault_bump = ctx.bumps.escrow_vault;

        emit!(InferenceRequested {
            escrow: ctx.accounts.inference_escrow.key(),
            user: ctx.accounts.user.key(),
            model: ctx.accounts.model_listing.key(),
            amount: price,
        });
        Ok(())
    }

    /// Called by the oracle/backend after inference completes successfully.
    /// Distributes: fee → treasury, remainder → creator.
    pub fn complete_inference(ctx: Context<CompleteInference>) -> Result<()> {
        let escrow = &mut ctx.accounts.inference_escrow;
        require!(!escrow.is_fulfilled, LuminaError::AlreadyFulfilled);

        let amount = escrow.amount;
        let fee = amount
            .checked_mul(ctx.accounts.marketplace_state.fee_bps)
            .unwrap()
            .checked_div(10_000)
            .unwrap();
        let creator_share = amount.checked_sub(fee).unwrap();

        let escrow_key = escrow.key();
        let seeds: &[&[u8]] = &[
            b"escrow_vault",
            escrow_key.as_ref(),
            &[escrow.vault_bump],
        ];
        let signer = &[seeds];

        // Fee → treasury.
        if fee > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.escrow_vault.to_account_info(),
                        to: ctx.accounts.treasury.to_account_info(),
                        authority: ctx.accounts.escrow_vault.to_account_info(),
                    },
                    signer,
                ),
                fee,
            )?;
        }

        // Creator share → creator's token account.
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.creator_token_account.to_account_info(),
                    authority: ctx.accounts.escrow_vault.to_account_info(),
                },
                signer,
            ),
            creator_share,
        )?;

        escrow.is_fulfilled = true;

        let model = &mut ctx.accounts.model_listing;
        model.total_inferences = model.total_inferences.checked_add(1).unwrap();
        model.total_earnings = model.total_earnings.checked_add(creator_share).unwrap();

        let state = &mut ctx.accounts.marketplace_state;
        state.total_inferences = state.total_inferences.checked_add(1).unwrap();
        state.total_volume = state.total_volume.checked_add(amount).unwrap();

        emit!(InferenceCompleted {
            escrow: ctx.accounts.inference_escrow.key(),
            model: ctx.accounts.model_listing.key(),
            creator: escrow.creator,
            creator_share,
            fee,
        });
        Ok(())
    }

    /// Refunds the user if the oracle never fulfilled within a timeout window.
    pub fn refund_inference(ctx: Context<RefundInference>) -> Result<()> {
        let escrow = &mut ctx.accounts.inference_escrow;
        require!(!escrow.is_fulfilled, LuminaError::AlreadyFulfilled);

        let now = Clock::get()?.unix_timestamp;
        // Allow refund after 60 seconds of inactivity.
        require!(
            now - escrow.requested_at > 60,
            LuminaError::RefundTooEarly
        );

        let amount = escrow.amount;
        let escrow_key = escrow.key();
        let seeds: &[&[u8]] = &[
            b"escrow_vault",
            escrow_key.as_ref(),
            &[escrow.vault_bump],
        ];
        let signer = &[seeds];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.escrow_vault.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        escrow.is_fulfilled = true; // mark consumed so it can't be replayed
        Ok(())
    }

    /// Update a model's price (creator only).
    pub fn update_model_price(
        ctx: Context<UpdateModelPrice>,
        new_price: u64,
    ) -> Result<()> {
        require!(new_price > 0, LuminaError::ZeroPrice);
        ctx.accounts.model_listing.price_per_inference = new_price;
        Ok(())
    }

    /// Top up a model's stake (e.g. if minimum was raised).
    pub fn add_stake(ctx: Context<AddStake>, amount: u64) -> Result<()> {
        require!(amount > 0, LuminaError::ZeroPrice);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.creator_token_account.to_account_info(),
                    to: ctx.accounts.stake_vault.to_account_info(),
                    authority: ctx.accounts.creator.to_account_info(),
                },
            ),
            amount,
        )?;

        ctx.accounts.model_listing.staked_amount = ctx
            .accounts
            .model_listing
            .staked_amount
            .checked_add(amount)
            .unwrap();
        Ok(())
    }
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeMarketplace<'info> {
    #[account(
        init,
        payer = admin,
        space = MarketplaceState::LEN,
        seeds = [b"marketplace"],
        bump
    )]
    pub marketplace_state: Account<'info, MarketplaceState>,

    pub lumina_mint: Account<'info, Mint>,

    /// CHECK: treasury is a validated token account; created off-chain.
    pub treasury: AccountInfo<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct RegisterModel<'info> {
    #[account(
        init,
        payer = creator,
        space = ModelListing::LEN,
        seeds = [b"model", creator.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub model_listing: Account<'info, ModelListing>,

    /// Stake vault PDA — holds creator's locked tokens.
    #[account(
        init,
        payer = creator,
        token::mint = lumina_mint,
        token::authority = stake_vault,
        seeds = [b"stake_vault", creator.key().as_ref(), model_listing.key().as_ref()],
        bump
    )]
    pub stake_vault: Account<'info, TokenAccount>,

    #[account(mut, seeds = [b"marketplace"], bump = marketplace_state.bump)]
    pub marketplace_state: Account<'info, MarketplaceState>,

    pub lumina_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = lumina_mint,
        associated_token::authority = creator
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UnregisterModel<'info> {
    #[account(mut, has_one = creator, seeds = [b"model", creator.key().as_ref(), model_listing.name.as_bytes()], bump = model_listing.bump)]
    pub model_listing: Account<'info, ModelListing>,

    #[account(
        mut,
        seeds = [b"stake_vault", creator.key().as_ref(), model_listing.key().as_ref()],
        bump = model_listing.stake_vault_bump
    )]
    pub stake_vault: Account<'info, TokenAccount>,

    #[account(mut, seeds = [b"marketplace"], bump = marketplace_state.bump)]
    pub marketplace_state: Account<'info, MarketplaceState>,

    #[account(
        mut,
        associated_token::mint = lumina_mint,
        associated_token::authority = creator
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    pub lumina_mint: Account<'info, Mint>,
    pub creator: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestInference<'info> {
    #[account(
        init,
        payer = user,
        space = InferenceEscrow::LEN,
        seeds = [b"escrow", user.key().as_ref(), model_listing.key().as_ref(), &Clock::get().unwrap().unix_timestamp.to_le_bytes()],
        bump
    )]
    pub inference_escrow: Account<'info, InferenceEscrow>,

    /// Escrow token vault — holds payment until inference completes.
    #[account(
        init,
        payer = user,
        token::mint = lumina_mint,
        token::authority = escrow_vault,
        seeds = [b"escrow_vault", inference_escrow.key().as_ref()],
        bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(mut, constraint = model_listing.is_active @ LuminaError::ModelNotActive)]
    pub model_listing: Account<'info, ModelListing>,

    pub lumina_mint: Account<'info, Mint>,

    #[account(mut, associated_token::mint = lumina_mint, associated_token::authority = user)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CompleteInference<'info> {
    #[account(mut, has_one = model)]
    pub inference_escrow: Account<'info, InferenceEscrow>,

    #[account(
        mut,
        seeds = [b"escrow_vault", inference_escrow.key().as_ref()],
        bump = inference_escrow.vault_bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub model_listing: Account<'info, ModelListing>,

    /// CHECK: validated via model_listing.creator
    pub model: AccountInfo<'info>,

    #[account(mut, seeds = [b"marketplace"], bump = marketplace_state.bump)]
    pub marketplace_state: Account<'info, MarketplaceState>,

    #[account(mut)]
    pub treasury: Account<'info, TokenAccount>,

    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,

    pub lumina_mint: Account<'info, Mint>,

    /// Oracle / backend signer — must match marketplace_state.admin for MVP.
    #[account(constraint = oracle.key() == marketplace_state.admin @ LuminaError::Unauthorized)]
    pub oracle: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RefundInference<'info> {
    #[account(mut, has_one = user)]
    pub inference_escrow: Account<'info, InferenceEscrow>,

    #[account(
        mut,
        seeds = [b"escrow_vault", inference_escrow.key().as_ref()],
        bump = inference_escrow.vault_bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,

    pub lumina_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateModelPrice<'info> {
    #[account(mut, has_one = creator)]
    pub model_listing: Account<'info, ModelListing>,
    pub creator: Signer<'info>,
}

#[derive(Accounts)]
pub struct AddStake<'info> {
    #[account(mut, has_one = creator)]
    pub model_listing: Account<'info, ModelListing>,

    #[account(
        mut,
        seeds = [b"stake_vault", creator.key().as_ref(), model_listing.key().as_ref()],
        bump = model_listing.stake_vault_bump
    )]
    pub stake_vault: Account<'info, TokenAccount>,

    pub lumina_mint: Account<'info, Mint>,

    #[account(mut, associated_token::mint = lumina_mint, associated_token::authority = creator)]
    pub creator_token_account: Account<'info, TokenAccount>,

    pub creator: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// ─── State Accounts ────────────────────────────────────────────────────────────

#[account]
pub struct MarketplaceState {
    pub admin: Pubkey,       // 32
    pub lumina_mint: Pubkey, // 32
    pub treasury: Pubkey,    // 32
    pub fee_bps: u64,        // 8
    pub total_models: u64,   // 8
    pub total_inferences: u64, // 8
    pub total_volume: u64,   // 8
    pub bump: u8,            // 1
}

impl MarketplaceState {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 1 + 64; // +64 padding
}

#[account]
pub struct ModelListing {
    pub creator: Pubkey,              // 32
    pub name: String,                 // 4 + MAX_NAME_LEN
    pub description: String,          // 4 + MAX_DESC_LEN
    pub api_endpoint_uri: String,     // 4 + MAX_URI_LEN
    pub price_per_inference: u64,     // 8
    pub staked_amount: u64,           // 8
    pub total_inferences: u64,        // 8
    pub total_earnings: u64,          // 8
    pub is_active: bool,              // 1
    pub created_at: i64,              // 8
    pub bump: u8,                     // 1
    pub stake_vault_bump: u8,         // 1
}

impl ModelListing {
    pub const LEN: usize =
        8 + 32 + (4 + MAX_NAME_LEN) + (4 + MAX_DESC_LEN) + (4 + MAX_URI_LEN)
            + 8 + 8 + 8 + 8 + 1 + 8 + 1 + 1 + 64;
}

#[account]
pub struct InferenceEscrow {
    pub user: Pubkey,        // 32
    pub model: Pubkey,       // 32
    pub creator: Pubkey,     // 32
    pub amount: u64,         // 8
    pub requested_at: i64,   // 8
    pub is_fulfilled: bool,  // 1
    pub bump: u8,            // 1
    pub vault_bump: u8,      // 1
}

impl InferenceEscrow {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1 + 1 + 32; // +32 padding
}

// ─── Events ────────────────────────────────────────────────────────────────────

#[event]
pub struct MarketplaceInitialized {
    pub admin: Pubkey,
    pub lumina_mint: Pubkey,
    pub fee_bps: u64,
}

#[event]
pub struct ModelRegistered {
    pub model: Pubkey,
    pub creator: Pubkey,
    pub name: String,
    pub price_per_inference: u64,
    pub stake_amount: u64,
}

#[event]
pub struct ModelUnregistered {
    pub model: Pubkey,
    pub creator: Pubkey,
}

#[event]
pub struct InferenceRequested {
    pub escrow: Pubkey,
    pub user: Pubkey,
    pub model: Pubkey,
    pub amount: u64,
}

#[event]
pub struct InferenceCompleted {
    pub escrow: Pubkey,
    pub model: Pubkey,
    pub creator: Pubkey,
    pub creator_share: u64,
    pub fee: u64,
}

// ─── Errors ────────────────────────────────────────────────────────────────────

#[error_code]
pub enum LuminaError {
    #[msg("Fee basis points must be ≤ 10 000")]
    InvalidFeeBps,
    #[msg("Model name exceeds 64 characters")]
    NameTooLong,
    #[msg("Description exceeds 256 characters")]
    DescriptionTooLong,
    #[msg("API URI exceeds 128 characters")]
    UriTooLong,
    #[msg("Price must be greater than zero")]
    ZeroPrice,
    #[msg("Stake amount below minimum (1 LUMINA)")]
    InsufficientStake,
    #[msg("Model is not currently active")]
    ModelNotActive,
    #[msg("Inference already fulfilled or refunded")]
    AlreadyFulfilled,
    #[msg("Refund window not yet elapsed (60 s)")]
    RefundTooEarly,
    #[msg("Caller is not authorised to perform this action")]
    Unauthorized,
}
