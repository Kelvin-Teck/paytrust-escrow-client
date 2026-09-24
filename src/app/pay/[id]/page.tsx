"use client";

import React, { useState, useEffect, useRef } from "react";
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
  KeyRound,
  RotateCw,
  Mail,
  Phone,
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

  // 2-Step Secure Account Activation Modal state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [authStep, setAuthStep] = useState<"password" | "otp">("password");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

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

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authStep === "otp" && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [authStep, countdown]);

  const handleProceedToPayment = () => {
    if (currentUser) {
      router.push(`/transaction/${id}`);
    } else {
      setAuthStep("password");
      setShowClaimModal(true);
    }
  };

  // Step 1: Submit chosen password & trigger OTP
  const handleInitiatePasswordStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setModalError("Password must be at least 6 characters long.");
      return;
    }

    setIsProcessing(true);
    setModalError(null);

    const buyerEmail = transaction?.buyer?.email ? transaction.buyer.email.trim() : undefined;
    const buyerPhone = transaction?.buyer?.phone ? transaction.buyer.phone.trim() : undefined;

    try {
      // 1. Claim account & set password (backend dispatches 6-digit OTP)
      await authService.register({
        email: buyerEmail,
        phone: buyerPhone,
        password,
        firstName: transaction?.buyer?.name || "Buyer",
      });

      // Switch to Step 2: OTP Verification
      setAuthStep("otp");
      setCountdown(60);
      setCanResend(false);
      toast.success("6-digit verification code sent to your email / phone!");
    } catch (err: any) {
      console.warn("Register step notice:", err.message);
      // If user already exists and registered with their password, attempt to send OTP or direct to login
      if (err.response?.status === 409 || err.message?.includes("already exists")) {
        try {
          await authService.resendVerification({ email: buyerEmail, phone: buyerPhone });
          setAuthStep("otp");
          setCountdown(60);
          setCanResend(false);
          toast.info("Account exists. A fresh verification code has been sent!");
        } catch {
          toast.info("Account already active. Please log in to proceed.");
          router.push(`/login?redirect=/transaction/${id}`);
        }
      } else {
        setModalError(
          err.response?.data?.message ||
            err.message ||
            "Failed to initiate account security. Please try again."
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Verify 6-Digit OTP and Log In
  const handleVerifyOtpAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpCode.join("").trim();
    if (fullOtp.length !== 6) {
      setModalError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsProcessing(true);
    setModalError(null);

    const buyerEmail = transaction?.buyer?.email ? transaction.buyer.email.trim() : undefined;
    const buyerPhone = transaction?.buyer?.phone ? transaction.buyer.phone.trim() : undefined;

    try {
      // 1. Verify code on backend
      await authService.verifyEmail({
        email: buyerEmail,
        phone: buyerPhone,
        code: fullOtp,
      });

      // 2. Log in with the verified credentials
      const loginRes = await authService.login({
        email: buyerEmail,
        phone: buyerPhone,
        emailOrPhone: buyerEmail || buyerPhone,
        password,
      });

      if (loginRes.token && loginRes.user) {
        setAuth(loginRes.user, loginRes.token);
        toast.success(
          "Identity verified successfully!",
          "Redirecting to secure escrow checkout..."
        );
        setShowClaimModal(false);
        router.push(`/transaction/${id}`);
      } else {
        router.push(`/login?redirect=/transaction/${id}`);
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setModalError(
        err.response?.data?.message ||
          err.message ||
          "Invalid or expired verification code. Please request a new one."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsProcessing(true);
    setModalError(null);
    const buyerEmail = transaction?.buyer?.email ? transaction.buyer.email.trim() : undefined;
    const buyerPhone = transaction?.buyer?.phone ? transaction.buyer.phone.trim() : undefined;

    try {
      await authService.resendVerification({ email: buyerEmail, phone: buyerPhone });
      setCountdown(60);
      setCanResend(false);
      setOtpCode(["", "", "", "", "", ""]);
      toast.success("Fresh verification code sent!");
      if (otpInputsRef.current[0]) {
        otpInputsRef.current[0].focus();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to resend code");
    } finally {
      setIsProcessing(false);
    }
  };

  // OTP Input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-advance
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otpCode];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtpCode(newOtp);
    const focusIdx = Math.min(pasted.length, 5);
    otpInputsRef.current[focusIdx]?.focus();
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
  const buyerContact = transaction.buyer?.email || transaction.buyer?.phone || "your contact address";

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
                className="w-full py-4 rounded-2xl bg-[#32A05F] hover:bg-[#28874E] text-white text-base font-bold shadow-lg shadow-[#32A05F]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
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

      {/* 2-Step Secure Account Activation Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {authStep === "password" ? (
              // Step 1: Password Creation
              <>
                <div className="space-y-2 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mx-auto shadow-inner">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Secure Your Escrow Account
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set a password to protect your payment and track your delivery.
                  </p>
                </div>

                <form onSubmit={handleInitiatePasswordStep} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Email / Phone
                    </label>
                    <input
                      type="text"
                      disabled
                      value={transaction.buyer?.email || transaction.buyer?.phone || ""}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-sm font-medium cursor-not-allowed"
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

                  {modalError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                      {modalError}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowClaimModal(false)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 py-3 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? "Sending OTP..." : "Send Verification Code"} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // Step 2: 6-Digit OTP Verification
              <>
                <div className="space-y-2 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#32A05F] flex items-center justify-center mx-auto shadow-inner">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Verify Your Identity
                  </h3>
                  <p className="text-xs text-slate-500">
                    We sent a 6-digit verification code to{" "}
                    <strong className="text-slate-700">{buyerContact}</strong>.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtpAndLogin} className="space-y-5">
                  {/* 6 Digit Input Boxes */}
                  <div className="flex items-center justify-between gap-2">
                    {otpCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpInputsRef.current[index] = el;
                        }}
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        autoFocus={index === 0}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="w-11 h-13 text-center text-xl font-black rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 focus:border-[#32A05F] transition-all"
                      />
                    ))}
                  </div>

                  {modalError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                      {modalError}
                    </div>
                  )}

                  {/* Resend Timer */}
                  <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isProcessing}
                        className="text-[#32A05F] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> Resend Code
                      </button>
                    ) : (
                      <span>Resend code in <strong className="text-slate-800">{countdown}s</strong></span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthStep("password")}
                      className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing || otpCode.join("").length !== 6}
                      className="flex-1 py-3 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? "Verifying..." : "Verify & Pay"} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
