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
  Building2,
  User,
  Percent,
  Layers,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { transactionService } from "@/services/api";
import { toast } from "@/components/ui/Toast";
import { useAuthStore } from "@/stores/authStore";

interface MilestoneItem {
  id: string;
  title: string;
  amount: number;
  description: string;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [dealType, setDealType] = useState<"p2p" | "b2b_milestone">(
    user?.accountType === "business" ? "b2b_milestone" : "p2p"
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [inspectionPeriod, setInspectionPeriod] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // B2B specific fields
  const [poNumber, setPoNumber] = useState("");
  const [applyTax, setApplyTax] = useState(true);
  const [taxRate, setTaxRate] = useState(7.5); // Default 7.5% Nigerian VAT
  const [contractUrl, setContractUrl] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");

  // B2B Milestones list
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    {
      id: "m-1",
      title: "Initial Milestone / Phase 1 Deliverables",
      amount: 0,
      description: "Project kickoff and foundational milestone delivery.",
    },
  ]);

  const addMilestone = () => {
    const newIdx = milestones.length + 1;
    setMilestones([
      ...milestones,
      {
        id: `m-${Date.now()}`,
        title: `Phase ${newIdx} Deliverables`,
        amount: 0,
        description: "",
      },
    ]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const updateMilestone = (
    id: string,
    field: "title" | "amount" | "description",
    val: any
  ) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  // Compute calculated amounts
  const milestoneTotal = milestones.reduce(
    (acc, cur) => acc + (Number(cur.amount) || 0),
    0
  );
  const baseValue =
    dealType === "b2b_milestone"
      ? milestoneTotal > 0
        ? milestoneTotal
        : parseFloat(amount) || 0
      : parseFloat(amount) || 0;

  const effectiveTaxRate = applyTax && dealType === "b2b_milestone" ? taxRate : 0;
  const taxAmount = (baseValue * effectiveTaxRate) / 100;
  const grossInvoiceTotal = baseValue + taxAmount;
  const platformFee = (grossInvoiceTotal * 2.5) / 100;
  const netSellerPayout = grossInvoiceTotal - platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (grossInvoiceTotal <= 0) {
      setError("Please specify a valid transaction value greater than 0.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        title,
        description: description || title,
        amount: grossInvoiceTotal,
        buyerEmail: buyerEmail.trim().toLowerCase(),
        inspectionPeriod: Number(inspectionPeriod),
        dealType,
      };

      if (dealType === "b2b_milestone") {
        payload.poNumber = poNumber.trim() || undefined;
        payload.taxRate = effectiveTaxRate;
        payload.taxAmount = taxAmount;
        payload.contractUrl = contractUrl.trim() || undefined;
        payload.termsAndConditions = termsAndConditions.trim() || undefined;
        payload.milestones = milestones.map((m) => ({
          title: m.title,
          amount: Number(m.amount) || baseValue,
          description: m.description,
        }));
      }

      await transactionService.createInvoice(payload);
      toast.success(
        dealType === "b2b_milestone"
          ? "Corporate B2B Milestone Contract Created!"
          : "P2P Escrow Invoice Created!",
        "Counterparty has been notified to review terms and fund the escrow agreement."
      );
      router.push("/transaction");
    } catch (err: any) {
      console.error("Create invoice error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to create invoice";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        <Link
          href="/transaction"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Deals
        </Link>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Escrow Agreement Generator
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Create Escrow Agreement
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Issue a secure milestone invoice with automated escrow holding, inspection protection, and transparent fee calculation.
          </p>
        </div>

        {/* Deal Mode Switcher */}
        <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setDealType("p2p")}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              dealType === "p2p"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4" />
            <div className="text-left">
              <div>Quick Escrow (P2P / B2C)</div>
              <div className="text-[10px] font-normal text-slate-400">Standard single-delivery transaction</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setDealType("b2b_milestone")}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              dealType === "b2b_milestone"
                ? "bg-[#32A05F] text-white shadow-sm shadow-[#32A05F]/20"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <div className="text-left">
              <div>Corporate Contract (B2B)</div>
              <div className={`text-[10px] font-normal ${dealType === "b2b_milestone" ? "text-white/80" : "text-slate-400"}`}>
                Milestones, PO number, VAT & legal terms
              </div>
            </div>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6"
        >
          {/* Agreement Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Agreement Title / Project Subject *
            </label>
            <input
              type="text"
              required
              placeholder={
                dealType === "b2b_milestone"
                  ? "e.g. Enterprise Cloud Infrastructure & Frontend Modernization"
                  : "e.g. MacBook Pro M3 Delivery / Web Development"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
            />
          </div>

          {/* Buyer Email & PO / Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Buyer / Client Email Address *
              </label>
              <input
                type="email"
                required
                placeholder={dealType === "b2b_milestone" ? "procurement@clientcompany.com" : "buyer@example.com"}
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
              />
            </div>

            {dealType === "b2b_milestone" ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Purchase Order (PO) #</span>
                  <span className="text-slate-400 lowercase font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. PO-2026-9042"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Total Escrow Value (NGN) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="₦ 500,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
                />
              </div>
            )}
          </div>

          {/* Deliverables & Scope */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Scope of Work & Conditions for Release
            </label>
            <textarea
              rows={3}
              placeholder="Describe deliverables, warranty provisions, acceptance criteria, and conditions required before releasing funds..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
            />
          </div>

          {/* B2B MILESTONE CONTRACT BUILDER */}
          {dealType === "b2b_milestone" && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#32A05F]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Corporate Milestones Breakdown
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="text-xs font-bold text-[#32A05F] hover:text-[#28874E] flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Milestone Phase</span>
                </button>
              </div>

              <div className="space-y-3">
                {milestones.map((m, idx) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        Phase {idx + 1}
                      </span>
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestone(m.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="Milestone Title (e.g. Design Prototype Delivery)"
                          value={m.title}
                          onChange={(e) =>
                            updateMilestone(m.id, "title", e.target.value)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          required
                          placeholder="Phase Amount (NGN)"
                          value={m.amount || ""}
                          onChange={(e) =>
                            updateMilestone(m.id, "amount", parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20"
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Phase verification criteria / deliverables (optional)"
                      value={m.description}
                      onChange={(e) =>
                        updateMilestone(m.id, "description", e.target.value)
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20"
                    />
                  </div>
                ))}
              </div>

              {/* Tax / VAT Settings */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-[#32A05F]" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Tax & Value Added Tax (VAT)
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={applyTax}
                      onChange={(e) => setApplyTax(e.target.checked)}
                      className="rounded text-[#32A05F] focus:ring-[#32A05F] cursor-pointer"
                    />
                    <span>Include VAT / Tax</span>
                  </label>
                </div>

                {applyTax && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs text-slate-600 font-medium">VAT Rate:</span>
                    <div className="flex items-center gap-1.5">
                      {[0, 5, 7.5, 10].map((rate) => (
                        <button
                          type="button"
                          key={rate}
                          onClick={() => setTaxRate(rate)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            taxRate === rate
                              ? "bg-[#32A05F] text-white border-[#32A05F]"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Legal Contract & Terms Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Contract / Agreement Link</span>
                    <span className="text-slate-400 lowercase font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/contract.pdf"
                    value={contractUrl}
                    onChange={(e) => setContractUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Corporate Terms & Conditions</span>
                    <span className="text-slate-400 lowercase font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Standard Net 15 Corporate SLA"
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Inspection Window */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Inspection / Verification Window (Days)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={inspectionPeriod}
              onChange={(e) => setInspectionPeriod(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Number of days the buyer has to verify deliverable quality before funds auto-release.
            </span>
          </div>

          {/* Financial Breakdown & Summary Card */}
          {grossInvoiceTotal > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3.5 shadow-md">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#32A05F]" />
                  <span>Escrow Financial Breakdown</span>
                </span>
                <span className="text-[#32A05F] bg-[#32A05F]/15 px-2 py-0.5 rounded-full font-semibold">
                  2.5% Platform Fee
                </span>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-800">
                <div className="flex justify-between text-slate-300 pt-1">
                  <span>Base Agreement Value:</span>
                  <span className="font-semibold text-white">
                    ₦{baseValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {dealType === "b2b_milestone" && applyTax && taxAmount > 0 && (
                  <div className="flex justify-between text-slate-300 pt-2">
                    <span>VAT ({taxRate}%):</span>
                    <span className="font-semibold text-emerald-400">
                      +₦{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-300 pt-2 font-bold">
                  <span className="text-slate-200">Gross Contract Total (Funded by Buyer):</span>
                  <span className="text-white text-sm">
                    ₦{grossInvoiceTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400 pt-2">
                  <span>PayTrust Service Fee (2.5%):</span>
                  <span className="font-semibold text-rose-400">
                    -₦{platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-2.5 flex justify-between text-sm font-bold">
                  <span className="text-slate-100">Estimated Net Seller Payout:</span>
                  <span className="text-[#32A05F] text-base">
                    ₦{netSellerPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-[#32A05F] shrink-0" />
                <span>
                  Funds are secured in PayTrust multi-sig escrow until conditions are verified. Platform fees are only deducted upon release.
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all active:scale-[0.98] disabled:opacity-50 text-sm cursor-pointer"
          >
            {isSubmitting
              ? "Generating Escrow Agreement..."
              : dealType === "b2b_milestone"
                ? "Generate & Send Corporate Contract"
                : "Generate & Send P2P Invoice"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
