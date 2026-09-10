'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCircle2, AlertCircle, ShieldCheck,
  Check, ArrowRight, Clock, Trash2, RefreshCw,
  Receipt, Wallet, AlertTriangle, ExternalLink
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { notificationService } from '@/services/api';
import { NotificationSkeleton } from '@/components/ui/Skeleton';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchNotifs = async (unreadOnly = false) => {
    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications({ unreadOnly });
      const list = Array.isArray(data) ? data : data?.notifications || [];
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs(filterTab === 'unread');
  }, [filterTab]);

  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setActionSuccessMsg('All notifications marked as read');
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'dispute':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'kyc':
        return <ShieldCheck className="w-4 h-4 text-[#32A05F]" />;
      case 'transaction':
      case 'escrow':
        return <Receipt className="w-4 h-4 text-blue-600" />;
      case 'wallet':
      case 'payment':
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActionLink = (n: any) => {
    if (n.type === 'dispute' && n.referenceId) {
      return `/disputes/${n.referenceId}`;
    }
    if ((n.type === 'transaction' || n.type === 'escrow') && n.referenceId) {
      return `/transaction/${n.referenceId}`;
    }
    if (n.type === 'kyc') {
      return '/profile/identity-verification';
    }
    if (n.type === 'wallet') {
      return '/wallet';
    }
    return null;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Notifications & Activity Feed
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time audit updates for escrows, wallet deposits, KYC, and dispute mediation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNotifs(filterTab === 'unread')}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#32A05F]' : ''}`} />
              Refresh
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-[#32A05F]" /> Mark All as Read
              </button>
            )}
          </div>
        </div>

        {actionSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-[#EBF7F0] border border-[#32A05F]/30 text-[#32A05F] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {actionSuccessMsg}
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'all'
                ? 'bg-[#32A05F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilterTab('unread')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterTab === 'unread'
                ? 'bg-[#32A05F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-inherit text-[10px] font-extrabold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications Stream */}
        {isLoading ? (
          <NotificationSkeleton count={4} />
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n) => {
              const link = getActionLink(n);

              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={`p-5 rounded-2xl border transition-all flex items-start gap-4 group relative ${
                    n.isRead
                      ? 'bg-white border-slate-200 shadow-xs opacity-85 hover:opacity-100'
                      : 'bg-[#EBF7F0]/40 border-[#32A05F]/30 shadow-sm'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{n.title || 'System Notification'}</h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#32A05F] ring-2 ring-white" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(n.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{n.message || n.body}</p>

                    {link && (
                      <Link
                        href={link}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#32A05F] hover:underline mt-2.5"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="absolute right-4 top-5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.isRead && (
                      <button
                        onClick={(e) => handleMarkRead(n.id, e)}
                        title="Mark as read"
                        className="p-1.5 text-slate-400 hover:text-[#32A05F] hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(n.id, e)}
                      title="Delete notification"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {filterTab === 'unread' ? 'No Unread Notifications' : 'No Notifications Yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filterTab === 'unread'
                ? 'You have viewed all of your recent updates and alerts.'
                : 'When you create escrow orders, receive payments, or file disputes, updates will appear here.'}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
