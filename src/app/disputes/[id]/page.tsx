'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Shield, AlertTriangle, Send, Upload,
  CheckCircle2, FileText, User, MessageSquare, RefreshCw
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { disputeService } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

export default function DisputeMediationRoomPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const user = useAuthStore((s) => s.user);

  const [dispute, setDispute] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    disputeService.getDisputeById(id)
      .then((res) => {
        setDispute(res);
        // Initialize discussion thread with the dispute reason
        if (res) {
          const initialMessages = [
            {
              id: 'init-1',
              sender: res.raisedBy?.name || res.raisedBy?.firstName || 'Disputant',
              role: 'buyer',
              time: new Date(res.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: `Dispute Reason: "${res.reason}". Please review transaction terms and provide evidence.`,
            },
            {
              id: 'init-2',
              sender: 'PayTrust Support Arbiter',
              role: 'arbiter',
              time: 'Mediation Active',
              text: 'Welcome to the secure mediation room. Escrow funds are frozen in custody. Both parties may provide context, tracking waybills, and delivery receipts here.',
            }
          ];
          setChatLog(initialMessages);
        }
      })
      .catch((err) => {
        console.error('Failed to load dispute:', err);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const senderName = user?.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : user?.name || user?.email?.split('@')[0] || 'Me';

    setChatLog([
      ...chatLog,
      {
        id: Date.now().toString(),
        sender: senderName,
        role: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: message.trim(),
      },
    ]);
    setMessage('');
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/disputes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Disputes
        </Link>

        {dispute ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                    {dispute.id?.slice(0, 8)}
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {dispute.status === 'OPEN' ? 'Mediation In Progress' : dispute.status}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mt-2">
                  {dispute.transaction?.title || 'Escrow Agreement Dispute'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Order ID: {dispute.transactionId?.slice(0, 8)} • Arbiter Assigned: PayTrust Mediation Panel
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs font-bold text-slate-400 uppercase">Frozen Escrow Amount</span>
                <div className="text-3xl font-extrabold text-slate-900">
                  ₦{Number(dispute.transaction?.amount || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Mediation Room Chat Stream */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#32A05F]" /> Evidence & Discussion Room
              </h2>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 max-h-[420px] overflow-y-auto">
                {chatLog.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl max-w-xl ${
                      msg.role === 'arbiter'
                        ? 'bg-[#0F172A] text-white ml-auto border border-slate-800'
                        : msg.role === 'user'
                        ? 'bg-white text-slate-900 border border-slate-200 shadow-xs ml-auto'
                        : 'bg-white text-slate-900 border border-slate-200 mr-auto'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span
                        className={`text-xs font-bold ${
                          msg.role === 'arbiter' ? 'text-[#32A05F]' : 'text-slate-700'
                        }`}
                      >
                        {msg.sender}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Input form */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message or response for the arbiter..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">Loading dispute mediation room...</div>
        )}
      </div>
    </AppShell>
  );
}
