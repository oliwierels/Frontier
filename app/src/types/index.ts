export interface ModelListing {
  publicKey: string;
  creator: string;
  name: string;
  description: string;
  apiEndpointUri: string;
  pricePerInference: number; // raw LUMINA tokens (9 decimals)
  stakedAmount: number;
  totalInferences: number;
  totalEarnings: number;
  isActive: boolean;
  createdAt: number;
}

export interface InferenceEscrow {
  publicKey: string;
  user: string;
  model: string;
  creator: string;
  amount: number;
  requestedAt: number;
  isFulfilled: boolean;
}

export interface MarketplaceState {
  admin: string;
  luminaMint: string;
  treasury: string;
  feeBps: number;
  totalModels: number;
  totalInferences: number;
  totalVolume: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface InferenceRequest {
  modelId: string;
  prompt: string;
  escrowPubkey?: string;
}

export interface InferenceResponse {
  text: string;
  modelId: string;
  tokensUsed: number;
  latencyMs: number;
  txSignature?: string;
}
