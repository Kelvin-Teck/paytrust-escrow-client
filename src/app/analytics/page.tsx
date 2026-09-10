'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp, Receipt, Shield, CheckCircle2,
  DollarSign, ArrowUpRight, BarChart3, Clock,
  RefreshCw, AlertCircle, PlusCircle, ChevronRight
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { analyticsService, dashboardService, transactionService } from '@/services/api';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [dashData, setDashData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [statsRes, dashRes, txRes] = await Promise.allSettled([
        analyticsService.getStats(),
        dashboardService.getDashboard(),
        transactionService.getTransactions(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
      }

      if (dashRes.status === 'fulfilled' && dashRes.value) {
        setDashData(dashRes.value);
      }

      if (txRes.status === 'fulfilled' && txRes.value) {
        const list = Array.isArray(txRes.value) ? txRes.value : txRes.value?.transactions || [];
        setTransactions(list);
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Compute metrics from transactions
  const totalVolume = transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const completedCount = stats?.completedTransactions ?? transactions.filter((t) => t.status === 'COMPLETED' || t.status === 'DELIVERED').length;
  const totalCount = stats?.totalTransactions ?? transactions.length;
  const completionRate = stats?.completionRate !== undefined
    ? Number(stats.completionRate).toFixed(1)
    : totalCount > 0
    ? ((completedCount / totalCount) * 100).toFixed(1)
    : '100.0';

  // Monthly breakdown calculation
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const idx = (currentMonthIdx - 5 + i + 12) % 12;
    return months[idx];
  });

  const monthlyVolumeMap: Record<string, number> = {};
  last6Months.forEach((m) => { monthlyVolumeMap[m] = 0; });

  transactions.forEach((tx) => {
    const date = new Date(tx.createdAt || Date.now());
    const mName = months[date.getMonth()];
    if (monthlyVolumeMap[mName] !== undefined) {
      monthlyVolumeMap[mName] += Number(tx.amount) || 0;
    }
  });

  const maxMonthlyVol = Math.max(...Object.values(monthlyVolumeMap), 100000);

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Analytics & Escrow Volume
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live financial performance, escrow fulfillment rates, and clearing velocity from your backend.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#32A05F]' : ''}`} />
              Refresh Analytics
            </button>
            <Link
              href="/transaction/invoice"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-semibold shadow-sm shadow-[#32A05F]/20 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Escrow Deal
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Total Volume */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Escrow Volume
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">
              ₦{Number(totalVolume).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#32A05F] font-bold mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{totalCount} Total Contract{totalCount === 1 ? '' : 's'} Created</span>
            </div>
          </div>

          {/* Completed Agreements */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Completed Agreements
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">
              {completedCount} <span className="text-base font-normal text-slate-400">/ {totalCount} Deals</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#32A05F] font-bold mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{completionRate}% Completion Rate</span>
            </div>
          </div>

          {/* Active Escrow Volume */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Protected Deals
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">
              {dashData?.stats?.activeEscrows ?? 0} <span className="text-base font-normal text-slate-400">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold mt-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{dashData?.stats?.pendingEscrows ?? 0} Pending Milestone Actions</span>
            </div>
          </div>
        </div>

        {/* Volume Chart Visualization */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Escrow Transaction Volume (Last 6 Months)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time funds processed through escrow contracts</p>
            </div>
            <span className="text-xs font-bold text-[#32A05F] bg-[#EBF7F0] px-3 py-1 rounded-full border border-[#32A05F]/20 w-fit">
              Live API Metrics
            </span>
          </div>

          {/* Bar visualization */}
          <div className="h-56 flex items-end gap-4 pt-10 pb-4 border-b border-slate-100">
            {last6Months.map((m) => {
              const val = monthlyVolumeMap[m] || 0;
              const heightPercent = totalVolume > 0
                ? Math.max(Math.round((val / maxMonthlyVol) * 100), 12)
                : 15;

              return (
                <div key={m} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[11px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₦{Number(val).toLocaleString()}
                  </div>
                  <div
                    className="w-full bg-[#32A05F] rounded-t-xl transition-all duration-500 group-hover:bg-[#28874E] relative"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/10 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs text-slate-600 font-semibold mt-1">{m}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Average Deal Size</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  ₦{totalCount > 0 ? Number(totalVolume / totalCount).toLocaleString('en-NG', { maximumFractionDigits: 0 }) : '0'}
                </p>
              </div>
              <span className="text-xs font-bold text-[#32A05F] bg-[#EBF7F0] px-2.5 py-1 rounded-lg">
                NGN
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Dispute Protection Status</span>
                <p className="text-base font-bold text-[#32A05F] mt-0.5">100% Escrow Guarded</p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
