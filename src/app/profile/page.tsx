"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Gift,
  Copy,
  Check,
  Share2,
  Sparkles,
  Tag,
  Globe,
  Building2,
  Zap,
  QrCode,
  Download,
  ExternalLink,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/stores/authStore";
import { profileService } from "@/services/api";
import { getTierInfo, getKybInfo } from "@/lib/utils";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfileHubPage() {
  const { user, setUser } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [originUrl, setOriginUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin);
    }

    setIsLoading(true);
    profileService
      .getProfile()
      .then((data) => {
        if (data) {
          setProfileData(data);
          setUser(data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [setUser]);

  const formatNameFromEmail = (email?: string) => {
    if (!email) return "My Account";
    const username = email.split("@")[0];
    return username
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const displayName =
    profileData?.name ||
    (profileData?.firstName
      ? `${profileData.firstName} ${profileData.lastName || ""}`.trim()
      : null) ||
    user?.name ||
    (user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : null) ||
    (profileData?.email
      ? formatNameFromEmail(profileData.email)
      : user?.email
        ? formatNameFromEmail(user.email)
        : "My Account");

  const userInitials = profileData?.firstName
    ? `${profileData.firstName[0]}${profileData.lastName?.[0] || ""}`.toUpperCase()
    : profileData?.name
      ? profileData.name
          .split(" ")
          .filter(Boolean)
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : user?.firstName
        ? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()
        : user?.name
          ? user.name
              .split(" ")
              .filter(Boolean)
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : "PT";

  const referralCode =
    profileData?.referralCode ||
    user?.referralCode ||
    (user?.id ? `PAY${user.id.slice(0, 6).toUpperCase()}` : "PAYTRUST");

  const referralLink = originUrl
    ? `${originUrl}/register?ref=${referralCode}`
    : `https://paytrust.io/register?ref=${referralCode}`;

  useEffect(() => {
    const rawQr = profileData?.referralQrCode || (user as any)?.referralQrCode;
    if (rawQr) {
      setQrDataUrl(rawQr);
    } else if (referralLink) {
      QRCode.toDataURL(referralLink, {
        width: 400,
        margin: 2,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(console.error);
    }
  }, [profileData?.referralQrCode, (user as any)?.referralQrCode, referralLink]);

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `paytrust-referral-${referralCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2500);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Join PayTrust Escrow Platform",
          text: `Join PayTrust using my referral code ${referralCode} for milestone-protected escrow trading & multi-currency settlements!`,
          url: referralLink,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      copyToClipboard(referralLink, "link");
    }
  };

  const userCountry = profileData?.country || user?.country || "Nigeria";
  const isBusiness = (profileData?.accountType || user?.accountType) === "business";
  const kyb = getKybInfo(profileData?.kybStatus || user?.kybStatus, profileData?.kybTier || user?.kybTier);
  const kyc = getTierInfo(profileData?.kycStatus || user?.kycStatus);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Account & Compliance Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal identity, corporate verification limits, and security settings.
          </p>
        </div>

        {/* User Profile & Referral Card */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Main Profile Info Header */}
          {isLoading && !profileData && !user ? (
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-slate-100">
              <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-7 w-48 rounded-lg" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-slate-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 text-[#32A05F] flex items-center justify-center font-bold text-2xl border border-[#32A05F]/20 shadow-xs shrink-0">
                {userInitials}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                    {displayName}
                  </h2>

                  {isBusiness ? (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${kyb.badgeBg} ${kyb.badgeTextClass} ${kyb.badgeBorder}`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      {kyb.title}
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${kyc.badgeBg} ${kyc.badgeTextClass} ${kyc.badgeBorder}`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {kyc.tierName}
                    </span>
                  )}
                </div>

                {/* Corporate Company Name and RC info if business */}
                {isBusiness && (profileData?.companyName || user?.companyName) && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{profileData?.companyName || user?.companyName}</span>
                    {(profileData?.rcNumber || user?.rcNumber) && (
                      <span className="text-slate-400 font-mono text-[11px]">
                        ({profileData?.rcNumber || user?.rcNumber})
                      </span>
                    )}
                  </div>
                )}

                {/* Contact and Location Metadata */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {profileData?.email || user?.email || "user@paytrust.io"}
                    </span>
                  </span>

                  {(profileData?.phone || user?.phone) && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{profileData?.phone || user?.phone}</span>
                    </span>
                  )}

                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{userCountry}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ─── VISUAL TIER CAPACITY & LIMIT CARD ─── */}
          <div className="p-6 sm:p-8 bg-slate-900 text-white border-b border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {isBusiness ? "Corporate Escrow Limits" : "Personal Escrow Limits"}
                </span>
              </div>
              <Link
                href="/profile/identity-verification"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>View All Tiers & Upgrade</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-[11px] text-slate-400 font-medium block">Current Tier</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {isBusiness ? kyb.title : kyc.tierName}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                  {isBusiness ? kyb.badgeText : kyc.badgeText}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-[11px] text-slate-400 font-medium block">Single Deal Limit</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {isBusiness ? kyb.singleLimitLabel : kyc.singleLimitLabel}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Per individual transaction
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-[11px] text-slate-400 font-medium block">Monthly Capacity</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {isBusiness ? kyb.monthlyLimitLabel : "Unlimited"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Rolling 30-day volume
                </span>
              </div>
            </div>
          </div>

          {/* Referral & Invite Rewards Section */}
          <div className="p-6 sm:p-8 bg-slate-50/60 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#32A05F] flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Referral Program & Invite Options</span>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-[#32A05F]/15 text-[#28874E]">
                      0.75% Fee Reward
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Invite partners and clients to trade with PayTrust escrow protection.
                  </p>
                </div>
              </div>

              {typeof navigator !== "undefined" &&
                typeof navigator.share === "function" && (
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Share</span>
                  </button>
                )}
            </div>

            {/* Referral Reward Rule Callout */}
            <div className="p-3.5 rounded-2xl bg-[#EBF7F0] border border-[#32A05F]/30 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-[#32A05F] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Gift className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900">0.75% Platform Fee Referral Reward:</span> When anyone registers via your referral code, invite link, or QR code, you receive <span className="font-bold text-[#15803d]">0.75% of the platform fee</span> credited directly to your wallet for their <span className="font-bold text-slate-900 underline decoration-[#32A05F]/40 underline-offset-2">very first completed transaction</span>!
              </div>
            </div>

            {/* Referral 3-Option Interactive Grid (Code, Link, QR) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              {/* 1. Referral Code */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#32A05F]" /> 1. Referral Code
                  </span>
                  <p className="text-[11px] text-slate-400">Share your alphanumeric code to enter at sign up.</p>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="font-mono text-base font-bold text-slate-900 tracking-wider">
                    {referralCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(referralCode, "code")}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      copiedCode
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95"
                    }`}
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 2. Shareable Invite Link */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#32A05F]" /> 2. Invite Link
                  </span>
                  <p className="text-[11px] text-slate-400">Direct registration link that pre-fills your referral code.</p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 min-w-0 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 font-mono text-[11px] truncate select-all">
                    {referralLink}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(referralLink, "link")}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      copiedLink
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-[#32A05F] hover:bg-[#28874E] text-white shadow-xs shadow-[#32A05F]/20 active:scale-95"
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3. Referral QR Code */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-[#32A05F]" /> 3. Referral QR Code
                  </span>
                  <p className="text-[11px] text-slate-400">Scan with camera to sign up or save as image.</p>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  {qrDataUrl ? (
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="w-12 h-12 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs hover:border-[#32A05F] transition-all shrink-0 flex items-center justify-center relative group cursor-pointer"
                      title="Click to view & expand QR code"
                    >
                      <img
                        src={qrDataUrl}
                        alt="Referral QR Code"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                  )}

                  <div className="flex-1 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-slate-600" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadQrCode}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-[#32A05F] hover:bg-[#28874E] text-white transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/profile/personal-information"
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#32A05F]/40 transition-all group flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#32A05F] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Personal & Corporate Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Legal name, business entity & contact
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </Link>

          <Link
            href="/profile/bank-details"
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#32A05F]/40 transition-all group flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#32A05F] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Bank Payout Accounts
                </h3>
                <p className="text-xs text-slate-500">
                  Manage NGN withdrawal accounts
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </Link>

          <Link
            href="/profile/identity-verification"
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#32A05F]/40 transition-all group flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#32A05F] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Identity & KYB Compliance
                </h3>
                <p className="text-xs text-slate-500">
                  Tier roadmap, CAC & SCUML audits
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </Link>

          <Link
            href="/profile/security"
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#32A05F]/40 transition-all group flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#32A05F] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Security & 2FA
                </h3>
                <p className="text-xs text-slate-500">
                  Google Authenticator & Password
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </Link>
        </div>

        {/* ─── Referral QR Code Interactive Modal ─── */}
        <AnimatePresence>
          {showQrModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4"
              >
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-1 pt-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-[#32A05F] mb-1">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Your Referral QR Code
                  </h3>
                  <p className="text-xs text-slate-500">
                    Scan with any smartphone camera to open signup with your code pre-filled.
                  </p>
                </div>

                {/* Big Clean QR Image Box */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs inline-block mx-auto">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`Referral QR Code for ${referralCode}`}
                      className="w-56 h-56 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-56 h-56 rounded-lg bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400">
                      Generating QR Code...
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Code:</span>
                    <span className="font-mono font-bold text-slate-900 tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {referralCode}
                    </span>
                  </div>
                </div>

                {/* Reward explanation reminder inside modal */}
                <div className="text-[11px] text-[#28874E] bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-100 font-medium">
                  Earn 0.75% of the platform fee on their 1st transaction!
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={downloadQrCode}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-[#32A05F] hover:bg-[#28874E] text-white shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(referralLink, "link")}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedLink ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
