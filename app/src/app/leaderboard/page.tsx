"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, TrendingUp, Zap, ArrowRight, Brain, Code, Eye, MessageSquare, Shield, Languages, FileText } from "lucide-react";

const MODELS = [
  { id: "3", name: "VisionX-CLIP", creator: "Bq7n...1kTs", calls: 5900, earned: 293600, price: 0.05, icon: Eye },
  { id: "2", name: "CodeOracle-13B", creator: "Af2m...9wLr", calls: 9400, earned: 235300, price: 0.025, icon: Code },
  { id: "7", name: "MindMapper-34B", creator: "Fz1s...8qYu", calls: 3200, earned: 320400, price: 0.1, icon: Brain },
  { id: "1", name: "Lumina-7B-Chat", creator: "9xKd...3fPq", calls: 14300, earned: 142800, price: 0.01, icon: MessageSquare },
  { id: "4", name: "SentinelGuard", creator: "Cz8p...5mNv", calls: 42900, earned: 214600, price: 0.005, icon: Shield },
  { id: "8", name: "PixelDreamer", creator: "Ga4t...6rZv", calls: 7600, earned: 190200, price: 0.025, icon: Eye },
  { id: "5", name: "AlphaSummariser", creator: "Dx3q...7oWs", calls: 11300, earned: 170100, price: 0.015, icon: FileText },
  { id: "6", name: "SonicTranslate", creator: "Ey6r...2pXt", calls: 18800, earned: 150000, price: 0.008, icon: Languages },
];

const TABS = [
  { l: "Top Earners", k: "earned", icon: Trophy },
  { l: "Most Used", k: "calls", icon: TrendingUp },
  { l: "Premium", k: "price", icon: Zap },
] as const;

const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toString();

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"earned" | "calls" | "price">("earned");

  const sorted = [...MODELS].sort((a, b) => b[tab] - a[tab]);
  const totalEarned = MODELS.reduce((s, m) => s + m.earned, 0);
  const totalCalls = MODELS.reduce((s, m) => s + m.calls, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 mb-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-black text-white">Leaderboard</h1>
        </div>
        <p className="text-gray-400 mb-6">Najlepsze modele AI na Lumina Marketplace</p>
        <div className="inline-flex items-center gap-8 px-8 py-4 rounded-2xl border border-white/8 bg-white/3">
          <div>
            <p className="text-2xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{fmt(totalEarned)} ◎</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Earned</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-2xl font-black text-white">{fmt(totalCalls)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Inferences</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-2xl font-black text-white">{MODELS.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Active Models</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(({ l, k, icon: Icon }) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === k ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40" : "bg-white/5 text-gray-400 hover:text-white"}`}>
            <Icon className="w-4 h-4" />{l}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[sorted[1], sorted[0], sorted[2]].map((m, pos) => {
          const realRank = pos === 0 ? 2 : pos === 1 ? 1 : 3;
          const medals = ["🥇", "🥈", "🥉"];
          const sizes = ["py-6", "py-10", "py-5"];
          const glows = ["", "shadow-xl shadow-yellow-900/30 border-yellow-500/20", ""];
          return (
            <Link key={m.id} href={`/models/${m.id}`}>
              <div className={`rounded-2xl border border-white/10 bg-white/3 hover:bg-white/6 transition text-center cursor-pointer ${sizes[pos]} px-4 ${glows[pos]}`}>
                <div className="text-3xl mb-2">{medals[realRank - 1]}</div>
                <m.icon className="w-6 h-6 text-violet-400 mx-auto mb-1" />
                <p className="font-bold text-white text-sm truncate">{m.name}</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{m.creator}</p>
                <p className={`text-lg font-black mt-2 ${realRank === 1 ? "text-yellow-400" : "text-violet-400"}`}>
                  {tab === "earned" ? fmt(m.earned) + " ◎" : tab === "calls" ? fmt(m.calls) : m.price + " ◎"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Full table */}
      <div className="rounded-2xl border border-white/8 overflow-hidden">
        {sorted.map((m, i) => (
          <Link key={m.id} href={`/models/${m.id}`}>
            <div className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/3 transition cursor-pointer group">
              <div className="w-8 text-center flex-shrink-0">
                {i < 3 ? <span className="text-xl">{["🥇","🥈","🥉"][i]}</span>
                  : <span className="text-gray-600 font-bold text-sm">#{i + 1}</span>}
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/15 flex items-center justify-center flex-shrink-0">
                <m.icon className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm group-hover:text-violet-300 transition-colors">{m.name}</p>
                <p className="text-xs text-gray-500 font-mono">{m.creator}</p>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-right">
                <div>
                  <p className="text-[10px] text-gray-500">Calls</p>
                  <p className="text-sm font-bold text-white">{fmt(m.calls)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Earned</p>
                  <p className="text-sm font-bold text-violet-400">{fmt(m.earned)} ◎</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Price</p>
                  <p className="text-sm font-bold text-cyan-400">{m.price} ◎</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
