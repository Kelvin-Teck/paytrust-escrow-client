"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Quote,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Building2,
  ShoppingBag,
  Laptop,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatarText: string;
  avatarBg: string;
  category: "all" | "ecommerce" | "freelance" | "high-value";
  dealType: string;
  dealAmount?: string;
  rating: number;
  quote: string;
  badge: string;
}

const testimonials: Testimonial[] = [
  {
    id: "amaka",
    name: "Amaka Okafor",
    role: "Luxury Fashion & Jewelry Vendor",
    location: "Lagos, Nigeria",
    avatarText: "AO",
    avatarBg: "bg-emerald-500",
    category: "ecommerce",
    dealType: "High-Volume Apparel Deals",
    dealAmount: "₦850,000 / deal",
    rating: 5,
    quote:
      "Before PayTrust, interstate buyers always demanded payment on delivery, which caused frequent delivery cancellations. Now, buyers fund the escrow upfront. I ship knowing my funds are 100% locked and guaranteed. My completed sales tripled in two months!",
    badge: "Verified Vendor",
  },
  {
    id: "tunde",
    name: "Tunde Adeyemi",
    role: "Lead Fullstack & UI/UX Engineer",
    location: "Abuja, Nigeria",
    avatarText: "TA",
    avatarBg: "bg-blue-600",
    category: "freelance",
    dealType: "Milestone Contract Development",
    dealAmount: "₦1.8M Project",
    rating: 5,
    quote:
      "Milestone escrow is a total game changer for software contracts. The client funds 3 distinct milestones: Design, MVP, and Deployment. Once I deliver each phase and they inspect it, funds release instantly to my wallet. No more chasing unpaid invoices.",
    badge: "Verified Agency",
  },
  {
    id: "emeka",
    name: "Emeka Nwosu",
    role: "Procurement Lead, TechCorp Nigeria",
    location: "Port Harcourt, Nigeria",
    avatarText: "EN",
    avatarBg: "bg-indigo-600",
    category: "high-value",
    dealType: "Bulk Hardware & Server Supplies",
    dealAmount: "₦3.5M Escrow",
    rating: 5,
    quote:
      "Buying millions worth of hardware from a vendor in another state was always stressful. With PayTrust, our logistics team inspects the consignment on delivery before authorizing payout. It provides the institutional safety we need.",
    badge: "Corporate Buyer",
  },
  {
    id: "zainab",
    name: "Zainab Bello",
    role: "Digital Growth & Brand Strategist",
    location: "Kano, Nigeria",
    avatarText: "ZB",
    avatarBg: "bg-amber-600",
    category: "freelance",
    dealType: "Monthly Retainer Escrow",
    dealAmount: "₦650,000 / mo",
    rating: 5,
    quote:
      "I create branded escrow invoices with 1-click payment links for both local and international clients. The automated verification and real-time transaction updates give our consulting brand an ultra-professional polish.",
    badge: "Verified Merchant",
  },
  {
    id: "olumide",
    name: "Olumide Bakare",
    role: "Gadget Collector & Tech Enthusiast",
    location: "Ibadan, Nigeria",
    avatarText: "OB",
    avatarBg: "bg-teal-600",
    category: "high-value",
    dealType: "High-End Laptop & Phone Purchases",
    dealAmount: "₦1.4M MacBook Pro",
    rating: 5,
    quote:
      "I purchased an expensive MacBook from an online vendor. When a minor spec discrepancy arose, PayTrust's mediation team stepped in calmly and resolved it in 24 hours according to our agreed terms. I will never do direct transfers again.",
    badge: "Verified Buyer",
  },
  {
    id: "david",
    name: "David Chen",
    role: "Cross-Border Digital Asset Merchant",
    location: "International",
    avatarText: "DC",
    avatarBg: "bg-purple-600",
    category: "ecommerce",
    dealType: "BTC & Naira Multi-Currency Trade",
    dealAmount: "0.15 BTC",
    rating: 5,
    quote:
      "The Bitcoin SegWit on-chain wallet integration combined with automated Naira settlements makes cross-border trades seamless. Both counterparties can verify fund locks in real time before releasing goods.",
    badge: "Verified Trader",
  },
];

const categoryTabs = [
  { id: "all", label: "All Stories", icon: Sparkles },
  { id: "ecommerce", label: "E-Commerce & Retail", icon: ShoppingBag },
  { id: "freelance", label: "Freelancers & Agencies", icon: Laptop },
  { id: "high-value", label: "High-Value Goods", icon: Building2 },
];

export function TestimonialsSection() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredTestimonials =
    activeCategory === "all"
      ? testimonials
      : testimonials.filter((item) => item.category === activeCategory);

  return (
    <section
      id="testimonials"
      className="py-24 sm:py-32 bg-[#F8FAFC] border-t border-slate-200/80 overflow-hidden relative"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#32A05F]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF7F0] border border-[#32A05F]/25 text-[#32A05F] text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs"
          >
            <Star className="w-3.5 h-3.5 fill-[#32A05F] text-[#32A05F]" />
            Verified Customer Stories
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]"
          >
            Trusted by Thousands of <br className="hidden sm:inline" />
            <span className="text-[#32A05F]">Buyers, Sellers & Creators</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto"
          >
            See how everyday merchants, agencies, and buyers eliminate payment
            anxiety and fraud with PayTrust milestone escrow.
          </motion.p>
        </div>

        {/* 4 Trust Metrics Highlight Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16"
        >
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">4.9 / 5.0</p>
              <p className="text-xs font-semibold text-slate-500">
                1,800+ Verified Reviews
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#32A05F] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">99.8%</p>
              <p className="text-xs font-semibold text-slate-500">
                Successful Completion
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">₦500M+</p>
              <p className="text-xs font-semibold text-slate-500">
                Safely Protected in Escrow
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">&lt; 15 Mins</p>
              <p className="text-xs font-semibold text-slate-500">
                Avg. Approval & Payout
              </p>
            </div>
          </div>
        </motion.div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#32A05F] text-white shadow-sm shadow-[#32A05F]/30"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Testimonials Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredTestimonials.map((item, index) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-[#32A05F]/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Deal Tag + Quote Icon */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EBF7F0] text-[#32A05F] border border-[#32A05F]/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.badge}
                    </span>

                    <Quote className="w-6 h-6 text-slate-200 group-hover:text-[#32A05F]/40 transition-colors" />
                  </div>

                  {/* 5-Star Rating */}
                  <div className="flex items-center gap-1 mb-4 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  {/* Quote Text */}
                  <p className="text-slate-700 text-sm sm:text-[15px] leading-relaxed mb-6 font-normal">
                    "{item.quote}"
                  </p>
                </div>

                {/* Author Card Footer */}
                <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full ${item.avatarBg} text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0`}
                    >
                      {item.avatarText}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {item.role}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                        {item.location}
                      </p>
                    </div>
                  </div>

                  {item.dealAmount && (
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Deal Value
                      </span>
                      <span className="text-xs font-extrabold text-[#32A05F]">
                        {item.dealAmount}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Social Proof Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 p-4 sm:px-8 sm:py-4 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <p className="text-sm font-semibold text-slate-700">
              Ready to safeguard your next transaction?
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-[#32A05F] hover:bg-[#28874E] text-white transition-all shadow-xs active:scale-95"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
