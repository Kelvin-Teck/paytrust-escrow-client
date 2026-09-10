'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative overflow-hidden">
      <header className="p-6 sm:p-8 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10">
        <Logo size="md" href="/" />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#EBF7F0] border border-[#32A05F]/30 flex items-center justify-center text-[#32A05F] mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Created Successfully!</h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Your PayTrust wallet and escrow vault are ready. You can now start creating protected milestones or fund your multi-currency wallet.
          </p>

          <Link
            href="/dashboard"
            className="w-full py-3.5 rounded-xl font-semibold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all active:scale-95 text-sm"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </main>

      <footer className="p-6 text-center text-xs text-slate-400 relative z-10">
        PayTrust Escrow Platform
      </footer>
    </div>
  );
}
