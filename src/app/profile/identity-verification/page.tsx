'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, ArrowRight, FileCheck, CreditCard, Building } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

export default function IdentityVerificationPage() {
  const documents = [
    {
      id: 'nin',
      title: 'National Identity Number (NIN)',
      desc: 'Instant electronic verification with slip or card',
    },
    {
      id: 'passport',
      title: 'International Passport',
      desc: 'Standard photo page upload',
    },
    {
      id: 'license',
      title: "Driver's License",
      desc: 'Front and back photo verification',
    },
  ];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">KYC Verification</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Choose an ID Document
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Select a valid government-issued document to unlock higher escrow limits and fast withdrawals.
          </p>
        </div>

        <div className="space-y-4">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href="/profile/identity-verification/upload"
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all flex items-center justify-between group"
            >
              <div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{doc.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
