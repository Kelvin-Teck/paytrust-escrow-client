'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Smartphone, CheckCircle2 } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

export default function SecuritySettingsPage() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Security & Authentication
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure two-factor authentication and update your account password.
          </p>
        </div>

        {/* 2FA Card */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Two-Factor Authentication (2FA)</h3>
                <p className="text-xs text-slate-500">Protect high-value escrow releases with Google Authenticator</p>
              </div>
            </div>
            <button
              onClick={() => setIs2FAEnabled(!is2FAEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                is2FAEnabled
                  ? 'bg-[#32A05F] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {is2FAEnabled ? 'Enabled' : 'Enable 2FA'}
            </button>
          </div>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handlePasswordChange} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-base">Change Password</h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Current Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white text-sm shadow-sm transition-all"
          >
            {passwordSaved ? 'Password Updated Successfully!' : 'Update Password'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
