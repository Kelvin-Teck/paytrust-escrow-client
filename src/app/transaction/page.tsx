"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  PlusCircle,
  ChevronRight,
  Search,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { transactionService } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { DealCardSkeleton } from "@/components/ui/Skeleton";

export default function EscrowTransactionPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <AppShell>
      <div className="space-y-8">
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

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by contract title, counterparty, or Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
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
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
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

        {isLoading ? (
          <DealCardSkeleton count={3} />
        ) : filteredTransactions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
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

              return (
                <div
                  key={deal.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#32A05F]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                        {deal.id?.slice(0, 8)}
                      </span>
                      <span className="text-xs font-semibold text-[#32A05F] bg-[#EBF7F0] px-2.5 py-0.5 rounded-full capitalize">
                        {deal.status?.replace("_", " ").toLowerCase() ||
                          "Active"}
                      </span>
                      {isCurrentUserBuyer && (
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                          You are Buying
                        </span>
                      )}
                      {isCurrentUserSeller && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          You are Selling
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {deal.title || deal.description || "Escrow Agreement"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Buyer:{" "}
                      <span className="font-semibold text-slate-700">
                        {buyerLabel}
                        {isCurrentUserBuyer ? " (You)" : ""}
                      </span>{" "}
                      • Seller:{" "}
                      <span className="font-semibold text-slate-700">
                        {sellerLabel}
                        {isCurrentUserSeller ? " (You)" : ""}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end justify-between gap-4">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-400 font-bold uppercase">
                        Escrow Value
                      </span>
                      <div className="text-2xl font-extrabold text-slate-900">
                        ₦
                        {Number(
                          deal.totalAmount || deal.amount || 0,
                        ).toLocaleString()}
                      </div>
                    </div>

                    <Link
                      href={`/transaction/${deal.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold transition-all"
                    >
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No Escrow Deals Found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              You do not have any active escrow agreements matching your query.
              Create an invoice to lock funds securely.
            </p>
            <Link
              href="/transaction/invoice"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-sm font-semibold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Create New Invoice
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
