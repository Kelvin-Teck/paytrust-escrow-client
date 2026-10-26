"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Sparkles,
  Info,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { toast } from "@/components/ui/Toast";

export default function BitcoinWalletPage() {
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsSubscribed(true);
    toast.success("You are on the priority list for Peltapay Crypto Escrow!");
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <Link
          href="/wallet"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Wallets
        </Link>

        {/* Regulatory Sandbox Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Digital Asset Escrow (BTC & USDT) — Regulatory Incubation Notice</span>
            <p className="text-amber-700 leading-relaxed">
              Peltapay digital asset custodial infrastructure is currently in private testnet sandbox mode pending final clearance under SEC Nigeria's Accelerated Regulatory Incubation Programme (ARIP). Live multi-currency fiat NGN settlements are active and unaffected.
            </p>
          </div>
        </div>

        {/* Hero Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-orange-950/40 to-slate-900 text-white border border-orange-900/30 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                  Bitcoin & Stablecoin Escrow Vault
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  SANDBOX
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1.5">
                0.00000000 BTC
              </h1>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" /> Multi-signature Cold Storage • Native SegWit Protection
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm sm:text-right">
              <span className="text-[11px] text-slate-400 font-medium block">Planned Features</span>
              <span className="text-xs font-bold text-orange-300 block mt-0.5">
                BTC, USDT (TRC-20 & ERC-20), USDC
              </span>
            </div>
          </div>
        </div>

        {/* Priority Access Card */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="max-w-xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Get Early Access to Crypto Escrow
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lock Bitcoin and stablecoins in institutional escrow for cross-border tech contracts, domain sales, and international import deals with auto-hedging and zero chargeback risk.
            </p>
          </div>

          {isSubscribed ? (
            <div className="p-5 rounded-2xl bg-[#EBF7F0] border border-[#32A05F]/30 flex items-center gap-3 text-xs text-[#32A05F] font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>You're on the priority waitlist! We will notify you when digital asset deposits open.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                type="email"
                required
                placeholder="Enter your work email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl font-bold bg-orange-600 hover:bg-orange-700 text-white text-xs shadow-md shadow-orange-600/20 transition-all cursor-pointer whitespace-nowrap"
              >
                Request Beta Access
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-800 block">On-Chain Verification</span>
              <p className="text-[11px] text-slate-500">Unique multi-sig deposit addresses with automated blockchain monitoring.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-800 block">Zero Volatility Option</span>
              <p className="text-[11px] text-slate-500">Auto-convert escrowed crypto to stable NGN at deposit time to protect against price swings.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-800 block">Arbitration Proof</span>
              <p className="text-[11px] text-slate-500">Cryptographically verifiable release signatures backed by the Peltapay Tribunal.</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
