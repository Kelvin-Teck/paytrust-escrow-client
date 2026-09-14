"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lock,
  UserCheck,
  KeyRound,
  Zap,
  FileText,
  Scale,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface SecurityPillar {
  id: string;
  icon: React.ElementType;
  emoji: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  accent: {
    bg: string;
    border: string;
    text: string;
    iconBg: string;
    glow: string;
  };
}

const securityPillars: SecurityPillar[] = [
  {
    id: "secure-escrow",
    icon: Lock,
    emoji: "🔒",
    title: "Secure Escrow",
    tagline: "Your money stays protected until the agreed transaction conditions are met.",
    description:
      "Funds are not immediately transferred to the seller. PayTrust holds the transaction safely under predefined release conditions.",
    badge: "Protected Holding Vault",
    accent: {
      bg: "bg-emerald-50/50",
      border: "border-emerald-200/80 hover:border-emerald-500/50",
      text: "text-emerald-700",
      iconBg: "bg-emerald-100 text-emerald-700",
      glow: "group-hover:shadow-emerald-500/10",
    },
  },
  {
    id: "identity-verification",
    icon: UserCheck,
    emoji: "🛡️",
    title: "Identity Verification",
    tagline: "Know who you're dealing with.",
    description:
      "Verified users provide identity information required by PayTrust's verification process, helping reduce impersonation and fraudulent accounts.",
    badge: "Tiered Identity Validation",
    accent: {
      bg: "bg-blue-50/50",
      border: "border-blue-200/80 hover:border-blue-500/50",
      text: "text-blue-700",
      iconBg: "bg-blue-100 text-blue-700",
      glow: "group-hover:shadow-blue-500/10",
    },
  },
  {
    id: "encrypted-data",
    icon: KeyRound,
    emoji: "🔐",
    title: "Encrypted Data",
    tagline: "Your information stays private.",
    description:
      "Sensitive account and transaction data is protected using industry-standard encryption and secure communication protocols.",
    badge: "AES-256 & TLS Encryption",
    accent: {
      bg: "bg-indigo-50/50",
      border: "border-indigo-200/80 hover:border-indigo-500/50",
      text: "text-indigo-700",
      iconBg: "bg-indigo-100 text-indigo-700",
      glow: "group-hover:shadow-indigo-500/10",
    },
  },
  {
    id: "controlled-release",
    icon: Zap,
    emoji: "⚡",
    title: "Controlled Fund Release",
    tagline: "Money moves only when the rules are satisfied.",
    description:
      "Funds are released based on predefined transaction conditions—not simply because someone requests a payout.",
    badge: "Milestone-Driven Execution",
    accent: {
      bg: "bg-amber-50/50",
      border: "border-amber-200/80 hover:border-amber-500/50",
      text: "text-amber-800",
      iconBg: "bg-amber-100 text-amber-700",
      glow: "group-hover:shadow-amber-500/10",
    },
  },
  {
    id: "transaction-records",
    icon: FileText,
    emoji: "🧾",
    title: "Complete Transaction Records",
    tagline: "Every important action leaves a trace.",
    description:
      "Transaction activity, approvals, milestones, payments, and relevant evidence are recorded to provide transparency and support dispute resolution.",
    badge: "Tamper-Proof Audit Trail",
    accent: {
      bg: "bg-teal-50/50",
      border: "border-teal-200/80 hover:border-teal-500/50",
      text: "text-teal-800",
      iconBg: "bg-teal-100 text-teal-700",
      glow: "group-hover:shadow-teal-500/10",
    },
  },
  {
    id: "dispute-protection",
    icon: Scale,
    emoji: "🚨",
    title: "Dispute Protection",
    tagline: "Something goes wrong? You're not left alone.",
    description:
      "When a legitimate dispute is raised, the transaction can be paused while evidence is reviewed and a resolution is determined according to the agreed terms.",
    badge: "Impartial Mediation Desk",
    accent: {
      bg: "bg-rose-50/50",
      border: "border-rose-200/80 hover:border-rose-500/50",
      text: "text-rose-700",
      iconBg: "bg-rose-100 text-rose-700",
      glow: "group-hover:shadow-rose-500/10",
    },
  },
];

export function SecuritySection() {
  return (
    <section
      id="security"
      className="relative py-24 sm:py-32 bg-gradient-to-b from-white via-slate-50/70 to-white overflow-hidden border-t border-slate-100"
    >
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#32A05F]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF7F0] border border-[#32A05F]/25 text-[#32A05F] text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4" />
            Institutional Security Architecture
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]"
          >
            Built for Total Trust & <br className="hidden sm:inline" />
            <span className="text-[#32A05F]">Uncompromised Protection</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto"
          >
            Every transaction is safeguarded by cryptographic data encryption,
            verified counterparties, and automated milestone holding rules.
          </motion.p>
        </div>

        {/* 6 Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {securityPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`group relative p-8 rounded-3xl bg-white border ${pillar.accent.border} shadow-sm hover:shadow-xl ${pillar.accent.glow} transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl ${pillar.accent.iconBg} flex items-center justify-center shadow-inner transition-transform group-hover:scale-105 duration-300`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${pillar.accent.bg} ${pillar.accent.text} border border-current/15`}
                    >
                      {pillar.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span>{pillar.emoji}</span>
                    <span>{pillar.title}</span>
                  </h3>

                  <p className="text-sm font-semibold text-slate-800 mb-3 leading-snug">
                    {pillar.tagline}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                {/* Bottom Trust Signal */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#32A05F] shrink-0" />
                  <span>Enforced on all transactions</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Security Assurance Banner & Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 sm:mt-20 rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#32A05F]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#32A05F]/20 text-[#32A05F] text-xs font-bold uppercase tracking-wider mb-4 border border-[#32A05F]/30">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Risk Elimination
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Ready to trade with total confidence?
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Join thousands of businesses, freelancers, and buyers using
                PayTrust to protect high-value payments and delivery agreements.
              </p>

              {/* 4 Metric Badges */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <p className="text-lg font-extrabold text-[#32A05F]">100%</p>
                  <p className="text-xs text-slate-400">Pre-Funded Escrow</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <p className="text-lg font-extrabold text-[#32A05F]">256-Bit</p>
                  <p className="text-xs text-slate-400">TLS Encryption</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <p className="text-lg font-extrabold text-[#32A05F]">0%</p>
                  <p className="text-xs text-slate-400">Unapproved Payouts</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <p className="text-lg font-extrabold text-[#32A05F]">24/7</p>
                  <p className="text-xs text-slate-400">Mediation Support</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 w-full sm:w-auto shrink-0">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl text-base font-bold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/30 transition-all hover:scale-[1.02] active:scale-95 text-center"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 flex items-center justify-center gap-2 transition-all text-center"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
