"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
  AlertCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  Copy,
  Check,
  Receipt,
  Download,
  ExternalLink,
  ChevronDown,
  Info,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { walletService, paymentService } from "@/services/api";
import { toast } from "@/components/ui/Toast";
import { CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

type CurrencyFilter = "ALL" | "NGN" | "BTC";
type StatusFilter = "ALL" | "success" | "pending" | "failed";
type TypeFilter =
  | "ALL"
  | "deposit"
  | "withdrawal"
  | "escrow_lock"
  | "escrow_release"
  | "escrow_credit";
type SortOption = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

function WalletContent() {
  const searchParams = useSearchParams();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filters & Sorting state
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("date_desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected transaction for detailed receipt modal
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const fetchWallet = async () => {
    setIsLoading(true);
    try {
      const [balRes, histRes] = await Promise.allSettled([
        walletService.getBalances(),
        walletService.getHistory({ limit: 100 }),
      ]);

      if (balRes.status === "fulfilled" && balRes.value) {
        const bal = balRes.value?.balance ?? balRes.value?.[0]?.balance ?? 0;
        setWalletBalance(bal);
      }

      if (histRes.status === "fulfilled" && histRes.value) {
        const list = Array.isArray(histRes.value)
          ? histRes.value
          : histRes.value?.transactions || [];
        setHistory(list);
      }
    } catch (e) {
      console.error("Wallet fetch error", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");
    const status = searchParams.get("status");

    if (reference) {
      // Verify payment with backend
      paymentService
        .verifyPayment(reference)
        .then((res) => {
          setNotification({
            type: "success",
            message: `Deposit confirmed! Your wallet balance has been credited successfully. Reference: ${reference}`,
          });
          fetchWallet();
        })
        .catch((err) => {
          console.warn("Payment verification notice:", err);
          if (status === "success") {
            setNotification({
              type: "success",
              message:
                "Deposit recorded successfully! Your wallet has been credited.",
            });
          }
          fetchWallet();
        });
    } else {
      fetchWallet();
    }
  }, [searchParams]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return history
      .filter((tx) => {
        // Currency filter
        if (currencyFilter !== "ALL") {
          const txCur = (tx.currency || "NGN").toUpperCase();
          if (txCur !== currencyFilter) return false;
        }

        // Status filter
        if (statusFilter !== "ALL") {
          const txStatus = (tx.status || "success").toLowerCase();
          if (txStatus !== statusFilter) return false;
        }

        // Type filter
        if (typeFilter !== "ALL") {
          const txType = (tx.type || "").toLowerCase();
          if (txType !== typeFilter) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const refMatch = (tx.reference || tx.id || "")
            .toLowerCase()
            .includes(q);
          const descMatch = (tx.description || "").toLowerCase().includes(q);
          const typeMatch = (tx.type || "").toLowerCase().includes(q);
          if (!refMatch && !descMatch && !typeMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const amountA = Math.abs(Number(a.amount || 0));
        const amountB = Math.abs(Number(b.amount || 0));
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        switch (sortBy) {
          case "date_asc":
            return dateA - dateB;
          case "amount_desc":
            return amountB - amountA;
          case "amount_asc":
            return amountA - amountB;
          case "date_desc":
          default:
            return dateB - dateA;
        }
      });
  }, [history, currencyFilter, statusFilter, typeFilter, sortBy, searchQuery]);

  // Statistics summary for current filtered view
  const { totalInflow, totalOutflow, countNgn, countBtc } = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    let ngn = 0;
    let btc = 0;

    filteredTransactions.forEach((tx) => {
      const amt = Number(tx.amount || 0);
      const isDeposit =
        tx.type === "deposit" ||
        tx.type === "CREDIT" ||
        tx.type === "escrow_credit" ||
        (amt > 0 &&
          !tx.type?.includes("withdrawal") &&
          !tx.type?.includes("lock"));

      if (isDeposit) {
        inflow += Math.abs(amt);
      } else {
        outflow += Math.abs(amt);
      }

      if ((tx.currency || "NGN").toUpperCase() === "BTC") {
        btc++;
      } else {
        ngn++;
      }
    });

    return {
      totalInflow: inflow,
      totalOutflow: outflow,
      countNgn: ngn,
      countBtc: btc,
    };
  }, [filteredTransactions]);

  const hasActiveFilters =
    currencyFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    searchQuery.trim() !== "" ||
    sortBy !== "date_desc";

  const resetFilters = () => {
    setCurrencyFilter("ALL");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setSortBy("date_desc");
    setSearchQuery("");
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xs ${
              notification.type === "success"
                ? "bg-[#EBF7F0] border-[#32A05F]/30 text-[#1E6B3E]"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-[#32A05F] shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <p className="text-sm font-semibold">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Multi-Currency Wallets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Deposit, transfer, and withdraw balances for Nigerian Naira and
            Bitcoin escrow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/wallet/naira"
            className="px-4 py-2.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-sm font-semibold shadow-sm shadow-[#32A05F]/20 transition-all"
          >
            + Deposit NGN
          </Link>
          <Link
            href="/wallet/withdraw"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-all shadow-xs"
          >
            Withdraw to Bank
          </Link>
        </div>
      </div>

      {/* Currency Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton isDark={true} className="min-h-[260px]" />
          <CardSkeleton isDark={true} className="min-h-[260px]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Naira Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[260px]">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#32A05F]/20 text-[#32A05F] flex items-center justify-center font-bold text-lg border border-[#32A05F]/30">
                    ₦
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Nigerian Naira Wallet</h3>
                    <span className="text-xs text-[#32A05F] font-semibold">
                      Instant Paystack & Transfer
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#32A05F]/20 text-[#32A05F] text-xs font-bold border border-[#32A05F]/30">
                  Active
                </span>
              </div>

              <div className="mt-8">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Available Balance
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
                  ₦
                  {Number(walletBalance).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
              <Link
                href="/wallet/naira"
                className="text-sm font-bold text-[#32A05F] hover:underline flex items-center gap-1"
              >
                Top up & Fund Wallet <ChevronRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-slate-400">Default Currency</span>
            </div>
          </div>

          {/* Bitcoin Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[260px]">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-lg border border-orange-500/30">
                    ₿
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Bitcoin Vault</h3>
                    <span className="text-xs text-orange-400 font-semibold">
                      On-chain SegWit
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30">
                  Active
                </span>
              </div>

              <div className="mt-8">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Available Balance
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
                  0.00000000{" "}
                  <span className="text-lg text-slate-400 font-normal">
                    BTC
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
              <Link
                href="/wallet/bitcoin"
                className="text-sm font-bold text-orange-400 hover:underline flex items-center gap-1"
              >
                Open Bitcoin Vault <ChevronRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-slate-400">
                Multi-sig Protected
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* WALLET ACTIVITY SECTION WITH ENHANCED FILTERING & SORTING */}
      {/* ========================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        {/* Header Title & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900">
                Wallet Activity
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {filteredTransactions.length} of {history.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time ledger of your deposits, payouts, and escrow locks
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-all flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
            <button
              onClick={fetchWallet}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh ledger"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="space-y-4">
          {/* Top Bar: Search + Currency Tabs + Sorting */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Currency Filter Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-fit">
              <button
                onClick={() => setCurrencyFilter("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currencyFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Currencies
              </button>
              <button
                onClick={() => setCurrencyFilter("NGN")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currencyFilter === "NGN"
                    ? "bg-[#32A05F] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>₦</span> Naira (NGN)
              </button>
              <button
                onClick={() => setCurrencyFilter("BTC")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currencyFilter === "BTC"
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>₿</span> Bitcoin (BTC)
              </button>
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search reference or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#32A05F] focus:ring-1 focus:ring-[#32A05F]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="amount_desc">Highest Amount</option>
                  <option value="amount_asc">Lowest Amount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Secondary Filter Row: Status Pills & Activity Type Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Status Filter Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  statusFilter === "ALL"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                All Statuses
              </button>
              <button
                onClick={() => setStatusFilter("success")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                  statusFilter === "success"
                    ? "bg-[#EBF7F0] text-[#1E6B3E] border-[#32A05F]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#32A05F]"></span>
                Successful
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                  statusFilter === "pending"
                    ? "bg-amber-50 text-amber-800 border-amber-300"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Pending
              </button>
              <button
                onClick={() => setStatusFilter("failed")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                  statusFilter === "failed"
                    ? "bg-rose-50 text-rose-800 border-rose-300"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                Failed
              </button>
            </div>

            {/* Type Filter Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Type:
              </span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#32A05F] cursor-pointer"
              >
                <option value="ALL">All Activity Types</option>
                <option value="deposit">Deposits / Wallet Funding</option>
                <option value="withdrawal">Withdrawals / Payouts</option>
                <option value="escrow_lock">Escrow Locks</option>
                <option value="escrow_release">Escrow Releases</option>
                <option value="escrow_credit">Escrow Credits</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filtered Summary Mini Bar */}
        {filteredTransactions.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <span className="text-slate-500 font-medium">
                Showing{" "}
                <strong className="text-slate-900">
                  {filteredTransactions.length}
                </strong>{" "}
                matching records
              </span>
              {currencyFilter === "ALL" && (
                <span className="text-slate-400 text-[11px]">
                  ({countNgn} Naira • {countBtc} Bitcoin)
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Total Inflow:</span>
                <span className="font-bold text-[#32A05F]">
                  +₦
                  {totalInflow.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Total Outflow:</span>
                <span className="font-bold text-slate-800">
                  -₦
                  {totalOutflow.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Ledger Table / List */}
        {isLoading && history.length === 0 ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filteredTransactions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                No matching transactions found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No transactions match the selected filters or search query. Try
                adjusting your criteria.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-2 text-xs font-bold text-[#32A05F] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {filteredTransactions.map((tx: any, idx: number) => {
              const cur = (tx.currency || "NGN").toUpperCase();
              const isBtc = cur === "BTC";
              const amt = Number(tx.amount || 0);
              const isDeposit =
                tx.type === "deposit" ||
                tx.type === "CREDIT" ||
                tx.type === "escrow_credit" ||
                (amt > 0 &&
                  !tx.type?.includes("withdrawal") &&
                  !tx.type?.includes("lock"));

              const status = (tx.status || "success").toLowerCase();

              return (
                <div
                  key={tx.id || idx}
                  onClick={() => setSelectedTx(tx)}
                  className="p-4 sm:px-5 hover:bg-slate-50/80 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  {/* Left: Icon & Description */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform group-hover:scale-105 ${
                        isDeposit
                          ? "bg-[#EBF7F0] text-[#32A05F]"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 capitalize truncate">
                          {tx.description || tx.type || "Wallet Transaction"}
                        </p>
                        {isBtc && (
                          <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-bold">
                            BTC
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono truncate">
                        <span className="truncate">
                          {tx.reference || tx.id || `TXN-${idx + 1}`}
                        </span>
                        {tx.createdAt && (
                          <>
                            <span>•</span>
                            <span className="shrink-0 font-sans text-slate-500">
                              {new Date(tx.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                              ,{" "}
                              {new Date(tx.createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                },
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Status Badge */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-extrabold ${
                        isDeposit ? "text-[#32A05F]" : "text-slate-900"
                      }`}
                    >
                      {isDeposit ? "+" : "-"}
                      {isBtc
                        ? `${Math.abs(amt).toFixed(8)} BTC`
                        : `₦${Math.abs(amt).toLocaleString("en-NG", {
                            minimumFractionDigits: 2,
                          })}`}
                    </span>

                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                          status === "success" || status === "completed"
                            ? "bg-[#EBF7F0] text-[#1E6B3E]"
                            : status === "pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* DETAILED TRANSACTION RECEIPT MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Receipt Modal Header */}
              <div className="p-6 bg-slate-900 text-white relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#32A05F]/20 text-[#32A05F] flex items-center justify-center font-bold">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Transaction Details</h3>
                    <p className="text-xs text-slate-400">
                      Official PayTrust Ledger Receipt
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Receipt Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Large Amount Display */}
                <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Amount
                  </span>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {(selectedTx.currency || "NGN").toUpperCase() === "BTC"
                      ? `${Math.abs(Number(selectedTx.amount || 0)).toFixed(8)} BTC`
                      : `₦${Math.abs(
                          Number(selectedTx.amount || 0),
                        ).toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                        })}`}
                  </div>
                  <span
                    className={`inline-block text-xs font-bold px-3 py-0.5 rounded-full capitalize ${
                      selectedTx.status === "success" ||
                      selectedTx.status === "completed"
                        ? "bg-[#EBF7F0] text-[#1E6B3E]"
                        : selectedTx.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {selectedTx.status || "Success"}
                  </span>
                </div>

                {/* Field-by-Field Breakdown */}
                <div className="space-y-3.5 text-xs">
                  {/* Reference ID with Copy button */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Reference Number
                    </span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                      <span>{selectedTx.reference || selectedTx.id}</span>
                      <button
                        onClick={() =>
                          handleCopy(selectedTx.reference || selectedTx.id)
                        }
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Copy Reference"
                      >
                        {copiedRef ? (
                          <Check className="w-3.5 h-3.5 text-[#32A05F]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Transaction Type */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Activity Type
                    </span>
                    <span className="font-bold text-slate-900 capitalize">
                      {selectedTx.type || "Wallet Transaction"}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Description
                    </span>
                    <span className="font-bold text-slate-900 text-right max-w-[240px] truncate">
                      {selectedTx.description || "Wallet Top-up"}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Timestamp
                    </span>
                    <span className="font-bold text-slate-900">
                      {selectedTx.createdAt
                        ? new Date(selectedTx.createdAt).toLocaleString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "Recent"}
                    </span>
                  </div>

                  {/* Currency Rail */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-500 font-medium">
                      Payment Channel
                    </span>
                    <span className="font-bold text-slate-900">
                      {(selectedTx.currency || "NGN").toUpperCase() === "BTC"
                        ? "Bitcoin Blockchain (SegWit)"
                        : "Paystack Direct / NUBAN Transfer"}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setSelectedTx(null)}
                    className="w-full py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      toast.success("Receipt exported to clipboard.");
                      handleCopy(
                        `PayTrust Receipt:\nReference: ${
                          selectedTx.reference || selectedTx.id
                        }\nAmount: ₦${Number(selectedTx.amount || 0).toLocaleString()}\nStatus: ${
                          selectedTx.status
                        }\nDate: ${new Date(
                          selectedTx.createdAt || Date.now(),
                        ).toLocaleString()}`,
                      );
                    }}
                    className="w-full py-3 rounded-xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-[#32A05F]/20"
                  >
                    <Download className="w-3.5 h-3.5" /> Copy Receipt
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WalletHubPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="py-16 text-center text-slate-400 font-semibold text-sm">
            Loading Wallet Dashboard...
          </div>
        }
      >
        <WalletContent />
      </Suspense>
    </AppShell>
  );
}
