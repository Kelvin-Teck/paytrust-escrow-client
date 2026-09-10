'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, User, Lock, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { DEFAULT_COUNTRY, Country, detectUserCountrySync, detectUserCountryAsync } from '@/data/countries';
import { authService } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

function DetailsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const setAuth = useAuthStore((s) => s.setAuth);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState<Country>(() => detectUserCountrySync());
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    detectUserCountryAsync().then((detected) => {
      if (detected) {
        setCountry((prev) => (prev.code === DEFAULT_COUNTRY.code ? detected : prev));
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setErrorMessage('Please provide a valid phone number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const names = fullName.trim().split(' ');
    const firstName = names[0] || 'User';
    const lastName = names.slice(1).join(' ') || 'Customer';

    try {
      const data = await authService.register({
        email,
        password,
        firstName,
        lastName,
        phone: phoneNumber,
        country: country.name,
      });
      if (data?.token) {
        setAuth(data.user || { id: '1', email, firstName, lastName }, data.token);
      }
      router.push('/register/success');
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 rounded-3xl bg-white border border-slate-200 shadow-xl"
    >
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F]">Step 3 of 3</span>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Complete Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Provide your legal name and password for protected settlements.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Full Legal Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Tolulope Lanre Balogun"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] text-sm font-medium transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Phone Number
            </label>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <CountryFlag code={country.code} name={country.name} size="sm" />
              <span>{country.name}</span>
            </div>
          </div>
          <PhoneInput
            required
            value={phoneNumber}
            onChange={(fullE164, selectedCountry) => {
              setPhoneNumber(fullE164);
              setCountry(selectedCountry);
            }}
            onCountryChange={(selectedCountry) => setCountry(selectedCountry)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] text-sm font-medium transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl font-semibold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all active:scale-95 disabled:opacity-50 text-sm mt-2 cursor-pointer"
        >
          {isLoading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}

export default function RegisterDetailsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative overflow-hidden">
      <header className="p-6 sm:p-8 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10">
        <Logo size="md" href="/" />
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <Suspense fallback={<div className="text-slate-400">Loading form...</div>}>
          <DetailsForm />
        </Suspense>
      </main>
      <footer className="p-6 text-center text-xs text-slate-400 relative z-10">
        PayTrust Escrow Platform
      </footer>
    </div>
  );
}
