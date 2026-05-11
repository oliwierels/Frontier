"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Lock,
  TrendingUp,
  Users,
  Clock,
  ExternalLink,
  Copy,
  CheckCheck,
} from "lucide-react";
import { InferenceChat } from "@/components/models/InferenceChat";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatLumina, formatNumber, truncateAddress } from "@/lib/utils";
import { MOCK_MODELS } from "@/lib/constants";
import { useState } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ModelPage({ params }: PageProps) {
  const { id } = use(params);
  const [copied, setCopied] = useState(false);

  const model = MOCK_MODELS.find((m) => m.publicKey === id);
  if (!model) notFound();

  const copyAddress = () => {
    navigator.clipboard.writeText(model.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    {
      label: "Total Inferences",
      value: formatNumber(model.totalInferences),
      icon: TrendingUp,
      color: "text-cyan-400",
    },
    {
      label: "Total Earned",
      value: `${formatLumina(model.totalEarnings)} LUMINA`,
      icon: Users,
      color: "text-violet-400",
    },
    {
      label: "Staked",
      value: `${formatLumina(model.stakedAmount)} LUMINA`,
      icon: Lock,
      color: "text-emerald-400",
    },
    {
      label: "Price / Inference",
      value: `${formatLumina(model.pricePerInference)} LUMINA`,
      icon: Clock,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link href="/models">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Models
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: chat playground */}
        <div className="lg:col-span-2">
          <Card glow className="overflow-hidden">
            {/* Model header */}
            <div className="border-b border-white/8 px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-600/30 border border-violet-500/20 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{model.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 font-mono">
                        {truncateAddress(model.creator, 6)}
                      </span>
                      <button onClick={copyAddress} className="text-gray-600 hover:text-gray-400">
                        {copied ? (
                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={model.isActive ? "success" : "danger"}>
                    {model.isActive ? "● Live" : "Offline"}
                  </Badge>
                  <a
                    href={`https://explorer.solana.com/address/${model.publicKey}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                {model.description}
              </p>
            </div>

            {/* Playground */}
            <InferenceChat model={model} />
          </Card>
        </div>

        {/* Right: wallet + stats */}
        <div className="space-y-4">
          <WalletBalance />

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-white text-sm">Model Stats</h3>
              {stats.map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    {label}
                  </div>
                  <span className="text-sm font-semibold text-white">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* How it works */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-white text-sm mb-3">
                How Payment Works
              </h3>
              <ol className="space-y-2.5 text-xs text-gray-400">
                {[
                  "Your wallet signs a transaction depositing LUMINA into a PDA escrow",
                  "The Lumina backend verifies the on-chain escrow before routing your prompt",
                  "The model processes your request and returns the result",
                  "The oracle releases payment: 95% to creator, 5% to treasury",
                ].map((step, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold flex-shrink-0 text-[10px]">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
