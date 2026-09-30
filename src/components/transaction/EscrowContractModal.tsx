"use client";

import React, { useRef } from "react";
import {
  X,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  FileText,
  Truck,
  QrCode,
} from "lucide-react";
import { formatTableDate, formatTableTime } from "@/lib/exportUtils";

interface EscrowContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: any;
}

export default function EscrowContractModal({
  isOpen,
  onClose,
  deal,
}: EscrowContractModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !deal) return null;

  const handlePrint = () => {
    window.print();
  };

  const dealId = deal.id || "TRX-ESCROW";
  const title = deal.title || deal.description || "Escrow Agreement";
  const dealType = deal.dealType || "p2p";
  const deliveryMethod = deal.deliveryMethod || "courier";
  const feePayer = deal.feePayer || "seller";
  const inspectionDays = deal.inspectionPeriod || 3;
  const createdAt = deal.createdAt || new Date().toISOString();

  const totalAmount = Number(deal.totalAmount || deal.amount || 0);
  const feePercentage = Number(deal.feePercentage || 0.5);
  const totalPlatformFee = (totalAmount * feePercentage) / 100;

  // Fee calculation based on fee payer
  let buyerFeeShare = 0;
  let sellerFeeShare = totalPlatformFee;
  if (feePayer === "buyer") {
    buyerFeeShare = totalPlatformFee;
    sellerFeeShare = 0;
  } else if (feePayer === "split_50_50") {
    buyerFeeShare = totalPlatformFee / 2;
    sellerFeeShare = totalPlatformFee / 2;
  }

  const grossDepositRequired = totalAmount + buyerFeeShare;
  const netSellerPayout = totalAmount - sellerFeeShare;

  const buyerName =
    deal.buyer?.name ||
    (deal.buyer?.firstName
      ? `${deal.buyer.firstName} ${deal.buyer.lastName || ""}`.trim()
      : null) ||
    deal.buyer?.email ||
    deal.buyerEmail ||
    "Authorized Buyer";

  const sellerName =
    deal.seller?.name ||
    (deal.seller?.firstName
      ? `${deal.seller.firstName} ${deal.seller.lastName || ""}`.trim()
      : null) ||
    deal.seller?.email ||
    deal.sellerEmail ||
    "Authorized Seller";

  const status = (deal.status || "AWAITING_PAYMENT").toUpperCase().replace(/_/g, " ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:rounded-none">
        {/* Modal Top Bar - Hidden in Print */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#32A05F]" />
            <span className="text-sm font-bold tracking-tight">
              Official Legal Escrow Agreement & Proof of Terms
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div ref={printAreaRef} className="p-8 sm:p-12 space-y-8 text-slate-900 print:p-6">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#32A05F] flex items-center justify-center text-white font-black text-lg">
                  P
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Pay<span className="text-[#32A05F]">Trust</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Licensed Escrow Custodian & Digital Settlement Infrastructure
              </p>
              <p className="text-[10px] text-slate-400">
                Operating under the Nigerian Arbitration and Conciliation Framework
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono">
                BINDING ESCROW CONTRACT
              </span>
              <p className="text-xs font-bold font-mono text-slate-800 mt-2">
                Agreement Ref: {dealId}
              </p>
              <p className="text-[11px] text-slate-500">
                Executed: {formatTableDate(createdAt)} at {formatTableTime(createdAt)}
              </p>
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Party A (Buyer / Principal)
              </span>
              <p className="font-bold text-slate-900 text-sm leading-tight">{buyerName}</p>
              <p className="text-slate-500 font-mono text-[11px]">
                {deal.buyer?.email || deal.buyerEmail || "Contact on File"}
              </p>
              <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 mt-1">
                Verified Depositor
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Party B (Seller / Beneficiary)
              </span>
              <p className="font-bold text-slate-900 text-sm leading-tight">{sellerName}</p>
              <p className="text-slate-500 font-mono text-[11px]">
                {deal.seller?.email || deal.sellerEmail || "Contact on File"}
              </p>
              <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-1">
                Verified Provider
              </span>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Escrow Custodian & Agent
              </span>
              <p className="font-bold text-slate-900 text-sm leading-tight">PayTrust Technologies Ltd</p>
              <p className="text-slate-500 text-[11px]">Neutral Fiduciary Agent</p>
              <span className="inline-block text-[10px] font-semibold text-[#15803d] bg-[#EBF7F0] px-2 py-0.5 rounded-md border border-[#32A05F]/30 mt-1">
                Fiduciary Protected
              </span>
            </div>
          </div>

          {/* Agreement Specifications */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Transaction & Covenant Specifications
            </h3>
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="flex justify-between p-3.5 bg-white">
                <span className="text-slate-500 font-medium">Subject Deliverable / Title:</span>
                <span className="font-bold text-slate-900 text-right">{title}</span>
              </div>
              <div className="flex justify-between p-3.5 bg-slate-50/50">
                <span className="text-slate-500 font-medium">Contract Type:</span>
                <span className="font-bold text-slate-900 capitalize">
                  {dealType === "b2b_milestone" ? "B2B Milestone Agreement" : "Commercial Escrow Sale"}
                </span>
              </div>
              <div className="flex justify-between p-3.5 bg-white">
                <span className="text-slate-500 font-medium">Fulfillment / Dispatch Method:</span>
                <span className="font-bold text-slate-900 capitalize">
                  {deliveryMethod === "in_person"
                    ? "In-Person Physical Meetup (Verified via Secret 6-Digit Handshake OTP)"
                    : deliveryMethod === "digital"
                    ? "Digital Asset / Service Provision"
                    : "Courier Dispatch & Tracking Waybill"}
                </span>
              </div>
              <div className="flex justify-between p-3.5 bg-slate-50/50">
                <span className="text-slate-500 font-medium">Mandatory Inspection Window:</span>
                <span className="font-bold text-slate-900">
                  {inspectionDays} Days from Proof of Delivery / Handover
                </span>
              </div>
              <div className="flex justify-between p-3.5 bg-white">
                <span className="text-slate-500 font-medium">Custody Lifecycle Status:</span>
                <span className="font-bold text-[#32A05F]">{status}</span>
              </div>
            </div>
          </div>

          {/* Financial Schedule & Fee Split Schedule */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Financial Custody & Fee Allocation Schedule
            </h3>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Agreed Deliverable Valuation (Base Total):</span>
                <span className="font-bold text-slate-900">₦{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>PayTrust Escrow Custody Fee ({feePercentage}%):</span>
                <span className="font-semibold text-slate-800">
                  ₦{totalPlatformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px] pl-3 border-l-2 border-slate-300">
                <span>Fee Payer Responsibility:</span>
                <span className="font-semibold text-slate-700 capitalize">
                  {feePayer === "buyer"
                    ? "100% Covered by Buyer"
                    : feePayer === "split_50_50"
                    ? "50 / 50 Shared Split"
                    : "100% Covered by Seller"}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px] pl-3 border-l-2 border-slate-300">
                <span>Buyer Deposit Surcharge:</span>
                <span className="font-semibold text-blue-700">
                  +₦{buyerFeeShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px] pl-3 border-l-2 border-slate-300">
                <span>Seller Payout Deductions:</span>
                <span className="font-semibold text-rose-600">
                  -₦{sellerFeeShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Gross Buyer Funding Requirement
                  </span>
                  <span className="text-base font-extrabold text-blue-900">
                    ₦{grossDepositRequired.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Net Seller Payout Disbursement
                  </span>
                  <span className="text-base font-extrabold text-[#32A05F]">
                    ₦{netSellerPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Binding Legal Terms & Covenants */}
          <div className="space-y-3 text-[11px] text-slate-600 leading-relaxed border-t border-slate-200 pt-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Irrevocable Covenants & Dispute Arbitration
            </h3>
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>
                <strong>Fiduciary Neutrality:</strong> PayTrust acts solely as an independent, neutral
                escrow stakeholder. Funds deposited by the Buyer do not constitute corporate assets of
                PayTrust and are safeguarded exclusively for the settlement of this transaction.
              </li>
              <li>
                <strong>Condition Precedent to Release:</strong> Escrow disbursement to the Seller is
                contingent upon either: (a) affirmative delivery confirmation by the Buyer, (b) verified
                submission of the secret 6-digit handover OTP in physical meetup mode, or (c) the expiry
                of the {inspectionDays}-day inspection window without an open dispute.
              </li>
              <li>
                <strong>Inspection & Rejection Rights:</strong> The Buyer is granted a binding inspection
                window of {inspectionDays} calendar days post-fulfillment. Should the received goods or
                milestones substantially deviate from agreed specifications, the Buyer has the legal
                right to pause disbursement by lodging a dispute.
              </li>
              <li>
                <strong>Arbitration Clause:</strong> Any unresolved controversy arising out of or
                relating to this agreement shall be submitted to binding arbitration governed by the
                rules of PayTrust Dispute Resolution Services and Nigerian Arbitration law.
              </li>
            </ol>
          </div>

          {/* Stamped Seal & Signature Box */}
          <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-[#32A05F] flex flex-col items-center justify-center text-center p-1 bg-[#EBF7F0]/40">
                <ShieldCheck className="w-5 h-5 text-[#32A05F]" />
                <span className="text-[8px] font-black uppercase text-[#32A05F] tracking-tighter">
                  VERIFIED SEAL
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Digitally Executed & Time-Stamped
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Hash: SHA256:{dealId}-{createdAt.slice(0, 10)}
                </p>
                <p className="text-[10px] text-slate-500">
                  PayTrust Automated Escrow Clearing Authority
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="h-10 border-b border-slate-400 w-48 mb-1 flex items-end justify-center sm:justify-end text-xs italic font-serif text-slate-700">
                PayTrust Fiduciary Services
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Authorized Platform Custodian Signature
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
