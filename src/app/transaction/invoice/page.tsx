"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { transactionService } from "@/services/api";
import { toast } from "@/components/ui/Toast";

export default function CreateInvoicePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [inspectionPeriod, setInspectionPeriod] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await transactionService.createInvoice({
        title,
        description,
        amount: parseFloat(amount),
        buyerEmail,
        inspectionPeriod: Number(inspectionPeriod),
      });
      toast.success(
        "Escrow invoice created successfully!",
        "Counterparty has been notified to review and fund the contract.",
      );
      router.push("/transaction");
    } catch (err: any) {
      console.error("Create invoice error:", err);
      const msg = err.message || "Failed to create invoice";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          href="/transaction"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Deals
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Create Escrow Milestone Invoice
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Specify the milestone scope and recipient email to issue a secure
            escrow contract.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5"
        >
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
              Agreement Title / Item Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Website Redesign & Frontend Delivery"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
              Detailed Deliverables / Scope of Work
            </label>
            <textarea
              rows={3}
              placeholder="Describe deliverables, warranty terms, and conditions for funds release..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                Total Escrow Value (NGN)
              </label>
              <input
                type="number"
                required
                placeholder="₦ 500,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                Buyer Email Address
              </label>
              <input
                type="email"
                required
                placeholder="client@company.com"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
              Inspection / Dispute Window (Days)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={inspectionPeriod}
              onChange={(e) => setInspectionPeriod(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
            />
          </div>

          {/* Dynamic Platform Fee & Net Payout Breakdown */}
          {parseFloat(amount) > 0 && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Fee & Payout Breakdown</span>
                <span className="text-[#32A05F] bg-[#EBF7F0] px-2 py-0.5 rounded-full font-semibold">
                  2.5% Platform Fee
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Escrow Value:</span>
                  <span className="font-semibold text-slate-900">
                    ₦{parseFloat(amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PayTrust Service Fee (2.5%):</span>
                  <span className="font-semibold text-rose-600">
                    -₦
                    {((parseFloat(amount) * 2.5) / 100).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                  <span className="text-slate-900">Estimated Net Payout:</span>
                  <span className="text-[#32A05F]">
                    ₦
                    {(
                      parseFloat(amount) -
                      (parseFloat(amount) * 2.5) / 100
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#32A05F] shrink-0" />
                <span>
                  The platform fee is only deducted from your proceeds upon
                  successful release of funds.
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all active:scale-95 disabled:opacity-50 text-sm"
          >
            {isSubmitting
              ? "Creating Escrow Agreement..."
              : "Generate & Send Invoice"}{" "}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
