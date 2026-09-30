"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "@/components/ui/Toast";

export interface InvoiceShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: {
    id: string;
    title?: string;
    description?: string;
    totalAmount?: number | string;
    amount?: number | string;
    inspectionPeriod?: number;
    buyerPhone?: string;
    buyerEmail?: string;
    buyer?: {
      phone?: string;
      email?: string;
      name?: string;
      firstName?: string;
      lastName?: string;
    };
  } | null;
  isNewlyCreated?: boolean;
  onViewDetails?: () => void;
}

export default function InvoiceShareModal({
  isOpen,
  onClose,
  deal,
  isNewlyCreated = false,
  onViewDetails,
}: InvoiceShareModalProps) {
  const [activeTab, setActiveTab] = useState<"qr" | "link">("qr");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [copied, setCopied] = useState(false);

  const getEscrowPayUrl = () => {
    if (!deal) return "";
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://paytrust.ng";
    return `${origin}/pay/${deal.id}`;
  };

  const payUrl = getEscrowPayUrl();

  // Generate QR Code data URL whenever deal changes or modal opens
  useEffect(() => {
    if (!isOpen || !deal?.id) {
      setQrDataUrl("");
      return;
    }

    const url = getEscrowPayUrl();
    setIsGeneratingQr(true);

    QRCode.toDataURL(url, {
      width: 480,
      margin: 2,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    })
      .then((dataUrl) => {
        setQrDataUrl(dataUrl);
        setIsGeneratingQr(false);
      })
      .catch((err) => {
        console.error("Failed to generate invoice QR Code:", err);
        setIsGeneratingQr(false);
      });
  }, [isOpen, deal?.id]);

  if (!isOpen || !deal) return null;

  const dealTitle = deal.title || deal.description || "Escrow Agreement";
  const dealAmount = Number(deal.totalAmount || deal.amount || 0);
  const inspectionDays = deal.inspectionPeriod || 3;

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(payUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = payUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success("Escrow payment link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `paytrust-invoice-${deal.id.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Invoice QR code downloaded!");
  };

  const handleWhatsAppShare = () => {
    const message = `👋 Hello!\n\nI have created a secure Escrow Agreement for *${dealTitle}* on PayTrust.\n\n💰 Total Amount: *₦${dealAmount.toLocaleString()}*\n🛡️ Protection: *PayTrust Escrow* (Your money is safely locked until you inspect and approve delivery)\n⏱️ Inspection Period: *${inspectionDays} Days*\n\n👉 Review details and fund the escrow safely here:\n${payUrl}\n\n_Powered by PayTrust Escrow Nigeria_`;

    const rawPhone =
      deal.buyerPhone ||
      deal.buyer?.phone ||
      "";
    const cleanPhone = rawPhone ? String(rawPhone).replace(/[^0-9]/g, "") : "";
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 z-10"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="space-y-1.5 text-center pr-6">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mx-auto shadow-inner">
              {isNewlyCreated ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <QrCode className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {isNewlyCreated ? "Escrow Invoice Created!" : "Share Escrow Invoice"}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Share via scannable QR code, direct payment link, or WhatsApp to lock funds securely.
            </p>
          </div>

          {/* Deal Overview Snippet */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 truncate">
                {dealTitle}
              </span>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shrink-0">
                #{deal.id.slice(0, 8)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Escrow Total:</span>
              <span className="font-extrabold text-[#32A05F] text-sm">
                ₦{dealAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("qr")}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "qr"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-[#32A05F]" />
              <span>Invoice QR Code</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("link")}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "link"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-[#32A05F]" />
              <span>Link & WhatsApp</span>
            </button>
          </div>

          {/* TAB 1: QR CODE VIEW */}
          {activeTab === "qr" && (
            <div className="space-y-4 text-center">
              {/* Clean Framed QR Code */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs inline-block mx-auto relative group">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Escrow Invoice QR Code for #${deal.id.slice(0, 8)}`}
                    className="w-48 h-48 object-contain rounded-lg mx-auto"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 animate-pulse mx-auto">
                    {isGeneratingQr ? "Generating QR Code..." : "Loading QR Code..."}
                  </div>
                )}
                <div className="mt-2 text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                  paytrust.ng/pay/{deal.id.slice(0, 8)}...
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Scan with any smartphone camera to open checkout and lock funds in escrow.
              </p>

              {/* QR Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={downloadQrCode}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-[#32A05F] hover:bg-[#28874E] text-white shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LINK & WHATSAPP VIEW */}
          {activeTab === "link" && (
            <div className="space-y-4">
              {/* Link Container */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Public Escrow Payment URL
                </span>
                <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                  <span className="text-xs font-mono font-semibold text-slate-700 truncate">
                    {payUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* WhatsApp Direct Share */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Share Directly on WhatsApp
              </button>
            </div>
          )}

          {/* Bottom Common Actions */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <a
              href={payUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>Preview Buyer Checkout</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {isNewlyCreated && onViewDetails && (
              <button
                type="button"
                onClick={onViewDetails}
                className="text-xs font-bold text-[#32A05F] hover:text-[#28874E] inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Go to Deal Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
