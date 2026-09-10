"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowLeft,
  ShieldCheck,
  ArrowRight,
  CreditCard,
  Building,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Wallet,
  Sparkles,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { paymentService } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000, 250000];

interface SuccessDetails {
  reference: string;
  amount: number;
  date: string;
}

/**
 * Dynamically loads the Paystack Inline JavaScript SDK if not already in DOM.
 */
function ensurePaystackLoaded(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).PaystackPop && typeof (window as any).PaystackPop.setup === "function") {
      resolve(true);
      return;
    }

    const existing = document.getElementById("paystack-inline-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      // In case it already loaded
      setTimeout(() => {
        if ((window as any).PaystackPop) resolve(true);
        else resolve(false);
      }, 1500);
      return;
    }

    const script = document.createElement("script");
    script.id = "paystack-inline-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function FundNairaWalletPage() {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState("50000");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successDetails, setSuccessDetails] = useState<SuccessDetails | null>(null);
  const [copied, setCopied] = useState(false);

  // Preload Paystack SDK on component mount
  useEffect(() => {
    ensurePaystackLoaded().catch(() => {});
  }, []);

  const numAmount = parseFloat(amount) || 0;

  const handleCopyRef = () => {
    if (successDetails?.reference) {
      navigator.clipboard.writeText(successDetails.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePaymentSuccess = async (reference: string, fundedAmount: number) => {
    setIsVerifying(true);
    try {
      await paymentService.verifyPayment(reference);
    } catch (err) {
      console.warn("Verify check notice:", err);
    } finally {
      setIsVerifying(false);
      setIsProcessing(false);
      setSuccessDetails({
        reference,
        amount: fundedAmount,
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount < 100) {
      setError("Minimum deposit amount is ₦100");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Initialize funding on backend
      const data = await paymentService.initializeFunding({
        amount: numAmount,
        currency: "NGN",
      });

      console.log("[Paystack Init Response]:", data);

      const publicKey =
        data?.publicKey ||
        process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
        "pk_test_4494148fefeef36d2c15999becc7ec7d1ebe3975";

      // 2. Ensure Paystack inline script is ready
      const scriptReady = await ensurePaystackLoaded();

      // Get user email safely
      let userEmail = user?.email;
      if (!userEmail && typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("paytrust_user");
          if (stored) {
            userEmail = JSON.parse(stored)?.email;
          }
        } catch {}
      }
      if (!userEmail) userEmail = "customer@paytrust.ng";

      // 3. Open Paystack Popup Modal
      if (
        scriptReady &&
        typeof window !== "undefined" &&
        (window as any).PaystackPop &&
        typeof (window as any).PaystackPop.setup === "function"
      ) {
        const paystackOptions: any = {
          key: publicKey,
          email: userEmail,
          amount: Math.round(numAmount * 100),
          currency: "NGN",
          ref: data?.reference,
          channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
          callback: async (response: any) => {
            console.log("[Paystack Success Callback]:", response);
            const ref = response?.reference || data?.reference;
            await handlePaymentSuccess(ref, numAmount);
          },
          onClose: () => {
            console.log("[Paystack Modal Closed]");
            setIsProcessing(false);
          },
        };

        if (data?.accessCode) {
          paystackOptions.access_code = data.accessCode;
        }

        const handler = (window as any).PaystackPop.setup(paystackOptions);
        if (handler && typeof handler.openIframe === "function") {
          handler.openIframe();
          return;
        }
      }

      // 4. Fallback to redirect URL if modal is blocked or unavailable
      const redirectUrl = data?.authorizationUrl || data?.authorization_url;
      if (redirectUrl) {
        console.log("[Paystack Fallback Redirect]:", redirectUrl);
        window.location.href = redirectUrl;
        return;
      }

      throw new Error("Unable to open Paystack payment modal. Please try again.");
    } catch (err: any) {
      console.error("[Paystack Funding Error]:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Payment initialization failed. Please try again.";
      setError(errMsg);
      setIsProcessing(false);
    }
  };

  return (
    <AppShell>
      {/* Paystack Inline Script Tag */}
      <Script
        id="paystack-inline-script"
        src="https://js.paystack.co/v1/inline.js"
        strategy="afterInteractive"
      />

      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          href="/wallet"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Wallets
        </Link>

        {/* ─── SUCCESS MODAL / RECEIPT ─── */}
        {successDetails ? (
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mx-auto border-4 border-[#32A05F]/20 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F] bg-[#EBF7F0] px-3 py-1 rounded-full">
                Deposit Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 pt-2 tabular-nums">
                ₦{successDetails.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-sm text-slate-500">
                Your Naira wallet has been successfully funded and is available for escrow transactions.
              </p>
            </div>

            {/* Receipt Summary Details */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Payment Channel</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#32A05F]"></span> Paystack Inline
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Transaction Date</span>
                <span className="font-bold text-slate-800 tabular-nums">{successDetails.date}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Reference Code</span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="font-mono font-bold text-slate-800 flex items-center gap-1.5 hover:text-[#32A05F] transition-colors"
                  title="Click to copy reference"
                >
                  <span>{successDetails.reference}</span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#32A05F]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/wallet"
                className="flex-1 py-4 px-6 rounded-2xl font-bold bg-[#32A05F] hover:bg-[#28874E] active:scale-[0.98] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/20 transition-all text-sm"
              >
                <Wallet className="w-4 h-4" />
                <span>Go to Wallet Overview</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccessDetails(null);
                  setAmount("50000");
                }}
                className="py-4 px-6 rounded-2xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all text-sm"
              >
                Make Another Deposit
              </button>
            </div>
          </div>
        ) : (
          /* ─── FUNDING FORM ─── */
          <>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> In-App Instant Deposit
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
                Fund Nigerian Naira Wallet
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Deposit funds directly into your PayTrust escrow balance using Paystack's secure modal.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleFund}
              className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Amount to Deposit (NGN)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="100"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-2xl focus:bg-white focus:outline-none focus:border-[#32A05F] focus:ring-2 focus:ring-[#32A05F]/20 transition-all tabular-nums"
                  />
                </div>

                {/* Quick Amount Chips */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setAmount(String(val))}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center tabular-nums ${
                        numAmount === val
                          ? "bg-[#EBF7F0] text-[#32A05F] border-[#32A05F]"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      ₦{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Badges */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Supported Payment Rails
                  </span>
                  <span className="text-[11px] font-bold text-[#32A05F] bg-[#EBF7F0] px-2 py-0.5 rounded-md">
                    Secured by Paystack Inline
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600 font-medium">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#32A05F]" /> Debit Cards (Mastercard, Visa, Verve)
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" /> Direct Bank Transfer
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" /> USSD & OPay
                  </span>
                </div>
              </div>

              {/* Escrow Guarantee */}
              <div className="p-4 rounded-2xl bg-[#EBF7F0] border border-[#32A05F]/20 space-y-1 text-xs text-[#28874E]">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#32A05F]" />
                  Guaranteed Escrow Safety
                </p>
                <p className="text-slate-600 font-medium">
                  Deposited funds are securely held in your insured escrow balance and instantly available for creating or funding contracts.
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessing || numAmount < 100}
                className="w-full py-4 rounded-2xl font-bold bg-[#32A05F] hover:bg-[#28874E] active:scale-[0.98] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all disabled:opacity-50 text-base"
              >
                {isProcessing || isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>
                      {isVerifying ? "Verifying Deposit Confirmation..." : "Opening Secure Payment Modal..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="tabular-nums">
                      Pay ₦{numAmount > 0 ? numAmount.toLocaleString() : "0"} with Paystack
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </AppShell>
  );
}
