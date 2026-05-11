"use client";

import { useState } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { ModelCard } from "@/components/models/ModelCard";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { MOCK_MODELS } from "@/lib/constants";

const CATEGORIES = ["All", "Chat", "Code", "Vision", "Moderation", "Translation", "Summarisation"];
const SORT_OPTIONS = [
  { label: "Most Used", key: "totalInferences" },
  { label: "Top Earnings", key: "totalEarnings" },
  { label: "Cheapest", key: "pricePerInference" },
  { label: "Newest", key: "createdAt" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export default function ModelsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("totalInferences");

  const filtered = [...MOCK_MODELS]
    .filter(
      (m) =>
        m.isActive &&
        (search === "" ||
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortKey === "pricePerInference") return a[sortKey] - b[sortKey];
      return (b[sortKey] as number) - (a[sortKey] as number);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Model Marketplace</h1>
        <p className="text-gray-400">
          {filtered.length} models available • Pay-per-inference with $LUMINA
        </p>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <div className="flex gap-1 flex-wrap">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sortKey === opt.key
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        <Filter className="w-4 h-4 text-gray-500 mt-0.5" />
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)}>
            <Badge
              variant={category === cat ? "purple" : "default"}
              className="cursor-pointer hover:border-violet-500/50 transition-all"
            >
              {cat}
            </Badge>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No models match your search</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((model) => (
            <ModelCard key={model.publicKey} model={model} />
          ))}
        </div>
      )}
    </div>
  );
}
