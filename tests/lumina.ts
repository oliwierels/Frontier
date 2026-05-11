import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Lumina } from "../target/types/lumina";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { assert } from "chai";

describe("lumina", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Lumina as Program<Lumina>;
  const admin = provider.wallet as anchor.Wallet;

  let luminaMint: PublicKey;
  let treasury: PublicKey;
  let marketplacePDA: PublicKey;
  let marketplaceBump: number;

  const creator = Keypair.generate();
  const user = Keypair.generate();

  const MODEL_NAME = "TestModel-7B";
  const PRICE = new BN(10_000_000); // 0.01 LUMINA
  const STAKE = new BN(1_000_000_000); // 1 LUMINA

  before(async () => {
    // Airdrop to creator & user
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(creator.publicKey, 2e9)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user.publicKey, 2e9)
    );

    // Create LUMINA mint
    luminaMint = await createMint(
      provider.connection,
      admin.payer,
      admin.publicKey,
      null,
      9
    );

    // Treasury token account
    const treasuryKp = Keypair.generate();
    const treasuryATA = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      admin.payer,
      luminaMint,
      treasuryKp.publicKey
    );
    treasury = treasuryATA.address;

    // Marketplace PDA
    [marketplacePDA, marketplaceBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace")],
      program.programId
    );
  });

  it("initialises the marketplace", async () => {
    await program.methods
      .initializeMarketplace(new BN(500)) // 5% fee
      .accounts({
        marketplaceState: marketplacePDA,
        luminaMint,
        treasury,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const state = await program.account.marketplaceState.fetch(marketplacePDA);
    assert.equal(state.feeBps.toNumber(), 500);
    assert.equal(state.totalModels.toNumber(), 0);
    console.log("✅ Marketplace initialised");
  });

  it("registers a model with stake", async () => {
    // Mint tokens to creator
    const creatorATA = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      admin.payer,
      luminaMint,
      creator.publicKey
    );
    await mintTo(
      provider.connection,
      admin.payer,
      luminaMint,
      creatorATA.address,
      admin.payer,
      5_000_000_000 // 5 LUMINA
    );

    const [modelPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("model"), creator.publicKey.toBuffer(), Buffer.from(MODEL_NAME)],
      program.programId
    );
    const [stakeVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("stake_vault"), creator.publicKey.toBuffer(), modelPDA.toBuffer()],
      program.programId
    );

    await program.methods
      .registerModel(
        MODEL_NAME,
        "A test 7B parameter language model",
        "https://api.test.com/v1/chat",
        PRICE,
        STAKE
      )
      .accounts({
        modelListing: modelPDA,
        stakeVault: stakeVaultPDA,
        marketplaceState: marketplacePDA,
        luminaMint,
        creatorTokenAccount: creatorATA.address,
        creator: creator.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([creator])
      .rpc();

    const model = await program.account.modelListing.fetch(modelPDA);
    assert.equal(model.name, MODEL_NAME);
    assert.equal(model.pricePerInference.toNumber(), PRICE.toNumber());
    assert.equal(model.stakedAmount.toNumber(), STAKE.toNumber());
    assert.isTrue(model.isActive);
    console.log("✅ Model registered:", MODEL_NAME);
  });

  it("creates an inference escrow", async () => {
    const [modelPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("model"), creator.publicKey.toBuffer(), Buffer.from(MODEL_NAME)],
      program.programId
    );

    const userATA = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      admin.payer,
      luminaMint,
      user.publicKey
    );
    await mintTo(
      provider.connection,
      admin.payer,
      luminaMint,
      userATA.address,
      admin.payer,
      100_000_000 // 0.1 LUMINA
    );

    const timestamp = Math.floor(Date.now() / 1000);
    const tsBuf = Buffer.alloc(8);
    tsBuf.writeBigInt64LE(BigInt(timestamp));

    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), user.publicKey.toBuffer(), modelPDA.toBuffer(), tsBuf],
      program.programId
    );
    const [escrowVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow_vault"), escrowPDA.toBuffer()],
      program.programId
    );

    await program.methods
      .requestInference()
      .accounts({
        inferenceEscrow: escrowPDA,
        escrowVault: escrowVaultPDA,
        modelListing: modelPDA,
        luminaMint,
        userTokenAccount: userATA.address,
        user: user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([user])
      .rpc();

    const escrow = await program.account.inferenceEscrow.fetch(escrowPDA);
    assert.isFalse(escrow.isFulfilled);
    assert.equal(escrow.amount.toNumber(), PRICE.toNumber());
    console.log("✅ Inference escrow created:", escrowPDA.toBase58());
  });
});
