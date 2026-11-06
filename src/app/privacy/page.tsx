import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Eye } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export const metadata = {
  title: "Privacy Policy | PeltaPay",
  description: "Learn how PeltaPay collects, protects, and handles your personal information under the Nigeria Data Protection Act (NDPA).",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-[#EBF7F0] selection:text-[#32A05F]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="sm" href="/" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#32A05F] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Title Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF7F0] text-[#32A05F] text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> Data Protection & NDPA Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500">
            Last Updated: 28 October 2026 • Nigeria Data Protection Act 2023 Compliant
          </p>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-8 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center text-xs font-bold">1</span>
              Introduction & Scope
            </h2>
            <p>
              PeltaPay Technologies Limited (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) takes your privacy and data security seriously. This Privacy Policy details how we collect, store, process, and safeguard your personal and financial information when using our escrow platform, APIs, mobile web services, and payment integrations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center text-xs font-bold">2</span>
              Information We Collect
            </h2>
            <p>
              To provide reliable escrow custody and satisfy statutory KYC/AML obligations:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Contact Information:</strong> Full legal name, verified email address, phone/WhatsApp number, and postal address.</li>
              <li><strong>Government Identity Evidence:</strong> National Identification Number (NIN), Bank Verification Number (BVN), Driver&rsquo;s License, Voter&rsquo;s Card, or International Passport photo copies.</li>
              <li><strong>Business Identification:</strong> Corporate Affairs Commission (CAC) registration documents, Tax Identification Numbers (TIN), SCUML certificates, and beneficial ownership records.</li>
              <li><strong>Financial & Transaction Data:</strong> Bank account details (NUBAN), payment card tokens (processed securely through PCI-DSS Level 1 certified gateways such as Paystack), escrow invoices, and delivery waybill exhibits.</li>
              <li><strong>Device & Usage Telemetry:</strong> IP addresses, browser agent headers, access timestamps, and device fingerprints used exclusively for fraud prevention.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center text-xs font-bold">3</span>
              How We Use Your Data
            </h2>
            <p>We process your personal information strictly for legitimate purposes, including:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Facilitating conditional escrow contracts, payment notifications, and fund releases.</li>
              <li>Verifying user identities against central databases to prevent fraud, identity theft, and money laundering.</li>
              <li>Adjudicating transaction disputes, reviewing evidence exhibits, and enforcing fair outcomes.</li>
              <li>Complying with lawful court orders, Central Bank directives, and tax reporting requirements.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center text-xs font-bold">4</span>
              Data Protection & Cold Storage Security
            </h2>
            <p>
              We enforce multi-tiered defense protocols:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>All web traffic is transmitted via high-grade TLS 1.3 encryption.</li>
              <li>Sensitive identity documents and evidence uploads are encrypted at rest with AES-256 standard and stored in access-controlled environments.</li>
              <li>Payment credentials and card numbers are never stored in plain text on our servers; payments are tokenized via licensed payment gateway rails.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center text-xs font-bold">5</span>
              Your Rights Under NDPA 2023
            </h2>
            <p>
              As a data subject in Nigeria, you retain the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction or rectification of incomplete or inaccurate profile information.</li>
              <li>Request erasure of personal data, subject to statutory financial record retention requirements (minimum 5 years under AML laws).</li>
              <li>Object to or restrict specific processing operations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center text-xs font-bold">6</span>
              Contact Data Protection Officer (DPO)
            </h2>
            <p>
              To exercise any of your data rights or report a privacy concern:
            </p>
            <p className="font-semibold text-slate-800">
              Data Protection Officer<br />
              PeltaPay Technologies Limited<br />
              Email: <a href="mailto:privacy@peltapay.com" className="text-[#32A05F] hover:underline">privacy@peltapay.com</a> | <a href="mailto:compliance@peltapay.com" className="text-[#32A05F] hover:underline">compliance@peltapay.com</a><br />
              Lagos, Nigeria
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

