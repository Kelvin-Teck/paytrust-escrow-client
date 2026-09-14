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
  singleLimit: number;
  singleLimitLabel: string;
  description: string;
  isVerified: boolean;
}

export function getTierInfo(kycStatus?: string): TierInfo {
  const status = (kycStatus || "").toLowerCase();

  if (status === "completed" || status === "approved" || status === "verified") {
    return {
      tierNumber: 2,
      tierName: "Tier 2 Verified",
      badgeText: "Tier 2 Verified",
      statusColor: "text-[#32A05F]",
      badgeBg: "bg-[#EBF7F0]",
      badgeTextClass: "text-[#1E6B3E]",
      badgeBorder: "border-[#32A05F]/30",
      singleLimit: 50000000,
      singleLimitLabel: "Unlimited / ₦50M",
      description:
        "Tier 2 verified • Unlimited personal escrow limits & fast withdrawals active.",
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
      singleLimit: 500000,
      singleLimitLabel: "₦500,000 / deal",
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
      singleLimit: 500000,
      singleLimitLabel: "₦500,000 / deal",
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
      singleLimit: 500000,
      singleLimitLabel: "₦500,000 / deal",
      description:
        "Identity verification was declined. Please re-upload valid government ID.",
      isVerified: false,
    };
  }

  return {
    tierNumber: 1,
    tierName: "Tier 1 Standard",
    badgeText: "Tier 1 (₦500k Limit)",
    statusColor: "text-slate-400",
    badgeBg: "bg-slate-100",
    badgeTextClass: "text-slate-600",
    badgeBorder: "border-slate-200",
    singleLimit: 500000,
    singleLimitLabel: "₦500,000 / deal",
    description:
      "Upgrade to Tier 2 by completing identity verification in Profile.",
    isVerified: false,
  };
}

export interface KybInfo {
  tierNumber: 1 | 2 | 3;
  status: "unverified" | "in_review" | "verified" | "rejected";
  title: string;
  badgeText: string;
  statusColor: string;
  badgeBg: string;
  badgeTextClass: string;
  badgeBorder: string;
  singleLimit: number;
  monthlyLimit: number;
  singleLimitLabel: string;
  monthlyLimitLabel: string;
  description: string;
  isVerified: boolean;
}

export function getKybInfo(kybStatus?: string, kybTier?: number): KybInfo {
  const status = (kybStatus || "").toLowerCase();
  const tier = kybTier || (status === "completed" || status === "verified" || status === "approved" ? 2 : 1);
  const isVerified = status === "completed" || status === "verified" || status === "approved";

  if (tier === 3 && isVerified) {
    return {
      tierNumber: 3,
      status: "verified",
      title: "Tier 3 Institutional",
      badgeText: "Tier 3 Institutional",
      statusColor: "text-[#32A05F]",
      badgeBg: "bg-[#EBF7F0]",
      badgeTextClass: "text-[#1E6B3E]",
      badgeBorder: "border-[#32A05F]/30",
      singleLimit: 500000000,
      monthlyLimit: 2000000000,
      singleLimitLabel: "₦500M+ (Custom / Unlimited)",
      monthlyLimitLabel: "Unlimited Volume",
      description: "SCUML & Institutional status active • Unlimited volume, custom SLAs & dedicated manager.",
      isVerified: true,
    };
  }

  if (tier === 2 && isVerified) {
    return {
      tierNumber: 2,
      status: "verified",
      title: "Tier 2 Verified Corporate",
      badgeText: "Tier 2 Verified",
      statusColor: "text-[#32A05F]",
      badgeBg: "bg-[#EBF7F0]",
      badgeTextClass: "text-[#1E6B3E]",
      badgeBorder: "border-[#32A05F]/30",
      singleLimit: 50000000,
      monthlyLimit: 250000000,
      singleLimitLabel: "₦50,000,000 / deal",
      monthlyLimitLabel: "₦250,000,000 / month",
      description: "CAC verified • Multi-phase milestone contracts, PO tracking & ₦50M deal limits active.",
      isVerified: true,
    };
  }

  if (status === "in_review" || status === "under_review" || status === "pending") {
    return {
      tierNumber: tier === 3 ? 3 : 2,
      status: "in_review",
      title: `Tier ${tier === 3 ? 3 : 2} In Review`,
      badgeText: "Under Audit",
      statusColor: "text-amber-500",
      badgeBg: "bg-amber-50",
      badgeTextClass: "text-amber-800",
      badgeBorder: "border-amber-300",
      singleLimit: 2000000,
      monthlyLimit: 10000000,
      singleLimitLabel: "₦2,000,000 (Tier 1 Limit)",
      monthlyLimitLabel: "₦10,000,000 / month",
      description: "Your business documents are being audited by compliance. Current limit is ₦2,000,000.",
      isVerified: false,
    };
  }

  if (status === "rejected" || status === "failed") {
    return {
      tierNumber: 1,
      status: "rejected",
      title: "KYB Action Needed",
      badgeText: "Action Needed",
      statusColor: "text-rose-500",
      badgeBg: "bg-rose-50",
      badgeTextClass: "text-rose-700",
      badgeBorder: "border-rose-300",
      singleLimit: 2000000,
      monthlyLimit: 10000000,
      singleLimitLabel: "₦2,000,000 / deal",
      monthlyLimitLabel: "₦10,000,000 / month",
      description: "Business documents could not be verified. Please re-upload valid CAC registration documents.",
      isVerified: false,
    };
  }

  return {
    tierNumber: 1,
    status: "unverified",
    title: "Tier 1 Starter Corporate",
    badgeText: "Tier 1 (₦2M Limit)",
    statusColor: "text-slate-400",
    badgeBg: "bg-slate-100",
    badgeTextClass: "text-slate-600",
    badgeBorder: "border-slate-200",
    singleLimit: 2000000,
    monthlyLimit: 10000000,
    singleLimitLabel: "₦2,000,000 / deal",
    monthlyLimitLabel: "₦10,000,000 / month",
    description: "Starter business tier. Upload CAC Certificate to unlock Tier 2 (₦50M limit).",
    isVerified: false,
  };
}
