"use client";

import React from "react";

// ─── NIGERIAN CONTEXT TRUST & REGULATORY BADGES ───

function NigeriaFintechAwardIcon({ className = "w-7 h-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Flame in Emerald */}
      <path
        d="M16 2C16 2 21.5 8 20.5 14C19.5 20 14 20 14 20C14 20 12 16.5 13 13.5C14 10.5 16 2 16 2Z"
        fill="#32A05F"
      />
      {/* Inner Flame Core in Amber Gold */}
      <path
        d="M16 6.5C16 6.5 18.5 10.5 18 14C17.5 17 15 17 15 17C15 17 14 15 14.5 13C15 11 16 6.5 16 6.5Z"
        fill="#F59E0B"
      />
      {/* Torch Neck & Rim */}
      <rect x="11" y="21" width="10" height="2.5" rx="0.8" fill="#0A2540" />
      {/* Torch Body */}
      <path d="M12.5 23.5H19.5L18 34H14L12.5 23.5Z" fill="#0A2540" />
      {/* Base */}
      <rect x="13" y="34" width="6" height="2" rx="0.5" fill="#0A2540" />
      {/* Golden Star Mark */}
      <polygon
        points="16,26 17,28.5 19.5,28.5 17.5,30 18.5,32.5 16,31 13.5,32.5 14.5,30 12.5,28.5 15,28.5"
        fill="#F59E0B"
      />
    </svg>
  );
}

function CACAccreditedBadge() {
  return (
    <div
      className="inline-flex items-center bg-[#064E3B] text-white rounded-md p-1.5 px-3 gap-2 shadow-2xs border border-[#047857] select-none hover:brightness-105 transition-all cursor-default"
      title="Corporate Affairs Commission (CAC) Registered & RC Verified Escrow Entity"
    >
      <div className="flex flex-col items-center justify-center border-r border-emerald-400/30 pr-2">
        <svg viewBox="0 0 18 20" fill="none" className="w-4 h-4.5">
          <path
            d="M9 1L16 4V9C16 14 9 19 9 19C9 19 2 14 2 9V4L9 1Z"
            fill="#32A05F"
            stroke="#A7F3D0"
            strokeWidth="1"
          />
          <path
            d="M6 10L8 12L12 8"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[7.5px] font-black tracking-tight leading-none text-emerald-200 mt-0.5">
          CAC
        </span>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[9.5px] font-black tracking-wider text-white uppercase">
          RC VERIFIED
        </span>
        <span className="text-[8.5px] font-extrabold tracking-wider text-emerald-300 uppercase">
          ACCREDITED ENTITY
        </span>
      </div>
    </div>
  );
}

function SECNigeriaSeal() {
  return (
    <div
      className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-100 via-amber-200 to-emerald-600 p-[1.5px] shadow-2xs select-none hover:scale-105 transition-transform cursor-default shrink-0"
      title="SEC Nigeria ARIP Sandbox & Statutory Escrow Fiduciary Compliance"
    >
      <div className="w-full h-full rounded-full bg-radial from-emerald-50 to-emerald-100 flex items-center justify-center border border-emerald-700/40 relative overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-950">
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="#065F46"
            strokeWidth="2.5"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#047857"
            strokeWidth="1"
            strokeDasharray="2.5 2.5"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="33"
            fill="#ECFDF5"
            stroke="#059669"
            strokeWidth="1"
          />
          {/* Nigerian Coat of Arms motif: Y-shaped Niger-Benue & Eagle crest */}
          <path
            d="M50 32 L50 48 L40 60 L45 63 L50 54 L55 63 L60 60 L50 48 Z"
            fill="#047857"
          />
          <circle cx="50" cy="28" r="5" fill="#D97706" />
          {/* Laurel stars */}
          <circle cx="20" cy="50" r="2.5" fill="#D97706" />
          <circle cx="80" cy="50" r="2.5" fill="#D97706" />
          <circle cx="50" cy="18" r="2.5" fill="#D97706" />
          <circle cx="50" cy="82" r="2.5" fill="#D97706" />
        </svg>
        <span className="absolute text-[5.2px] font-black uppercase text-emerald-900 tracking-tighter text-center leading-[6px] inset-x-1 bottom-1">
          SEC NIGERIA
        </span>
      </div>
    </div>
  );
}

function NIBSSSettlementBadge() {
  return (
    <div
      className="inline-flex items-center gap-2 p-1.5 px-2.5 rounded-md border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-all select-none cursor-default shrink-0"
      title="NIBSS Instant Settlement & Central Bank of Nigeria (CBN) Banking Rails"
    >
      <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 40 40" className="w-full h-full">
          {/* Navy Shield with gold/slate border */}
          <path
            d="M5 8 L 20 3 L 35 8 L 35 24 Q 20 38 5 24 Z"
            fill="#0A2540"
            stroke="#1E293B"
            strokeWidth="1"
          />
          {/* Green-White-Green Nigerian National Flag inside shield */}
          <rect x="11" y="14" width="6" height="15" fill="#008751" />
          <rect x="17" y="14" width="6" height="15" fill="#FFFFFF" />
          <rect x="23" y="14" width="6" height="15" fill="#008751" />
          {/* Central security checkmark */}
          <circle cx="20" cy="21.5" r="3.5" fill="#0A2540" />
          <path
            d="M18.5 21.5L19.5 22.5L21.5 20.5"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[9.5px] font-black text-[#0A2540] tracking-tight leading-tight uppercase">
          NIBSS • CBN
        </span>
        <span className="text-[8.5px] font-extrabold text-[#008751] tracking-tight leading-tight uppercase">
          SETTLEMENT RAILS
        </span>
        <span className="text-[7px] font-medium text-slate-500 tracking-tight leading-tight">
          Instant Interbank Clearing
        </span>
      </div>
    </div>
  );
}

// ─── FULL-WIDTH NIGERIAN INSTITUTIONAL TRUST & CREDIBILITY STRIP ───

interface TrustAndTrackBannerProps {
  className?: string;
}

export function TrustAndTrackBanner({ className = "" }: TrustAndTrackBannerProps) {
  return (
    <section
      className={`w-full bg-white border-y border-slate-200/90 shadow-2xs relative z-20 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex items-center justify-between gap-6 sm:gap-8 lg:gap-12 overflow-x-auto no-scrollbar py-1">
          
          {/* Stat 1: ₦25,000,000,000+ Escrow Volume Processed */}
          <div className="shrink-0">
            <div className="text-2xl sm:text-3xl font-black text-[#0A2540] tracking-tight leading-none">
              ₦25,000,000,000+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wide">
              NGN Processed in Escrow
            </div>
          </div>

          {/* Stat 2: 350,000+ Customers Trust PeltaPay */}
          <div className="shrink-0">
            <div className="text-2xl sm:text-3xl font-black text-[#0A2540] tracking-tight leading-none">
              350,000+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wide">
              Nigerians Trust PeltaPay
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="h-10 w-[1.5px] bg-slate-200/90 shrink-0 hidden sm:block" />

          {/* Award: Nigeria Fintech Awards | Winner, Most Trusted Escrow Platform */}
          <div className="flex items-center gap-3 shrink-0">
            <NigeriaFintechAwardIcon className="w-7 h-9 shrink-0 drop-shadow-2xs" />
            <div className="flex flex-col justify-center">
              <div className="text-sm sm:text-base font-extrabold text-[#0A2540] tracking-tight leading-tight">
                Nigeria Fintech Awards
              </div>
              <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                Winner, Most Trusted Escrow Platform
              </div>
            </div>
          </div>

          {/* Accreditation Badge: Corporate Affairs Commission (CAC) RC Verified */}
          <div className="shrink-0 hidden md:flex items-center">
            <CACAccreditedBadge />
          </div>

          {/* Official Seal: SEC Nigeria ARIP Sandbox & Statutory Escrow Compliance */}
          <div className="shrink-0 hidden lg:flex items-center">
            <SECNigeriaSeal />
          </div>

          {/* Settlement Badge: NIBSS / CBN Settlement Rails */}
          <div className="shrink-0 hidden xl:flex items-center">
            <NIBSSSettlementBadge />
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustAndTrackBanner;
