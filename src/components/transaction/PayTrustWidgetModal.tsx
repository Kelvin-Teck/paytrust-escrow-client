"use client";

import React, { useState } from "react";
import {
  X,
  Code2,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Share2,
  Sparkles,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";

interface PayTrustWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: any;
}

export default function PayTrustWidgetModal({
  isOpen,
  onClose,
  deal,
}: PayTrustWidgetModalProps) {
  const [buttonTheme, setButtonTheme] = useState<"emerald" | "slate" | "outline">("emerald");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !deal) return null;

  const dealId = deal.id || "ESCROW-DEAL";
  const dealTitle = deal.title || deal.description || "Escrow Protected Purchase";
  const amount = Number(deal.totalAmount || deal.amount || 0);

  const payUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/pay/${dealId}`
      : `https://paytrust.ng/pay/${dealId}`;

  // Generated HTML code snippet
  const htmlSnippet = `<a href="${payUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:${
    buttonTheme === "emerald" ? "#32A05F" : buttonTheme === "slate" ? "#0F172A" : "#FFFFFF"
  };color:${
    buttonTheme === "outline" ? "#0F172A" : "#FFFFFF"
  };padding:12px 24px;border-radius:12px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border:${
    buttonTheme === "outline" ? "2px solid #E2E8F0" : "none"
  };box-shadow:0 4px 12px rgba(0,0,0,0.08);">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  Pay with PayTrust Escrow (₦${amount.toLocaleString()})
</a>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlSnippet);
    setCopiedCode(true);
    toast.success("Widget HTML snippet copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(payUrl);
    setCopiedLink(true);
    toast.success("Direct escrow payment link copied!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Embed "Pay with PayTrust" Widget
              </h3>
              <p className="text-[11px] text-slate-500">
                Embed on your website, WhatsApp, or online store
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Button Preview */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Button Style Live Preview
          </span>

          <div className="py-2 flex justify-center">
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer ${
                buttonTheme === "emerald"
                  ? "bg-[#32A05F] hover:bg-[#28874E] text-white"
                  : buttonTheme === "slate"
                  ? "bg-slate-900 hover:bg-slate-800 text-white"
                  : "bg-white hover:bg-slate-50 text-slate-900 border border-slate-300"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Pay with PayTrust Escrow (₦{amount.toLocaleString()})
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[
              { id: "emerald", label: "Emerald Trust" },
              { id: "slate", label: "Dark Enterprise" },
              { id: "outline", label: "Clean Border" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setButtonTheme(t.id as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  buttonTheme === t.id
                    ? "border-[#32A05F] bg-[#EBF7F0] text-[#32A05F]"
                    : "border-slate-200 text-slate-600 hover:bg-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Snippet Code Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              HTML Button Snippet
            </label>
            <span className="text-[10px] text-slate-400">Copy & paste into any website</span>
          </div>

          <div className="relative">
            <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 text-[11px] font-mono overflow-x-auto max-h-28 whitespace-pre-wrap leading-relaxed">
              {htmlSnippet}
            </pre>
            <button
              type="button"
              onClick={handleCopyCode}
              className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              {copiedCode ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copiedCode ? "Copied Snippet!" : "Copy Code"}
            </button>
          </div>
        </div>

        {/* Direct Link Option */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs space-y-0.5 min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Direct Checkout URL
            </span>
            <p className="font-mono text-slate-800 text-[11px] truncate">{payUrl}</p>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
