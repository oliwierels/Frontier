"use client";

import Link from "next/link";
import { Brain, Zap, TrendingUp, Lock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatLumina, formatNumber, truncateAddress } from "@/lib/utils";
import { ModelListing } from "@/types";

interface ModelCardProps {
  model: ModelListing;
  rank?: number;
}

const MODEL_ICONS = [Brain, Zap, TrendingUp];

export function ModelCard({ model, rank }: ModelCardProps) {
  const Icon = MODEL_ICONS[parseInt(model.publicKey.slice(-1), 16) % MODEL_ICONS.length];
  const priceFormatted = formatLumina(model.pricePerInference);
  const earningsFormatted = formatLumina(model.totalEarnings);

  return (
    <Link href={`/models/${model.publicKey}`}>
      <Card
        glow
        className="group cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
      >
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {rank && (
                <span className="text-2xl font-black text-gray-700 w-8 text-center">
                  {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
                </span>
              )}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-600/30 border border-violet-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                  {model.name}
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  {truncateAddress(model.creator)}
                </p>
              </div>
            </div>
            <Badge variant={model.isActive ? "success" : "danger"}>
              {model.isActive ? "● Live" : "Offline"}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
            {model.description}
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/4 rounded-lg p-2.5">
              <p className="text-xs text-gray-500 mb-0.5">Price</p>
              <p className="text-sm font-bold text-cyan-400">
                {priceFormatted} <span className="text-xs font-normal">◎</span>
              </p>
            </div>
            <div className="bg-white/4 rounded-lg p-2.5">
              <p className="text-xs text-gray-500 mb-0.5">Calls</p>
              <p className="text-sm font-bold text-white">
                {formatNumber(model.totalInferences)}
              </p>
            </div>
            <div className="bg-white/4 rounded-lg p-2.5">
              <p className="text-xs text-gray-500 mb-0.5">Earned</p>
              <p className="text-sm font-bold text-violet-400">
                {earningsFormatted}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Lock className="w-3 h-3" />
              <span>{formatLumina(model.stakedAmount)} staked</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Open playground</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
