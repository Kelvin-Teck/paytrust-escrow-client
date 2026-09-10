"use client";

import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "default" | "dark" | "circle" | "pill";
}

/**
 * Base atomic Skeleton with smooth animated shimmer gradient.
 */
export function Skeleton({
  className = "",
  variant = "default",
  ...props
}: SkeletonProps) {
  let baseClasses = "relative overflow-hidden";

  if (variant === "dark") {
    baseClasses += " animate-shimmer-dark rounded-xl";
  } else if (variant === "circle") {
    baseClasses += " animate-shimmer rounded-full";
  } else if (variant === "pill") {
    baseClasses += " animate-shimmer rounded-full";
  } else {
    baseClasses += " animate-shimmer rounded-xl";
  }

  return <div className={`${baseClasses} ${className}`} {...props} />;
}

/**
 * Metric/Balance Card Skeleton
 */
export function CardSkeleton({
  isDark = false,
  className = "",
}: {
  isDark?: boolean;
  className?: string;
}) {
  if (isDark) {
    return (
      <div
        className={`p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4 relative overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-between">
          <Skeleton variant="dark" className="h-4 w-36" />
          <Skeleton variant="dark" className="h-5 w-5 rounded-md" />
        </div>
        <Skeleton variant="dark" className="h-9 w-48 rounded-lg" />
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <Skeleton variant="dark" className="h-4 w-28" />
          <Skeleton variant="dark" className="h-4 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 relative overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-9 w-40 rounded-lg" />
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

/**
 * Table Shimmer Skeleton (used in Dashboard & Wallet Ledgers)
 */
export function TableSkeleton({
  rows = 5,
  cols = 5,
  className = "",
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100 pb-3">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="pb-3 px-4">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-50/50">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="py-4 px-4">
                <Skeleton className="h-5 w-20 rounded-full" />
              </td>
              <td className="py-4 px-4">
                <Skeleton className="h-4 w-24 font-bold" />
              </td>
              <td className="py-4 px-4 text-right">
                <Skeleton className="h-8 w-20 rounded-xl ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Escrow Deal Card Skeleton (for `/transaction` page)
 */
export function DealCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-3 max-w-xl flex-1">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-5 w-20 rounded-lg" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <div className="flex flex-col md:items-end justify-between gap-3">
            <div className="space-y-1 md:text-right">
              <Skeleton className="h-3 w-24 md:ml-auto" />
              <Skeleton className="h-8 w-36 rounded-lg md:ml-auto" />
            </div>
            <Skeleton className="h-9 w-28 rounded-xl md:ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Full Deal Detail Skeleton (`/transaction/[id]`)
 */
export function DealDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Box Skeleton */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-20 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <Skeleton className="h-8 w-2/3 rounded-lg" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="space-y-2 md:text-right">
          <Skeleton className="h-3 w-28 md:ml-auto" />
          <Skeleton className="h-9 w-44 rounded-lg md:ml-auto" />
        </div>
      </div>

      {/* Parties Involved Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Items & Shipping) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <Skeleton className="h-6 w-36 rounded-lg" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-100 flex items-center justify-between"
                >
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        {/* Right Column (Timeline & Actions) */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
            <Skeleton className="h-6 w-36 rounded-lg" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-11 w-full rounded-xl mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dispute Card Skeleton
 */
export function DisputeCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-2.5 max-w-xl flex-1">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-5 w-20 rounded-lg" />
              <Skeleton className="h-5 w-24 rounded-lg" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-28" />
          </div>

          <div className="flex flex-col md:items-end justify-between gap-3">
            <div className="space-y-1 md:text-right">
              <Skeleton className="h-3 w-24 md:ml-auto" />
              <Skeleton className="h-8 w-32 rounded-lg md:ml-auto" />
            </div>
            <Skeleton className="h-9 w-40 rounded-xl md:ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Dispute Detail Skeleton (`/disputes/[id]`)
 */
export function DisputeDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-8 w-2/3 rounded-lg" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <div className="space-y-4 min-h-[300px]">
          <div className="p-4 rounded-2xl bg-slate-50 max-w-lg space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/40 max-w-lg ml-auto space-y-2">
            <Skeleton className="h-4 w-28 ml-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Notification Stream Skeleton
 */
export function NotificationSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-4"
        >
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Form Input Skeleton
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
      <Skeleton className="h-12 w-full rounded-xl mt-4" />
    </div>
  );
}

/**
 * Analytics Bar Chart & Stat Skeleton
 */
export function AnalyticsChartSkeleton() {
  const dummyHeights = ["40%", "75%", "55%", "90%", "65%", "80%"];
  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-64 rounded-lg" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="h-56 flex items-end gap-4 pt-10 pb-4 border-b border-slate-100">
        {dummyHeights.map((h, idx) => (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
          >
            <div
              className="w-full bg-slate-200 animate-shimmer rounded-t-xl"
              style={{ height: h }}
            />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-36" />
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    </div>
  );
}
