"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, TrendingUp, Globe, Activity, Brain, Code, Eye } from "lucide-react";

const STATS = [
  { label: "Active Models", value: "127", sub: "+12 this week", color: "text-violet-400" },
  { label: "Inferences Today", value: "94.2K", sub: "+8.3%", color: "text-cyan-400" },
  { label: "Volume (24h)", value: "1.4M ◎", sub: "+22%", color: "text-emerald-400" },
  { label: "Avg Latency", value: "412ms", sub: "↓18ms", color: "text-amber-400" },
];

const FEATURES = [
  { icon: Zap, title: "Lightning Fast", desc: "Solana settles payments in ~400 ms. Inference and payment in one atomic flow.", c: "from-yellow-500/20 to-amber-500/20 border-yellow-500/20 text-yellow-400" },
  { icon: Shield, title: "Trustless Escrow", desc: "Tokens locked in a PDA. Creators earn only after verified inference delivery.", c: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-400" },
  { icon: Globe, title: "Permissionless", desc: "Any creator stakes $LUMINA and lists a model. No approvals needed.", c: "from-violet-500/20 to-purple-500/20 border-violet-500/20 text-violet-400" },
  { icon: TrendingUp, title: "Compute-to-Earn", desc: "Earn per call. Top models dominate the leaderboard and attract more volume.", c: "from-cyan-500/20 to-blue-500/20 border-cyan-500/20 text-cyan-400" },
];

const TRENDING = [
  { name: "Lumina-7B-Chat", creator: "9xKd...3fPq", calls: "14.3K", earned: "142.8K", price: "0.01", icon: Brain, tag: "Chat" },
  { name: "CodeOracle-13B", creator: "Af2m...9wLr", calls: "9.4K", earned: "235.3K", price: "0.025", icon: Code, tag: "Code" },
  { name: "VisionX-CLIP", creator: "Bq7n...1kTs", calls: "5.9K", earned: "293.5K", price: "0.05", icon: Eye, tag: "Vision" },
];

export default function Home() {
  return (
    <div className="bg-grid min-h-screen relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/6 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm mb-8">
          <Activity className="w-3.5 h-3.5" />
          Live on Solana Devnet
        </div>

        <h1 className="text-6xl sm:text-8xl font-black tracking-tight leading-none mb-6">
          <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            The AI Marketplace
          </span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Built on Solana
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Discover, run, and monetise AI models with instant on-chain payments.
          Creators earn <span className="text-violet-300 font-semibold">$LUMINA</span> on every inference.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/models">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold text-base hover:opacity-90 transition shadow-xl shadow-violet-900/40">
              Explore Models <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/creator">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-white font-semibold text-base hover:bg-white/5 transition">
              List Your Model
            </button>
          </Link>
        </div>

        {/* Stats strip */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur px-5 py-5 text-left">
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              <p className="text-xs text-emerald-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, c }) => (
            <div key={title} className={`rounded-2xl border bg-gradient-to-br p-5 ${c.split(" ").slice(0, 3).join(" ")}`}>
              <div className={`w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center mb-3 ${c.split(" ")[3]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trending ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">Trending Models</h2>
            <p className="text-sm text-gray-500 mt-0.5">Ranked by 24h inference volume</p>
          </div>
          <Link href="/models" className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {TRENDING.map(({ name, creator, calls, earned, price, icon: Icon, tag }) => (
            <Link key={name} href="/models">
              <div className="group rounded-2xl border border-white/8 bg-white/3 hover:border-violet-500/30 hover:bg-white/5 hover:-translate-y-0.5 transition-all duration-200 p-5 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-600/30 border border-violet-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-violet-300 transition-colors text-sm">{name}</p>
                      <p className="text-xs text-gray-500 font-mono">{creator}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">{tag}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[["Calls", calls], ["Earned", earned + " ◎"], ["Price", price + " ◎"]].map(([l, v]) => (
                    <div key={l} className="bg-white/4 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-gray-500 mb-0.5">{l}</p>
                      <p className="text-xs font-bold text-white">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="relative rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-600/10 p-14 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Start Earning with Your Model</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Stake $LUMINA, register your endpoint, and earn on every inference. Automatic. Trustless. Instant.
            </p>
            <Link href="/creator">
              <button className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold hover:opacity-90 transition shadow-xl shadow-violet-900/40">
                Open Creator Studio <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
