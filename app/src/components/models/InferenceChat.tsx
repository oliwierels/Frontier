"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Send, Zap, Clock, Cpu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatLumina } from "@/lib/utils";
import { ChatMessage, ModelListing } from "@/types";
import { BACKEND_URL } from "@/lib/constants";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface InferenceChatProps {
  model: ModelListing;
}

export function InferenceChat({ model }: InferenceChatProps) {
  const { connected, publicKey } = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hello! I'm **${model.name}**. ${model.description} How can I help you today?`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastLatency, setLastLatency] = useState<number | null>(null);
  const [lastTxSig, setLastTxSig] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!connected) {
      toast.error("Please connect your wallet to run inference");
      return;
    }

    const userMsg: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const start = performance.now();

    try {
      // In production this first POSTs to the Anchor program to lock tokens,
      // then the backend verifies the escrow and returns the inference result.
      const res = await fetch(`${BACKEND_URL}/inference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: model.publicKey,
          prompt: userMsg.content,
          walletAddress: publicKey?.toBase58(),
        }),
      });

      const latency = Math.round(performance.now() - start);
      setLastLatency(latency);

      if (!res.ok) throw new Error(`Backend error: ${res.status}`);

      const data = await res.json();
      setLastTxSig(data.txSignature || null);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.text,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      // Fallback mock for demo / offline environments
      const latency = Math.round(performance.now() - start);
      setLastLatency(latency);

      const mockReplies = [
        `That's a great question! As ${model.name}, I can help with that. Based on my training data and optimised inference pipeline on the Lumina network, here's my analysis: the key insight is that decentralised AI computation removes the single point of trust, enabling permissionless model access verified by on-chain state.`,
        `Excellent prompt! Running inference on Solana means your payment is settled in ~400 ms — faster than most HTTP round trips. The escrow pattern ensures creators only earn when actual computation is delivered.`,
        `I've processed your request through the payment-guarded inference pipeline. The on-chain escrow at your transaction ensures the creator is only rewarded upon successful completion. Here are my thoughts on your query...`,
      ];
      const reply = mockReplies[Math.floor(Math.random() * mockReplies.length)];

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, timestamp: Date.now() },
      ]);

      toast("Running in demo mode — backend not reachable", { icon: "⚡" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Stats bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-white/2">
        <Badge variant="cyan">
          <Cpu className="w-3 h-3" />
          {formatLumina(model.pricePerInference)} LUMINA / call
        </Badge>
        {lastLatency && (
          <Badge variant="success">
            <Clock className="w-3 h-3" />
            {lastLatency} ms
          </Badge>
        )}
        {lastTxSig && (
          <Badge variant="purple">
            <Zap className="w-3 h-3" />
            On-chain ✓
          </Badge>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-violet-600/20 border border-violet-500/30 text-white"
                  : "bg-white/5 border border-white/8 text-gray-200"
              )}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-gray-400">
                U
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="flex gap-1">
                {[0, 1, 2].map((n) => (
                  <span
                    key={n}
                    className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${n * 150}ms` }}
                  />
                ))}
              </span>
              <span className="text-xs text-gray-500">Processing inference...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/8 p-4 bg-black/40">
        {!connected && (
          <p className="text-xs text-amber-400 mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Connect wallet to enable on-chain payment guard
          </p>
        )}
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Send a message to ${model.name}... (Enter to send)`}
            rows={2}
            className="flex-1 resize-none"
          />
          <Button
            onClick={handleSend}
            loading={loading}
            disabled={!input.trim()}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Each message costs {formatLumina(model.pricePerInference)} $LUMINA • Settled on Solana in ~400ms
        </p>
      </div>
    </div>
  );
}
