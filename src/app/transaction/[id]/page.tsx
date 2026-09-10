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
  DollarSign,
  Package,
  User,
  Calendar,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { transactionService } from "@/services/api";

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    transactionService
      .getTransactionById(id)
      .then((res) => {
        setTransaction(res);
      })
      .catch((err) => console.error("Failed to load transaction:", err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleMarkShipped = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await transactionService.markAsShipped(id, { courier, trackingNumber });
      setActionMsg("Marked as shipped successfully!");
      const updated = await transactionService.getTransactionById(id);
      setTransaction(updated);
    } catch (err: any) {
      alert(err.message || "Failed to update shipping status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!confirm("Confirm delivery and release funds to seller?")) return;
    setIsSubmitting(true);
    try {
      await transactionService.confirmDelivery(id);
      setActionMsg("Delivery confirmed! Funds have been released.");
      const updated = await transactionService.getTransactionById(id);
      setTransaction(updated);
    } catch (err: any) {
      alert(err.message || "Failed to confirm delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/transaction"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Deals
        </Link>

        {transaction ? (
          <div className="space-y-6">
            {/* Header Box */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                    {transaction.id?.slice(0, 8)}
                  </span>
                  <span className="text-xs font-semibold text-[#32A05F] bg-[#EBF7F0] px-2.5 py-0.5 rounded-full capitalize">
                    {transaction.status?.replace("_", " ").toLowerCase() ||
                      "Active"}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {transaction.title || "Escrow Agreement"}
                </h1>
                <p className="text-xs text-slate-500">
                  {transaction.description ||
                    "Secured milestone-based agreement"}
                </p>
              </div>

              <div className="text-left md:text-right">
                <span className="text-xs text-slate-400 font-bold uppercase">
                  Locked Escrow Total
                </span>
                <div className="text-3xl font-extrabold text-[#32A05F]">
                  ₦{Number(transaction.amount || 0).toLocaleString()}
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
                  {transaction.feePercentage
                    ? `${transaction.feePercentage}% Platform Fee`
                    : "2.5% Platform Fee"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 space-y-1">
                  <span className="text-slate-500 font-medium">
                    Gross Escrow Value
                  </span>
                  <p className="text-base font-bold text-slate-900">
                    ₦
                    {Number(
                      transaction.totalAmount || transaction.amount || 0,
                    ).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Total locked in escrow
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1">
                  <span className="text-rose-700 font-medium">
                    Platform Fee ({transaction.feePercentage || 2.5}%)
                  </span>
                  <p className="text-base font-bold text-rose-600">
                    -₦
                    {Number(
                      transaction.platformFee ||
                        (Number(
                          transaction.totalAmount || transaction.amount || 0,
                        ) *
                          (Number(transaction.feePercentage) || 2.5)) /
                          100,
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <span className="text-[10px] text-rose-500">
                    PayTrust service protection
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#EBF7F0] border border-[#32A05F]/20 space-y-1">
                  <span className="text-[#15803d] font-medium">
                    Net Seller Payout
                  </span>
                  <p className="text-base font-bold text-[#15803d]">
                    ₦
                    {Number(
                      transaction.netAmount ||
                        Number(
                          transaction.totalAmount || transaction.amount || 0,
                        ) -
                          (Number(transaction.platformFee) ||
                            (Number(
                              transaction.totalAmount ||
                                transaction.amount ||
                                0,
                            ) *
                              (Number(transaction.feePercentage) || 2.5)) /
                              100),
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <span className="text-[10px] text-[#166534]">
                    {transaction.status === "COMPLETED"
                      ? "✓ Credited to wallet"
                      : "Credited upon release"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Box */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Fulfillment & Tracking
                    </h3>
                    <p className="text-xs text-slate-500">
                      Provide courier dispatch details
                    </p>
                  </div>
                </div>

                {transaction.status === "SHIPPED" ? (
                  <div className="p-4 rounded-xl bg-slate-50 text-xs space-y-1">
                    <p className="font-semibold text-slate-700">
                      Courier:{" "}
                      {transaction.shippingCarrier ||
                        transaction.courier ||
                        "GIG Logistics"}
                    </p>
                    <p className="font-mono text-slate-500">
                      Tracking: {transaction.trackingNumber || "GIG-98214"}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleMarkShipped} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Courier Name (e.g. DHL, GIG)"
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
                    />
                    <input
                      type="text"
                      placeholder="Tracking / Waybill Number"
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
                      {isSubmitting ? "Updating..." : "Mark as Dispatched"}
                    </button>
                  </form>
                )}
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
                    Once confirmed, ₦
                    {Number(
                      transaction.netAmount ||
                        Number(
                          transaction.totalAmount || transaction.amount || 0,
                        ) * 0.975,
                    ).toLocaleString()}{" "}
                    will be released to the seller after deducting the 2.5%
                    platform fee.
                  </p>
                </div>

                <button
                  onClick={handleConfirmDelivery}
                  disabled={
                    isSubmitting ||
                    transaction.status === "COMPLETED" ||
                    transaction.status === "DELIVERED"
                  }
                  className="w-full py-3 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {transaction.status === "COMPLETED" ||
                  transaction.status === "DELIVERED"
                    ? "✓ Delivery Confirmed & Settled"
                    : "Confirm Delivery & Release Funds"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            Loading escrow agreement details...
          </div>
        )}
      </div>
    </AppShell>
  );
}
