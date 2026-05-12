"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Zap, Clock, Cpu, TrendingUp, Lock, Brain, ExternalLink } from "lucide-react";

const MODELS: Record<string, { name: string; desc: string; price: string; calls: string; earned: string; stake: string }> = {
  "1": { name: "Lumina-7B-Chat", desc: "Fine-tuned 7B conversational model optimised for instruction following and multi-turn dialogue.", price: "0.01", calls: "14.3K", earned: "142.8K", stake: "5" },
  "2": { name: "CodeOracle-13B", desc: "Code completion and generation trained on 100B tokens of curated open-source repositories.", price: "0.025", calls: "9.4K", earned: "235.3K", stake: "10" },
  "3": { name: "VisionX-CLIP", desc: "Multimodal image-text model for VQA, captioning and zero-shot classification.", price: "0.05", calls: "5.9K", earned: "293.6K", stake: "20" },
};

const REPLIES = [
  "Świetne pytanie! Jako model działający na sieci Lumina, każde moje wywołanie jest rozliczane w $LUMINA tokenach na Solanie w ~400ms. Oto moja odpowiedź na Twoje zapytanie:",
  "Przetworzyłem Twoje zapytanie przez pipeline chroniony escrow. Płatność jest bezpiecznie zablokowana do czasu dostarczenia wyników. Oto co znalazłem:",
  "Integracja z blockchainem Solana sprawia, że każda inferencja jest transparentna i natychmiastowa. Na podstawie moich parametrów mogę powiedzieć:",
];

export default function ModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const model = MODELS[id] ?? MODELS["1"];
  const [msgs, setMsgs] = useState([
    { role: "ai", text: `Cześć! Jestem **${model.name}**. ${model.desc} W czym mogę pomóc?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [txCount, setTxCount] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMsgs(p => [...p, { role: "user", text: q }]);
    setLoading(true);
    const t = Date.now();
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
    setLatency(Date.now() - t);
    setTxCount(c => c + 1);
    const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
    setMsgs(p => [...p, { role: "ai", text: reply + `\n\n*[Esktrow #${txCount + 1} — ${(Date.now() - t)}ms · opłata ${model.price} ◎ LUMINA]*` }]);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/models">
        <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Powrót do modeli
        </button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/2 overflow-hidden flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
          {/* Header */}
          <div className="border-b border-white/8 px-5 py-4 flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/40 to-cyan-600/40 border border-violet-500/30 flex items-center justify-center">
                <Brain className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="font-bold text-white">{model.name}</p>
                <p className="text-xs text-gray-500">{model.desc.slice(0, 50)}…</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {latency && (
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                  <Clock className="w-3 h-3" />{latency}ms
                </span>
              )}
              {txCount > 0 && (
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-400">
                  <Zap className="w-3 h-3" />{txCount} tx
                </span>
              )}
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-400">
                <Cpu className="w-3 h-3" />{model.price} ◎/call
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "ai" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-violet-600/20 border border-violet-500/30 text-white"
                    : "bg-white/5 border border-white/8 text-gray-200"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3 flex gap-1 items-center">
                  {[0,1,2].map(n => (
                    <span key={n} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${n * 150}ms` }} />
                  ))}
                  <span className="text-xs text-gray-500 ml-2">Weryfikacja escrow + inferencja…</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/8 p-4 bg-black/20">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
                placeholder={`Napisz do ${model.name}… (Enter aby wysłać)`}
                rows={2}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="self-end px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white disabled:opacity-40 transition hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-gray-600 mt-1.5">Każda wiadomość = {model.price} $LUMINA · rozliczenie w ~400ms na Solanie</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-3">
            <h3 className="font-bold text-white text-sm mb-2">Statystyki modelu</h3>
            {[
              { icon: TrendingUp, label: "Wywołania", val: model.calls, c: "text-cyan-400" },
              { icon: Zap, label: "Zarobiono", val: model.earned + " ◎", c: "text-violet-400" },
              { icon: Lock, label: "Stake", val: model.stake + " LUMINA", c: "text-emerald-400" },
              { icon: Cpu, label: "Cena / call", val: model.price + " LUMINA", c: "text-amber-400" },
            ].map(({ icon: Icon, label, val, c }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className={`flex items-center gap-2 text-sm text-gray-400`}>
                  <Icon className={`w-3.5 h-3.5 ${c}`} />{label}
                </div>
                <span className="text-sm font-bold text-white">{val}</span>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
            <h3 className="font-bold text-white text-sm mb-3">Jak działa płatność?</h3>
            <ol className="space-y-2.5">
              {[
                "Portfel podpisuje tx blokując LUMINA w PDA escrow",
                "Backend sprawdza escrow na Solanie przed przekazaniem prompta",
                "Model przetwarza zapytanie i zwraca wynik",
                "95% → creator · 5% → treasury (auto-release)",
              ].map((s, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-gray-400">
                  <span className="w-5 h-5 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          <a href={`https://explorer.solana.com/?cluster=devnet`} target="_blank" rel="noopener noreferrer">
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-4 py-3 hover:bg-white/5 transition cursor-pointer">
              <span className="text-sm text-gray-400">Solana Explorer</span>
              <ExternalLink className="w-4 h-4 text-gray-600" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
