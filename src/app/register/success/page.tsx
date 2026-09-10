"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

function SuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-[#EBF7F0] border border-[#32A05F]/30 flex items-center justify-center text-[#32A05F] mx-auto mb-6 shadow-inner">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F] bg-[#EBF7F0] px-3 py-1 rounded-full">
        Verification Complete
      </span>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3 mb-2">
        Account Verified!
      </h1>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed">
        Your email has been verified. Your PayTrust wallet and escrow vault are active and ready.
      </p>

      <Link
        href={email ? `/login?email=${encodeURIComponent(email)}` : "/login"}
        className="w-full py-4 rounded-2xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all active:scale-[0.98] text-sm"
      >
        <span>Proceed to Log In</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative overflow-hidden">
      <header className="p-6 sm:p-8 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10">
        <Logo size="md" href="/" />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <Suspense fallback={<div className="text-slate-400">Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </main>

      <footer className="p-6 text-center text-xs text-slate-400 relative z-10">
        PayTrust Escrow Platform
      </footer>
    </div>
  );
}
