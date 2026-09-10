'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowDownLeft, ArrowUpRight, ShieldCheck,
  Copy, CheckCircle2, QrCode, Lock
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

export default function BitcoinWalletPage() {
  const [copied, setCopied] = useState(false);
  const btcAddress = 'bc1q9v0k58z8n0hupk6m2qpxkld5vgj9wz7c4l6r8e';

  const handleCopy = () => {
    navigator.clipboard.writeText(btcAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/wallet"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Wallets
        </Link>

        {/* Hero Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-orange-950/40 to-slate-900 text-white border border-orange-900/30 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                Bitcoin Escrow Vault (BTC)
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
                0.04850000 BTC
              </h1>
              <p className="text-xs text-slate-400 mt-2">
                ≈ ₦4,850,000.00 • Multi-signature Native SegWit protection
              </p>
            </div>
          </div>
        </div>

        {/* Deposit Box */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Deposit Bitcoin (Native SegWit)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Send BTC to your unique on-chain address. Credits after 1 network confirmation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center">
              <QrCode className="w-24 h-24 text-slate-800" />
            </div>

            <div className="flex-1 space-y-3">
              <span className="text-xs text-slate-400 uppercase font-semibold">Your BTC Deposit Address</span>
              <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-xs sm:text-sm text-slate-900 break-all select-all flex items-center justify-between gap-2">
                <span>{btcAddress}</span>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Copy BTC Address"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && <span className="text-xs text-emerald-600 font-semibold block">Copied to clipboard!</span>}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
