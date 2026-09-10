'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function RegisterEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    router.push(`/register/verify?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative overflow-hidden">
      <header className="p-6 sm:p-8 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10">
        <Logo size="md" href="/" />
        <Link href="/login" className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#32A05F] transition-colors">
          Already have an account? <span className="text-[#32A05F]">Log In</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 rounded-3xl bg-white border border-slate-200 shadow-xl"
        >
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F]">Step 1 of 3</span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Register Account</h1>
            <p className="text-sm text-slate-500 mt-1">
              Enter your email address to get started with milestone-protected escrow.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Please enter email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 focus:border-[#32A05F] text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all active:scale-95 disabled:opacity-50 text-sm mt-2"
            >
              {isLoading ? 'Sending Code...' : 'Continue'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2 justify-center">
            <CheckCircle2 className="w-4 h-4 text-[#32A05F]" /> Bank-grade encryption & 2FA protection
          </div>
        </motion.div>
      </main>

      <footer className="p-6 text-center text-xs text-slate-400 relative z-10">
        By registering, you agree to our Terms of Service and Privacy Policy.
      </footer>
    </div>
  );
}
