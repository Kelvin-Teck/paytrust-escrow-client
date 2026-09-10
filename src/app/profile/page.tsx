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
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/stores/authStore";
import { profileService } from "@/services/api";
import { getTierInfo } from "@/lib/utils";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { getCountryByCode } from "@/data/countries";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfileHubPage() {
  const { user, setUser } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
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
        // User cancelled share or not supported
      }
    } else {
      copyToClipboard(referralLink, "link");
    }
  };

  const userCountry = profileData?.country || user?.country || "Nigeria";

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Account & Security Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal profile, referral rewards, bank payout details, and security.
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

                  {(() => {
                    const tier = getTierInfo(
                      profileData?.kycStatus || user?.kycStatus,
                    );
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${tier.badgeBg} ${tier.badgeTextClass} ${tier.badgeBorder}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {tier.tierName}
                      </span>
                    );
                  })()}
                </div>

                {/* Contact and Location Metadata */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{profileData?.email || user?.email || "user@paytrust.io"}</span>
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

          {/* Referral & Invite Rewards Section */}
          <div className="p-6 sm:p-8 bg-slate-50/60 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#32A05F] flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Referral Program & Invite Link</span>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-[#32A05F]/15 text-[#28874E]">
                      Earn Rewards
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Invite partners and clients to trade with escrow protection and earn fee rebates.
                  </p>
                </div>
              </div>

              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
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

            {/* Referral Code & Link Interactive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-1">
              {/* Referral Code Box */}
              <div className="sm:col-span-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#32A05F]" /> Referral Code
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-base sm:text-lg font-bold text-slate-900 tracking-wider">
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

              {/* Referral Link Box */}
              <div className="sm:col-span-8 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#32A05F]" /> Shareable Invite Link
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 font-mono text-xs truncate select-all">
                    {referralLink}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(referralLink, "link")}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      copiedLink
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-[#32A05F] hover:bg-[#28874E] text-white shadow-xs shadow-[#32A05F]/20 active:scale-95"
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied Link</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
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
                  Personal Information
                </h3>
                <p className="text-xs text-slate-500">
                  Legal name, email & phone number
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
                  Identity & KYC Verification
                </h3>
                <p className="text-xs text-slate-500">
                  Government ID & address verification
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
      </div>
    </AppShell>
  );
}
