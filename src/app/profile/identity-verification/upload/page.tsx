"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Building2,
  ShieldCheck,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { profileService } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";

function UploadVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode") || "kyc";
  const docTypeParam = searchParams.get("docType") || "gov_id";

  const { user, setUser } = useAuthStore();
  const isKyb = modeParam === "kyb" || user?.accountType === "business";

  const [docType, setDocType] = useState<"gov_id" | "passport" | "drivers_license">(
    (docTypeParam as any) || "gov_id"
  );
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  // Corporate KYB state
  const [cacFile, setCacFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [rcNumber, setRcNumber] = useState(user?.rcNumber || "");
  const [tin, setTin] = useState(user?.tin || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontFile) {
      setErrorMsg("Please select at least the front side of your ID document.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("documentType", docType);
      formData.append("idCardFront", frontFile);
      if (backFile) {
        formData.append("idCardBack", backFile);
      }

      const res = await profileService.submitKyc(formData);
      if (res) {
        const freshProfile = await profileService.getProfile();
        if (freshProfile) setUser(freshProfile);
      }
      setSuccessMsg("Identity document submitted successfully! Your Tier 2 status is now in review.");
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to upload KYC document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitKyb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cacFile) {
      setErrorMsg("Please select your CAC Certificate of Incorporation document.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("cacCertificate", cacFile);
      if (addressFile) {
        formData.append("proofOfBusinessAddress", addressFile);
      }
      if (companyName) formData.append("companyName", companyName.trim());
      if (rcNumber) formData.append("rcNumber", rcNumber.trim());
      if (tin) formData.append("tin", tin.trim());

      const res = await profileService.submitKyb(formData);
      if (res) {
        const freshProfile = await profileService.getProfile();
        if (freshProfile) setUser(freshProfile);
      }
      setSuccessMsg("Corporate KYB documents submitted successfully! Compliance team is auditing your business details.");
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to upload Corporate KYB documents.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <Link
        href="/profile/identity-verification"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Verification Hub
      </Link>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          {isKyb ? "Corporate Compliance" : "Individual Compliance"}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
          {isKyb ? "Submit Corporate KYB Verification" : "Upload Identity Document"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isKyb
            ? "Upload official Corporate Affairs Commission (CAC) incorporation certificates and business registration documents."
            : "Ensure all 4 corners of the document are visible and text is clear and readable."}
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

      {isKyb ? (
        <form onSubmit={handleSubmitKyb} className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-[#32A05F]" />
              <span>Entity Details & Tax Information</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Registered Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PayTrust Global Technologies Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  CAC RC / Business Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RC-1849203"
                  value={rcNumber}
                  onChange={(e) => setRcNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Tax ID (TIN)</span>
                  <span className="text-slate-400 lowercase font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 23849102-0001"
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white border-2 border-dashed border-slate-300 hover:border-[#32A05F] text-center transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setCacFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-10 h-10 rounded-xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center mx-auto mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-900">
                {cacFile ? cacFile.name : "CAC Certificate of Incorporation *"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">PDF or High-Res Image (Required)</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border-2 border-dashed border-slate-300 hover:border-[#32A05F] text-center transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setAddressFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-900">
                {addressFile ? addressFile.name : "Proof of Operating Address"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Utility bill / lease agreement (Optional)</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!cacFile || isSubmitting}
            className="w-full py-4 rounded-xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/20 transition-all active:scale-[0.98] disabled:opacity-50 text-sm cursor-pointer"
          >
            {isSubmitting ? "Uploading & Auditing Business Records..." : "Submit Corporate KYB for Audit"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmitKyc} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Document Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "gov_id", label: "Government ID / NIN" },
                { id: "passport", label: "Passport" },
                { id: "drivers_license", label: "Driver's License" },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setDocType(t.id as any)}
                  className={`p-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    docType === t.id
                      ? "bg-[#EBF7F0] text-[#32A05F] border-[#32A05F]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
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
                {frontFile ? frontFile.name : "Front Side Image *"}
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
                {backFile ? backFile.name : "Back Side Image"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click or drag file (Optional)</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!frontFile || isSubmitting}
            className="w-full py-4 rounded-xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/20 transition-all active:scale-[0.98] disabled:opacity-50 text-sm cursor-pointer"
          >
            {isSubmitting ? "Uploading & Verifying..." : "Submit Document for Review"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

export default function IdentityUploadPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="text-slate-400 p-8">Loading upload interface...</div>}>
        <UploadVerificationForm />
      </Suspense>
    </AppShell>
  );
}
