"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Package,
  ArrowRight,
  X,
  ExternalLink,
  Lock,
  Sparkles,
  Award,
  Globe2,
  HelpCircle,
} from "lucide-react";

// ─── SVG ICONS & BADGES FOR 1:1 TEMPLATE FIDELITY ───

function BBBTorchIcon({ className = "w-6 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Flame Outer */}
      <path
        d="M16 2C16 2 21.5 8 20.5 14C19.5 20 14 20 14 20C14 20 12 16.5 13 13.5C14 10.5 16 2 16 2Z"
        fill="#005A9C"
      />
      {/* Flame Inner Core */}
      <path
        d="M16 6.5C16 6.5 18.5 10.5 18 14C17.5 17 15 17 15 17C15 17 14 15 14.5 13C15 11 16 6.5 16 6.5Z"
        fill="#38B6FF"
      />
      {/* Torch Neck & Rim */}
      <rect x="11" y="21" width="10" height="2.5" rx="0.8" fill="#0A2540" />
      {/* Torch Body */}
      <path d="M12.5 23.5H19.5L18 34H14L12.5 23.5Z" fill="#0A2540" />
      {/* Base */}
      <rect x="13" y="34" width="6" height="2" rx="0.5" fill="#0A2540" />
      {/* BBB Wordmark */}
      <text
        x="16"
        y="40"
        textAnchor="middle"
        fontSize="5.5"
        fontWeight="900"
        fill="#005A9C"
        fontFamily="sans-serif"
        letterSpacing="0.2"
      >
        BBB
      </text>
    </svg>
  );
}

function BBBAccreditedBadge() {
  return (
    <div
      className="inline-flex items-center bg-[#005A9C] text-white rounded-md p-1.5 px-3 gap-2 shadow-xs border border-[#004A82] select-none hover:brightness-105 transition-all cursor-default"
      title="BBB Accredited Business - A+ Trust & Reliability Standing"
    >
      <div className="flex flex-col items-center justify-center border-r border-white/30 pr-2">
        <svg viewBox="0 0 16 22" fill="none" className="w-3.5 h-4.5">
          <path
            d="M8 1C8 1 11.5 4.5 11 8.5C10.5 11.5 7 11.5 7 11.5C7 11.5 6 9.5 6.5 8C7 6.5 8 1 8 1Z"
            fill="#38B6FF"
          />
          <path d="M6 13.5H10L9 19.5H7L6 13.5Z" fill="white" />
        </svg>
        <span className="text-[7.5px] font-black tracking-tight leading-none text-white mt-0.5">
          BBB
        </span>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[9.5px] font-black tracking-wider text-white uppercase">
          ACCREDITED
        </span>
        <span className="text-[9.5px] font-black tracking-wider text-white uppercase">
          BUSINESS
        </span>
      </div>
    </div>
  );
}

function StateSealBadge() {
  return (
    <div
      className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-500 p-[1.5px] shadow-xs select-none hover:scale-105 transition-transform cursor-default shrink-0"
      title="State Licensed & Statutorily Regulated Escrow Authority"
    >
      <div className="w-full h-full rounded-full bg-radial from-amber-50 to-amber-100 flex items-center justify-center border border-amber-600/40 relative overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full h-full text-amber-900">
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="#92400E"
            strokeWidth="2.5"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#B45309"
            strokeWidth="1"
            strokeDasharray="2.5 2.5"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="33"
            fill="#FEF3C7"
            stroke="#D97706"
            strokeWidth="1"
          />
          {/* Goddess Minerva & Sierra Nevada Foothills motif */}
          <path
            d="M26 66 Q 50 46 74 66 L 74 76 L 26 76 Z"
            fill="#D97706"
            opacity="0.75"
          />
          <circle cx="50" cy="32" r="8" fill="#B45309" />
          <path d="M42 42 L 58 42 L 54 58 L 46 58 Z" fill="#92400E" />
          <path
            d="M38 58 Q 50 64 62 58"
            stroke="#78350F"
            strokeWidth="2"
            fill="none"
          />
          {/* Compass and laurel points */}
          <circle cx="20" cy="50" r="2.5" fill="#B45309" />
          <circle cx="80" cy="50" r="2.5" fill="#B45309" />
          <circle cx="50" cy="18" r="2.5" fill="#B45309" />
          <circle cx="50" cy="82" r="2.5" fill="#B45309" />
        </svg>
        <span className="absolute text-[5.5px] font-black uppercase text-amber-900 tracking-tighter text-center leading-[6.5px] inset-x-1 bottom-1">
          STATE LICENSED
        </span>
      </div>
    </div>
  );
}

function USCommercialServiceBadge() {
  return (
    <div
      className="inline-flex items-center gap-2 p-1.5 px-2.5 rounded-md border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-all select-none cursor-default shrink-0"
      title="U.S. Commercial Service - Department of Commerce Trade & Export Escrow Desk"
    >
      <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 40 40" className="w-full h-full">
          {/* Navy Shield with gold border */}
          <path
            d="M5 8 L 20 3 L 35 8 L 35 24 Q 20 38 5 24 Z"
            fill="#0A2540"
            stroke="#1E3A8A"
            strokeWidth="1"
          />
          {/* Red & white stripes inside shield */}
          <path
            d="M11 18 L 29 18 L 27 28 Q 20 33 13 28 Z"
            fill="#DC2626"
          />
          <rect x="14.5" y="18" width="3" height="11" fill="white" />
          <rect x="22.5" y="18" width="3" height="11" fill="white" />
          {/* Stars */}
          <polygon
            points="14,10 15,13 18,13 15.5,15 16.5,18 14,16 11.5,18 12.5,15 10,13 13,13"
            fill="white"
          />
          <polygon
            points="26,10 27,13 30,13 27.5,15 28.5,18 26,16 23.5,18 24.5,15 22,13 25,13"
            fill="white"
          />
          <polygon
            points="20,7 21,9 23,9 21.5,10.5 22,12.5 20,11.5 18,12.5 18.5,10.5 17,9 19,9"
            fill="white"
          />
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[9.5px] font-black text-[#0A2540] tracking-tight leading-tight uppercase">
          U.S. COMMERCIAL
        </span>
        <span className="text-[8.5px] font-extrabold text-[#DC2626] tracking-tight leading-tight uppercase">
          SERVICE
        </span>
        <span className="text-[7px] font-medium text-slate-500 tracking-tight leading-tight">
          United States of America
        </span>
      </div>
    </div>
  );
}

// ─── MAIN TRUST & TRACK BANNER COMPONENT ───

interface TrustAndTrackBannerProps {
  className?: string;
  showTrackerButton?: boolean;
}

export function TrustAndTrackBanner({
  className = "",
  showTrackerButton = true,
}: TrustAndTrackBannerProps) {
  const router = useRouter();
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [searchRef, setSearchRef] = useState("");
  const [activeTab, setActiveTab] = useState<"template" | "peltapay">("template");

  // Sample preloaded transactions for the "Track Escrow Details" screen
  const sampleDeals = [
    {
      ref: "ESC-8842-NG",
      title: "20x Bulk iPhone 15 Pro Max Shipments",
      amount: "₦28,500,000",
      status: "In Neutral Vault (Funded)",
      stage: 2,
      buyer: "Halima B. (Lagos)",
      seller: "TechHub Global (Abuja)",
      inspectionPeriod: "3 Days",
      updatedAt: "Today, 14:10",
    },
    {
      ref: "ESC-7719-USD",
      title: "Enterprise Web3 Escrow Integration",
      amount: "$14,500 USD",
      status: "Inspection Window Active",
      stage: 4,
      buyer: "Apex Ventures Inc",
      seller: "PeltaPay Partner Studio",
      inspectionPeriod: "5 Days",
      updatedAt: "Yesterday, 18:30",
    },
  ];

  const [trackedDeal, setTrackedDeal] = useState<any>(sampleDeals[0]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRef.trim()) return;

    const trimmed = searchRef.trim().toUpperCase();
    const found = sampleDeals.find(
      (d) => d.ref.toUpperCase() === trimmed || d.ref.includes(trimmed)
    );

    if (found) {
      setTrackedDeal(found);
    } else {
      // Mock generate a live agreement view for arbitrary ID or navigate to pay/[id]
      setTrackedDeal({
        ref: trimmed,
        title: "Escrow Agreement Custody",
        amount: "₦150,000",
        status: "Payment Secured in Neutral Escrow",
        stage: 2,
        buyer: "Verified Buyer",
        seller: "Verified Merchant",
        inspectionPeriod: "3 Days",
        updatedAt: "Just now",
      });
    }
  };

  return (
    <>
      {/* ─── FULL-WIDTH CREDIBILITY STRIP (EXACT SCREEN AS SEEN IN IMAGE) ─── */}
      <section
        className={`w-full bg-white border-y border-slate-200/90 shadow-xs relative z-20 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            
            {/* Scrollable / Responsive Container for Stats & Badges */}
            <div className="w-full flex items-center justify-between lg:justify-start gap-6 sm:gap-8 lg:gap-10 overflow-x-auto no-scrollbar py-1">
              
              {/* Stat 1: $8,300,000,000+ USD Processed */}
              <div className="shrink-0">
                <div className="text-xl sm:text-2xl lg:text-[26px] font-black text-[#0A2540] tracking-tight leading-none">
                  $8,300,000,000+
                </div>
                <div className="text-xs sm:text-[13px] font-semibold text-slate-500 mt-1 uppercase tracking-wide">
                  USD Processed
                </div>
              </div>

              {/* Stat 2: 3,900,000+ Customers Trust Escrow */}
              <div className="shrink-0">
                <div className="text-xl sm:text-2xl lg:text-[26px] font-black text-[#0A2540] tracking-tight leading-none">
                  3,900,000+
                </div>
                <div className="text-xs sm:text-[13px] font-semibold text-slate-500 mt-1 uppercase tracking-wide">
                  Customers Trust Escrow
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-10 w-[1.5px] bg-slate-200/80 shrink-0 hidden sm:block" />

              {/* Award: BBB Torch Awards | Winner of 2017 Award for Ethics */}
              <div className="flex items-center gap-3 shrink-0">
                <BBBTorchIcon className="w-7 h-9 shrink-0 drop-shadow-2xs" />
                <div className="flex flex-col justify-center">
                  <div className="text-sm sm:text-base font-extrabold text-[#0A2540] tracking-tight leading-tight">
                    BBB Torch Awards
                  </div>
                  <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                    Winner of 2017 Award for Ethics
                  </div>
                </div>
              </div>

              {/* Accreditation Badge: BBB Accredited Business */}
              <div className="shrink-0 hidden md:flex items-center">
                <BBBAccreditedBadge />
              </div>

              {/* Official Seal: The Great Seal of California / Licensed Escrow Authority */}
              <div className="shrink-0 hidden lg:flex items-center">
                <StateSealBadge />
              </div>

              {/* Emblem: U.S. Commercial Service */}
              <div className="shrink-0 hidden xl:flex items-center">
                <USCommercialServiceBadge />
              </div>
            </div>

            {/* Quick Action: "Track Escrow Details" Screen / Modal Launcher */}
            {showTrackerButton && (
              <div className="shrink-0 w-full lg:w-auto flex items-center justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTrackerOpen(true)}
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#0A2540] hover:bg-[#1E3A8A] text-white shadow-sm transition-all hover:shadow hover:scale-[1.01] active:scale-95"
                >
                  <Search className="w-3.5 h-3.5 text-[#38B6FF]" />
                  <span>Track Escrow Details</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── MODAL SCREEN TO TRACK DETAILS (INTERACTIVE TEMPLATE) ─── */}
      <AnimatePresence>
        {isTrackerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-[#0A2540] to-[#1E293B] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#32A05F] flex items-center justify-center text-white shadow-md shadow-[#32A05F]/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      Live Escrow Contract Tracker
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                        Institutional Custody
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Query real-time escrow milestone status and vault holding verification
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTrackerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar Screen */}
              <div className="p-6 bg-[#F8FAFC] border-b border-slate-200">
                <form onSubmit={handleTrackSubmit} className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Enter Escrow ID or Agreement Reference
                  </label>
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. ESC-8842-NG or paste contract link"
                      value={searchRef}
                      onChange={(e) => setSearchRef(e.target.value)}
                      className="w-full pl-10 pr-28 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#32A05F] focus:border-transparent transition-all shadow-2xs"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 px-4 py-1.5 bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                    >
                      Track Now
                    </button>
                  </div>

                  {/* Sample Query Pills */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 overflow-x-auto no-scrollbar">
                    <span className="font-semibold text-slate-400 shrink-0">Try Sample:</span>
                    {sampleDeals.map((deal) => (
                      <button
                        key={deal.ref}
                        type="button"
                        onClick={() => {
                          setSearchRef(deal.ref);
                          setTrackedDeal(deal);
                        }}
                        className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-mono text-[11px] shrink-0 transition-colors"
                      >
                        {deal.ref}
                      </button>
                    ))}
                  </div>
                </form>
              </div>

              {/* Track Details Result Screen */}
              {trackedDeal && (
                <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                  {/* Agreement Summary Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#32A05F] bg-[#EBF7F0] px-2 py-0.5 rounded">
                            {trackedDeal.ref}
                          </span>
                          <span className="text-xs font-medium text-slate-400">
                            Updated {trackedDeal.updatedAt}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          {trackedDeal.title}
                        </h4>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-xs font-medium text-slate-500">Escrow Value</div>
                        <div className="text-lg font-black text-slate-900">
                          {trackedDeal.amount}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-slate-400 block font-medium">Buyer Party</span>
                        <span className="font-bold text-slate-800">{trackedDeal.buyer}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Seller Party</span>
                        <span className="font-bold text-slate-800">{trackedDeal.seller}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Inspection Period</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                          {trackedDeal.inspectionPeriod}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5-Step Milestone Stepper */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Custodial Milestone Stepper
                    </h5>

                    <div className="space-y-3">
                      {[
                        {
                          step: 1,
                          title: "Escrow Agreement Drafted & Signed",
                          desc: "Mutual covenants established between buyer and merchant.",
                          done: trackedDeal.stage >= 1,
                          current: trackedDeal.stage === 1,
                        },
                        {
                          step: 2,
                          title: "Buyer Funded Neutral Custody Vault",
                          desc: "Funds verified & locked under 256-bit institutional fiduciary custody.",
                          done: trackedDeal.stage >= 2,
                          current: trackedDeal.stage === 2,
                        },
                        {
                          step: 3,
                          title: "Fulfillment & Dispatch Active",
                          desc: "Merchant delivers goods/services with verifiable courier proof.",
                          done: trackedDeal.stage >= 3,
                          current: trackedDeal.stage === 3,
                        },
                        {
                          step: 4,
                          title: "Inspection & Quality Approval",
                          desc: "Buyer verifies deliverables meet specifications before release.",
                          done: trackedDeal.stage >= 4,
                          current: trackedDeal.stage === 4,
                        },
                        {
                          step: 5,
                          title: "Disbursement & Payout Completed",
                          desc: "Funds instantly settled to seller wallet or verified bank account.",
                          done: trackedDeal.stage >= 5,
                          current: trackedDeal.stage === 5,
                        },
                      ].map((s) => (
                        <div
                          key={s.step}
                          className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                            s.current
                              ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300"
                              : s.done
                              ? "bg-slate-50 border-slate-200"
                              : "bg-white border-slate-100 opacity-60"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                              s.done
                                ? "bg-[#32A05F] text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {s.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.step}
                          </div>
                          <div className="flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-bold ${
                                  s.current ? "text-emerald-900" : "text-slate-800"
                                }`}
                              >
                                {s.title}
                              </span>
                              {s.current && (
                                <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-1.5 py-0.2 rounded">
                                  In Progress
                                </span>
                              )}
                            </div>
                            <p className="text-slate-500 mt-0.5">{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fiduciary Guarantee Footer */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#32A05F]" />
                      <span>Protected by PeltaPay Neutral Escrow Protocol</span>
                    </div>
                    <Link
                      href={trackedDeal.ref.startsWith("ESC-") ? `/pay/${trackedDeal.ref}` : "/login"}
                      className="font-bold text-[#32A05F] hover:underline flex items-center gap-1"
                    >
                      View Live Agreement <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Need mediation assistance? Contact{" "}
                  <a href="mailto:support@peltapay.com" className="text-[#32A05F] font-semibold hover:underline">
                    support@peltapay.com
                  </a>
                </span>
                <button
                  type="button"
                  onClick={() => setIsTrackerOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
                >
                  Close Screen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default TrustAndTrackBanner;
