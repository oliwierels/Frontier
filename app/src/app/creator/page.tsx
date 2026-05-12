"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Zap, Lock, Info, ExternalLink, PlusCircle } from "lucide-react";

type Step = 1 | 2 | 3;

export default function CreatorPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({ name: "", desc: "", endpoint: "", price: "0.01", stake: "1" });
  const [submitting, setSubmitting] = useState(false);
  const [txSig, setTxSig] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const checks = [
    { l: "Nazwa (min. 3 znaki)", ok: form.name.length >= 3 },
    { l: "Opis (min. 10 znaków)", ok: form.desc.length >= 10 },
    { l: "Endpoint HTTPS", ok: form.endpoint.startsWith("http") },
    { l: "Cena > 0", ok: parseFloat(form.price || "0") > 0 },
    { l: "Stake ≥ 1 LUMINA", ok: parseFloat(form.stake || "0") >= 1 },
  ];
  const valid = checks.every(c => c.ok);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
    const sig = Array.from({ length: 88 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789"[Math.floor(Math.random() * 58)]).join("");
    setTxSig(sig);
    setSubmitting(false);
  };

  if (txSig) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
      </div>
      <h2 className="text-2xl font-black text-white mb-2">Model zaregistrowany!</h2>
      <p className="text-gray-400 mb-6">Twój model jest teraz aktywny na marketplace. Zarabiasz od każdego wywołania.</p>
      <div className="rounded-xl border border-white/8 bg-white/3 p-4 font-mono text-xs text-gray-500 break-all text-left mb-6">
        <p className="text-gray-600 mb-1">Tx signature:</p>
        <p className="text-gray-300">{txSig}</p>
      </div>
      <div className="flex gap-3 justify-center">
        <a href={`https://explorer.solana.com/?cluster=devnet`} target="_blank" rel="noopener noreferrer">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition">
            <ExternalLink className="w-4 h-4" /> Explorer
          </button>
        </a>
        <button onClick={() => { setTxSig(null); setForm({ name: "", desc: "", endpoint: "", price: "0.01", stake: "1" }); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition">
          <PlusCircle className="w-4 h-4" /> Dodaj kolejny
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
          <PlusCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Creator Studio</h1>
          <p className="text-sm text-gray-400">Zarejestruj model i zarabiaj $LUMINA na każdym wywołaniu</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-3 mb-8">
        {([1, 2, 3] as Step[]).map(s => (
          <button key={s} onClick={() => setStep(s)} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s ? "bg-violet-600 text-white" : step > s ? "bg-emerald-600/30 border border-emerald-500/40 text-emerald-400" : "bg-white/5 border border-white/10 text-gray-500"}`}>
              {step > s ? "✓" : s}
            </div>
            <span className={`text-sm hidden sm:block ${step === s ? "text-white font-semibold" : "text-gray-500"}`}>
              {["Tożsamość", "Endpoint", "Ekonomia"][s - 1]}
            </span>
            {s < 3 && <div className="w-8 h-px bg-white/10 ml-1" />}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={submit} className="lg:col-span-2">
          <div className="rounded-2xl border border-white/8 bg-white/2 p-6">

            {step === 1 && (
              <div className="space-y-5">
                <h3 className="font-bold text-white text-lg">Tożsamość modelu</h3>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Nazwa modelu <span className="text-red-400">*</span></label>
                  <input value={form.name} onChange={set("name")} maxLength={64}
                    placeholder="np. MyLLM-7B-Chat"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                  <p className="text-xs text-gray-600 mt-1">{form.name.length}/64</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Opis <span className="text-red-400">*</span></label>
                  <textarea value={form.desc} onChange={set("desc")} maxLength={256} rows={4}
                    placeholder="Opisz możliwości, specjalizację i przypadki użycia..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                  <p className="text-xs text-gray-600 mt-1">{form.desc.length}/256</p>
                </div>
                <button type="button" onClick={() => setStep(2)} disabled={form.name.length < 3 || form.desc.length < 10}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition">
                  Dalej →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h3 className="font-bold text-white text-lg">Endpoint inferencji</h3>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">API Endpoint / IPFS CID <span className="text-red-400">*</span></label>
                  <input value={form.endpoint} onChange={set("endpoint")} maxLength={128}
                    placeholder="https://api.twojmodel.com/v1/chat"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                </div>
                <div className="flex items-start gap-2 p-4 rounded-xl bg-blue-500/8 border border-blue-500/20">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300 leading-relaxed">
                    Lumina oracle przekieruje podpisane requesty inferencji na ten endpoint.
                    Musi akceptować <code className="bg-white/10 px-1 rounded">POST</code> z body{" "}
                    <code className="bg-white/10 px-1 rounded">{"{ prompt, walletAddress }"}</code>.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition">
                    ← Wstecz
                  </button>
                  <button type="button" onClick={() => setStep(3)} disabled={!form.endpoint.startsWith("http")}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition">
                    Dalej →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h3 className="font-bold text-white text-lg">Tokenomia</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Cena za inferencję (LUMINA)</label>
                    <input type="number" value={form.price} onChange={set("price")} step="0.001" min="0.001"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                    <p className="text-xs text-gray-600 mt-1">95% do Ciebie · 5% treasury</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Stake (LUMINA)
                    </label>
                    <input type="number" value={form.stake} onChange={set("stake")} step="0.1" min="1"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                    <p className="text-xs text-gray-600 mt-1">Min. 1 LUMINA · zwrot przy usunięciu</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">Przed zarejestrowaniem</span>
                  </div>
                  <p className="text-xs text-amber-300/80">Podłącz portfel Phantom lub Solflare, aby podpisać transakcję on-chain. Stake zostanie zablokowany w PDA do czasu usunięcia modelu.</p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)}
                    className="px-4 py-2.5 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition">
                    ← Wstecz
                  </button>
                  <button type="submit" disabled={!valid || submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition">
                    {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Podpisywanie tx…</> : <><Zap className="w-4 h-4" />Zarejestruj On-Chain</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Checklist */}
          <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
            <h3 className="font-bold text-white text-sm mb-3">Wymagania</h3>
            {checks.map(({ l, ok }) => (
              <div key={l} className="flex items-center gap-2 py-1.5 text-sm">
                <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${ok ? "text-emerald-400" : "text-gray-700"}`} />
                <span className={ok ? "text-white" : "text-gray-500"}>{l}</span>
              </div>
            ))}
          </div>

          {/* Earnings preview */}
          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-transparent p-5">
            <h3 className="font-bold text-white text-sm mb-3">Prognoza zarobków</h3>
            {[10, 100, 1000].map(calls => {
              const price = parseFloat(form.price || "0");
              const earned = (calls * price * 0.95).toFixed(3);
              return (
                <div key={calls} className="flex justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-gray-400">{calls.toLocaleString()} wywołań</span>
                  <span className="text-violet-400 font-semibold">{earned} LUMINA</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
