"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatLumina, formatNumber, truncateAddress } from "@/lib/utils";
import { MOCK_MODELS } from "@/lib/constants";

type LeaderboardKey = "totalEarnings" | "totalInferences" | "pricePerInference";

const TABS: { label: string; key: LeaderboardKey; icon: React.ElementType }[] = [
  { label: "Top Earners", key: "totalEarnings", icon: Trophy },
  { label: "Most Used", key: "totalInferences", icon: TrendingUp },
  { label: "Premium", key: "pricePerInference", icon: Zap },
];

const RANK_STYLES = [
  "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
  "from-gray-400/15 to-gray-500/15 border-gray-400/30",
  "from-orange-600/20 to-amber-700/20 border-orange-600/30",
];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardKey>("totalEarnings");

  const sorted = [...MOCK_MODELS]
    .filter((m) => m.isActive)
    .sort((a, b) => {
      if (activeTab === "pricePerInference") return b[activeTab] - a[activeTab];
      return b[activeTab] - a[activeTab];
    });

  const totalVolume = MOCK_MODELS.reduce((acc, m) => acc + m.totalEarnings, 0);
  const totalInferences = MOCK_MODELS.reduce((acc, m) => acc + m.totalInferences, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-black text-white">Leaderboard</h1>
        </div>
        <p className="text-gray-400">
          The most successful AI models on the Lumina marketplace
        </p>

        {/* Global stats */}
        <div className="flex justify-center gap-6 mt-6">
          <div className="text-center">
            <p className="text-2xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              {formatLumina(totalVolume)}
            </p>
            <p className="text-xs text-gray-500">Total LUMINA Earned</p>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-black text-white">
              {formatNumber(totalInferences)}
            </p>
            <p className="text-xs text-gray-500">Total Inferences</p>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-black text-white">{MOCK_MODELS.length}</p>
            <p className="text-xs text-gray-500">Active Models</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(({ label, key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {sorted.slice(0, 3).map((model, i) => (
          <Link key={model.publicKey} href={`/models/${model.publicKey}`}>
            <div
              className={`rounded-xl border bg-gradient-to-br p-4 text-center cursor-pointer hover:scale-105 transition-transform ${
                RANK_STYLES[i]
              } ${i === 0 ? "col-start-2 row-start-1" : ""}`}
              style={{ order: i === 0 ? 2 : i === 1 ? 1 : 3 }}
            >
              <div className="text-3xl mb-2">
                {["🥇", "🥈", "🥉"][i]}
              </div>
              <p className="font-bold text-white text-sm truncate">{model.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {truncateAddress(model.creator)}
              </p>
              <p className="text-lg font-black mt-2 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                {activeTab === "totalEarnings"
                  ? `${formatLumina(model.totalEarnings)}`
                  : activeTab === "totalInferences"
                  ? formatNumber(model.totalInferences)
                  : `${formatLumina(model.pricePerInference)}`}
              </p>
              <p className="text-xs text-gray-500">
                {activeTab === "totalEarnings"
                  ? "LUMINA earned"
                  : activeTab === "totalInferences"
                  ? "inferences"
                  : "LUMINA/call"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Full list */}
      <Card>
        <CardContent className="p-0 divide-y divide-white/5">
          {sorted.map((model, i) => (
            <Link key={model.publicKey} href={`/models/${model.publicKey}`}>
              <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors cursor-pointer">
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {i < 3 ? (
                    <span className="text-xl">{["🥇", "🥈", "🥉"][i]}</span>
                  ) : (
                    <span className="text-gray-600 font-bold text-sm">#{i + 1}</span>
                  )}
                </div>

                {/* Model info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-sm truncate">
                      {model.name}
                    </p>
                    <Badge variant={model.isActive ? "success" : "danger"}>
                      {model.isActive ? "Live" : "Offline"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    {truncateAddress(model.creator)}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-right">
                  <div>
                    <p className="text-xs text-gray-500">Inferences</p>
                    <p className="text-sm font-bold text-white">
                      {formatNumber(model.totalInferences)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Earned</p>
                    <p className="text-sm font-bold text-violet-400">
                      {formatLumina(model.totalEarnings)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-sm font-bold text-cyan-400">
                      {formatLumina(model.pricePerInference)}
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Medal explanation */}
      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        {[
          { icon: "🥇", label: "Gold", desc: "Highest earning model" },
          { icon: "🥈", label: "Silver", desc: "Second highest earner" },
          { icon: "🥉", label: "Bronze", desc: "Third highest earner" },
        ].map(({ icon, label, desc }) => (
          <div
            key={label}
            className="rounded-lg border border-white/8 bg-white/3 p-3 text-sm"
          >
            <span className="text-2xl">{icon}</span>
            <p className="text-white font-medium mt-1">{label}</p>
            <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
