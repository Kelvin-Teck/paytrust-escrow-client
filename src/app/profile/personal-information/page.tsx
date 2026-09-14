"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Building2, User } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { profileService } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { FormSkeleton } from "@/components/ui/Skeleton";

export default function PersonalInformationPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"personal" | "business">(
    user?.accountType === "business" ? "business" : "personal"
  );

  // Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");

  // Business Info
  const [companyName, setCompanyName] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [tin, setTin] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessType, setBusinessType] = useState("Technology & Services");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    profileService
      .getProfile()
      .then((p) => {
        if (p) {
          setFirstName(p.firstName || "");
          setLastName(p.lastName || "");
          setPhone(p.phone || "");
          setEmail(p.email || "");
          setAddress(p.address || "");
          setDob(p.dob || "");
          setCompanyName(p.companyName || "");
          setRcNumber(p.rcNumber || "");
          setTin(p.tin || "");
          setBusinessAddress(p.businessAddress || "");
          setBusinessType(p.businessType || "Technology & Services");
          if (p.accountType === "business") {
            setActiveTab("business");
          }
        }
      })
      .catch(() => {
        if (user) {
          setFirstName(user.firstName || "");
          setLastName(user.lastName || "");
          setPhone(user.phone || "");
          setEmail(user.email || "");
          setAddress((user as any).address || "");
          setDob((user as any).dob || "");
          setCompanyName(user.companyName || "");
          setRcNumber(user.rcNumber || "");
          setTin(user.tin || "");
          setBusinessAddress(user.businessAddress || "");
          setBusinessType(user.businessType || "Technology & Services");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await profileService.updatePersonal({
        firstName,
        lastName,
        phone,
        address: address || undefined,
        dob: dob || undefined,
      });
      setUser({
        ...(user || { id: "1", email }),
        firstName,
        lastName,
        phone,
        ...({ address, dob } as any),
      });
      setSuccessMsg("Personal information updated successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to update personal information");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await profileService.updateBusiness({
        companyName: companyName.trim() || undefined,
        rcNumber: rcNumber.trim() || undefined,
        tin: tin.trim() || undefined,
        businessAddress: businessAddress.trim() || undefined,
        businessType: businessType || undefined,
      });
      setUser({
        ...(user || { id: "1", email }),
        accountType: "business",
        companyName,
        rcNumber,
        tin,
        businessAddress,
        businessType,
      });
      setSuccessMsg("Corporate business profile updated successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to update business profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 pb-10">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Account Profile & Identity
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal representative identity and corporate legal business information.
          </p>
        </div>

        {/* Tab switch */}
        <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "personal"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Identity</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("business")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "business"
                ? "bg-[#32A05F] text-white shadow-sm shadow-[#32A05F]/20"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Corporate / Business Info</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-[#EBF7F0] border border-[#32A05F]/30 text-[#32A05F] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <FormSkeleton fields={5} />
        ) : activeTab === "personal" ? (
          <form
            onSubmit={handleSavePersonal}
            className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Email address cannot be changed for security purposes.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                Phone Number
              </label>
              <PhoneInput
                value={phone}
                onChange={(val) => setPhone(val)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14 Marina Street, Lagos"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 rounded-xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Saving Changes..." : "Save Personal Info"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleSaveBusiness}
            className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Registered Company / Corporate Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PayTrust Global Technologies Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  CAC / RC Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. RC-1849203"
                  value={rcNumber}
                  onChange={(e) => setRcNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Corporate Tax ID (TIN)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 23849102-0001"
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Business Category / Industry
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all cursor-pointer"
              >
                <option value="Technology & Services">Technology & Software Services</option>
                <option value="E-Commerce & Retail">E-Commerce & Retail Supply</option>
                <option value="Construction & Real Estate">Construction & Real Estate</option>
                <option value="Import / Export & Logistics">Import / Export & Logistics</option>
                <option value="Manufacturing & Distribution">Manufacturing & Distribution</option>
                <option value="Professional Consulting & Legal">Professional Consulting & Legal</option>
                <option value="Other Commercial Enterprise">Other Commercial Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Registered Business Operating Address
              </label>
              <input
                type="text"
                placeholder="e.g. Level 4, Victoria Island Commercial Center, Lagos"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 rounded-xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Saving Business Profile..." : "Save Corporate Profile"}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
