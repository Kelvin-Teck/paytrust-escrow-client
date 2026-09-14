"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/stores/authStore";
import { getKybInfo, getTierInfo } from "@/lib/utils";

export default function IdentityVerificationPage() {
  const { user } = useAuthStore();
  const isBusiness = user?.accountType === "business";
  const kyb = getKybInfo(user?.kybStatus, user?.kybTier);
  const kyc = getTierInfo(user?.kycStatus);

  const personalDocs = [
    {
      id: "nin",
      title: "National Identity Number (NIN)",
      desc: "Instant electronic verification with slip or card",
      type: "gov_id",
    },
    {
      id: "passport",
      title: "International Passport",
      desc: "Standard photo page upload",
      type: "passport",
    },
    {
      id: "license",
      title: "Driver's License",
      desc: "Front and back photo verification",
      type: "drivers_license",
    },
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Compliance & Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            {isBusiness ? "Corporate KYB Tier Progression" : "Identity Verification & Limits"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isBusiness
              ? "Progress through corporate verification tiers to scale transaction ceilings, unlock custom PO milestones, and enable institutional multi-sig payouts."
              : "Verify your government-issued ID to unlock unlimited personal escrow limits and fast withdrawals."}
          </p>
        </div>

        {/* ─── B2B 3-TIER ROADMAP ─── */}
        {isBusiness ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Corporate Tier RoadMap & Limits
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${kyb.badgeBg} ${kyb.badgeTextClass} border ${kyb.badgeBorder}`}>
                Current: {kyb.title}
              </span>
            </div>

            {/* Tier 1 Card */}
            <div className={`p-6 rounded-3xl border transition-all ${
              kyb.tierNumber === 1
                ? "bg-white border-[#32A05F] ring-1 ring-[#32A05F]/20 shadow-md"
                : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Tier 1</span>
                    <h3 className="font-bold text-slate-900 text-base">Starter Corporate</h3>
                    {kyb.tierNumber >= 1 && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        Active Base
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Basic registration with RC Number and Contact Verification.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-900 block">₦2,000,000</span>
                  <span className="text-[10px] text-slate-400">Single Deal Limit</span>
                </div>
              </div>
            </div>

            {/* Tier 2 Card */}
            <div className={`p-6 rounded-3xl border transition-all ${
              kyb.tierNumber === 2 && kyb.isVerified
                ? "bg-white border-[#32A05F] ring-1 ring-[#32A05F]/20 shadow-md"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#32A05F]">Tier 2</span>
                    <h3 className="font-bold text-slate-900 text-base">Verified Corporate (LTD / LLC)</h3>
                    {kyb.tierNumber >= 2 && kyb.isVerified ? (
                      <span className="text-[10px] font-bold bg-[#32A05F] text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    CAC Certificate of Incorporation & Proof of Operating Address.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-600 font-medium">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-lg">✓ Multi-Phase Milestones</span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded-lg">✓ Purchase Order (PO) Tracking</span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded-lg">✓ Automated VAT Handling</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-900 block">₦50,000,000</span>
                  <span className="text-[10px] text-slate-400">Single Deal Limit</span>
                </div>
              </div>

              {kyb.tierNumber < 2 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Upload CAC Certificate to upgrade</span>
                  <Link
                    href="/profile/identity-verification/upload?mode=kyb&tier=2"
                    className="px-4 py-2 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>Upgrade to Tier 2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Tier 3 Card */}
            <div className={`p-6 rounded-3xl border transition-all ${
              kyb.tierNumber === 3 && kyb.isVerified
                ? "bg-slate-900 text-white border-slate-800 shadow-xl"
                : "bg-slate-900 text-white border-slate-800"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">Tier 3</span>
                    <h3 className="font-bold text-white text-base">Institutional & Enterprise</h3>
                    {kyb.tierNumber === 3 && kyb.isVerified ? (
                      <span className="text-[10px] font-bold bg-[#32A05F] text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Institutional Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded-md">
                        Unlimited Volume
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    SCUML Anti-Money Laundering Certificate, Ultimate Beneficial Ownership (UBO), & Financials.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-300 font-medium">
                    <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ Unlimited Escrow Volume</span>
                    <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ Dedicated Relationship Officer</span>
                    <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ Custom Reduced Platform Rates</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-400 block">₦500M+ / Custom</span>
                  <span className="text-[10px] text-slate-400">Unlimited Limit</span>
                </div>
              </div>

              {kyb.tierNumber < 3 && (
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Submit SCUML & Institutional Records</span>
                  <Link
                    href="/profile/identity-verification/upload?mode=kyb&tier=3"
                    className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>Upgrade to Tier 3</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ─── B2C INDIVIDUAL KYC ROADMAP ─── */
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Tier 2 Individual KYC</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verify government-issued identity documents to lift the ₦500,000 single transaction cap.
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${kyc.badgeBg} ${kyc.badgeTextClass} border ${kyc.badgeBorder}`}>
                  {kyc.badgeText}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Select Identity Document
              </span>
              {personalDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/profile/identity-verification/upload?mode=kyc&docType=${doc.type}`}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#32A05F]/50 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#32A05F] transition-colors">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
