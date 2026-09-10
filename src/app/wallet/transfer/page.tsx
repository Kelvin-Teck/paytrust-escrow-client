"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, ArrowRight, UserCheck } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { toast } from "@/components/ui/Toast";

export default function WalletTransferPage() {
  const router = useRouter();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("25000");
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      toast.success(
        `Transfer of ₦${parseFloat(amount).toLocaleString()} to ${recipient} successful!`,
      );
      router.push("/wallet");
    }, 1000);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          href="/wallet"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Wallets
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Instant PayTrust P2P Transfer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Send money directly to any PayTrust username or email address with
            0% fee.
          </p>
        </div>

        <form
          onSubmit={handleTransfer}
          className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6"
        >
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
              Recipient Email or PayTrust Tag
            </label>
            <input
              type="text"
              required
              placeholder="e.g. adeyemi@company.com or @tolu"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
              Transfer Amount (NGN)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₦
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
              Payment Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Design consultancy milestone advance"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 rounded-xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all active:scale-95 disabled:opacity-50 text-sm"
          >
            {isProcessing ? "Sending Funds..." : "Send Payment"}{" "}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
