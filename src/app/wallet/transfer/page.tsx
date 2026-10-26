"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Wallet,
  Receipt,
  Copy,
  Check,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { toast } from "@/components/ui/Toast";
import { walletService } from "@/services/api";

interface RecipientPreview {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountType?: string;
  isVerified?: boolean;
}

export default function WalletTransferPage() {
  const router = useRouter();

  const [recipientInput, setRecipientInput] = useState("");
  const [recipient, setRecipient] = useState<RecipientPreview | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // 1. Fetch available balance
  useEffect(() => {
    async function loadBalance() {
      try {
        const bal = await walletService.getBalances();
        const currentBal = Number(bal?.balance ?? bal?.[0]?.balance ?? 0);
        setAvailableBalance(currentBal);
      } catch (err) {
        console.error("Failed to load wallet balance:", err);
      } finally {
        setIsLoadingBalance(false);
      }
    }
    loadBalance();
  }, []);

  // 2. Debounced recipient lookup
  useEffect(() => {
    const clean = recipientInput.trim();
    if (!clean || clean.length < 3) {
      setRecipient(null);
      setLookupError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLookingUp(true);
      setLookupError(null);
      try {
        const found = await walletService.lookupRecipient(clean);
        setRecipient(found);
      } catch (err: any) {
        setRecipient(null);
        setLookupError(
          err.response?.data?.message || "No Peltapay user found with this email or username"
        );
      } finally {
        setIsLookingUp(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [recipientInput]);

  const handleSetMax = () => {
    if (availableBalance > 0) {
      setAmount(String(availableBalance));
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0) {
      toast.error("Please enter a valid transfer amount.");
      return;
    }

    if (numAmount > availableBalance) {
      toast.error(
        `Insufficient funds. Available: ₦${availableBalance.toLocaleString()}`
      );
      return;
    }

    if (!recipientInput.trim()) {
      toast.error("Recipient email, phone, or username is required.");
      return;
    }

    setIsProcessing(true);
    setTransferError(null);

    try {
      const result = await walletService.transfer({
        recipient: recipientInput.trim(),
        amount: numAmount,
        note: note.trim() || undefined,
      });

      setSuccessReceipt(result);
      setAvailableBalance(result.newBalance ?? Math.max(0, availableBalance - numAmount));
      toast.success(
        `₦${numAmount.toLocaleString()} sent successfully to ${
          recipient?.name || recipientInput
        }!`
      );
    } catch (err: any) {
      console.error("Transfer error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Transfer failed. Please check your balance and recipient details.";
      setTransferError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyReference = () => {
    if (successReceipt?.reference) {
      navigator.clipboard.writeText(successReceipt.reference);
      setCopiedRef(true);
      toast.success("Transaction reference copied!");
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 pb-16">
        <Link
          href="/wallet"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Wallets
        </Link>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Instant Peer-to-Peer
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Instant Peltapay P2P Transfer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Transfer available funds directly to any Peltapay user instantly with 0% fees.
          </p>
        </div>

        {/* Balance Status Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#32A05F]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Available Wallet Balance</p>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {isLoadingBalance ? "Loading..." : `₦${availableBalance.toLocaleString()}`}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSetMax}
            disabled={availableBalance <= 0}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#32A05F]/20 text-[#32A05F] hover:bg-[#32A05F]/30 transition-colors disabled:opacity-50"
          >
            Use Max
          </button>
        </div>

        {successReceipt ? (
          /* Success Receipt Card */
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mx-auto shadow-md shadow-[#32A05F]/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Transfer Successful!</h2>
              <p className="text-xs text-slate-500">
                Funds have been deposited into the recipient's Peltapay wallet instantly.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Amount Sent</span>
                <span className="font-extrabold text-base text-slate-900">
                  ₦{Number(successReceipt.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Recipient</span>
                <span className="font-bold text-slate-800">
                  {successReceipt.recipient?.name || recipient?.name || recipientInput}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Recipient Email</span>
                <span className="font-mono text-slate-700">
                  {successReceipt.recipient?.email || recipient?.email || recipientInput}
                </span>
              </div>
              {successReceipt.note && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Note</span>
                  <span className="text-slate-700 italic">"{successReceipt.note}"</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Reference</span>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  className="font-mono text-slate-800 font-semibold flex items-center gap-1.5 hover:text-[#32A05F] transition-colors"
                >
                  {successReceipt.reference}{" "}
                  {copiedRef ? (
                    <Check className="w-3.5 h-3.5 text-[#32A05F]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSuccessReceipt(null);
                  setAmount("");
                  setRecipientInput("");
                  setRecipient(null);
                  setNote("");
                }}
                className="flex-1 py-3.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm transition-all text-center"
              >
                Send Another Transfer
              </button>
              <Link
                href="/wallet"
                className="flex-1 py-3.5 rounded-xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white text-sm transition-all text-center shadow-lg shadow-[#32A05F]/20"
              >
                Return to Wallets
              </Link>
            </div>
          </div>
        ) : (
          /* Transfer Form */
          <form
            onSubmit={handleTransfer}
            className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6"
          >
            {transferError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{transferError}</p>
              </div>
            )}

            {/* Recipient Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Recipient Email, Phone, or Referral Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. adeyemi@company.com or +2348012345678"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  className={`w-full px-4 py-3.5 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none transition-all ${
                    recipient
                      ? "border-[#32A05F] ring-2 ring-[#32A05F]/20"
                      : lookupError
                      ? "border-rose-300"
                      : "border-slate-200 focus:ring-2 focus:ring-[#32A05F]/40"
                  }`}
                />
                {isLookingUp && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Verified Recipient Confirmation Pill */}
              {recipient && (
                <div className="mt-2.5 p-3 rounded-xl bg-[#EBF7F0] border border-[#32A05F]/30 flex items-center justify-between text-xs animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-[#32A05F] font-bold">
                    <UserCheck className="w-4 h-4" />
                    <span>{recipient.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {recipient.accountType === "business" ? "Corporate Business" : "Individual"} Account
                  </span>
                </div>
              )}

              {lookupError && !isLookingUp && (
                <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {lookupError}
                </p>
              )}
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Transfer Amount (NGN)
                </label>
                <span className="text-xs text-slate-500">
                  Available: <strong className="text-slate-800">₦{availableBalance.toLocaleString()}</strong>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-base">
                  ₦
                </span>
                <input
                  type="number"
                  min="100"
                  max={availableBalance}
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 transition-all"
                />
              </div>

              {/* Quick amount pills */}
              <div className="flex items-center gap-2 mt-2">
                {[5000, 10000, 25000, 50000, 100000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setAmount(String(quick))}
                    disabled={quick > availableBalance}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-40"
                  >
                    ₦{(quick / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Note Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Payment Note (Optional)
              </label>
              <input
                type="text"
                maxLength={200}
                placeholder="e.g. Design consultancy milestone advance"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || !recipientInput.trim() || !amount || parseFloat(amount) <= 0}
              className="w-full py-4 rounded-xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all active:scale-95 disabled:opacity-50 text-sm cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing Instant Transfer...
                </>
              ) : (
                <>
                  Send Payment Instantly <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
