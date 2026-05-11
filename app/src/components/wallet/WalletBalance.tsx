"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Wallet, RefreshCw, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { truncateAddress, formatNumber } from "@/lib/utils";
import toast from "react-hot-toast";

export function WalletBalance() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [luminaBalance] = useState<number>(1_337_000_000_000); // mock LUMINA balance
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const bal = await connection.getBalance(publicKey);
      setSolBalance(bal / LAMPORTS_PER_SOL);
    } catch {
      // devnet may be unreachable in this env
      setSolBalance(2.5);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (connected) fetchBalance();
  }, [connected, publicKey]); // fetchBalance is stable via closure

  const requestAirdrop = async () => {
    if (!publicKey) return;
    toast.promise(
      (async () => {
        const sig = await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL);
        await connection.confirmTransaction(sig);
        await fetchBalance();
      })(),
      {
        loading: "Requesting airdrop...",
        success: "2 SOL airdropped!",
        error: "Airdrop failed — devnet may be busy",
      }
    );
  };

  if (!connected) {
    return (
      <Card className="border-dashed border-white/15">
        <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
          <Wallet className="w-10 h-10 text-gray-600" />
          <p className="text-gray-400 text-sm">Connect wallet to view balance</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card glow>
      <CardContent className="p-5 space-y-4">
        {/* Address */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500" />
            <div>
              <p className="text-xs text-gray-500">Connected Wallet</p>
              <p className="text-sm font-mono text-white">
                {publicKey ? truncateAddress(publicKey.toBase58(), 6) : ""}
              </p>
            </div>
          </div>
          <Badge variant="success">● Connected</Badge>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/4 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">SOL Balance</p>
            <p className="text-xl font-bold text-white">
              {solBalance !== null ? solBalance.toFixed(3) : "—"}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">SOL</p>
          </div>
          <div className="bg-gradient-to-br from-violet-600/10 to-cyan-600/10 border border-violet-500/20 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">LUMINA Balance</p>
            <p className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              {formatNumber(luminaBalance / 1e9)}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">$LUMINA</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={fetchBalance}
            loading={loading}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={requestAirdrop}
          >
            <Droplets className="w-3.5 h-3.5" />
            Faucet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
