"use client";

import React from "react";

// ─── SVG ICONS & BADGES FOR 1:1 TEMPLATE FIDELITY ───

function BBBTorchIcon({ className = "w-7 h-9" }: { className?: string }) {
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
      className="inline-flex items-center bg-[#005A9C] text-white rounded-md p-1.5 px-3 gap-2 shadow-2xs border border-[#004A82] select-none hover:brightness-105 transition-all cursor-default"
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
      className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-500 p-[1.5px] shadow-2xs select-none hover:scale-105 transition-transform cursor-default shrink-0"
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

// ─── FULL-WIDTH CREDIBILITY & TRUST STRIP (EXACT SCREEN AS SEEN IN IMAGE) ───

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
          
          {/* Stat 1: $8,300,000,000+ USD Processed */}
          <div className="shrink-0">
            <div className="text-2xl sm:text-3xl font-black text-[#0A2540] tracking-tight leading-none">
              $8,300,000,000+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wide">
              USD Processed
            </div>
          </div>

          {/* Stat 2: 3,900,000+ Customers Trust Escrow */}
          <div className="shrink-0">
            <div className="text-2xl sm:text-3xl font-black text-[#0A2540] tracking-tight leading-none">
              3,900,000+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wide">
              Customers Trust Escrow
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="h-10 w-[1.5px] bg-slate-200/90 shrink-0 hidden sm:block" />

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
      </div>
    </section>
  );
}

export default TrustAndTrackBanner;
