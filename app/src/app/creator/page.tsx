"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  PlusCircle,
  Lock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Zap,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { formatLumina } from "@/lib/utils";
import { MIN_STAKE_AMOUNT } from "@/lib/constants";
import toast from "react-hot-toast";

interface FormData {
  name: string;
  description: string;
  apiEndpointUri: string;
  pricePerInference: string;
  stakeAmount: string;
}

const INITIAL_FORM: FormData = {
  name: "",
  description: "",
  apiEndpointUri: "",
  pricePerInference: "0.01",
  stakeAmount: formatLumina(MIN_STAKE_AMOUNT),
};

export default function CreatorStudioPage() {
  const { connected } = useWallet();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const isValid =
    form.name.length >= 3 &&
    form.description.length >= 10 &&
    form.apiEndpointUri.startsWith("http") &&
    parseFloat(form.pricePerInference) > 0 &&
    parseFloat(form.stakeAmount) >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !isValid) return;

    setSubmitting(true);
    try {
      // In production: call buildRegisterModelTx then send via wallet
      await new Promise((r) => setTimeout(r, 2000)); // simulate tx

      const mockSig =
        "5" +
        Array.from({ length: 87 }, () =>
          "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789"[
            Math.floor(Math.random() * 58)
          ]
        ).join("");

      setSubmitted(mockSig);
      toast.success("Model registered on-chain!");
    } catch {
      toast.error("Transaction failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Model Successfully Listed!
        </h2>
        <p className="text-gray-400 mb-6">
          Your model is now live on the Lumina marketplace. Creators earn
          automatically on every inference.
        </p>
        <div className="bg-white/3 border border-white/8 rounded-xl p-4 font-mono text-xs text-gray-400 break-all mb-6">
          <p className="text-gray-600 text-xs mb-1">Transaction signature:</p>
          {submitted}
        </div>
        <div className="flex gap-3 justify-center">
          <a
            href={`https://explorer.solana.com/tx/${submitted}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary">
              <ExternalLink className="w-4 h-4" />
              View on Explorer
            </Button>
          </a>
          <Button onClick={() => { setSubmitted(null); setForm(INITIAL_FORM); }}>
            List Another Model
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Creator Studio</h1>
        </div>
        <p className="text-gray-400">
          List your AI model and start earning $LUMINA on every inference.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          {!connected && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 mb-6">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-300">
                Connect your Phantom or Backpack wallet to register a model on-chain.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Model identity */}
                <div>
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-xs flex items-center justify-center font-bold">1</span>
                    Model Identity
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">
                        Model Name <span className="text-red-400">*</span>
                      </label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. MyLLM-7B-Chat"
                        maxLength={64}
                      />
                      <p className="text-xs text-gray-600 mt-1">{form.name.length}/64 characters</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">
                        Description <span className="text-red-400">*</span>
                      </label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Describe your model's capabilities, specialisation, and intended use case..."
                        rows={3}
                        maxLength={256}
                      />
                      <p className="text-xs text-gray-600 mt-1">{form.description.length}/256 characters</p>
                    </div>
                  </div>
                </div>

                {/* Endpoint */}
                <div>
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-xs flex items-center justify-center font-bold">2</span>
                    Inference Endpoint
                  </h3>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 mb-1.5 block">
                      API Endpoint URI / IPFS CID <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={form.apiEndpointUri}
                      onChange={(e) => setForm({ ...form, apiEndpointUri: e.target.value })}
                      placeholder="https://api.yourmodel.com/v1/chat or ipfs://Qm..."
                      maxLength={128}
                    />
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-300">
                        The Lumina oracle will forward signed inference requests to this endpoint.
                        Must accept POST requests with a JSON body{" "}
                        <code className="bg-white/10 px-1 rounded">{"{ prompt, walletAddress }"}</code>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Economics */}
                <div>
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-xs flex items-center justify-center font-bold">3</span>
                    Tokenomics
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">
                        Price per Inference (LUMINA)
                      </label>
                      <Input
                        type="number"
                        value={form.pricePerInference}
                        onChange={(e) => setForm({ ...form, pricePerInference: e.target.value })}
                        step="0.001"
                        min="0.001"
                        placeholder="0.01"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        You receive 95% — 5% goes to the marketplace treasury
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Stake Amount (LUMINA)
                      </label>
                      <Input
                        type="number"
                        value={form.stakeAmount}
                        onChange={(e) => setForm({ ...form, stakeAmount: e.target.value })}
                        step="0.1"
                        min="1"
                        placeholder="1"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Minimum 1 LUMINA. Returned when you unlist.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={!connected || !isValid}
                    loading={submitting}
                    size="lg"
                    className="flex-1"
                  >
                    <Zap className="w-4 h-4" />
                    {submitting ? "Signing Transaction..." : "Register Model On-Chain"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <WalletBalance />

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-white text-sm">Requirements</h3>
              {[
                { label: "Model name", ok: form.name.length >= 3 },
                { label: "Description (≥10 chars)", ok: form.description.length >= 10 },
                { label: "Valid HTTPS endpoint", ok: form.apiEndpointUri.startsWith("http") },
                { label: "Price > 0", ok: parseFloat(form.pricePerInference || "0") > 0 },
                { label: "Stake ≥ 1 LUMINA", ok: parseFloat(form.stakeAmount || "0") >= 1 },
                { label: "Wallet connected", ok: connected },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <CheckCircle2
                    className={`w-4 h-4 flex-shrink-0 ${ok ? "text-emerald-400" : "text-gray-700"}`}
                  />
                  <span className={ok ? "text-white" : "text-gray-500"}>{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-transparent">
            <CardContent className="p-5">
              <h3 className="font-semibold text-white text-sm mb-2">
                Earn $LUMINA
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Once listed, every inference call automatically sends 95% of the
                payment to your wallet via on-chain escrow. No invoices, no
                middlemen — just code.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="purple">5% marketplace fee</Badge>
                <Badge variant="cyan">95% to creator</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
