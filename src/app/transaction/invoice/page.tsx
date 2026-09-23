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
  AlertTriangle,
  Share2,
  Copy,
  CheckCircle2,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { transactionService } from "@/services/api";
import { toast } from "@/components/ui/Toast";
import { useAuthStore } from "@/stores/authStore";
import { getKybInfo, getTierInfo } from "@/lib/utils";

interface MilestoneItem {
  id: string;
  title: string;
  amount: number;
  description: string;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const isBusiness = user?.accountType === "business";
  const kyb = getKybInfo(user?.kybStatus, user?.kybTier);
  const kyc = getTierInfo(user?.kycStatus);

  const [dealType, setDealType] = useState<"p2p" | "b2b_milestone">(
    isBusiness ? "b2b_milestone" : "p2p"
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [inspectionPeriod, setInspectionPeriod] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success Modal state
  const [createdDeal, setCreatedDeal] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // B2B specific fields
  const [poNumber, setPoNumber] = useState("");
  const [applyTax, setApplyTax] = useState(true);
  const [taxRate, setTaxRate] = useState(7.5);
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

  // Active limit check
  const activeLimit = isBusiness ? kyb.singleLimit : kyc.singleLimit;
  const isExceedingLimit = grossInvoiceTotal > activeLimit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (grossInvoiceTotal <= 0) {
      setError("Please specify a valid transaction value greater than 0.");
      return;
    }

    if (!buyerEmail.trim() && !buyerPhone.trim()) {
      setError("Please enter the buyer's email address or phone number.");
      return;
    }

    if (isExceedingLimit) {
      setError(
        `The transaction value of ₦${grossInvoiceTotal.toLocaleString()} exceeds your ${
          isBusiness ? kyb.title : kyc.tierName
        } limit of ₦${activeLimit.toLocaleString()}. Please upgrade your tier in Profile → Compliance to proceed.`
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        title,
        description: description || title,
        amount: grossInvoiceTotal,
        buyerEmail: buyerEmail.trim().toLowerCase() || undefined,
        buyerPhone: buyerPhone.trim() || undefined,
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

      const created = await transactionService.createInvoice(payload);
      setCreatedDeal(created);
      toast.success(
        dealType === "b2b_milestone"
          ? "Corporate B2B Milestone Contract Created!"
          : "P2P Escrow Invoice Created!",
        "Share the escrow link directly with the buyer on WhatsApp or copy link below."
      );
    } catch (err: any) {
      console.error("Create invoice error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to create invoice";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEscrowPayUrl = () => {
    if (!createdDeal) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "https://paytrust.ng";
    return `${origin}/pay/${createdDeal.id}`;
  };

  const handleCopyLink = () => {
    const url = getEscrowPayUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Escrow deal link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    if (!createdDeal) return;
    const dealTitle = createdDeal.title || createdDeal.description || title || "Escrow Agreement";
    const dealAmount = Number(createdDeal.totalAmount || createdDeal.amount || grossInvoiceTotal);
    const inspectionDays = createdDeal.inspectionPeriod || inspectionPeriod || 3;
    const payUrl = getEscrowPayUrl();

    const message = `👋 Hello!\n\nI have created a secure Escrow Agreement for *${dealTitle}* on PayTrust.\n\n💰 Total Amount: *₦${dealAmount.toLocaleString()}*\n🛡️ Protection: *PayTrust Escrow* (Your money is safely locked until you inspect and approve delivery)\n⏱️ Inspection Period: *${inspectionDays} Days*\n\n👉 Review details and fund the escrow safely here:\n${payUrl}\n\n_Powered by PayTrust Escrow Nigeria_`;

    const cleanPhone = buyerPhone ? buyerPhone.replace(/[^0-9]/g, "") : "";
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
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

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Create Escrow Invoice
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Issue a buyer/seller protected payment agreement with inspection terms.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold self-start">
            <ShieldCheck className="w-4 h-4 text-[#32A05F]" />
            <span>
              {isBusiness ? `B2B ${kyb.title}` : `Personal ${kyc.tierName}`}
            </span>
          </div>
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

        {/* Limit Warning Alert */}
        {isExceedingLimit && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  Amount Exceeds Your Current {isBusiness ? kyb.title : kyc.tierName} Limit (₦{activeLimit.toLocaleString()})
                </span>
                <span className="text-amber-700 mt-0.5 block">
                  To create escrow agreements of this volume, upgrade your tier in Profile → Compliance.
                </span>
              </div>
            </div>
            <Link
              href="/profile/identity-verification"
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors"
            >
              Upgrade Tier
            </Link>
          </div>
        )}

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
                  : "e.g. iPhone 13 Pro Max Delivery / Graphic Design Project"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
            />
          </div>

          {/* Buyer Email & WhatsApp / Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Buyer Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="buyer@example.com"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> Buyer WhatsApp / Phone
                </span>
                <span className="text-slate-400 lowercase font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. +234 801 234 5678"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
              />
            </div>
          </div>

          {/* B2B PO Number */}
          {dealType === "b2b_milestone" && (
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
          )}

          {/* Amount (for P2P) */}
          {dealType === "p2p" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Transaction Amount (₦) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="100"
                    step="any"
                    required
                    placeholder="150,000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Inspection Period (Days)
                </label>
                <select
                  value={inspectionPeriod}
                  onChange={(e) => setInspectionPeriod(Number(e.target.value))}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
                >
                  <option value={1}>1 Day (Express)</option>
                  <option value={2}>2 Days</option>
                  <option value={3}>3 Days (Standard Recommended)</option>
                  <option value={5}>5 Days</option>
                  <option value={7}>7 Days (Extended)</option>
                  <option value={14}>14 Days (Complex)</option>
                </select>
              </div>
            </div>
          )}

          {/* Milestones (for B2B) */}
          {dealType === "b2b_milestone" && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Milestone Breakdown & Pricing *
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define deliverables for each project phase. Funds release per approved milestone.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addMilestone}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EBF7F0] text-[#32A05F] hover:bg-[#d8f0e1] text-xs font-bold transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Phase
                </button>
              </div>

              <div className="space-y-3">
                {milestones.map((m, idx) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                        Phase {idx + 1}
                      </span>
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestone(m.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
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
                          placeholder="Milestone Title (e.g. Design Handover & UI Assets)"
                          value={m.title}
                          onChange={(e) => updateMilestone(m.id, "title", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F]"
                        />
                      </div>
                      <div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                            ₦
                          </span>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            required
                            placeholder="Amount (₦)"
                            value={m.amount || ""}
                            onChange={(e) => updateMilestone(m.id, "amount", parseFloat(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F]"
                          />
                        </div>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Optional deliverable notes & verification criteria..."
                      value={m.description}
                      onChange={(e) => updateMilestone(m.id, "description", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F]"
                    />
                  </div>
                ))}
              </div>

              {/* B2B Tax Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Percent className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Apply Nigerian VAT (7.5%)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Include statutory VAT calculation on corporate tax invoice
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={applyTax}
                  onChange={(e) => setApplyTax(e.target.checked)}
                  className="w-4 h-4 accent-[#32A05F] rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Agreement Terms & Deliverables Description
            </label>
            <textarea
              rows={3}
              placeholder="Outline the specific conditions, scope of work, warranty, or delivery timelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
            />
          </div>

          {/* Pricing Settlement Box */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Estimated Escrow Settlement Summary
            </h4>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Base Transaction Value:</span>
                <span className="font-semibold text-white">₦{baseValue.toLocaleString()}</span>
              </div>

              {applyTax && dealType === "b2b_milestone" && (
                <div className="flex justify-between text-slate-300">
                  <span>VAT ({taxRate}%):</span>
                  <span className="font-semibold text-emerald-400">+₦{taxAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>PayTrust Platform Fee (2.5%):</span>
                <span className="font-semibold text-rose-300">-₦{platformFee.toLocaleString()}</span>
              </div>

              <div className="pt-2.5 border-t border-slate-800 flex justify-between text-sm font-bold">
                <span className="text-white">Net Seller Payout:</span>
                <span className="text-[#32A05F] text-base">₦{netSellerPayout.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isExceedingLimit}
            className="w-full py-4 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white font-bold text-sm shadow-md shadow-[#32A05F]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              "Generating Escrow Agreement..."
            ) : (
              <>
                Create & Generate Shareable Escrow Invoice <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Success & Share Modal */}
      {createdDeal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#32A05F] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Escrow Invoice Created!
              </h3>
              <p className="text-xs text-slate-500">
                Share this escrow deal link directly with your buyer on WhatsApp or any channel.
              </p>
            </div>

            {/* Escrow Link Container */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Public Escrow Payment Link
              </span>
              <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                <span className="text-xs font-mono font-semibold text-slate-700 truncate">
                  {getEscrowPayUrl()}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Share Directly on WhatsApp
              </button>

              <button
                type="button"
                onClick={() => router.push(`/transaction/${createdDeal.id}`)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                View Deal in Dashboard <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
