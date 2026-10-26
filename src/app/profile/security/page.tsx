"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Loader2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { toast } from "@/components/ui/Toast";
import { profileService } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";

export default function SecuritySettingsPage() {
  const { user, setUser } = useAuthStore();
  const [is2FAEnabled, setIs2FAEnabled] = useState(Boolean(user?.twoFactorEnabled));

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 2FA Enrollment Modal State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollData, setEnrollData] = useState<{
    qrCodeDataUrl: string;
    secret: string;
    otpauthUrl: string;
  } | null>(null);
  const [isGenerating2Fa, setIsGenerating2Fa] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [isVerifying2Fa, setIsVerifying2Fa] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Disable 2FA Modal State
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableKey, setDisableKey] = useState("");
  const [isDisabling2Fa, setIsDisabling2Fa] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.twoFactorEnabled !== undefined) {
      setIs2FAEnabled(Boolean(user.twoFactorEnabled));
    }
  }, [user]);

  // 1. Password Change Handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await profileService.changePassword({ currentPassword, newPassword });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Failed to update password.";
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 2. Open 2FA Enrollment
  const handleStart2Fa = async () => {
    setIsGenerating2Fa(true);
    setEnrollError(null);
    try {
      const data = await profileService.generate2FaSecret();
      setEnrollData(data);
      setShowEnrollModal(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Could not generate 2FA secret. Please try again.";
      toast.error(msg);
    } finally {
      setIsGenerating2Fa(false);
    }
  };

  // 3. Confirm 2FA Code
  const handleConfirm2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim() || verifyCode.trim().length !== 6) {
      setEnrollError("Please enter the complete 6-digit code from your authenticator app.");
      return;
    }

    setIsVerifying2Fa(true);
    setEnrollError(null);
    try {
      await profileService.enable2Fa(verifyCode.trim());
      setIs2FAEnabled(true);
      if (user) {
        setUser({ ...user, twoFactorEnabled: true });
      }
      setShowEnrollModal(false);
      setVerifyCode("");
      toast.success("Two-Factor Authentication is now active on your account!");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Invalid 6-digit code. Please check your authenticator clock and try again.";
      setEnrollError(msg);
      toast.error(msg);
    } finally {
      setIsVerifying2Fa(false);
    }
  };

  // 4. Disable 2FA
  const handleDisable2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableKey.trim()) {
      setDisableError("Please enter your current password or 2FA code.");
      return;
    }

    setIsDisabling2Fa(true);
    setDisableError(null);
    try {
      await profileService.disable2Fa(disableKey.trim());
      setIs2FAEnabled(false);
      if (user) {
        setUser({ ...user, twoFactorEnabled: false });
      }
      setShowDisableModal(false);
      setDisableKey("");
      toast.success("Two-Factor Authentication has been disabled.");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Incorrect code or password. Could not disable 2FA.";
      setDisableError(msg);
      toast.error(msg);
    } finally {
      setIsDisabling2Fa(false);
    }
  };

  const handleCopySecret = () => {
    if (enrollData?.secret) {
      navigator.clipboard.writeText(enrollData.secret);
      setCopiedSecret(true);
      toast.success("Secret key copied!");
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 pb-16">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Account Protection
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Security & Authentication
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure two-factor authentication and update your login password.
          </p>
        </div>

        {/* 2FA Card */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  is2FAEnabled
                    ? "bg-[#EBF7F0] text-[#32A05F]"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">
                    Two-Factor Authentication (TOTP)
                  </h3>
                  {is2FAEnabled && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EBF7F0] text-[#32A05F] border border-[#32A05F]/30">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Protect escrow releases and sensitive actions using Google Authenticator, Authy, or 1Password.
                </p>
              </div>
            </div>

            {is2FAEnabled ? (
              <button
                type="button"
                onClick={() => setShowDisableModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shrink-0"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart2Fa}
                disabled={isGenerating2Fa}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#32A05F] hover:bg-[#28874E] text-white shadow-md shadow-[#32A05F]/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                {isGenerating2Fa ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Setting up...
                  </>
                ) : (
                  <>Enable 2FA</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Change Password Form */}
        <form
          onSubmit={handlePasswordChange}
          className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5"
        >
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <KeyRound className="w-5 h-5 text-[#32A05F]" />
            <h3 className="font-bold text-slate-900 text-base">Change Account Password</h3>
          </div>

          {passwordError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{passwordError}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Confirm New Password
              </label>
              <input
                type={showNew ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword || !currentPassword || !newPassword}
            className="w-full py-3.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 text-sm cursor-pointer"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
              </>
            ) : (
              "Save New Password"
            )}
          </button>
        </form>

        {/* 2FA Setup Modal */}
        {showEnrollModal && enrollData && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Set Up Authenticator 2FA</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  1. Scan this QR code with <strong>Google Authenticator</strong>, <strong>Authy</strong>, or your preferred authenticator app:
                </p>

                {/* QR Code Container */}
                <div className="flex justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={enrollData.qrCodeDataUrl}
                    alt="2FA QR Code"
                    className="w-44 h-44 rounded-lg shadow-sm"
                  />
                </div>

                {/* Manual Secret Code */}
                <div>
                  <p className="text-[11px] text-slate-500 mb-1.5">
                    Or enter this secret key manually into your app:
                  </p>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono">
                    <span className="flex-1 truncate select-all font-semibold text-slate-800">
                      {enrollData.secret}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#32A05F] transition-colors shrink-0"
                    >
                      {copiedSecret ? (
                        <Check className="w-3.5 h-3.5 text-[#32A05F]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Verification Code Form */}
                <form onSubmit={handleConfirm2Fa} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                      2. Enter the 6-Digit Code from App
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      placeholder="000000"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 transition-all"
                    />
                  </div>

                  {enrollError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>{enrollError}</p>
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEnrollModal(false)}
                      className="flex-1 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifying2Fa || verifyCode.length !== 6}
                      className="flex-1 py-3 rounded-xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white text-xs transition-colors shadow-md shadow-[#32A05F]/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {isVerifying2Fa ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                        </>
                      ) : (
                        "Verify & Enable"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Disable 2FA Modal */}
        {showDisableModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Disable Two-Factor Auth</h3>
                <button
                  type="button"
                  onClick={() => setShowDisableModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Confirm your identity to disable 2FA protection. Enter your current password or a 6-digit code from your authenticator app:
              </p>

              <form onSubmit={handleDisable2Fa} className="space-y-4">
                <div>
                  <input
                    type="password"
                    required
                    placeholder="Password or 6-digit OTP"
                    value={disableKey}
                    onChange={(e) => setDisableKey(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all"
                  />
                </div>

                {disableError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{disableError}</p>
                  </div>
                )}

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDisableModal(false)}
                    className="flex-1 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDisabling2Fa || !disableKey.trim()}
                    className="flex-1 py-3 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white text-xs transition-colors shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isDisabling2Fa ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Disabling...
                      </>
                    ) : (
                      "Confirm Disable"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
