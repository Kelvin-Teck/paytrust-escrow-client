"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { transactionService, walletService } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/components/ui/Toast";
import { DealDetailSkeleton } from "@/components/ui/Skeleton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleMarkShipped = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courier.trim() || !trackingNumber.trim()) {
      toast.error("Please provide both courier name and tracking number.");
      return;
    }
    setIsSubmitting(true);
    try {
      await transactionService.markAsShipped(id, {
        shippingCarrier: courier.trim(),
        courier: courier.trim(),
        trackingNumber: trackingNumber.trim(),
      });
      setActionMsg("Marked as shipped successfully!");
      toast.success(
        "Order marked as dispatched!",
        "The buyer has been notified with tracking details.",
      );
      const updated = await transactionService.getTransactionById(id);
      setTransaction(updated);
    } catch (err: any) {
      toast.error(err.message || "Failed to update shipping status");
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
        "The seller has been notified to package and dispatch the order.",
      );
      await loadData();
    } catch (err: any) {
      toast.error(
        err.message ||
          "Failed to secure payment in escrow. Please ensure you have sufficient wallet balance.",
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
      setActionMsg("Delivery confirmed! Funds have been released.");
      toast.success(
        "Delivery confirmed!",
        "Escrow funds have been successfully released to the seller.",
      );
      const updated = await transactionService.getTransactionById(id);
      setTransaction(updated);
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBuyer =
    currentUser?.id === transaction?.buyerId ||
    (currentUser?.email &&
      transaction?.buyer?.email &&
      currentUser.email.toLowerCase() ===
        transaction.buyer.email.toLowerCase()) ||
    (currentUser?.email &&
      transaction?.buyerEmail &&
      currentUser.email.toLowerCase() ===
        transaction.buyerEmail.toLowerCase());

  const isSeller =
    currentUser?.id === transaction?.sellerId ||
    (currentUser?.email &&
      transaction?.seller?.email &&
      currentUser.email.toLowerCase() ===
        transaction.seller.email.toLowerCase()) ||
    (currentUser?.email &&
      transaction?.sellerEmail &&
      currentUser.email.toLowerCase() ===
        transaction.sellerEmail.toLowerCase());

  const rawStatus = (transaction?.status || "").toUpperCase();
  const isAwaitingPayment =
    rawStatus === "AWAITING_PAYMENT" ||
    rawStatus === "PENDING" ||
    rawStatus === "DRAFT";
  const isSecured = rawStatus === "SECURED";
  const isShipped = rawStatus === "SHIPPED";
  const isDelivered = rawStatus === "DELIVERED";
  const isCompleted = rawStatus === "COMPLETED";
  const isDisputed = rawStatus === "DISPUTED";

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

  const totalAmount = Number(
    transaction?.totalAmount || transaction?.amount || 0,
  );
  const feePercentage = Number(transaction?.feePercentage) || 2.5;
  const platformFee =
    Number(transaction?.platformFee) || (totalAmount * feePercentage) / 100;
  const netAmount =
    Number(transaction?.netAmount) || totalAmount - platformFee;

  const nairaBalance = Number(wallet?.balance || 0);
  const hasSufficientBalance = nairaBalance >= totalAmount;
  const balanceShortfall = Math.max(0, totalAmount - nairaBalance);

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
        <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
          Dispatched / In Transit
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
    return (
      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full capitalize">
        {transaction?.status?.replace("_", " ").toLowerCase() || "Active"}
      </span>
    );
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/transaction"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Deals
          </Link>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#32A05F]/40 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#32A05F]" /> Share Escrow Invoice
          </button>
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
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {transaction.title ||
                    transaction.description ||
                    "Escrow Agreement"}
                </h1>
                <p className="text-xs text-slate-500">
                  {transaction.description ||
                    "Secured milestone-based escrow contract"}
                </p>
              </div>

              <div className="text-left md:text-right">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Locked Escrow Total
                </span>
                <div className="text-3xl font-extrabold text-[#32A05F]">
                  ₦{totalAmount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Awaiting Buyer Payment & Quick Share Banner */}
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
                      Send the public payment link to the buyer so they can review and secure funds into escrow.
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
                className={`p-5 rounded-2xl border ${isSeller ? "bg-emerald-50/40 border-emerald-200" : "bg-white border-slate-200"} shadow-xs space-y-2`}
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
                    <p className="text-sm font-bold text-slate-900 leading-snug">
                      {sellerName}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {transaction.seller?.email ||
                        transaction.sellerEmail ||
                        "Registered Seller"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Buyer Card */}
              <div
                className={`p-5 rounded-2xl border ${isBuyer ? "bg-blue-50/40 border-blue-200" : "bg-white border-slate-200"} shadow-xs space-y-2`}
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
                    <p className="text-sm font-bold text-slate-900 leading-snug">
                      {buyerName}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {transaction.buyer?.email ||
                        transaction.buyerEmail ||
                        "Registered Buyer"}
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

            {/* Settlement & Fee Breakdown Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#32A05F]" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Escrow Monetization & Payout Breakdown
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF7F0] text-[#32A05F]">
                  {feePercentage}% Platform Fee
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 space-y-1">
                  <span className="text-slate-500 font-medium">
                    Gross Escrow Value
                  </span>
                  <p className="text-base font-bold text-slate-900">
                    ₦{totalAmount.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Total locked in escrow
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1">
                  <span className="text-rose-700 font-medium">
                    Platform Fee ({feePercentage}%)
                  </span>
                  <p className="text-base font-bold text-rose-600">
                    -₦
                    {platformFee.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <span className="text-[10px] text-rose-500">
                    PayTrust protection service
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#EBF7F0] border border-[#32A05F]/20 space-y-1">
                  <span className="text-[#15803d] font-medium">
                    Net Seller Payout
                  </span>
                  <p className="text-base font-bold text-[#15803d]">
                    ₦
                    {netAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
                      <h3 className="font-bold text-slate-900 text-sm">
                        Fulfillment & Tracking
                      </h3>
                      <p className="text-xs text-slate-500">
                        Courier dispatch details
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
                            Fund <span className="font-bold">₦{totalAmount.toLocaleString()}</span> to lock payment safely in escrow. Once funded, the seller will be notified to package and dispatch your order.
                          </p>

                          {!hasSufficientBalance && (
                            <div className="p-3 rounded-xl bg-amber-100/90 border border-amber-300 text-[11px] text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span>
                                Shortfall: <strong className="text-amber-900">₦{balanceShortfall.toLocaleString()}</strong> needed.
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
                            className="w-full py-3 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            {isPaying
                              ? "Securing Payment in Escrow..."
                              : `Fund & Secure ₦${totalAmount.toLocaleString()}`}
                          </button>
                          <div className="text-center pt-1">
                            <Link
                              href="/wallet"
                              className="text-[11px] text-amber-800 hover:text-amber-950 font-semibold underline inline-flex items-center gap-1"
                            >
                              <Wallet className="w-3 h-3" /> Go to Wallets & Deposit
                            </Link>
                          </div>
                        </div>
                      ) : isSeller ? (
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Awaiting Buyer Escrow Payment</span>
                          </div>
                          <p className="text-amber-700 leading-relaxed">
                            Funds must be secured in escrow before dispatching. Once{" "}
                            <span className="font-bold">{buyerName}</span> locks the payment in escrow, you will be prompted here to enter courier tracking details.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-500">
                          Awaiting buyer to lock escrow payment.
                        </div>
                      )
                    ) : isSecured ? (
                      /* Case 2: Secured in Escrow (Ready to dispatch) */
                      isSeller ? (
                        <form onSubmit={handleMarkShipped} className="space-y-3">
                          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
                            <span className="font-bold">Payment Secured in Escrow!</span> Please dispatch the items and submit tracking details below.
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
                            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                          >
                            {isSubmitting ? "Updating Shipping..." : "Mark as Dispatched"}
                          </button>
                        </form>
                      ) : (
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-800 space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold">
                            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Payment Secured in Escrow</span>
                          </div>
                          <p className="text-blue-700 leading-relaxed">
                            Your payment of ₦{totalAmount.toLocaleString()} is safely held in escrow. The seller has been notified to package and dispatch your order.
                          </p>
                        </div>
                      )
                    ) : isShipped || isDelivered || isCompleted ? (
                      /* Case 3: Shipped, Delivered, or Completed */
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Carrier / Courier:</span>
                          <span className="font-bold text-slate-800">
                            {transaction.shippingCarrier || transaction.courier || "Standard Dispatch"}
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
                            {isDelivered || isCompleted ? "Delivered" : "In Transit"}
                          </span>
                        </div>
                      </div>
                    ) : isDisputed ? (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                        <p className="font-bold">Under Dispute</p>
                        <p>This transaction is currently undergoing dispute mediation.</p>
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
                      <h3 className="font-bold text-slate-900 text-sm">
                        Release Escrow Settlement
                      </h3>
                      <p className="text-xs text-slate-500">
                        Confirm receipt of items/milestones
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                    Once confirmed, <span className="font-bold text-slate-800">₦{netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> will be released to the seller after deducting the {feePercentage}% platform fee.
                  </p>
                </div>

                <div className="pt-4">
                  {isBuyer ? (
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
                        className="w-full py-3 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
            <h3 className="text-lg font-bold text-slate-900">
              Escrow Agreement Not Found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              The contract details could not be retrieved. It may have been
              archived or you do not have permission to view it.
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

      {/* Shareable Escrow Invoice Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mx-auto shadow-inner">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Share Escrow Invoice
              </h3>
              <p className="text-xs text-slate-500">
                Send this link to the buyer via WhatsApp or copy it to your clipboard.
              </p>
            </div>

            {/* Link Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Public Escrow Payment URL
              </span>
              <div className="flex items-center justify-between gap-2 bg-white px-3 py-2.5 rounded-xl border border-slate-200">
                <span className="text-xs font-mono font-semibold text-slate-700 truncate">
                  {getEscrowPayUrl()}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 flex items-center gap-1 transition-colors"
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
                <Share2 className="w-4 h-4" /> Send Invoice on WhatsApp
              </button>

              <a
                href={getEscrowPayUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                Preview What Buyer Sees <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
