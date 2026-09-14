"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, ShieldCheck, UserCheck } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/stores/authStore";

export default function IdentityVerificationPage() {
  const { user } = useAuthStore();

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
      <div className="max-w-2xl mx-auto space-y-8 pb-10">
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
            Identity & Compliance Verification
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete your KYC/KYB identity verification to unlock unlimited transaction volumes, higher withdrawal limits, and corporate contracts.
          </p>
        </div>

        {/* Corporate KYB Verification Card */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#32A05F]/20 text-[#32A05F] flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Corporate KYB Verification</h3>
                <p className="text-xs text-slate-400">CAC Certificate of Incorporation & Proof of Operating Address</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#32A05F] text-white px-2 py-0.5 rounded-full">
              B2B Standard
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Required for businesses to issue milestone invoices with custom PO numbers, automated VAT deductions, and multi-signature corporate payouts.
          </p>

          <Link
            href="/profile/identity-verification/upload?mode=kyb"
            className="w-full py-3 px-4 rounded-xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#32A05F]/25"
          >
            <span>Upload Corporate CAC Documents</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Individual KYC Documents */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Individual Identity Verification (KYC Tier 2)
            </span>
          </div>

          {personalDocs.map((doc) => (
            <Link
              key={doc.id}
              href={`/profile/identity-verification/upload?mode=kyc&docType=${doc.type}`}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#32A05F]/50 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#32A05F] transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{doc.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
