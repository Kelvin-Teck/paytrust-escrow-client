'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck, ArrowRight, Lock, Wallet, CheckCircle2,
  Zap, Sparkles, User, ShoppingBag, Shield
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#EBF7F0] selection:text-[#32A05F]">
      
      {/* ─── Top Navigation ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo size="md" href="/" />

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-[#32A05F] transition-colors">How it Works</a>
            <a href="#features" className="hover:text-[#32A05F] transition-colors">Features</a>
            <a href="#security" className="hover:text-[#32A05F] transition-colors">Security</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-[#32A05F] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#32A05F] hover:bg-[#28874E] text-white transition-all shadow-sm shadow-[#32A05F]/25 hover:shadow-md active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EBF7F0] border border-[#32A05F]/20 text-[#32A05F] text-xs font-bold uppercase tracking-wider mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" /> Guaranteed Safe Transactions
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]"
            >
              Get Paid Securely with <br />
              <span className="text-[#32A05F]">
                Milestone Escrow Protection
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto"
            >
              Eliminate the risk factor of buying and selling. Funds remain locked securely in trust until both parties approve delivery.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all hover:scale-[1.01] active:scale-95"
              >
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                Explore Dashboard
              </Link>
            </motion.div>
          </div>

          {/* ─── 3 Onboarding Pillars from Figma ─── */}
          <motion.div
            id="how-it-works"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Seller Pillar */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#32A05F]/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Seller Protection</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                "I want to make more sales, but I only do payment before delivery." With PayTrust, buyers fund escrow upfront so you can deliver with 100% confidence.
              </p>
            </div>

            {/* Buyer Pillar */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#32A05F]/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Buyer Confidence</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                "I'd love to buy this item, but I only do payment on delivery." Funds are only released to the vendor once you verify and approve the goods.
              </p>
            </div>

            {/* PayTrust Shield Pillar */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white shadow-xl space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-[#32A05F] text-white flex items-center justify-center shadow-md shadow-[#32A05F]/30">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">The Escrow System</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Risk is completely eliminated. Real-time milestones, dispute mediation, and multi-currency wallets ensure mutual trust for every deal.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="py-20 bg-[#F8FAFC] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F]">Complete Peace of Mind</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
              Built for Modern Commerce & Freelancers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Milestone Escrow Deals</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Structure large projects or supply agreements into bite-sized milestones. Release payments progressively upon verified inspection.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mb-6">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Multi-Currency (NGN & BTC)</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Fund wallets with Nigerian Naira via instant Paystack transfer or Bitcoin SegWit on-chain deposits with automated conversion.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Invoicing & Links</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Generate professional escrow invoices and share direct links with clients for immediate counter-party funding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-3">
            <Logo size="sm" href="/" />
            <span>© {new Date().getFullYear()} PayTrust Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/login" className="hover:text-[#32A05F]">Sign In</Link>
            <Link href="/register" className="hover:text-[#32A05F]">Register</Link>
            <Link href="/dashboard" className="hover:text-[#32A05F]">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
