"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Brain, Code, Eye, MessageSquare, Shield, Languages, FileText, ArrowRight } from "lucide-react";

const MODELS = [
  { id: "1", name: "Lumina-7B-Chat", creator: "9xKd...3fPq", desc: "Fine-tuned 7B conversational model optimised for instruction following and multi-turn dialogue.", calls: "14.3K", earned: "142.8K", price: "0.01", tag: "Chat", icon: MessageSquare, active: true },
  { id: "2", name: "CodeOracle-13B", creator: "Af2m...9wLr", desc: "Code completion and generation trained on 100B tokens of curated open-source repositories.", calls: "9.4K", earned: "235.3K", price: "0.025", tag: "Code", icon: Code, active: true },
  { id: "3", name: "VisionX-CLIP", creator: "Bq7n...1kTs", desc: "Multimodal image-text model for VQA, captioning, and zero-shot classification tasks.", calls: "5.9K", earned: "293.6K", price: "0.05", tag: "Vision", icon: Eye, active: true },
  { id: "4", name: "SentinelGuard", creator: "Cz8p...5mNv", desc: "Real-time content moderation with sub-100ms latency. Detects toxicity, NSFW, and spam.", calls: "42.9K", earned: "214.6K", price: "0.005", tag: "Moderation", icon: Shield, active: true },
  { id: "5", name: "AlphaSummariser", creator: "Dx3q...7oWs", desc: "Long-document summarisation supporting PDFs, papers, and legal contracts up to 128K context.", calls: "11.3K", earned: "170.1K", price: "0.015", tag: "Summarisation", icon: FileText, active: true },
  { id: "6", name: "SonicTranslate", creator: "Ey6r...2pXt", desc: "100-language neural machine translation with domain adaptation for legal and medical texts.", calls: "18.8K", earned: "150.0K", price: "0.008", tag: "Translation", icon: Languages, active: true },
  { id: "7", name: "MindMapper-34B", creator: "Fz1s...8qYu", desc: "Reasoning and chain-of-thought model for complex analysis, planning, and decision support.", calls: "3.2K", earned: "320.4K", price: "0.1", tag: "Chat", icon: Brain, active: true },
  { id: "8", name: "PixelDreamer", creator: "Ga4t...6rZv", desc: "Text-to-image diffusion model fine-tuned on 10M curated artworks. 512×512 in under 2s.", calls: "7.6K", earned: "190.2K", price: "0.025", tag: "Vision", icon: Eye, active: false },
];

const TAGS = ["All", "Chat", "Code", "Vision", "Moderation", "Summarisation", "Translation"];
const SORTS = [
  { l: "Most Used", k: "calls" },
  { l: "Top Earnings", k: "earned" },
  { l: "Cheapest", k: "price" },
] as const;

export default function ModelsPage() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("All");
  const [sort, setSort] = useState<"calls" | "earned" | "price">("calls");

  const items = MODELS
    .filter(m => (tag === "All" || m.tag === tag) && (q === "" || m.name.toLowerCase().includes(q.toLowerCase()) || m.desc.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => {
      const av = parseFloat(a[sort].replace("K","000").replace("M","000000"));
      const bv = parseFloat(b[sort].replace("K","000").replace("M","000000"));
      return sort === "price" ? av - bv : bv - av;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">AI Model Marketplace</h1>
        <p className="text-gray-400 text-sm">{items.length} models available · Pay-per-inference with $LUMINA</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search models..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div className="flex gap-1">
            {SORTS.map(s => (
              <button key={s.k} onClick={() => setSort(s.k)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sort === s.k ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
                {s.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tag filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {TAGS.map(t => (
          <button key={t} onClick={() => setTag(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${tag === t ? "bg-violet-500/20 border-violet-500/50 text-violet-300" : "border-white/10 text-gray-500 hover:text-white hover:border-white/20"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map(m => (
          <Link key={m.id} href={`/models/${m.id}`}>
            <div className="group rounded-2xl border border-white/8 bg-white/3 hover:border-violet-500/30 hover:bg-white/5 hover:-translate-y-0.5 transition-all duration-200 p-5 h-full flex flex-col cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-600/30 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <m.icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white group-hover:text-violet-300 transition-colors text-sm truncate">{m.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{m.creator}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ml-1 ${m.active ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
                  {m.active ? "● Live" : "Offline"}
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed flex-1">{m.desc}</p>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[["Calls", m.calls], ["Earned", m.earned + " ◎"], ["Price", m.price + " ◎"]].map(([l, v]) => (
                  <div key={l} className="bg-white/4 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-500 mb-0.5">{l}</p>
                    <p className="text-xs font-bold text-white">{v}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400`}>{m.tag}</span>
                <span className="flex items-center gap-1 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Playground <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
