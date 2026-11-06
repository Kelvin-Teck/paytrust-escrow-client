import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-6">
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Logo size="md" href="/" />
      </header>

      <main className="max-w-md mx-auto text-center space-y-6 my-auto py-12">
        <div className="w-16 h-16 rounded-3xl bg-[#EBF7F0] text-[#32A05F] mx-auto flex items-center justify-center shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F]">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            The escrow deal, page, or resource you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white font-semibold text-sm transition-all shadow-sm shadow-[#32A05F]/20 text-center"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-all text-center"
          >
            Return Home
          </Link>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400">
        © {new Date().getFullYear()} PeltaPay Escrow Platform. All rights reserved.
      </footer>
    </div>
  );
}

