"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Layers,
  Building2,
  UserCheck,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { transactionService, authService } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/components/ui/Toast";

export default function PublicInvoicePayPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user: currentUser, setAuth } = useAuthStore();

  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Account Claim Modal state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPublicDeal() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await transactionService.getPublicPreview(id);
        setTransaction(data);
      } catch (err: any) {
        console.error("Failed to load public escrow deal:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "This escrow agreement could not be found or has expired."
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadPublicDeal();
  }, [id]);

  const handleProceedToPayment = () => {
    if (currentUser) {
      router.push(`/transaction/${id}`);
    } else {
      setShowClaimModal(true);
    }
  };

  const handleQuickClaimAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setClaimError("Password must be at least 6 characters long.");
      return;
    }

    setIsClaiming(true);
    setClaimError(null);

    try {
      const buyerEmail = transaction?.buyer?.email;
      const buyerPhone = transaction?.buyer?.phone;

      // 1. Claim/Register account with the buyer's email
      const registerRes = await authService.register({
        email: buyerEmail,
        phone: buyerPhone,
        password,
        firstName: transaction?.buyer?.name || "Buyer",
      });

      // 2. Log in immediately
      const loginRes = await authService.login({
        emailOrPhone: buyerEmail || buyerPhone,
        password,
      });

      if (loginRes.token && loginRes.user) {
        setAuth(loginRes.user, loginRes.token);
        toast.success(
          "Account secured successfully!",
          "Redirecting you to secure escrow payment..."
        );
        setShowClaimModal(false);
        router.push(`/transaction/${id}`);
      } else {
        router.push(`/login?redirect=/transaction/${id}`);
      }
    } catch (err: any) {
      console.error("Claim account error:", err);
      // If user already has full credentials, direct them to login
      if (err.response?.status === 409 || err.message?.includes("already exists")) {
        toast.info("Account already exists. Please log in to proceed.");
        router.push(`/login?redirect=/transaction/${id}`);
      } else {
        setClaimError(
          err.response?.data?.message ||
            err.message ||
            "Failed to activate account. Please try logging in."
        );
      }
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#32A05F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            Loading secure escrow agreement...
          </p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Escrow Agreement Unavailable
          </h2>
          <p className="text-sm text-slate-500">
            {error || "This escrow deal link is invalid or has expired."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-semibold transition-all"
          >
            Return to PayTrust Homepage
          </Link>
        </div>
      </div>
    );
  }

  const isB2B = transaction.dealType === "b2b_milestone" || transaction.dealType === "b2b_contract";
  const totalAmount = Number(transaction.totalAmount || transaction.amount || 0);
  const sellerName = transaction.seller?.name || transaction.seller?.companyName || "Verified Seller";
  const sellerType = transaction.seller?.accountType === "business" ? "Corporate Business" : "Verified Individual";

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Branding Banner */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#32A05F] flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-[#32A05F]/30">
              P
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Pay<span className="text-[#32A05F]">Trust</span>
            </span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-[#32A05F]" /> Bank-Grade Escrow Vault
          </div>
        </div>

        {/* Main Escrow Deal Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-[#0F172A] to-slate-900 text-white space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-white/10 text-emerald-300">
                Order #{transaction.id?.slice(0, 8)}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#32A05F] text-white">
                🛡️ Escrow Protected
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {transaction.title || transaction.description || "Escrow Agreement"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Created by <strong className="text-white">{sellerName}</strong> • {sellerType}
              </p>
            </div>
          </div>

          {/* Amount & Inspection Box */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-[#F0FDF4]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Escrow Payable
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-0.5">
                ₦{totalAmount.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#32A05F] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {transaction.inspectionPeriod || 3}-Day Inspection Window
                </div>
                <div className="text-[11px] text-slate-500">
                  Funds held safely until you confirm receipt
                </div>
              </div>
            </div>
          </div>

          {/* Deal Details & Items */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Counterparty details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Seller Information
                </span>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  {transaction.seller?.accountType === "business" ? (
                    <Building2 className="w-4 h-4 text-[#32A05F]" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-[#32A05F]" />
                  )}
                  {sellerName}
                </p>
                <p className="text-xs text-slate-500">{sellerType}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Buyer Information (You)
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {transaction.buyer?.name || "Customer"}
                </p>
                <p className="text-xs text-slate-500">
                  {transaction.buyer?.email || transaction.buyer?.phone || "Invited Buyer"}
                </p>
              </div>
            </div>

            {/* Deliverables / Milestones */}
            {isB2B && transaction.milestones && transaction.milestones.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#32A05F]" /> Milestone Schedule
                </h3>
                <div className="space-y-2">
                  {transaction.milestones.map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {m.title || `Phase ${idx + 1}`}
                        </p>
                        {m.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-slate-900">
                          ₦{Number(m.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : transaction.items && transaction.items.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#32A05F]" /> Itemized Order Summary
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {transaction.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-white flex items-center justify-between gap-4 text-sm"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-400">Qty: {item.quantity || 1}</p>
                      </div>
                      <span className="font-extrabold text-slate-900">
                        ₦{Number(item.price || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Escrow Protection Guarantee Explanation */}
            <div className="p-5 rounded-2xl bg-[#EBF7F0] border border-[#32A05F]/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#32A05F]" /> 100% Buyer Protection Guarantee
              </div>
              <ul className="text-xs text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#32A05F] shrink-0 mt-0.5" />
                  <span>
                    Your payment of <strong>₦{totalAmount.toLocaleString()}</strong> is held safely in PayTrust’s escrow vault.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#32A05F] shrink-0 mt-0.5" />
                  <span>
                    The seller is notified to dispatch your items immediately.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#32A05F] shrink-0 mt-0.5" />
                  <span>
                    Money is released to the seller <strong>ONLY after you inspect & confirm delivery</strong>.
                  </span>
                </li>
              </ul>
            </div>

            {/* Call to Action Button */}
            <div className="pt-2">
              <button
                onClick={handleProceedToPayment}
                className="w-full py-4 rounded-2xl bg-[#32A05F] hover:bg-[#28874E] text-white text-base font-bold shadow-lg shadow-[#32A05F]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Lock className="w-5 h-5" /> Accept & Pay with Escrow (₦{totalAmount.toLocaleString()})
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Protected by PayTrust Escrow Services Nigeria. Licensed & compliant.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Account Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Secure Your Escrow Account
              </h3>
              <p className="text-xs text-slate-500">
                Set a password to protect your payment and track your delivery.
              </p>
            </div>

            <form onSubmit={handleQuickClaimAndPay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Email / Phone
                </label>
                <input
                  type="text"
                  disabled
                  value={transaction.buyer?.email || transaction.buyer?.phone || ""}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Create Account Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter at least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {claimError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {claimError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isClaiming}
                  className="flex-1 py-3 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isClaiming ? "Securing..." : "Proceed to Pay"} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

