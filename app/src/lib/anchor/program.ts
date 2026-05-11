import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { IDL } from "./idl";
import {
  LUMINA_PROGRAM_ID,
  LUMINA_MINT,
  MARKETPLACE_SEED,
  MODEL_SEED,
  STAKE_VAULT_SEED,
  ESCROW_SEED,
  ESCROW_VAULT_SEED,
} from "@/lib/constants";

export function getLuminaProgram(provider: AnchorProvider) {
  return new Program(IDL as never, LUMINA_PROGRAM_ID, provider);
}

// ── PDA helpers ──────────────────────────────────────────────────────────────

export async function getMarketplacePDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MARKETPLACE_SEED)],
    LUMINA_PROGRAM_ID
  );
}

export async function getModelPDA(creator: PublicKey, name: string) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MODEL_SEED), creator.toBuffer(), Buffer.from(name)],
    LUMINA_PROGRAM_ID
  );
}

export async function getStakeVaultPDA(creator: PublicKey, modelPubkey: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(STAKE_VAULT_SEED), creator.toBuffer(), modelPubkey.toBuffer()],
    LUMINA_PROGRAM_ID
  );
}

export async function getEscrowPDA(
  user: PublicKey,
  model: PublicKey,
  timestamp: number
) {
  const timestampBuf = Buffer.alloc(8);
  timestampBuf.writeBigInt64LE(BigInt(timestamp));
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ESCROW_SEED), user.toBuffer(), model.toBuffer(), timestampBuf],
    LUMINA_PROGRAM_ID
  );
}

export async function getEscrowVaultPDA(escrow: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ESCROW_VAULT_SEED), escrow.toBuffer()],
    LUMINA_PROGRAM_ID
  );
}

// ── Instruction builders ─────────────────────────────────────────────────────

export async function buildRegisterModelTx(
  provider: AnchorProvider,
  args: {
    name: string;
    description: string;
    apiEndpointUri: string;
    pricePerInference: number;
    stakeAmount: number;
  }
) {
  const program = getLuminaProgram(provider);
  const creator = provider.wallet.publicKey;

  const [modelPDA] = await getModelPDA(creator, args.name);
  const [marketplacePDA] = await getMarketplacePDA();
  const [stakeVaultPDA] = await getStakeVaultPDA(creator, modelPDA);
  const creatorATA = await getAssociatedTokenAddress(LUMINA_MINT, creator);

  return program.methods
    .registerModel(
      args.name,
      args.description,
      args.apiEndpointUri,
      new BN(args.pricePerInference),
      new BN(args.stakeAmount)
    )
    .accounts({
      modelListing: modelPDA,
      stakeVault: stakeVaultPDA,
      marketplaceState: marketplacePDA,
      luminaMint: LUMINA_MINT,
      creatorTokenAccount: creatorATA,
      creator,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .transaction();
}

export async function buildRequestInferenceTx(
  provider: AnchorProvider,
  modelPubkey: PublicKey,
  timestamp: number
) {
  const program = getLuminaProgram(provider);
  const user = provider.wallet.publicKey;

  const [escrowPDA] = await getEscrowPDA(user, modelPubkey, timestamp);
  const [escrowVaultPDA] = await getEscrowVaultPDA(escrowPDA);
  const userATA = await getAssociatedTokenAddress(LUMINA_MINT, user);

  return program.methods
    .requestInference()
    .accounts({
      inferenceEscrow: escrowPDA,
      escrowVault: escrowVaultPDA,
      modelListing: modelPubkey,
      luminaMint: LUMINA_MINT,
      userTokenAccount: userATA,
      user,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .transaction();
}
