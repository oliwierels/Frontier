import { PublicKey } from "@solana/web3.js";

// Replace with actual deployed program ID after `anchor deploy`
export const LUMINA_PROGRAM_ID = new PublicKey(
  "11111111111111111111111111111111"
);

// Replace with actual devnet SPL mint after `spl-token create-token`
export const LUMINA_MINT = new PublicKey(
  "11111111111111111111111111111111"
);

export const LUMINA_DECIMALS = 9;
export const MIN_STAKE_AMOUNT = 1_000_000_000; // 1 LUMINA
export const MARKETPLACE_SEED = "marketplace";
export const MODEL_SEED = "model";
export const STAKE_VAULT_SEED = "stake_vault";
export const ESCROW_SEED = "escrow";
export const ESCROW_VAULT_SEED = "escrow_vault";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const MOCK_MODELS = [
  {
    publicKey: "Model1111111111111111111111111111111111111111",
    creator: "Creator111111111111111111111111111111111111",
    name: "Lumina-7B-Chat",
    description:
      "A fine-tuned 7B parameter conversational model optimised for instruction following and multi-turn dialogue. Blazing fast on Solana.",
    apiEndpointUri: "https://api.lumina.ai/models/lumina-7b",
    pricePerInference: 10_000_000, // 0.01 LUMINA
    stakedAmount: 5_000_000_000,
    totalInferences: 14283,
    totalEarnings: 142_830_000_000,
    isActive: true,
    createdAt: 1710000000,
  },
  {
    publicKey: "Model2222222222222222222222222222222222222222",
    creator: "Creator222222222222222222222222222222222222",
    name: "CodeOracle-13B",
    description:
      "Specialised code completion and generation model trained on 100B tokens of curated open-source repositories.",
    apiEndpointUri: "https://api.lumina.ai/models/code-oracle-13b",
    pricePerInference: 25_000_000, // 0.025 LUMINA
    stakedAmount: 10_000_000_000,
    totalInferences: 9412,
    totalEarnings: 235_300_000_000,
    isActive: true,
    createdAt: 1711000000,
  },
  {
    publicKey: "Model3333333333333333333333333333333333333333",
    creator: "Creator333333333333333333333333333333333333",
    name: "VisionX-CLIP",
    description:
      "Multimodal image-text model for visual question answering, captioning, and zero-shot classification tasks.",
    apiEndpointUri: "https://api.lumina.ai/models/visionx-clip",
    pricePerInference: 50_000_000, // 0.05 LUMINA
    stakedAmount: 20_000_000_000,
    totalInferences: 5871,
    totalEarnings: 293_550_000_000,
    isActive: true,
    createdAt: 1712000000,
  },
  {
    publicKey: "Model4444444444444444444444444444444444444444",
    creator: "Creator444444444444444444444444444444444444",
    name: "SentinelGuard",
    description:
      "Real-time content moderation model with sub-100 ms latency. Detect toxicity, NSFW, and spam at scale.",
    apiEndpointUri: "https://api.lumina.ai/models/sentinel-guard",
    pricePerInference: 5_000_000, // 0.005 LUMINA
    stakedAmount: 3_000_000_000,
    totalInferences: 42910,
    totalEarnings: 214_550_000_000,
    isActive: true,
    createdAt: 1713000000,
  },
  {
    publicKey: "Model5555555555555555555555555555555555555555",
    creator: "Creator555555555555555555555555555555555555",
    name: "AlphaSummariser",
    description:
      "High-quality long-document summarisation with support for PDFs, academic papers, and legal contracts up to 128K context.",
    apiEndpointUri: "https://api.lumina.ai/models/alpha-summariser",
    pricePerInference: 15_000_000, // 0.015 LUMINA
    stakedAmount: 7_000_000_000,
    totalInferences: 11340,
    totalEarnings: 170_100_000_000,
    isActive: true,
    createdAt: 1714000000,
  },
  {
    publicKey: "Model6666666666666666666666666666666666666666",
    creator: "Creator666666666666666666666666666666666666",
    name: "SonicTranslate",
    description:
      "100-language neural machine translation with domain adaptation for legal, medical, and technical texts.",
    apiEndpointUri: "https://api.lumina.ai/models/sonic-translate",
    pricePerInference: 8_000_000, // 0.008 LUMINA
    stakedAmount: 4_000_000_000,
    totalInferences: 18750,
    totalEarnings: 150_000_000_000,
    isActive: true,
    createdAt: 1715000000,
  },
];
