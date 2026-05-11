# Lumina — Decentralised AI Model Marketplace on Solana

> **Superteam Poland Hackathon Entry** · Compute-to-Earn · Inference-as-a-Service

Lumina is a permissionless marketplace where AI model creators list their models, users pay per inference with the **$LUMINA** SPL token, and payments settle on Solana in ~400 ms — no middlemen, no invoices, just code.

---

## Demo

| Screen | Description |
|---|---|
| **Dashboard** | Hero stats, trending models grid, feature highlights |
| **Model Marketplace** | Search, filter, sort 127+ models |
| **Model Playground** | Live chat interface with on-chain payment guard |
| **Leaderboard** | Top earners, most used, premium models |
| **Creator Studio** | Register a model, set price, stake $LUMINA |
| **Wallet Panel** | SOL + LUMINA balances, devnet faucet, transaction history |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│   Next.js 14 · Tailwind · Solana Wallet Adapter             │
└───────────────────────┬─────────────────────────────────────┘
                        │ @coral-xyz/anchor
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              SOLANA DEVNET / MAINNET-BETA                    │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │  Lumina Program  │  │     SPL Token ($LUMINA)       │    │
│  │  (Anchor v0.30)  │  │  Mint · ATA · Transfer CPI   │    │
│  │                  │  └──────────────────────────────┘    │
│  │  ModelListing    │                                       │
│  │  InferenceEscrow │                                       │
│  │  MarketplaceState│                                       │
│  └──────────────────┘                                       │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP (escrow verification + CPI)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              LUMINA ORACLE / BACKEND (FastAPI)               │
│  • Verify escrow PDA exists before routing prompt           │
│  • Forward to model endpoint / OpenRouter                   │
│  • Sign & submit completeInference() tx                     │
│  • 95% → creator  ·  5% → treasury                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              MODEL ENDPOINTS (Creator-hosted)                │
│  Custom HTTPS API  ·  OpenRouter  ·  IPFS/Arweave CID       │
└─────────────────────────────────────────────────────────────┘
```

---

## Smart Contract (`programs/lumina/src/lib.rs`)

Built with **Anchor 0.30**. Key accounts:

| Account | Purpose |
|---|---|
| `MarketplaceState` | Global config (admin, mint, treasury, fee BPS) |
| `ModelListing` | Per-model registry (creator, price, stake, stats) |
| `InferenceEscrow` | One-shot payment lock per inference call |

### Instructions

| Instruction | Who Calls | What It Does |
|---|---|---|
| `initialize_marketplace` | Admin | One-time setup |
| `register_model` | Creator | Stakes LUMINA, lists model |
| `unregister_model` | Creator | Delists, returns stake |
| `request_inference` | User | Locks payment in PDA escrow |
| `complete_inference` | Oracle | Releases 95% to creator, 5% to treasury |
| `refund_inference` | User | Refund if oracle never responds (60s timeout) |
| `update_model_price` | Creator | Change price per call |
| `add_stake` | Creator | Top up stake |

### Tokenomics

```
User sends 0.01 LUMINA
        │
        ▼
[InferenceEscrow PDA]  ──── Oracle confirms ────▶  Creator: 0.0095 LUMINA (95%)
                                                    Treasury: 0.0005 LUMINA  (5%)
```

---

## Quick Start

### Prerequisites

```bash
# Solana toolchain
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor (via AVM)
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.30.1 && avm use 0.30.1

# Node 18+, Yarn
```

### 1 · Deploy the Anchor Program

```bash
# Configure devnet
solana config set --url devnet
solana airdrop 5

# Build & deploy
anchor build
anchor deploy

# Note the program ID output and update:
# - declare_id!(...) in programs/lumina/src/lib.rs
# - LUMINA_PROGRAM_ID in app/src/lib/constants.ts
```

### 2 · Create the $LUMINA Mint

```bash
# Create mint (9 decimals)
spl-token create-token --decimals 9

# Create treasury ATA
spl-token create-account <MINT_ADDRESS>

# Mint initial supply to treasury
spl-token mint <MINT_ADDRESS> 1000000000

# Update LUMINA_MINT in app/src/lib/constants.ts
```

### 3 · Start the Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Copy and fill in env vars
cp .env.example .env

uvicorn main:app --reload --port 8000
```

### 4 · Start the Frontend

```bash
cd app

# Set env var
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local

npm install
npm run dev
# → http://localhost:3000
```

---

## Project Structure

```
Frontier/
├── programs/
│   └── lumina/
│       └── src/lib.rs          # Full Anchor program (7 instructions)
├── app/                        # Next.js 14 frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx        # Dashboard
│       │   ├── models/         # Model listing & playground
│       │   ├── leaderboard/    # Top earners leaderboard
│       │   └── creator/        # Creator Studio (register model)
│       ├── components/
│       │   ├── layout/Navbar
│       │   ├── models/ModelCard · InferenceChat
│       │   └── wallet/WalletBalance
│       ├── lib/
│       │   ├── anchor/         # IDL + PDA helpers + tx builders
│       │   └── constants.ts    # Program IDs, mock data
│       └── context/            # WalletContextProvider
├── backend/
│   └── main.py                 # FastAPI oracle + payment guard
├── tests/
│   └── lumina.ts               # Mocha/Chai integration tests
└── Anchor.toml
```

---

## Key Design Decisions

**Why escrow instead of direct transfer?**
The user locks funds atomically before the inference is sent. If the backend never responds, the user can call `refund_inference` after 60 seconds. This eliminates the risk of paying without receiving a result.

**Why Stake-to-List?**
Creators must lock $LUMINA to list a model. This creates a Sybil-resistance mechanism — spam listings are economically irrational — and signals creator commitment to uptime.

**Why an oracle for `complete_inference`?**
Solana programs are sandboxed; they can't make HTTP calls. The oracle (admin keypair on the backend) is the bridge that verifies off-chain delivery and then signs the on-chain settlement. A future iteration can replace the admin oracle with a decentralised committee of verifiers using a ZK proof of inference.

---

## Roadmap

- [ ] ZK proof-of-inference to replace trusted oracle
- [ ] DAO governance for marketplace fee BPS
- [ ] Model versioning with on-chain changelogs
- [ ] Reputation / review system (SBT-based)
- [ ] Cross-chain bridges (ETH, BSC) via Wormhole
- [ ] IPFS/Arweave model card metadata standard

---

## Built With

- [Anchor Framework](https://www.anchor-lang.com/) — Solana smart contract toolkit
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter) — Multi-wallet React integration
- [Next.js 14](https://nextjs.org/) — App Router, RSC, Server Actions
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
- [FastAPI](https://fastapi.tiangolo.com/) — High-performance Python API
- [OpenRouter](https://openrouter.ai/) — Unified LLM API gateway

---

*Made with ⚡ for the Superteam Poland Hackathon*
