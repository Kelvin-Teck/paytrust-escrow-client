"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, ArrowRight } from "lucide-react";
import AppShell from "@/components/layout/AppShell";

export default function InvoiceReviewPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText("https://paytrust.io/invoice/INV-2026-9824");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/transaction/invoice"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Edit Invoice
        </Link>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F]">
                Escrow Milestone Invoice
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                INV-2026-9824
              </h1>
              <p className="text-xs text-slate-400">
                Created Sep 08, 2026 • Status: Ready to Fund
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-semibold">
                Total Invoice Amount
              </span>
              <div className="text-3xl font-extrabold text-slate-900">
                ₦500,000
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">
                Issued By (Seller)
              </span>
              <p className="font-bold text-slate-900 mt-1">Lanre Balogun</p>
              <p className="text-xs text-slate-500">lanre@paytrust.io</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">
                Billed To (Buyer)
              </span>
              <p className="font-bold text-slate-900 mt-1">Acme Corporation</p>
              <p className="text-xs text-slate-500">buyer@acmecorp.com</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Protected Deliverables
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 text-sm">
                  Milestone 1: Project Architecture & Wireframes
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Due Date: Sep 20, 2026
                </p>
              </div>
              <span className="font-bold text-slate-900 text-sm">₦500,000</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Payout Settlement Summary
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Invoice Total:</span>
                <span className="font-semibold text-slate-900">₦500,000</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>PayTrust Platform Fee (2.5%):</span>
                <span className="font-semibold text-rose-600">-₦12,500</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                <span className="text-slate-900">Net Seller Payout:</span>
                <span className="text-[#32A05F]">₦487,500</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#EBF7F0] border border-[#32A05F]/30 flex items-center justify-between">
            <div className="text-xs text-slate-800 font-medium">
              Shareable Escrow Link:{" "}
              <span className="font-mono font-bold text-[#32A05F]">
                https://paytrust.io/invoice/INV-2026-9824
              </span>
            </div>
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />{" "}
              {copied ? "Copied Link!" : "Copy Link"}
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/transaction")}
              className="w-full py-3.5 rounded-xl font-semibold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 text-sm"
            >
              Confirm & Publish Invoice <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
