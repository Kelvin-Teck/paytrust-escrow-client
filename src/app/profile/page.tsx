"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building,
  Mail,
  Phone,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/stores/authStore";
import { profileService } from "@/services/api";
import { getTierInfo } from "@/lib/utils";

export default function ProfileHubPage() {
  const { user, setUser } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    profileService
      .getProfile()
      .then((data) => {
        if (data) {
          setProfileData(data);
          setUser(data);
        }
      })
      .catch(console.error);
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

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Account & Security Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal profile, bank payout details, identity
            verification, and 2FA.
          </p>
        </div>

        {/* User Card */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center font-bold text-2xl border border-[#32A05F]/30">
            {userInitials}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {displayName}
              </h2>

              {(() => {
                const tier = getTierInfo(
                  profileData?.kycStatus || user?.kycStatus,
                );
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border w-fit mx-auto sm:mx-0 ${tier.badgeBg} ${tier.badgeTextClass} ${tier.badgeBorder}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {tier.tierName}
                  </span>
                );
              })()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {profileData?.email || user?.email || "user@paytrust.io"} •{" "}
              {profileData?.phone || "+234 Registered"}
            </p>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/profile/personal-information"
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#32A05F]/40 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center">
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
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#32A05F]/40 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center">
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
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#32A05F]/40 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center">
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
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#32A05F]/40 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center">
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
