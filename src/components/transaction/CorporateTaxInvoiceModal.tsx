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
  FileText,
  Briefcase,
  Layers,
} from "lucide-react";
import { formatTableDate, formatTableTime } from "@/lib/exportUtils";

interface CorporateTaxInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: any;
}

export default function CorporateTaxInvoiceModal({
  isOpen,
  onClose,
  deal,
}: CorporateTaxInvoiceModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !deal) return null;

  const handlePrint = () => {
    window.print();
  };

  const dealId = deal.id || "INV-2026-B2B";
  const title = deal.title || deal.description || "Corporate Escrow Contract";
  const poNumber = deal.poNumber || `PO-${dealId.slice(0, 8).toUpperCase()}`;
  const createdAt = deal.createdAt || new Date().toISOString();

  const totalAmount = Number(deal.totalAmount || deal.amount || 0);
  const taxRate = Number(deal.taxRate || 7.5); // Nigeria Standard VAT 7.5%
  const vatAmount = (totalAmount * taxRate) / 100;
  const grossCorporateTotal = totalAmount + vatAmount;

  const seller = deal.seller || {};
  const buyer = deal.buyer || {};

  const sellerCompany =
    seller.companyName ||
    seller.name ||
    (seller.firstName ? `${seller.firstName} ${seller.lastName || ""}` : "Registered Provider Ltd");

  const buyerCompany =
    buyer.companyName ||
    buyer.name ||
    deal.companyName ||
    (buyer.firstName ? `${buyer.firstName} ${buyer.lastName || ""}` : "Client Enterprise Corp");

  const milestones =
    deal.milestones && deal.milestones.length > 0
      ? deal.milestones
      : [
          {
            title: title,
            amount: totalAmount,
            description: "Full contract execution deliverable",
            status: deal.status || "COMPLETED",
          },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:rounded-none">
        {/* Top bar (hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold tracking-tight">
              Corporate VAT Tax Invoice & Escrow Purchase Order
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" /> Print Tax Invoice
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

        {/* Printable Tax Invoice Sheet */}
        <div ref={printAreaRef} className="p-8 sm:p-12 space-y-8 text-slate-900 print:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-lg">
                  P
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Pay<span className="text-[#32A05F]">Trust</span>
                  <span className="text-xs ml-1.5 font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    B2B Enterprise
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Fiduciary Escrow Custodian & Payment Clearing Network
              </p>
              <p className="text-[10px] text-slate-400">
                TIN / Tax Identification: 24891044-0001 • RC Number: RC-1849204
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-slate-900 text-white font-mono">
                COMMERCIAL TAX INVOICE
              </span>
              <p className="text-xs font-bold font-mono text-slate-800 mt-2">
                Invoice No: {dealId}
              </p>
              <p className="text-xs font-mono text-slate-600">
                P.O. Reference: {poNumber}
              </p>
              <p className="text-[11px] text-slate-500">
                Date: {formatTableDate(createdAt)}
              </p>
            </div>
          </div>

          {/* Supplier & Customer Entities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                SUPPLIER / SERVICE PROVIDER
              </span>
              <p className="font-bold text-slate-900 text-sm">{sellerCompany}</p>
              <p className="text-slate-600 font-mono text-[11px]">
                {seller.email || deal.sellerEmail || "corporate@seller.com"}
              </p>
              <p className="text-[11px] text-slate-500">
                RC/BN: {seller.rcNumber || "RC-928174"} • TIN: {seller.tin || "1928374-0001"}
              </p>
              <p className="text-[11px] text-slate-500">
                Address: {seller.businessAddress || "Lagos Commercial District, Victoria Island, Nigeria"}
              </p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                BILLED TO / CORPORATE CLIENT
              </span>
              <p className="font-bold text-slate-900 text-sm">{buyerCompany}</p>
              <p className="text-slate-600 font-mono text-[11px]">
                {buyer.email || deal.buyerEmail || "procurement@client.com"}
              </p>
              <p className="text-[11px] text-slate-500">
                Corporate PO: {poNumber}
              </p>
              <p className="text-[11px] text-slate-500">
                Payment Channel: PayTrust Neutral Escrow Vault (Settled)
              </p>
            </div>
          </div>

          {/* Itemized Deliverables & Milestones Schedule */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#32A05F]" /> Itemized Milestone Schedule & Deliverables
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Item / Milestone</th>
                  <th className="p-3">Specification</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Amount (NGN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {milestones.map((m: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-3 font-bold text-slate-900">
                      {m.title || `Phase ${idx + 1}`}
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {m.description || "Agreed deliverable as outlined in scope of work."}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 capitalize">
                        {(m.status || "COMPLETED").replace(/_/g, " ").toLowerCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 font-mono">
                      ₦{Number(m.amount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Calculations Table */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Net):</span>
                <span className="font-bold text-slate-900">₦{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>VAT ({taxRate}%):</span>
                <span className="font-semibold text-slate-800">
                  ₦{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Escrow Processing Fee:</span>
                <span className="text-slate-600">Included (Neutral)</span>
              </div>
              <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Corporate Due:</span>
                <span className="text-[#32A05F] text-base">
                  ₦{grossCorporateTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Corporate Compliance Stamped Box */}
          <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl border-2 border-slate-900 flex flex-col items-center justify-center text-center p-1 bg-slate-100">
                <ShieldCheck className="w-5 h-5 text-slate-900" />
                <span className="text-[8px] font-black uppercase text-slate-900 tracking-tighter">
                  VERIFIED PO
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Certified Corporate Escrow Tax Record
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Escrow Vault Deposit ID: {dealId}
                </p>
                <p className="text-[10px] text-slate-500">
                  PayTrust Escrow Fiduciary Services (Nigeria)
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="h-10 border-b border-slate-400 w-48 mb-1 flex items-end justify-center sm:justify-end text-xs italic font-serif text-slate-700">
                Certified Enterprise Billing
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Authorized Corporate Financial Controller
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
