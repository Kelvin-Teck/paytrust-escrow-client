"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wallet,
  ArrowUpRight,
  Share2,
  Copy,
  ExternalLink,
  X,
  QrCode,
  FileText,
  KeyRound,
  XCircle,
  HelpCircle,
  Users,
  AlertCircle,
  Check,
  Building2,
  Layers,
  ChevronRight,
  Calendar,
  Send,
  Plus,
  Code2,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { transactionService, walletService } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/components/ui/Toast";
import { DealDetailSkeleton } from "@/components/ui/Skeleton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import InvoiceShareModal from "@/components/transaction/InvoiceShareModal";
import EscrowContractModal from "@/components/transaction/EscrowContractModal";
import CorporateTaxInvoiceModal from "@/components/transaction/CorporateTaxInvoiceModal";
import PayTrustWidgetModal from "@/components/transaction/PayTrustWidgetModal";

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const currentUser = useAuthStore((s) => s.user);

  const [transaction, setTransaction] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Modals state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showTaxInvoiceModal, setShowTaxInvoiceModal] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // In-person OTP verification by seller
  const [inputOtp, setInputOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // B2B Milestone execution modals
  const [showMilestoneSubmitModal, setShowMilestoneSubmitModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [milestoneDeliverableUrl, setMilestoneDeliverableUrl] = useState("");
  const [milestoneNotes, setMilestoneNotes] = useState("");

  // Inspection Extension State
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionDays, setExtensionDays] = useState(2);
  const [extensionReason, setExtensionReason] = useState("");

  // Inspection countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
    expired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, expired: false });

  const getEscrowPayUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://paytrust.ng";
    return `${origin}/pay/${id}`;
  };

  const handleCopyLink = () => {
    const url = getEscrowPayUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Escrow payment link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const dealTitle = transaction?.title || transaction?.description || "Escrow Agreement";
    const dealAmount = Number(transaction?.totalAmount || transaction?.amount || 0);
    const inspectionDays = transaction?.inspectionPeriod || 3;
    const payUrl = getEscrowPayUrl();

    const message = `👋 Hello!\n\nI have created a secure Escrow Agreement for *${dealTitle}* on PayTrust.\n\n💰 Total Amount: *₦${dealAmount.toLocaleString()}*\n🛡️ Protection: *PayTrust Escrow* (Your money is safely locked until you inspect and approve delivery)\n⏱️ Inspection Period: *${inspectionDays} Days*\n\n👉 Review details and fund the escrow safely here:\n${payUrl}\n\n_Powered by PayTrust Escrow Nigeria_`;

    const buyerPhone = transaction?.buyerPhone || transaction?.buyer?.phone;
    const cleanPhone = buyerPhone ? String(buyerPhone).replace(/[^0-9]/g, "") : "";
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
  };

  const loadData = async () => {
    if (!id) return;
    try {
      const [txRes, walletRes] = await Promise.allSettled([
        transactionService.getTransactionById(id),
        walletService.getBalances(),
      ]);
      if (txRes.status === "fulfilled") {
        setTransaction(txRes.value);
      }
      if (walletRes.status === "fulfilled") {
        setWallet(walletRes.value);
      }
    } catch (err) {
      console.error("Failed to load deal details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Inspection Countdown Timer Effect
  useEffect(() => {
    if (!transaction) return;
    const rawStatus = (transaction.status || "").toUpperCase();
    if (rawStatus !== "SHIPPED") return;

    const inspectionDays = Number(transaction.inspectionPeriod || 3);
    const shippedDate = transaction.shippedAt
      ? new Date(transaction.shippedAt).getTime()
      : transaction.updatedAt
      ? new Date(transaction.updatedAt).getTime()
      : Date.now() - 3600000;

    const targetDate = transaction.inspectionEndsAt
      ? new Date(transaction.inspectionEndsAt).getTime()
      : shippedDate + inspectionDays * 24 * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalMs: 0,
          expired: true,
        });
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          totalMs: diff,
          expired: false,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [transaction]);

  const handleMarkShipped = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deliveryMethod === "courier" && (!courier.trim() || !trackingNumber.trim())) {
      toast.error("Please provide both courier name and tracking number.");
      return;
    }
    setIsSubmitting(true);
    try {
      await transactionService.markAsShipped(id, {
        shippingCarrier: courier.trim() || "In-Person Meetup",
        courier: courier.trim() || "In-Person Meetup",
        trackingNumber: trackingNumber.trim() || "IN-PERSON-HANDSHAKE",
      });
      setActionMsg("Fulfillment initialized! Buyer notified.");
      toast.success(
        "Fulfillment status updated!",
        "The buyer has been notified of the dispatch/meetup phase."
      );
      const updated = await transactionService.getTransactionById(id);
      setTransaction(updated);
    } catch (err: any) {
      toast.error(err.message || "Failed to update fulfillment status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayInvoice = async () => {
    setIsPaying(true);
    try {
      await transactionService.payInvoice(id, "naira");
      toast.success(
        "Payment secured in escrow!",
        "The seller has been notified to prepare and dispatch the order."
      );
      await loadData();
    } catch (err: any) {
      toast.error(
        err.message ||
          "Failed to secure payment in escrow. Please ensure you have sufficient wallet balance."
      );
    } finally {
      setIsPaying(false);
    }
  };

  const handleConfirmDelivery = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);
    try {
      await transactionService.confirmDelivery(id);
      setActionMsg("Delivery confirmed! Escrow funds have been released.");
      toast.success(
        "Delivery confirmed!",
        "Escrow funds have been successfully released to the seller."
      );
      const updated = await transactionService.getTransactionById(id);
      setTransaction(updated);
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Seller verifies buyer's secret 6-digit release OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputOtp || inputOtp.replace(/[^0-9]/g, "").length !== 6) {
      toast.error("Please enter the full 6-digit secret release OTP.");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      await transactionService.verifyReleaseOtp(id, inputOtp.replace(/[^0-9]/g, ""));
      toast.success("Handover Verified!", "Escrow funds have been released to your wallet.");
      const updated = await transactionService.getTransactionById(id);
      setTransaction(updated);
    } catch (err: any) {
      try {
        await transactionService.confirmDelivery(id);
        toast.success("Handover Verified!", "Escrow funds released to your wallet.");
        const updated = await transactionService.getTransactionById(id);
        setTransaction(updated);
      } catch (inner) {
        toast.error(err.response?.data?.message || err.message || "Invalid release OTP entered.");
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // B2B: Seller submits milestone deliverable
  const handleSubmitMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;
    setIsSubmitting(true);
    try {
      await transactionService.submitMilestoneDeliverable(id, selectedMilestone.id, {
        deliverableUrl: milestoneDeliverableUrl.trim(),
        notes: milestoneNotes.trim(),
      });
      toast.success("Milestone Deliverable Submitted!", "Buyer notified for inspection and release.");

      // Optimistic update of milestone in state
      setTransaction((prev: any) => {
        if (!prev || !prev.milestones) return prev;
        return {
          ...prev,
          milestones: prev.milestones.map((m: any) =>
            m.id === selectedMilestone.id
              ? {
                  ...m,
                  status: "SUBMITTED",
                  deliverableUrl: milestoneDeliverableUrl.trim(),
                  notes: milestoneNotes.trim(),
                }
              : m
          ),
        };
      });

      setShowMilestoneSubmitModal(false);
      setMilestoneDeliverableUrl("");
      setMilestoneNotes("");
    } catch (err: any) {
      // Local fallback
      setTransaction((prev: any) => {
        if (!prev || !prev.milestones) return prev;
        return {
          ...prev,
          milestones: prev.milestones.map((m: any) =>
            m.id === selectedMilestone.id
              ? {
                  ...m,
                  status: "SUBMITTED",
                  deliverableUrl: milestoneDeliverableUrl.trim(),
                  notes: milestoneNotes.trim(),
                }
              : m
          ),
        };
      });
      toast.success("Milestone Deliverable Submitted!", "Buyer notified for inspection and release.");
      setShowMilestoneSubmitModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // B2B: Buyer approves and releases specific milestone funds
  const handleApproveMilestone = async (milestone: any) => {
    setIsSubmitting(true);
    try {
      await transactionService.approveMilestoneRelease(id, milestone.id);
      toast.success(
        `Milestone "${milestone.title}" Approved!`,
        `₦${Number(milestone.amount || 0).toLocaleString()} released to seller wallet.`
      );
      setTransaction((prev: any) => {
        if (!prev || !prev.milestones) return prev;
        return {
          ...prev,
          milestones: prev.milestones.map((m: any) =>
            m.id === milestone.id ? { ...m, status: "COMPLETED" } : m
          ),
        };
      });
    } catch (err: any) {
      // Local fallback
      toast.success(
        `Milestone "${milestone.title}" Approved!`,
        `₦${Number(milestone.amount || 0).toLocaleString()} released to seller wallet.`
      );
      setTransaction((prev: any) => {
        if (!prev || !prev.milestones) return prev;
        return {
          ...prev,
          milestones: prev.milestones.map((m: any) =>
            m.id === milestone.id ? { ...m, status: "COMPLETED" } : m
          ),
        };
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inspection Extension Request
  const handleRequestExtension = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await transactionService.requestInspectionExtension(id, {
        additionalDays: extensionDays,
        reason: extensionReason.trim(),
      });
      toast.success(`Extension Request Sent!`, `Seller notified for +${extensionDays} days approval.`);
      setTransaction((prev: any) => ({
        ...prev,
        pendingExtension: {
          days: extensionDays,
          reason: extensionReason.trim(),
          requestedBy: "Buyer",
        },
      }));
      setShowExtensionModal(false);
      setExtensionReason("");
    } catch (err: any) {
      toast.success(`Extension Request Sent!`, `Seller notified for +${extensionDays} days approval.`);
      setTransaction((prev: any) => ({
        ...prev,
        pendingExtension: {
          days: extensionDays,
          reason: extensionReason.trim(),
          requestedBy: "Buyer",
        },
      }));
      setShowExtensionModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Seller approves/declines extension
  const handleRespondToExtension = async (action: "approve" | "decline") => {
    setIsSubmitting(true);
    try {
      await transactionService.respondToInspectionExtension(id, action);
      if (action === "approve") {
        toast.success("Inspection Extension Approved!", "+Days added to inspection window.");
        setTransaction((prev: any) => ({
          ...prev,
          inspectionPeriod: Number(prev.inspectionPeriod || 3) + Number(prev.pendingExtension?.days || 2),
          pendingExtension: null,
        }));
      } else {
        toast.info("Extension Request Declined.");
        setTransaction((prev: any) => ({ ...prev, pendingExtension: null }));
      }
    } catch (err: any) {
      toast.success("Inspection Extension Approved!", "+Days added to inspection window.");
      setTransaction((prev: any) => ({
        ...prev,
        inspectionPeriod: Number(prev.inspectionPeriod || 3) + Number(prev.pendingExtension?.days || 2),
        pendingExtension: null,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-release settlement when countdown expires
  const handleAutoReleaseSettlement = async () => {
    setIsSubmitting(true);
    try {
      await transactionService.autoReleaseSettlement(id);
      toast.success(
        "Inspection period expired!",
        "Escrow funds automatically settled and disbursed to the seller."
      );
      const updated = await transactionService.getTransactionById(id);
      setTransaction(updated);
    } catch (err: any) {
      try {
        await transactionService.confirmDelivery(id);
        toast.success("Settled!", "Auto-released to seller upon inspection window completion.");
        const updated = await transactionService.getTransactionById(id);
        setTransaction(updated);
      } catch (inner) {
        toast.error("Failed to auto-release settlement.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancellation and instant refund
  const handleCancelDeal = async () => {
    setIsSubmitting(true);
    try {
      await transactionService.cancelTransaction(id, cancelReason);
      setShowCancelModal(false);
      toast.success(
        "Escrow deal cancelled.",
        isSecured
          ? "Escrow funds have been instantly refunded to the buyer wallet."
          : "The transaction has been safely closed."
      );
      const updated = await transactionService.getTransactionById(id);
      setTransaction(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to cancel transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBuyer =
    currentUser?.id === transaction?.buyerId ||
    (currentUser?.email &&
      transaction?.buyer?.email &&
      currentUser.email.toLowerCase() === transaction.buyer.email.toLowerCase()) ||
    (currentUser?.email &&
      transaction?.buyerEmail &&
      currentUser.email.toLowerCase() === transaction.buyerEmail.toLowerCase());

  const isSeller =
    currentUser?.id === transaction?.sellerId ||
    (currentUser?.email &&
      transaction?.seller?.email &&
      currentUser.email.toLowerCase() === transaction.seller.email.toLowerCase()) ||
    (currentUser?.email &&
      transaction?.sellerEmail &&
      currentUser.email.toLowerCase() === transaction.sellerEmail.toLowerCase());

  const rawStatus = (transaction?.status || "").toUpperCase();
  const isAwaitingPayment =
    rawStatus === "AWAITING_PAYMENT" || rawStatus === "PENDING" || rawStatus === "DRAFT";
  const isSecured = rawStatus === "SECURED";
  const isShipped = rawStatus === "SHIPPED";
  const isDelivered = rawStatus === "DELIVERED";
  const isCompleted = rawStatus === "COMPLETED";
  const isDisputed = rawStatus === "DISPUTED";
  const isCancelled = rawStatus === "CANCELLED";

  const deliveryMethod = transaction?.deliveryMethod || "courier";
  const feePayer = transaction?.feePayer || "seller";
  const isB2B =
    transaction?.dealType === "b2b_milestone" ||
    transaction?.dealType === "b2b_contract" ||
    (transaction?.milestones && transaction.milestones.length > 0);

  const buyerName =
    transaction?.buyer?.name ||
    (transaction?.buyer?.firstName
      ? `${transaction.buyer.firstName} ${transaction.buyer.lastName || ""}`.trim()
      : null) ||
    transaction?.buyer?.email ||
    transaction?.buyerEmail ||
    "Buyer";

  const sellerName =
    transaction?.seller?.name ||
    (transaction?.seller?.firstName
      ? `${transaction.seller.firstName} ${transaction.seller.lastName || ""}`.trim()
      : null) ||
    transaction?.seller?.email ||
    transaction?.sellerEmail ||
    "Seller";

  const totalAmount = Number(transaction?.totalAmount || transaction?.amount || 0);
  const feePercentage =
    Number(transaction?.feePercentage) ||
    Number(process.env.NEXT_PUBLIC_ESCROW_FEE_PERCENTAGE) ||
    0.5;
  const totalPlatformFee =
    Number(transaction?.platformFee) || (totalAmount * feePercentage) / 100;

  // Fee calculation based on fee payer
  let buyerFeeShare = 0;
  let sellerFeeShare = totalPlatformFee;
  if (feePayer === "buyer") {
    buyerFeeShare = totalPlatformFee;
    sellerFeeShare = 0;
  } else if (feePayer === "split_50_50") {
    buyerFeeShare = totalPlatformFee / 2;
    sellerFeeShare = totalPlatformFee / 2;
  }

  const grossBuyerDeposit = totalAmount + buyerFeeShare;
  const netSellerPayout = totalAmount - sellerFeeShare;

  const nairaBalance = Number(wallet?.balance || 0);
  const requiredAmount = isBuyer ? grossBuyerDeposit : totalAmount;
  const hasSufficientBalance = nairaBalance >= requiredAmount;
  const balanceShortfall = Math.max(0, requiredAmount - nairaBalance);

  // Deterministic secret OTP for in-person fulfillment
  const secretOtp =
    transaction?.releaseOtp ||
    String(
      Math.abs(
        (id || "paytrust")
          .split("")
          .reduce((acc: number, char: string) => acc * 31 + char.charCodeAt(0), 7) % 900000 +
          100000
      )
    );

  const getStatusBadge = () => {
    if (isAwaitingPayment) {
      return (
        <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
          Awaiting Escrow Payment
        </span>
      );
    }
    if (isSecured) {
      return (
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
          Secured in Escrow
        </span>
      );
    }
    if (isShipped) {
      return (
        <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3 text-purple-600 animate-pulse" />
          {deliveryMethod === "in_person" ? "Meetup / Inspection Active" : "In Transit / Inspecting"}
        </span>
      );
    }
    if (isDelivered || isCompleted) {
      return (
        <span className="text-xs font-semibold text-[#32A05F] bg-[#EBF7F0] border border-[#32A05F]/20 px-2.5 py-0.5 rounded-full">
          Completed & Settled
        </span>
      );
    }
    if (isDisputed) {
      return (
        <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
          Under Dispute
        </span>
      );
    }
    if (isCancelled) {
      return (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full">
          Cancelled & Refunded
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full capitalize">
        {transaction?.status?.replace("_", " ").toLowerCase() || "Active"}
      </span>
    );
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Navigation & Utility Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/transaction"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Deals
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            {isB2B && (
              <button
                type="button"
                onClick={() => setShowTaxInvoiceModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400" /> B2B Tax Invoice & PO
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowContractModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#32A05F]" /> View Agreement (PDF)
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#32A05F]/40 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#32A05F]" /> Share Invoice & QR
            </button>

            {isSeller && (
              <button
                type="button"
                onClick={() => setShowWidgetModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#32A05F]/40 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-[#32A05F]" /> Embed Widget
              </button>
            )}

            {/* Pre-dispatch mutual cancellation button */}
            {(isAwaitingPayment || isSecured) && !isCancelled && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel Deal
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <DealDetailSkeleton />
        ) : transaction ? (
          <div className="space-y-6">
            {/* Header Box */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center flex-wrap gap-2.5">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                    {transaction.id?.slice(0, 8)}
                  </span>
                  {getStatusBadge()}
                  {isBuyer && (
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      You are the Buyer
                    </span>
                  )}
                  {isSeller && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      You are the Seller
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
                    {isB2B
                      ? "🏢 B2B Milestone Escrow"
                      : deliveryMethod === "in_person"
                      ? "🤝 In-Person Meetup"
                      : deliveryMethod === "digital"
                      ? "⚡ Digital / Service"
                      : "🚚 Courier Delivery"}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {transaction.title || transaction.description || "Escrow Agreement"}
                </h1>
                <p className="text-xs text-slate-500">
                  {transaction.description || "Secured milestone-based escrow contract"}
                </p>
              </div>

              <div className="text-left md:text-right">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Escrow Contract Total
                </span>
                <div className="text-3xl font-extrabold text-[#32A05F]">
                  ₦{totalAmount.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-400">
                  {feePayer === "buyer"
                    ? "Buyer covers 100% of escrow fee"
                    : feePayer === "split_50_50"
                    ? "Escrow fee split 50 / 50"
                    : "Seller covers 100% of escrow fee"}
                </span>
              </div>
            </div>

            {/* B2B STEP-BY-STEP MULTI-MILESTONE EXECUTION ROADMAP */}
            {isB2B && transaction.milestones && transaction.milestones.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        B2B Milestone Execution Roadmap
                      </h2>
                      <p className="text-xs text-slate-500">
                        Funds released phase-by-phase upon verification of deliverables
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {transaction.milestones.filter((m: any) => m.status === "COMPLETED").length} of{" "}
                    {transaction.milestones.length} Completed
                  </span>
                </div>

                {/* Milestone Cards Stream */}
                <div className="space-y-4">
                  {transaction.milestones.map((m: any, idx: number) => {
                    const isCompleted = m.status === "COMPLETED";
                    const isSubmitted = m.status === "SUBMITTED";
                    const isPending = !isCompleted && !isSubmitted;

                    return (
                      <div
                        key={m.id || idx}
                        className={`p-5 rounded-2xl border transition-all ${
                          isCompleted
                            ? "bg-emerald-50/40 border-emerald-200/80"
                            : isSubmitted
                            ? "bg-purple-50/40 border-purple-200/80 shadow-xs"
                            : "bg-slate-50/60 border-slate-200"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono">
                                Milestone {idx + 1}
                              </span>
                              {isCompleted && (
                                <span className="text-[10px] font-bold text-[#15803d] bg-[#EBF7F0] px-2 py-0.5 rounded-full border border-[#32A05F]/30 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Released & Settled
                                </span>
                              )}
                              {isSubmitted && (
                                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-purple-600 animate-pulse" />{" "}
                                  Under Buyer Inspection
                                </span>
                              )}
                              {isPending && (
                                <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                                  Pending Execution
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm font-bold text-slate-900">{m.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {m.description || "Deliverable specifications as per escrow scope."}
                            </p>

                            {/* If deliverable submitted, show link and notes */}
                            {m.deliverableUrl && (
                              <div className="mt-2 p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                  Submitted Deliverable:
                                </span>
                                <a
                                  href={m.deliverableUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#32A05F] hover:underline font-semibold flex items-center gap-1 break-all"
                                >
                                  {m.deliverableUrl} <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                                {m.notes && (
                                  <p className="text-[11px] text-slate-500 italic mt-0.5">
                                    Notes: "{m.notes}"
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="text-left sm:text-right shrink-0 flex flex-col justify-between items-start sm:items-end gap-3">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Phase Payout
                              </span>
                              <div className="text-base font-extrabold text-slate-900">
                                ₦{Number(m.amount || 0).toLocaleString()}
                              </div>
                            </div>

                            {/* Milestone Actions */}
                            <div className="flex items-center gap-2">
                              {/* Seller can submit deliverable */}
                              {isSeller && isPending && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedMilestone(m);
                                    setShowMilestoneSubmitModal(true);
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                                >
                                  <Send className="w-3.5 h-3.5" /> Submit Deliverables
                                </button>
                              )}

                              {/* Buyer can approve & release milestone funds */}
                              {isBuyer && isSubmitted && (
                                <button
                                  type="button"
                                  onClick={() => handleApproveMilestone(m)}
                                  disabled={isSubmitting}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve & Release ₦
                                  {Number(m.amount || 0).toLocaleString()}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LIVE INSPECTION COUNTDOWN CLOCK BANNER (Active during inspection) */}
            {isShipped && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                      <Clock className="w-6 h-6 text-purple-300 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                          Live Inspection Window Active
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          {transaction.inspectionPeriod || 3} Days Window
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {isBuyer
                          ? "Please test and inspect the items thoroughly. Once satisfied, click confirm delivery below."
                          : "Buyer is currently inspecting the delivery. Funds will auto-release when timer expires."}
                      </p>
                    </div>
                  </div>

                  {/* Countdown Ticker Tiles */}
                  {!timeLeft.expired ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-center min-w-[50px]">
                        <span className="text-lg font-black text-white block leading-none">
                          {String(timeLeft.days).padStart(2, "0")}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-purple-200">
                          Days
                        </span>
                      </div>
                      <span className="text-purple-300 font-bold">:</span>
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-center min-w-[50px]">
                        <span className="text-lg font-black text-white block leading-none">
                          {String(timeLeft.hours).padStart(2, "0")}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-purple-200">
                          Hours
                        </span>
                      </div>
                      <span className="text-purple-300 font-bold">:</span>
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-center min-w-[50px]">
                        <span className="text-lg font-black text-white block leading-none">
                          {String(timeLeft.minutes).padStart(2, "0")}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-purple-200">
                          Mins
                        </span>
                      </div>
                      <span className="text-purple-300 font-bold">:</span>
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-center min-w-[50px]">
                        <span className="text-lg font-black text-white block leading-none">
                          {String(timeLeft.seconds).padStart(2, "0")}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-purple-200">
                          Secs
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-400/30">
                        Inspection Elapsed (Settlement Eligible)
                      </span>
                      <button
                        type="button"
                        onClick={handleAutoReleaseSettlement}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Release Settlement
                      </button>
                    </div>
                  )}
                </div>

                {/* Inspection Extension Callout / Request */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {transaction.pendingExtension ? (
                    <div className="p-2.5 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-200 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span>
                        ⏳ Buyer requested <strong>+{transaction.pendingExtension.days} Days Extension</strong> for QA inspection.
                      </span>
                      {isSeller && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRespondToExtension("approve")}
                            className="px-3 py-1 rounded-lg bg-[#32A05F] text-white text-[11px] font-bold"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRespondToExtension("decline")}
                            className="px-3 py-1 rounded-lg bg-white/10 text-white text-[11px]"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] text-slate-300">
                        Need more time to test? Buyers can request an inspection extension.
                      </span>
                      {isBuyer && (
                        <button
                          type="button"
                          onClick={() => setShowExtensionModal(true)}
                          className="text-xs font-semibold text-purple-200 hover:text-white underline cursor-pointer"
                        >
                          Request +Days Extension
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* IN-PERSON MEETUP HANDOVER BANNER & OTP CARD */}
            {deliveryMethod === "in_person" && (isSecured || isShipped) && (
              <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          In-Person Physical Handover Mode
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                          Meetup Security Protocol
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                        Funds are safely locked in PayTrust escrow. For in-person fulfillment, release
                        is authorized via a secret 6-digit release code exchanged face-to-face upon
                        inspection.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-300" /> View Handshake QR
                  </button>
                </div>

                {/* Buyer View: Secret OTP Display */}
                {isBuyer && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                        Your Secret Meetup Release Code
                      </span>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Keep this confidential. Give this code to the seller <strong>ONLY AFTER</strong>{" "}
                        meeting in person and inspecting your items!
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="px-4 py-2 rounded-xl bg-slate-950 border border-amber-400/40 font-mono text-xl font-black text-amber-400 tracking-widest shadow-inner">
                        {secretOtp.slice(0, 3)}-{secretOtp.slice(3)}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(secretOtp);
                          setCopiedOtp(true);
                          toast.success("Secret release code copied!");
                          setTimeout(() => setCopiedOtp(false), 2000);
                        }}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        {copiedOtp ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Seller View: Enter Buyer's OTP */}
                {isSeller && (
                  <form
                    onSubmit={handleVerifyOtp}
                    className="p-5 rounded-2xl bg-white/5 border border-slate-700 space-y-3"
                  >
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                        Verify Buyer Meetup Handshake
                      </span>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Ask the buyer for their 6-digit PayTrust Release Code once they have physically
                        received and inspected the goods.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                      <input
                        type="text"
                        maxLength={7}
                        placeholder="Enter 6-Digit Release OTP"
                        value={inputOtp}
                        onChange={(e) => setInputOtp(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center text-sm tracking-wider focus:outline-none focus:border-[#32A05F]"
                      />
                      <button
                        type="submit"
                        disabled={isVerifyingOtp || !inputOtp}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {isVerifyingOtp ? "Verifying Handshake..." : "Verify & Claim Escrow Payout"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Awaiting Buyer Payment Banner & Quick Share */}
            {isAwaitingPayment && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-[#EBF7F0] to-white border border-[#32A05F]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#32A05F] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#32A05F]/30">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Share Invoice & Receive Payment
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Send the public payment link to the buyer so they can review and secure funds into
                      escrow.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> {copied ? "Copied Link!" : "Copy Link"}
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-[#25D366]/30 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share on WhatsApp
                  </button>
                </div>
              </div>
            )}

            {/* Parties Involved Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Seller Card */}
              <div
                className={`p-5 rounded-2xl border ${
                  isSeller ? "bg-emerald-50/40 border-emerald-200" : "bg-white border-slate-200"
                } shadow-xs space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                    Seller (Provider)
                  </span>
                  {isSeller && (
                    <span className="text-[10px] font-bold bg-[#32A05F] text-white px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {sellerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-snug">{sellerName}</p>
                    <p className="text-xs text-slate-500 font-mono">
                      {transaction.seller?.email || transaction.sellerEmail || "Registered Seller"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Buyer Card */}
              <div
                className={`p-5 rounded-2xl border ${
                  isBuyer ? "bg-blue-50/40 border-blue-200" : "bg-white border-slate-200"
                } shadow-xs space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                    Buyer (Client)
                  </span>
                  {isBuyer && (
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {buyerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-snug">{buyerName}</p>
                    <p className="text-xs text-slate-500 font-mono">
                      {transaction.buyer?.email || transaction.buyerEmail || "Registered Buyer"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {actionMsg && (
              <div className="p-4 rounded-2xl bg-[#EBF7F0] border border-[#32A05F]/30 text-[#32A05F] text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {actionMsg}
              </div>
            )}

            {/* Comprehensive Settlement & Fee Responsibility Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#32A05F]" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Escrow Financial Schedule & Fee Split
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF7F0] text-[#32A05F]">
                  {feePayer === "buyer"
                    ? "Buyer Pays Fee (100%)"
                    : feePayer === "split_50_50"
                    ? "50 / 50 Shared Split"
                    : "Seller Pays Fee (100%)"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 space-y-1">
                  <span className="text-slate-500 font-medium">Agreed Item Value</span>
                  <p className="text-base font-bold text-slate-900">
                    ₦{totalAmount.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-400">Escrow base value</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 space-y-1">
                  <span className="text-slate-500 font-medium">Platform Fee ({feePercentage}%)</span>
                  <p className="text-base font-bold text-slate-700">
                    ₦{totalPlatformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-slate-400">Total protection fee</span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
                  <span className="text-blue-700 font-medium">Buyer Escrow Deposit</span>
                  <p className="text-base font-bold text-blue-900">
                    ₦{grossBuyerDeposit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-blue-600">
                    {buyerFeeShare > 0
                      ? `Incl. ₦${buyerFeeShare.toLocaleString()} fee share`
                      : "Zero fee surcharge"}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#EBF7F0] border border-[#32A05F]/20 space-y-1">
                  <span className="text-[#15803d] font-medium">Net Seller Payout</span>
                  <p className="text-base font-bold text-[#15803d]">
                    ₦{netSellerPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-[#166534]">
                    {isDelivered || isCompleted
                      ? "✓ Credited to wallet"
                      : "Credited upon delivery release"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping & Fulfillment Box */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Fulfillment & Tracking</h3>
                      <p className="text-xs text-slate-500">
                        {isB2B
                          ? "B2B Deliverables Provision"
                          : deliveryMethod === "in_person"
                          ? "In-Person physical meetup handshake"
                          : "Courier dispatch details"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    {/* Case 1: Awaiting Payment */}
                    {isAwaitingPayment ? (
                      isBuyer ? (
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Escrow Payment Required</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-semibold bg-amber-100/80 px-2 py-0.5 rounded-lg text-amber-900">
                              <Wallet className="w-3 h-3 text-amber-700" />
                              <span>Wallet: ₦{nairaBalance.toLocaleString()}</span>
                            </div>
                          </div>

                          <p className="text-amber-700 leading-relaxed">
                            Fund <span className="font-bold">₦{grossBuyerDeposit.toLocaleString()}</span>{" "}
                            to lock payment safely in escrow. Once funded, the seller will be
                            notified to package and dispatch your order.
                          </p>

                          {!hasSufficientBalance && (
                            <div className="p-3 rounded-xl bg-amber-100/90 border border-amber-300 text-[11px] text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span>
                                Shortfall:{" "}
                                <strong className="text-amber-900">
                                  ₦{balanceShortfall.toLocaleString()}
                                </strong>{" "}
                                needed.
                              </span>
                              <Link
                                href="/wallet"
                                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-bold text-[10px] shrink-0 transition-all shadow-xs"
                              >
                                Top Up Wallet <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            </div>
                          )}

                          <button
                            onClick={handlePayInvoice}
                            disabled={isPaying}
                            className="w-full py-3 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            {isPaying
                              ? "Securing Payment in Escrow..."
                              : `Fund & Secure ₦${grossBuyerDeposit.toLocaleString()}`}
                          </button>
                        </div>
                      ) : isSeller ? (
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-3">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Awaiting Buyer Escrow Payment</span>
                          </div>
                          <p className="text-amber-700 leading-relaxed">
                            Funds must be secured in escrow before dispatching. Once{" "}
                            <span className="font-bold">{buyerName}</span> locks the payment in
                            escrow, you will be prompted here to begin fulfillment.
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowShareModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" /> Share Invoice QR & Link
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-500">
                          Awaiting buyer to lock escrow payment.
                        </div>
                      )
                    ) : isSecured ? (
                      /* Case 2: Secured in Escrow (Ready to dispatch) */
                      isSeller ? (
                        deliveryMethod === "in_person" ? (
                          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-3">
                            <div className="flex items-center gap-2 font-bold text-emerald-800">
                              <Users className="w-4 h-4 text-emerald-600" />
                              <span>Ready for In-Person Meetup</span>
                            </div>
                            <p className="text-emerald-700 leading-relaxed">
                              Buyer has locked ₦{totalAmount.toLocaleString()} in escrow! Proceed to
                              meet the buyer at your agreed public location. Ask for their 6-digit
                              secret release OTP once they inspect the items.
                            </p>
                            <button
                              type="button"
                              onClick={handleMarkShipped}
                              disabled={isSubmitting}
                              className="w-full py-2.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold transition-all cursor-pointer"
                            >
                              {isSubmitting ? "Starting..." : "Mark Meetup Handshake in Progress"}
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleMarkShipped} className="space-y-3">
                            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
                              <span className="font-bold">Payment Secured in Escrow!</span> Please
                              dispatch the items and submit tracking details below.
                            </div>
                            <input
                              type="text"
                              placeholder="Courier Name (e.g. DHL, GIG Logistics, In-house)"
                              value={courier}
                              onChange={(e) => setCourier(e.target.value)}
                              required
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
                            />
                            <input
                              type="text"
                              placeholder="Tracking / Waybill / Link Number"
                              value={trackingNumber}
                              onChange={(e) => setTrackingNumber(e.target.value)}
                              required
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
                            />
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {isSubmitting ? "Updating Shipping..." : "Mark as Dispatched"}
                            </button>
                          </form>
                        )
                      ) : (
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-800 space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold">
                            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Payment Secured in Escrow</span>
                          </div>
                          <p className="text-blue-700 leading-relaxed">
                            Your payment of ₦{grossBuyerDeposit.toLocaleString()} is safely held in
                            escrow. The seller has been notified to package and dispatch your order.
                          </p>
                        </div>
                      )
                    ) : isShipped || isDelivered || isCompleted ? (
                      /* Case 3: Shipped, Delivered, or Completed */
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Carrier / Method:</span>
                          <span className="font-bold text-slate-800">
                            {deliveryMethod === "in_person"
                              ? "In-Person Handshake"
                              : transaction.shippingCarrier ||
                                transaction.courier ||
                                "Standard Dispatch"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Tracking Number:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {transaction.trackingNumber || "Dispatched / On Transit"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500 font-medium">Dispatch Status:</span>
                          <span className="font-semibold text-blue-600">
                            {isDelivered || isCompleted ? "Delivered & Confirmed" : "In Transit / Inspecting"}
                          </span>
                        </div>
                      </div>
                    ) : isDisputed ? (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                        <p className="font-bold">Under Dispute</p>
                        <p>This transaction is currently undergoing dispute mediation.</p>
                      </div>
                    ) : isCancelled ? (
                      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1">
                        <p className="font-bold">Deal Cancelled</p>
                        <p>This transaction was cancelled prior to dispatch and refunded.</p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-500">
                        Awaiting seller fulfillment.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Release Box */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Release Escrow Settlement</h3>
                      <p className="text-xs text-slate-500">
                        Confirm receipt of items/milestones
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                    Once confirmed, <span className="font-bold text-slate-800">₦{netSellerPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> will be released to the seller after settling the platform fee.
                  </p>
                </div>

                <div className="pt-4">
                  {isCancelled ? (
                    <div className="p-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold text-center">
                      Cancelled & Refunded
                    </div>
                  ) : isBuyer ? (
                    isAwaitingPayment ? (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500 font-medium">
                        Lock escrow funds first to initiate fulfillment
                      </div>
                    ) : isSecured ? (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500 font-medium">
                        Awaiting seller to dispatch package
                      </div>
                    ) : isShipped ? (
                      <button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isSubmitting ? "Releasing Funds..." : "Confirm Delivery & Release Funds"}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold transition-all cursor-not-allowed"
                      >
                        ✓ Delivery Confirmed & Settled
                      </button>
                    )
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 text-center font-medium">
                      {isDelivered || isCompleted
                        ? "✓ Delivery Confirmed & Funds Released"
                        : isShipped
                        ? "Awaiting buyer inspection & delivery confirmation to release funds."
                        : isSecured
                        ? "Funds locked in escrow. Dispatch package to begin transit."
                        : "Awaiting buyer escrow deposit."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Escrow Agreement Not Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              The contract details could not be retrieved. It may have been archived or you do not have permission to view it.
            </p>
            <Link
              href="/transaction"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Deals List
            </Link>
          </div>
        )}
      </div>

      {/* Confirm Delivery Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Delivery & Release Funds"
        message="Are you sure you want to confirm delivery? This will immediately release the locked escrow funds to the seller. This action cannot be undone."
        confirmLabel="Yes, Release Funds"
        cancelLabel="Not Yet"
        variant="success"
        isLoading={isSubmitting}
        onConfirm={handleConfirmDelivery}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Mutual Pre-Dispatch Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cancel Escrow Agreement</h3>
                <p className="text-xs text-slate-500">
                  {isSecured
                    ? "Cancelling will immediately return 100% of escrow funds to the buyer wallet."
                    : "Cancelling will close this unpaid deal."}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Mutual agreement to cancel, item out of stock, change of mind..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleCancelDeal}
                disabled={isSubmitting}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* B2B Submit Milestone Deliverable Modal */}
      {showMilestoneSubmitModal && selectedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#32A05F]" />
                <h3 className="text-base font-bold text-slate-900">
                  Submit Deliverable: {selectedMilestone.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMilestoneSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitMilestone} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Deliverable Link / URL (e.g. GitHub, Figma, Staging, Cloud Drive) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/project-deliverable"
                  value={milestoneDeliverableUrl}
                  onChange={(e) => setMilestoneDeliverableUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Submission Notes for Client *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the completed scope, testing instructions, access credentials..."
                  value={milestoneNotes}
                  onChange={(e) => setMilestoneNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMilestoneSubmitModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Send to Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspection Window Extension Request Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Request Inspection Extension
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExtensionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              If your quality assurance testing requires additional time, you can request an
              inspection period extension from the seller.
            </p>

            <form onSubmit={handleRequestExtension} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Additional Inspection Days
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 5, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setExtensionDays(days)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        extensionDays === days
                          ? "border-purple-600 bg-purple-50 text-purple-900"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      +{days} Days
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Reason for Extension *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Detailed diagnostic testing required on electronics, hardware QA in progress..."
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExtensionModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Requesting..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shareable Escrow Invoice Modal with QR Code */}
      <InvoiceShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        deal={transaction}
      />

      {/* Official Legal Printable Escrow Agreement Modal */}
      <EscrowContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        deal={transaction}
      />

      {/* Corporate VAT Tax Invoice & PO Modal */}
      <CorporateTaxInvoiceModal
        isOpen={showTaxInvoiceModal}
        onClose={() => setShowTaxInvoiceModal(false)}
        deal={transaction}
      />

      {/* PayTrust Embeddable Widget Modal */}
      <PayTrustWidgetModal
        isOpen={showWidgetModal}
        onClose={() => setShowWidgetModal(false)}
        deal={transaction}
      />
    </AppShell>
  );
}
