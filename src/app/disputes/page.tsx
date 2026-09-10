'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Shield, Clock, CheckCircle2, ChevronRight,
  PlusCircle, Search, FileText, ArrowRight, X, RefreshCw
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { disputeService, transactionService } from '@/services/api';

export default function DisputesHubPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [disputes, setDisputes] = useState<any[]>([]);
  const [activeTransactions, setActiveTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for raising a dispute
  const [selectedTxId, setSelectedTxId] = useState('');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      const [dispRes, txRes] = await Promise.allSettled([
        disputeService.getDisputes(),
        transactionService.getTransactions(),
      ]);

      if (dispRes.status === 'fulfilled' && dispRes.value) {
        const rows = Array.isArray(dispRes.value)
          ? dispRes.value
          : dispRes.value?.rows || dispRes.value?.disputes || [];
        setDisputes(rows);
      }

      if (txRes.status === 'fulfilled' && txRes.value) {
        const txList = Array.isArray(txRes.value)
          ? txRes.value
          : txRes.value?.transactions || [];
        // Only transactions eligible for dispute: SECURED or DELIVERED or IN_PROGRESS
        setActiveTransactions(txList);
      }
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxId || !reason) {
      setErrorMsg('Please select an order and provide a dispute reason.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await disputeService.raiseDispute({
        transactionId: selectedTxId,
        reason,
        details,
      });
      setIsModalOpen(false);
      setSelectedTxId('');
      setReason('');
      setDetails('');
      alert('Dispute raised successfully! Funds have been frozen in escrow.');
      fetchDisputes();
    } catch (err: any) {
      console.error('Raise dispute error:', err);
      setErrorMsg(err.message || 'Failed to raise dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDisputes = disputes.filter((dsp) => {
    const q = searchTerm.toLowerCase();
    const title = dsp.transaction?.title || dsp.title || '';
    const reasonText = dsp.reason || '';
    const id = dsp.id || '';
    const txId = dsp.transactionId || dsp.dealId || '';
    return (
      title.toLowerCase().includes(q) ||
      reasonText.toLowerCase().includes(q) ||
      id.toLowerCase().includes(q) ||
      txId.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Dispute Resolution Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Arbitration and mediation room for protected escrow contracts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDisputes}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#32A05F]' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-sm font-semibold shadow-sm shadow-[#32A05F]/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Raise New Dispute
            </button>
          </div>
        </div>

        {/* Dispute Guide Banner */}
        <div className="p-6 rounded-3xl bg-[#0F172A] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-[#32A05F] text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4" /> PayTrust Arbiter Protection
            </div>
            <h3 className="text-xl font-bold">How Dispute Mediation Works</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When a dispute is raised, escrow funds remain frozen in custody. Both parties submit delivery evidence, chat with an assigned PayTrust Arbiter, and receive a fair verdict within 48 hours.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by dispute reference, contract title, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
          />
        </div>

        {/* Disputes List */}
        {filteredDisputes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredDisputes.map((dsp) => {
              const amount = dsp.transaction?.amount ?? dsp.amount ?? 0;
              const title = dsp.transaction?.title || dsp.title || 'Escrow Agreement Dispute';
              const status = dsp.status || 'OPEN';

              return (
                <div
                  key={dsp.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#32A05F]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                        {dsp.id?.slice(0, 8)}
                      </span>
                      {dsp.transactionId && (
                        <span className="font-mono text-xs font-semibold text-slate-400">
                          Order: {dsp.transactionId.slice(0, 8)}
                        </span>
                      )}
                      {status === 'OPEN' && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Under Mediation
                        </span>
                      )}
                      {status === 'resolved_refund' && (
                        <span className="text-xs font-bold text-[#32A05F] bg-[#EBF7F0] px-2.5 py-0.5 rounded-full border border-[#32A05F]/20">
                          Resolved & Refunded
                        </span>
                      )}
                      {status === 'resolved_release' && (
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                          Resolved & Released
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <p className="text-xs text-slate-600">
                      Reason: <span className="font-medium text-slate-800">{dsp.reason}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Created: {new Date(dsp.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end justify-between gap-4">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-400 font-bold uppercase">Frozen Amount</span>
                      <div className="text-2xl font-extrabold text-slate-900">
                        ₦{Number(amount).toLocaleString()}
                      </div>
                    </div>

                    <Link
                      href={`/disputes/${dsp.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all"
                    >
                      Enter Mediation Room <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Active Disputes</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All of your escrow contracts are running smoothly without any open mediation requests.
            </p>
          </div>
        )}

        {/* Raise Dispute Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span>Raise Escrow Dispute</span>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {errorMsg && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleRaiseDispute} className="space-y-4 mt-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      Select Escrow Contract
                    </label>
                    <select
                      value={selectedTxId}
                      onChange={(e) => setSelectedTxId(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
                    >
                      <option value="">-- Choose an agreement --</option>
                      {activeTransactions.map((tx) => (
                        <option key={tx.id} value={tx.id}>
                          {tx.title || 'Escrow Order'} (₦{Number(tx.amount || 0).toLocaleString()}) - {tx.id.slice(0, 8)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      Dispute Reason / Issue Summary
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Delivery overdue by 14 days, item damaged, or incorrect deliverable"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      Detailed Evidence & Explanation
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe what occurred, dates, and previous communications with the counterparty..."
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
                    ⚠️ <strong>Notice:</strong> Raising a dispute freezes funds in escrow until an arbiter reviews evidence submitted by both parties.
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting Dispute...' : 'Submit Dispute'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
