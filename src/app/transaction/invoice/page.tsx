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
  Truck,
  QrCode,
  Laptop,
  Users2,
  CreditCard,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import InvoiceShareModal from "@/components/transaction/InvoiceShareModal";
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

  const [feePayer, setFeePayer] = useState<"seller" | "buyer" | "split_50_50">("seller");
  const [deliveryMethod, setDeliveryMethod] = useState<"courier" | "in_person" | "digital">("courier");

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

  const platformFeePercentage =
    Number(process.env.NEXT_PUBLIC_ESCROW_FEE_PERCENTAGE) || 0.5;
  const platformFee = (grossInvoiceTotal * platformFeePercentage) / 100;

  let buyerFeeShare = 0;
  let sellerFeeShare = platformFee;
  if (feePayer === "buyer") {
    buyerFeeShare = platformFee;
    sellerFeeShare = 0;
  } else if (feePayer === "split_50_50") {
    buyerFeeShare = platformFee / 2;
    sellerFeeShare = platformFee / 2;
  }

  const totalBuyerDeposit = grossInvoiceTotal + buyerFeeShare;
  const netSellerPayout = grossInvoiceTotal - sellerFeeShare;

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
        feePayer,
        deliveryMethod,
        platformFee,
        buyerFeeShare,
        sellerFeeShare,
        totalBuyerDeposit,
        netSellerPayout,
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

    const cleanPhone = buyerPhone ? String(buyerPhone).replace(/[^0-9]/g, "") : "";
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/transaction"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Deals
        </Link>

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F] bg-[#EBF7F0] px-2.5 py-0.5 rounded-full">
              Escrow Invoice Generator
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Create Protected Escrow Deal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lock buyer funds in PayTrust neutral custody until inspection and delivery requirements are met.
          </p>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6"
        >
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Cannot Create Invoice</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Deal Type Switcher */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Deal Classification *
            </label>
            <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setDealType("p2p")}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  dealType === "p2p"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <User className="w-4 h-4 text-[#32A05F]" />
                Peer-to-Peer (P2P)
              </button>

              <button
                type="button"
                onClick={() => setDealType("b2b_milestone")}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  dealType === "b2b_milestone"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Building2 className="w-4 h-4 text-[#32A05F]" />
                B2B Milestone Contract
              </button>
            </div>
            <p className="text-[11px] text-slate-500 px-1">
              {dealType === "p2p"
                ? "Ideal for physical goods, electronics, vehicles, and direct one-off sales."
                : "Ideal for agencies, construction, software projects, and phased corporate deliverables."}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Agreement Title *
            </label>
            <input
              type="text"
              required
              placeholder={
                dealType === "b2b_milestone"
                  ? "e.g. Enterprise Fintech Application Development Contract"
                  : "e.g. iPhone 15 Pro Max 256GB Natural Titanium"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
            />
          </div>

          {/* Counterparty Contact */}
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

          {/* Amount & Inspection Period (for P2P) */}
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

          {/* Delivery & Fulfillment Method */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Fulfillment & Delivery Method *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod("courier")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  deliveryMethod === "courier"
                    ? "border-[#32A05F] bg-[#EBF7F0]/60 ring-2 ring-[#32A05F]/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    deliveryMethod === "courier" ? "bg-[#32A05F] text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Courier Shipping</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Carrier dispatch with tracking number & waybill verification.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod("in_person")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  deliveryMethod === "in_person"
                    ? "border-[#32A05F] bg-[#EBF7F0]/60 ring-2 ring-[#32A05F]/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    deliveryMethod === "in_person" ? "bg-[#32A05F] text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">In-Person Handover</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Local meetup verified via Secret Release OTP & QR handshake.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod("digital")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  deliveryMethod === "digital"
                    ? "border-[#32A05F] bg-[#EBF7F0]/60 ring-2 ring-[#32A05F]/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    deliveryMethod === "digital" ? "bg-[#32A05F] text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    <Laptop className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Digital / Service</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Online files, digital accounts, or milestone deliverables.
                </p>
              </button>
            </div>
          </div>

          {/* Who Pays Escrow Fee Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Escrow Fee Responsibility ({platformFeePercentage}%) *
              </label>
              <span className="text-[11px] font-semibold text-[#32A05F]">
                Total Fee: ₦{platformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFeePayer("seller")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  feePayer === "seller"
                    ? "border-[#32A05F] bg-[#EBF7F0]/60 ring-2 ring-[#32A05F]/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">Seller Pays (100%)</span>
                  {feePayer === "seller" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#32A05F]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Standard practice. Fee is deducted from seller disbursement.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFeePayer("buyer")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  feePayer === "buyer"
                    ? "border-[#32A05F] bg-[#EBF7F0]/60 ring-2 ring-[#32A05F]/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">Buyer Pays (100%)</span>
                  {feePayer === "buyer" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#32A05F]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Fee is added to buyer's escrow checkout deposit.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFeePayer("split_50_50")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  feePayer === "split_50_50"
                    ? "border-[#32A05F] bg-[#EBF7F0]/60 ring-2 ring-[#32A05F]/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">50 / 50 Shared Split</span>
                  {feePayer === "split_50_50" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#32A05F]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Fair split. Buyer and seller each pay half of the escrow fee.
                </p>
              </button>
            </div>
          </div>

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
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
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
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Escrow Monetization & Payout Summary
              </h4>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                Fee Payer: {feePayer === "buyer" ? "Buyer (100%)" : feePayer === "split_50_50" ? "50/50 Split" : "Seller (100%)"}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Agreed Base Value:</span>
                <span className="font-semibold text-white">₦{baseValue.toLocaleString()}</span>
              </div>

              {applyTax && dealType === "b2b_milestone" && (
                <div className="flex justify-between text-slate-300">
                  <span>VAT ({taxRate}%):</span>
                  <span className="font-semibold text-emerald-400">+₦{taxAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>Total Escrow Protection Fee ({platformFeePercentage}%):</span>
                <span className="font-semibold text-slate-300">₦{platformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-slate-400 text-[11px] pl-2 border-l border-slate-700">
                <span>Buyer Fee Share:</span>
                <span className="text-blue-400 font-semibold">+₦{buyerFeeShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-slate-400 text-[11px] pl-2 border-l border-slate-700">
                <span>Seller Fee Share:</span>
                <span className="text-rose-400 font-semibold">-₦{sellerFeeShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="pt-2.5 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-blue-300 uppercase font-bold block">
                    Buyer Deposit Total
                  </span>
                  <span className="text-sm font-bold text-white">
                    ₦{totalBuyerDeposit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-emerald-300 uppercase font-bold block">
                    Net Seller Disbursement
                  </span>
                  <span className="text-sm font-bold text-[#32A05F]">
                    ₦{netSellerPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
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

      {/* Success & Share Modal with QR Code */}
      <InvoiceShareModal
        isOpen={!!createdDeal}
        onClose={() => {
          if (createdDeal) {
            router.push(`/transaction/${createdDeal.id}`);
          }
        }}
        deal={createdDeal}
        isNewlyCreated={true}
        onViewDetails={() => {
          if (createdDeal) {
            router.push(`/transaction/${createdDeal.id}`);
          }
        }}
      />
    </AppShell>
  );
}
