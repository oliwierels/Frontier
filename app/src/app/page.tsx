"use client";

import Link from "next/link";
import { Zap, TrendingUp, Shield, Globe, ArrowRight, Activity } from "lucide-react";
import { ModelCard } from "@/components/models/ModelCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatLumina } from "@/lib/utils";
import { MOCK_MODELS } from "@/lib/constants";

const STATS = [
  { label: "Total Models", value: "127", change: "+12 this week" },
  { label: "Inferences Today", value: "94.2K", change: "+8.3% vs yesterday" },
  { label: "Volume (24h)", value: "1.4M LUMINA", change: "+22%" },
  { label: "Avg Latency", value: "412 ms", change: "↓ 18 ms" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Solana settles payments in ~400 ms. Inference and payment happen in the same atomic flow.",
    color: "from-yellow-600/20 to-amber-600/20 border-yellow-500/20",
    iconColor: "text-yellow-400",
  },
  {
    icon: Shield,
    title: "Trustless Escrow",
    description:
      "Tokens are locked in a PDA escrow. Creators only earn upon verified inference delivery.",
    color: "from-emerald-600/20 to-teal-600/20 border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: Globe,
    title: "Permissionless",
    description:
      "Any creator can list a model by staking $LUMINA. No central approval — code is law.",
    color: "from-violet-600/20 to-purple-600/20 border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: TrendingUp,
    title: "Compute-to-Earn",
    description:
      "Models earn per inference call. Top performers rise on the leaderboard and attract more volume.",
    color: "from-cyan-600/20 to-blue-600/20 border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
];

export default function DashboardPage() {
  const trending = [...MOCK_MODELS]
    .sort((a, b) => b.totalInferences - a.totalInferences)
    .slice(0, 6);
  const totalVolume = MOCK_MODELS.reduce((acc, m) => acc + m.totalEarnings, 0);

  return (
    <div className="relative bg-grid min-h-screen">
      {/* Ambient glows */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-40 right-1/4 w-96 h-96 bg-cyan-600/6 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <Badge variant="purple" className="mb-6 px-4 py-1.5 text-sm">
          <Activity className="w-3.5 h-3.5" />
          Live on Solana Devnet
        </Badge>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6">
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            The AI Marketplace
          </span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Built on Solana
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Discover and run AI models with instant on-chain payments. Model
          creators earn{" "}
          <span className="text-violet-400 font-semibold">$LUMINA</span> for
          every inference. Powered by Solana&apos;s 400 ms finality.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/models">
            <Button size="lg" className="w-full sm:w-auto">
              Explore Models <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/creator">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              List Your Model
            </Button>
          </Link>
        </div>

        {/* Live counter strip */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/8 bg-white/3 backdrop-blur px-4 py-4"
            >
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              <p className="text-xs text-emerald-400 mt-1">{s.change}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, description, color, iconColor }) => (
            <div
              key={title}
              className={`rounded-xl border bg-gradient-to-br p-5 ${color}`}
            >
              <div
                className={`w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center mb-3 ${iconColor}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-1.5">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Models */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Trending Models</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Total platform volume:{" "}
              <span className="text-violet-400">
                {formatLumina(totalVolume)} LUMINA
              </span>
            </p>
          </div>
          <Link href="/models">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trending.map((model) => (
            <ModelCard key={model.publicKey} model={model} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-cyan-600/10 p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-3">
              Start Earning with Your Model
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Stake $LUMINA, register your endpoint, and earn on every
              inference. The leaderboard rewards the best models with the most
              visibility.
            </p>
            <Link href="/creator">
              <Button size="lg">
                Open Creator Studio <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
