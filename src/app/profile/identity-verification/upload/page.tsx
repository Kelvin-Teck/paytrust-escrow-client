'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { profileService } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

export default function IdentityUploadPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [docType, setDocType] = useState<'gov_id' | 'passport' | 'drivers_license'>('gov_id');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontFile) {
      setErrorMsg('Please select at least the front side of your ID document.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('documentType', docType);
      formData.append('idCardFront', frontFile);
      if (backFile) {
        formData.append('idCardBack', backFile);
      }

      const res = await profileService.submitKyc(formData);
      if (res) {
        const freshProfile = await profileService.getProfile();
        if (freshProfile) setUser(freshProfile);
      }
      setSuccessMsg('KYC document submitted successfully. Verification status updated.');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload KYC document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          href="/profile/identity-verification"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Document Selection
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Upload Document Image
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ensure all 4 corners of the document are visible and text is clear and readable.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-[#EBF7F0] border border-[#32A05F]/20 text-[#32A05F] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Document Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'gov_id', label: 'Government ID / NIN' },
                { id: 'passport', label: 'Passport' },
                { id: 'drivers_license', label: "Driver's License" },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setDocType(t.id as any)}
                  className={`p-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    docType === t.id
                      ? 'bg-[#EBF7F0] text-[#32A05F] border-[#32A05F]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white border-2 border-dashed border-slate-300 hover:border-[#32A05F] text-center transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-10 h-10 rounded-xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mx-auto mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-900">
                {frontFile ? frontFile.name : 'Front Side Image *'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click or drag file (Required)</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border-2 border-dashed border-slate-300 hover:border-[#32A05F] text-center transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-900">
                {backFile ? backFile.name : 'Back Side Image'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click or drag file (Optional)</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!frontFile || isSubmitting}
            className="w-full py-3.5 rounded-xl font-semibold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-md shadow-[#32A05F]/20 transition-all active:scale-98 disabled:opacity-50 text-sm"
          >
            {isSubmitting ? 'Uploading & Verifying...' : 'Submit Document for Review'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
