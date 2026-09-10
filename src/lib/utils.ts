import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TierInfo {
  tierNumber: 1 | 2;
  tierName: string;
  badgeText: string;
  statusColor: string;
  badgeBg: string;
  badgeTextClass: string;
  badgeBorder: string;
  description: string;
  isVerified: boolean;
}

export function getTierInfo(kycStatus?: string): TierInfo {
  const status = (kycStatus || "").toLowerCase();

  if (status === "completed" || status === "approved" || status === "verified") {
    return {
      tierNumber: 2,
      tierName: "Tier 2 Verified",
      badgeText: "Verified",
      statusColor: "text-[#32A05F]",
      badgeBg: "bg-[#EBF7F0]",
      badgeTextClass: "text-[#1E6B3E]",
      badgeBorder: "border-[#32A05F]/30",
      description:
        "Tier 2 verified • Unlimited escrow limits & fast withdrawals active.",
      isVerified: true,
    };
  }

  if (
    status === "pending" ||
    status === "under_review" ||
    status === "in_review"
  ) {
    return {
      tierNumber: 1,
      tierName: "Tier 1 (KYC Under Review)",
      badgeText: "In Review",
      statusColor: "text-amber-500",
      badgeBg: "bg-amber-50",
      badgeTextClass: "text-amber-800",
      badgeBorder: "border-amber-300",
      description:
        "Your KYC documents are currently being reviewed by compliance.",
      isVerified: false,
    };
  }

  if (status === "started" || status === "incomplete") {
    return {
      tierNumber: 1,
      tierName: "Tier 1 (KYC Incomplete)",
      badgeText: "Incomplete",
      statusColor: "text-slate-400",
      badgeBg: "bg-slate-100",
      badgeTextClass: "text-slate-700",
      badgeBorder: "border-slate-300",
      description:
        "Complete your identity document upload to upgrade to Tier 2.",
      isVerified: false,
    };
  }

  if (status === "failed" || status === "rejected") {
    return {
      tierNumber: 1,
      tierName: "Tier 1 (KYC Action Req.)",
      badgeText: "Rejected",
      statusColor: "text-rose-500",
      badgeBg: "bg-rose-50",
      badgeTextClass: "text-rose-700",
      badgeBorder: "border-rose-300",
      description:
        "Identity verification was declined. Please re-upload valid government ID.",
      isVerified: false,
    };
  }

  return {
    tierNumber: 1,
    tierName: "Tier 1 Standard",
    badgeText: "Tier 1",
    statusColor: "text-slate-400",
    badgeBg: "bg-slate-100",
    badgeTextClass: "text-slate-600",
    badgeBorder: "border-slate-200",
    description:
      "Upgrade to Tier 2 by completing identity verification in Profile.",
    isVerified: false,
  };
}

