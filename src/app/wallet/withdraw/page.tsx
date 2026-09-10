'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Building, ArrowRight, CheckCircle2 } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { walletService, profileService } from '@/services/api';

export default function WalletWithdrawPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('100000');
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    walletService.getBalances().then((res) => {
      const bal = res?.balance ?? res?.[0]?.balance ?? 0;
      setAvailableBalance(bal);
    }).catch(console.error);

    profileService.getProfile().then((p) => {
      if (p?.bankAccount || p?.bankDetails) {
        setBankAccount(p.bankAccount || p.bankDetails);
      }
    }).catch(console.error);
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(amount) > availableBalance) {
      alert('Amount exceeds your available NGN balance.');
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      await walletService.withdraw({
        amount: parseFloat(amount),
        bankAccountId: bankAccount?.id,
      });
      alert(`Withdrawal of ₦${parseFloat(amount).toLocaleString()} initiated successfully!`);
      router.push('/wallet');
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setError(err.message || 'Withdrawal failed. Please check bank details.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          href="/wallet"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Wallets
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Withdraw Funds to Bank Account
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fast payout settlement directly to your verified Nigerian NUBAN account.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleWithdraw} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Available for Payout</span>
              <div className="text-2xl font-extrabold text-slate-900">₦{Number(availableBalance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
            </div>
            <span className="text-xs font-bold text-[#32A05F] bg-[#EBF7F0] px-3 py-1 rounded-full">
              Instant Payout
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
              Withdrawal Amount (NGN)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
              />
            </div>
          </div>

          {/* Destination Account */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-600 uppercase">
              Destination Bank Account
            </label>
            {bankAccount ? (
              <div className="p-4 rounded-2xl border-2 border-[#32A05F] bg-[#EBF7F0]/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#32A05F] text-white flex items-center justify-center font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{bankAccount.bankName}</p>
                    <p className="text-xs text-slate-500 font-mono">{bankAccount.accountNumber} • {bankAccount.accountName}</p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#32A05F]" />
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                <span>No bank payout account configured yet.</span>
                <Link href="/profile/bank-details" className="font-bold underline">
                  Add Bank Details →
                </Link>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 rounded-xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all active:scale-95 disabled:opacity-50 text-sm"
          >
            {isProcessing ? 'Processing Transfer...' : 'Confirm Withdrawal'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
