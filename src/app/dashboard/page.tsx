"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowDownLeft,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Wallet,
  ArrowRight,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/stores/authStore";
import {
  CardSkeleton,
  TableSkeleton,
  Skeleton,
} from "@/components/ui/Skeleton";
import {
  dashboardService,
  walletService,
  transactionService,
} from "@/services/api";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "escrow">("all");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [dashRes, walletRes, txRes] = await Promise.allSettled([
          dashboardService.getDashboard(),
          walletService.getBalances(),
          transactionService.getTransactions(),
        ]);

        if (dashRes.status === "fulfilled" && dashRes.value) {
          setDashboardData(dashRes.value);
        }

        if (walletRes.status === "fulfilled" && walletRes.value) {
          // Check if wallet balance is returned directly or in an array
          const bal =
            walletRes.value?.balance ?? walletRes.value?.[0]?.balance ?? 0;
          setWalletBalance(bal);
        }

        if (txRes.status === "fulfilled" && txRes.value) {
          const list = Array.isArray(txRes.value)
            ? txRes.value
            : txRes.value?.transactions || [];
          setTransactions(list);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const formatNameFromEmail = (email?: string) => {
    if (!email) return "User";
    const username = email.split("@")[0];
    return username
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const displayName =
    user?.name ||
    (user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : null) ||
    (dashboardData?.greeting && dashboardData.greeting !== "Welcome, User"
      ? dashboardData.greeting.replace("Welcome, ", "")
      : null) ||
    (user?.email ? formatNameFromEmail(user.email) : "User");

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {displayName}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Here is what is happening across your escrow deals and
              multi-currency wallets today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/transaction/invoice"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-semibold shadow-xs transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-[#32A05F]" />
              New Escrow Deal
            </Link>
            <Link
              href="/wallet/naira"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-sm font-semibold shadow-sm shadow-[#32A05F]/20 transition-all active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Fund Wallet
            </Link>
          </div>
        </div>

        {/* Balance Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <CardSkeleton isDark={true} />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Main Available Balance */}
            <div className="p-6 rounded-3xl bg-[#0F172A] text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Available Balance (NGN)
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-slate-400 hover:text-white transition-colors"
                  title={showBalance ? "Hide Balance" : "Show Balance"}
                >
                  {showBalance ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="text-3xl font-extrabold tracking-tight mb-4">
                {showBalance
                  ? `₦${Number(walletBalance).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
                  : "••••••••••"}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                <span className="flex items-center gap-1 text-[#32A05F] font-bold">
                  <TrendingUp className="w-3.5 h-3.5" /> Instant Paystack &
                  Transfer
                </span>
                <Link
                  href="/wallet"
                  className="hover:text-[#32A05F] transition-colors font-semibold"
                >
                  Manage Wallet →
                </Link>
              </div>
            </div>

            {/* Locked in Escrow */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Escrow Deals
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
                {dashboardData?.stats?.activeEscrows ?? 0}{" "}
                <span className="text-base text-slate-400 font-normal">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>
                  {dashboardData?.stats?.pendingEscrows ?? 0} pending milestone
                  actions
                </span>
                <Link
                  href="/transaction"
                  className="text-[#32A05F] font-bold hover:underline"
                >
                  View Deals →
                </Link>
              </div>
            </div>

            {/* Bitcoin Vault */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Bitcoin Escrow Vault
                </span>
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
                {showBalance ? "0.0000 BTC" : "••••••••••"}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>Native SegWit Multi-sig</span>
                <Link
                  href="/wallet/bitcoin"
                  className="text-orange-600 font-bold hover:underline"
                >
                  BTC Details →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Transactions & Escrow Orders
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time status of protected agreements
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-[#32A05F] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Orders
              </button>
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Transaction Details</th>
                    <th className="pb-3">Counterparty</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx: any) => {
                    const isBuyer =
                      user?.id === tx.buyerId ||
                      (user?.email &&
                        tx.buyer?.email &&
                        user.email.toLowerCase() ===
                          tx.buyer.email.toLowerCase());

                    const counterpartyLabel = isBuyer
                      ? tx.seller?.name ||
                        (tx.seller?.firstName
                          ? `${tx.seller.firstName} ${tx.seller.lastName || ""}`.trim()
                          : null) ||
                        tx.seller?.email ||
                        tx.sellerEmail ||
                        "Seller"
                      : tx.buyer?.name ||
                        (tx.buyer?.firstName
                          ? `${tx.buyer.firstName} ${tx.buyer.lastName || ""}`.trim()
                          : null) ||
                        tx.buyer?.email ||
                        tx.buyerEmail ||
                        "Buyer";

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="py-4 pr-4">
                          <div className="font-semibold text-slate-900 group-hover:text-[#32A05F] transition-colors">
                            {tx.title || tx.description || "Escrow Agreement"}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 font-mono">
                            {tx.id?.slice(0, 8)} •{" "}
                            {new Date(
                              tx.createdAt || Date.now(),
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-slate-600 font-medium">
                          <div className="text-xs font-semibold text-slate-800">
                            {counterpartyLabel}
                          </div>
                          <span
                            className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-md mt-0.5 ${
                              isBuyer
                                ? "bg-blue-50 text-blue-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {isBuyer ? "Buying from" : "Selling to"}
                          </span>
                        </td>
                        <td className="py-4 pr-4 font-bold text-slate-900">
                          ₦
                          {Number(
                            tx.totalAmount || tx.amount || 0,
                          ).toLocaleString()}
                        </td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF7F0] text-[#32A05F] border border-[#32A05F]/20 capitalize">
                            {tx.status?.replace("_", " ").toLowerCase() ||
                              "Active"}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <Link
                            href={`/transaction/${tx.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#32A05F] hover:underline"
                          >
                            Details <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mx-auto">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No Escrow Deals Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create your first milestone escrow invoice to start receiving
                payments securely.
              </p>
              <Link
                href="/transaction/invoice"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold transition-all shadow-xs"
              >
                + Create Escrow Invoice
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
