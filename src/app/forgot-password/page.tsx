"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { authService } from "@/services/api";
import { toast } from "@/components/ui/Toast";
import {
  PasswordStrengthIndicator,
  checkPasswordCriteria,
} from "@/components/ui/PasswordStrengthIndicator";

type Step = "request" | "reset" | "success";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (step !== "reset" || resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendCooldown]);

  // Code input handlers
  const handleCodeInput = (index: number, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, "");
    if (!cleanVal && val) return;

    const newCode = [...code];
    newCode[index] = cleanVal.slice(-1);
    setCode(newCode);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    if (!pastedData) return;

    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] || "";
    }
    setCode(newCode);

    const nextFocusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const fullCode = code.join("");
  const isCodeComplete = fullCode.length === 6;

  // Step 1: Request reset code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.forgotPassword({
        email: email.trim().toLowerCase(),
      });

      toast.success(
        "Reset code sent!",
        `We've sent a 6-digit verification code to ${email.trim().toLowerCase()}`,
      );
      setStep("reset");
      setResendCooldown(60);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Could not find an account with that email address.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);

    try {
      await authService.forgotPassword({
        email: email.trim().toLowerCase(),
      });
      setResendCooldown(60);
      toast.success("New code sent!", "Please check your inbox.");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Failed to resend code.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  // Step 2: Submit new password with code
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCodeComplete) {
      setErrorMessage("Please enter the complete 6-digit reset code.");
      return;
    }

    const { isValid } = checkPasswordCriteria(newPassword);
    if (!isValid) {
      setErrorMessage("Please meet all password strength requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.resetPassword({
        email: email.trim().toLowerCase(),
        code: fullCode,
        password: newPassword,
      });

      toast.success(
        "Password updated successfully!",
        "You can now sign in with your new password.",
      );
      setStep("success");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Invalid or expired verification code. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl relative overflow-hidden">
      <AnimatePresence mode="wait">
        {step === "request" && (
          <motion.div
            key="request-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Forgot Password?
              </h1>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                Enter your registered email address and we'll send you a 6-digit
                code to securely reset your password.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-4 rounded-2xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all active:scale-[0.98] disabled:opacity-50 text-sm mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#32A05F] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Log In
              </Link>
            </div>
          </motion.div>
        )}

        {step === "reset" && (
          <motion.div
            key="reset-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Reset Password
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter the 6-digit code sent to{" "}
                <span className="font-bold text-slate-800">{email}</span> and
                create your new password.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* OTP Input Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  6-Digit Reset Code
                </label>
                <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeInput(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={idx === 0 ? handlePaste : undefined}
                      className="w-full h-12 text-center text-lg font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
                    />
                  ))}
                </div>

                {/* Resend Link */}
                <div className="flex items-center justify-between text-xs mt-2 px-1 text-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("request");
                      setCode(["", "", "", "", "", ""]);
                    }}
                    className="text-slate-500 hover:text-slate-800 hover:underline"
                  >
                    Change email
                  </button>
                  {resendCooldown > 0 ? (
                    <span className="text-slate-400">
                      Resend in {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isResending}
                      className="font-bold text-[#32A05F] hover:text-[#28874E] inline-flex items-center gap-1"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`}
                      />{" "}
                      Resend code
                    </button>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-11 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] text-sm font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <PasswordStrengthIndicator password={newPassword} />
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-11 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] text-sm font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1 px-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  isLoading ||
                  !isCodeComplete ||
                  !newPassword ||
                  newPassword !== confirmPassword
                }
                className="w-full py-4 rounded-2xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all active:scale-[0.98] disabled:opacity-50 text-sm mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password & Secure Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-16 h-16 rounded-3xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Password Reset Complete!
            </h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">
              Your password has been successfully updated. You can now use your
              new credentials to log in.
            </p>

            <Link
              href={
                email
                  ? `/login?email=${encodeURIComponent(email.trim())}`
                  : "/login"
              }
              className="w-full py-4 rounded-2xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all active:scale-[0.98] text-sm"
            >
              <span>Proceed to Log In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative overflow-hidden">
      <header className="p-6 sm:p-8 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10">
        <Logo size="md" href="/" />
        <Link
          href="/login"
          className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#32A05F] transition-colors"
        >
          Remember your password? <span className="text-[#32A05F]">Log In</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <Suspense
          fallback={<div className="text-slate-400">Loading form...</div>}
        >
          <ForgotPasswordForm />
        </Suspense>
      </main>

      <footer className="p-6 text-center text-xs text-slate-400 relative z-10">
        PayTrust Secure Password Recovery Portal
      </footer>
    </div>
  );
}
