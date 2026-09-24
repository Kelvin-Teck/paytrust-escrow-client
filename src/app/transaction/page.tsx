"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  PlusCircle,
  ChevronRight,
  Search,
  Share2,
  Copy,
  ExternalLink,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { transactionService } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { toast } from "@/components/ui/Toast";

export default function EscrowTransactionPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick share modal state
  const [sharingDeal, setSharingDeal] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadTransactions() {
      setIsLoading(true);
      try {
        const data = await transactionService.getTransactions();
        const list = Array.isArray(data) ? data : data?.transactions || [];
        setTransactions(list);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (t.title || "").toLowerCase().includes(q) ||
      (t.id || "").toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q) ||
      (t.buyer?.email || t.buyerEmail || "").toLowerCase().includes(q) ||
      (t.seller?.email || t.sellerEmail || "").toLowerCase().includes(q) ||
      (t.buyer?.firstName || "").toLowerCase().includes(q) ||
      (t.seller?.firstName || "").toLowerCase().includes(q);

    if (filterStatus === "ALL") return matchesSearch;
    const tStatus = (t.status || "").toUpperCase();
    if (filterStatus === "AWAITING_PAYMENT") {
      return (
        matchesSearch &&
        (tStatus === "AWAITING_PAYMENT" ||
          tStatus === "PENDING" ||
          tStatus === "DRAFT")
      );
    }
    return matchesSearch && tStatus === filterStatus.toUpperCase();
  });

  const getEscrowPayUrl = (dealId: string) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://paytrust.ng";
    return `${origin}/pay/${dealId}`;
  };

  const handleCopyLink = (deal: any) => {
    const url = getEscrowPayUrl(deal.id);
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Escrow payment link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = (deal: any) => {
    const dealTitle = deal.title || deal.description || "Escrow Agreement";
    const dealAmount = Number(deal.totalAmount || deal.amount || 0);
    const inspectionDays = deal.inspectionPeriod || 3;
    const payUrl = getEscrowPayUrl(deal.id);

    const message = `👋 Hello!\n\nI have created a secure Escrow Agreement for *${dealTitle}* on PayTrust.\n\n💰 Total Amount: *₦${dealAmount.toLocaleString()}*\n🛡️ Protection: *PayTrust Escrow* (Your money is safely locked until you inspect and approve delivery)\n⏱️ Inspection Period: *${inspectionDays} Days*\n\n👉 Review details and fund the escrow safely here:\n${payUrl}\n\n_Powered by PayTrust Escrow Nigeria_`;

    const buyerPhone = deal.buyerPhone || deal.buyer?.phone;
    const cleanPhone = buyerPhone
      ? String(buyerPhone).replace(/[^0-9]/g, "")
      : "";
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "AWAITING_PAYMENT" || s === "PENDING" || s === "DRAFT") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
          Awaiting Payment
        </span>
      );
    }
    if (s === "SECURED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
          Secured in Escrow
        </span>
      );
    }
    if (s === "SHIPPED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
          In Transit
        </span>
      );
    }
    if (s === "DELIVERED" || s === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-[#15803d] bg-[#EBF7F0] border border-[#32A05F]/20 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#32A05F] shrink-0"></span>
          Completed
        </span>
      );
    }
    if (s === "DISPUTED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
          Under Dispute
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 capitalize whitespace-nowrap">
        {status?.replace("_", " ").toLowerCase() || "Active"}
      </span>
    );
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Escrow Deals & Contracts
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create and manage milestone-backed deals with automated
              buyer/seller protection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/transaction/invoice"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-sm font-semibold shadow-sm shadow-[#32A05F]/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Create Escrow Invoice
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by contract title, counterparty, or Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0 max-w-full">
            {[
              "ALL",
              "AWAITING_PAYMENT",
              "SECURED",
              "SHIPPED",
              "DELIVERED",
              "COMPLETED",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === status
                    ? "bg-[#32A05F] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {status === "ALL"
                  ? "All Deals"
                  : status === "AWAITING_PAYMENT"
                    ? "Awaiting Payment"
                    : status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table Ledger */}
        {isLoading ? (
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Deal & Contract</th>
                    <th className="py-4 px-6">Role & Counterparty</th>
                    <th className="py-4 px-6">Escrow Amount</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((deal) => {
                    const isCurrentUserBuyer =
                      currentUser?.id === deal.buyerId ||
                      (currentUser?.email &&
                        deal.buyer?.email &&
                        currentUser.email.toLowerCase() ===
                          deal.buyer.email.toLowerCase()) ||
                      (currentUser?.email &&
                        deal.buyerEmail &&
                        currentUser.email.toLowerCase() ===
                          deal.buyerEmail.toLowerCase());

                    const isCurrentUserSeller =
                      currentUser?.id === deal.sellerId ||
                      (currentUser?.email &&
                        deal.seller?.email &&
                        currentUser.email.toLowerCase() ===
                          deal.seller.email.toLowerCase()) ||
                      (currentUser?.email &&
                        deal.sellerEmail &&
                        currentUser.email.toLowerCase() ===
                          deal.sellerEmail.toLowerCase());

                    const buyerLabel =
                      deal.buyer?.name ||
                      (deal.buyer?.firstName
                        ? `${deal.buyer.firstName} ${deal.buyer.lastName || ""}`.trim()
                        : null) ||
                      deal.buyer?.email ||
                      deal.buyerEmail ||
                      "Buyer";

                    const sellerLabel =
                      deal.seller?.name ||
                      (deal.seller?.firstName
                        ? `${deal.seller.firstName} ${deal.seller.lastName || ""}`.trim()
                        : null) ||
                      deal.seller?.email ||
                      deal.sellerEmail ||
                      "Seller";

                    const rawStatus = (deal.status || "").toUpperCase();
                    const isAwaiting =
                      rawStatus === "AWAITING_PAYMENT" ||
                      rawStatus === "PENDING" ||
                      rawStatus === "DRAFT";

                    const totalAmount = Number(
                      deal.totalAmount || deal.amount || 0,
                    );

                    return (
                      <tr
                        key={deal.id}
                        onClick={() => router.push(`/transaction/${deal.id}`)}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      >
                        {/* Column 1: Deal & Contract */}
                        <td className="py-4 px-6 min-w-[240px]">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                              #{deal.id?.slice(0, 8)}
                            </span>
                            {deal.dealType === "b2b_milestone" && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                B2B Milestone
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-slate-900 group-hover:text-[#32A05F] transition-colors text-sm line-clamp-1">
                            {deal.title ||
                              deal.description ||
                              "Escrow Agreement"}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-medium">
                            {deal.createdAt && (
                              <span>
                                {new Date(deal.createdAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            )}
                            {deal.inspectionPeriod && (
                              <>
                                <span>•</span>
                                <span>{deal.inspectionPeriod}d inspection</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Column 2: Role & Counterparty */}
                        <td className="py-4 px-6 min-w-[200px]">
                          <div className="flex items-center gap-1.5 mb-1">
                            {isCurrentUserBuyer ? (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                You are Buying
                              </span>
                            ) : isCurrentUserSeller ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                You are Selling
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                Participant
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-slate-800">
                            {isCurrentUserBuyer ? (
                              <span>
                                Seller:{" "}
                                <strong className="text-slate-900">
                                  {sellerLabel}
                                </strong>
                              </span>
                            ) : (
                              <span>
                                Buyer:{" "}
                                <strong className="text-slate-900">
                                  {buyerLabel}
                                </strong>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[190px] font-mono mt-0.5">
                            {isCurrentUserBuyer
                              ? deal.seller?.email ||
                                deal.sellerEmail ||
                                "Registered Seller"
                              : deal.buyer?.email ||
                                deal.buyerEmail ||
                                "Registered Buyer"}
                          </div>
                        </td>

                        {/* Column 3: Escrow Amount */}
                        <td className="py-4 px-6 min-w-[150px]">
                          <div className="text-base font-extrabold text-slate-900">
                            ₦{totalAmount.toLocaleString()}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            Escrow Value
                          </div>
                        </td>

                        {/* Column 4: Status */}
                        <td className="py-4 px-6 min-w-[160px]">
                          {getStatusBadge(deal.status)}
                        </td>

                        {/* Column 5: Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap min-w-[150px]">
                          <div className="inline-flex items-center justify-end gap-2">
                            {isAwaiting && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSharingDeal(deal);
                                }}
                                title="Share Invoice on WhatsApp / Link"
                                className="p-2 rounded-xl bg-slate-50 hover:bg-[#EBF7F0] border border-slate-200 hover:border-[#32A05F]/40 text-slate-600 hover:text-[#32A05F] transition-all cursor-pointer shadow-2xs"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <Link
                              href={`/transaction/${deal.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#32A05F] text-white text-xs font-semibold shadow-xs transition-all"
                            >
                              View Details{" "}
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>
                  Showing{" "}
                  <strong className="text-slate-900">
                    {filteredTransactions.length}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-slate-900">
                    {transactions.length}
                  </strong>{" "}
                  total contracts
                </span>
                {filterStatus !== "ALL" && (
                  <button
                    onClick={() => setFilterStatus("ALL")}
                    className="text-[#32A05F] font-bold hover:underline ml-2 cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Protected by PayTrust automated escrow infrastructure
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No Escrow Deals Found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              You do not have any active escrow agreements matching your query.
              Create an invoice to lock funds securely.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              {filterStatus !== "ALL" && (
                <button
                  onClick={() => setFilterStatus("ALL")}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  View All Deals
                </button>
              )}
              <Link
                href="/transaction/invoice"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Create New Invoice
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick Share Modal for Table Rows */}
      {sharingDeal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setSharingDeal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
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
                Send this link to the buyer via WhatsApp or copy it to your
                clipboard.
              </p>
            </div>

            {/* Deal Overview Snippet */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
              <div className="font-bold text-slate-800 line-clamp-1">
                {sharingDeal.title ||
                  sharingDeal.description ||
                  "Escrow Agreement"}
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Escrow Total:</span>
                <span className="font-bold text-[#32A05F]">
                  ₦
                  {Number(
                    sharingDeal.totalAmount || sharingDeal.amount || 0,
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Link Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Public Escrow Payment URL
              </span>
              <div className="flex items-center justify-between gap-2 bg-white px-3 py-2.5 rounded-xl border border-slate-200">
                <span className="text-xs font-mono font-semibold text-slate-700 truncate">
                  {getEscrowPayUrl(sharingDeal.id)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyLink(sharingDeal)}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleWhatsAppShare(sharingDeal)}
                className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Send Invoice on WhatsApp
              </button>

              <a
                href={getEscrowPayUrl(sharingDeal.id)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                Preview What Buyer Sees{" "}
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
