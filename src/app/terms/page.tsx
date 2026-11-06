import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, FileText, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export const metadata = {
  title: "Terms of Service | PeltaPay",
  description: "Terms and conditions governing the use of PeltaPay escrow services, dispute resolution, and payment custody.",
};

export default function TermsPage() {
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
            <FileText className="w-3.5 h-3.5" /> Legal & Governance
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500">
            Last Updated: 28 October 2026 • Effective Date: 1 January 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-8 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center text-xs font-bold">1</span>
              Agreement to Terms
            </h2>
            <p>
              By accessing, browsing, registering an account, or transacting on PeltaPay (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), you (&ldquo;User&rdquo;, &ldquo;Buyer&rdquo;, or &ldquo;Seller&rdquo;) agree to be legally bound by these Terms of Service, our Privacy Policy, and all applicable statutory regulations of the Federal Republic of Nigeria.
            </p>
            <p>
              If you do not agree with any provision of these Terms, you must immediately discontinue use of the Platform and any associated escrow transaction rails.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center text-xs font-bold">2</span>
              Fiduciary Role & Escrow Mechanics
            </h2>
            <p>
              PeltaPay operates as a neutral fiduciary custody agent for peer-to-peer (P2P) commerce, service milestones, and B2B agreements. We hold buyer funds in segregated, insured partner bank accounts under central clearing rails (NIBSS, CBN-licensed custody partners).
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Pre-Funding:</strong> Sellers must not dispatch goods or render deliverables until PeltaPay verifies that 100% of the invoice consideration is securely locked in escrow.</li>
              <li><strong>Conditional Release:</strong> Funds are only disbursed to the Seller upon (a) explicit Buyer confirmation via single-use OTP or dashboard sign-off, or (b) satisfactory expiry of the agreed Inspection Period without a formal dispute.</li>
              <li><strong>Inspection Period:</strong> Parties agree to an inspection window (1 to 30 calendar days). If no dispute or confirmation is lodged before the window expires, funds automatically settle to the Seller.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center text-xs font-bold">3</span>
              KYC & Anti-Money Laundering (AML) Compliance
            </h2>
            <p>
              In accordance with Central Bank of Nigeria (CBN) regulations and the Money Laundering (Prevention and Prohibition) Act 2022:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Tier 1 Standard:</strong> Unverified accounts may create or fund transactions up to ₦500,000 per deal, with a ₦2,500,000 monthly volume cap.</li>
              <li><strong>Tier 2 Verified:</strong> Users must submit valid government-issued identification (NIN, BVN, Voter&rsquo;s Card, Driver&rsquo;s License, or International Passport) to unlock higher transaction ceilings and external bank withdrawals.</li>
              <li><strong>Tier 3 Corporate:</strong> Business accounts must submit CAC Registration certificates and SCUML documentation where required.</li>
              <li><strong>Fiduciary Freezes:</strong> We reserve the statutory right to freeze accounts and withhold funds in instances of suspicious transactions, court orders, or active law enforcement directives.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center text-xs font-bold">4</span>
              Platform Escrow Fees
            </h2>
            <p>
              PeltaPay charges a transparent platform escrow protection fee (default 0.5% of gross invoice amount) as agreed by the counterparties (payable by Buyer, Seller, or split 50/50). Escrow fees cover secure settlement processing, insurance custody, and dispute adjudication infrastructure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center text-xs font-bold">5</span>
              Dispute Resolution & Binding Arbitration
            </h2>
            <p>
              If a buyer receives non-conforming goods, counterfeit items, or uncompleted milestones:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Mutual Settlement:</strong> Parties are given 72 hours to resolve the matter via the in-app Tribunal mediation stream or agree to a partial refund.</li>
              <li><strong>Administrative Ruling:</strong> If unresolved, the dispute escalates to the PeltaPay Fiduciary Arbitration Desk. Evidence (waybills, photos, serial numbers, signed delivery notes) is reviewed, and our compliance officers issue a final, legally binding disbursement ruling.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center text-xs font-bold">6</span>
              Prohibited Items & Activities
            </h2>
            <p>
              PeltaPay strictly prohibits escrow contracts involving illegal weapons, controlled narcotics, pirated software, adult materials, forged documentation, or illicit financial schemes. Any transaction flagged for illegal goods will be cancelled immediately and reported to relevant authorities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center text-xs font-bold">7</span>
              Contact & Inquiries
            </h2>
            <p>
              For legal inquiries, dispute appeals, or compliance questions:
            </p>
            <p className="font-semibold text-slate-800">
              PeltaPay Technologies Limited<br />
              Email: <a href="mailto:legal@peltapay.com" className="text-[#32A05F] hover:underline">legal@peltapay.com</a> | <a href="mailto:support@peltapay.com" className="text-[#32A05F] hover:underline">support@peltapay.com</a><br />
              Lagos, Nigeria
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

