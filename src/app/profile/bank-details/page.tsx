"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  Search,
  Check,
  ShieldCheck,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { profileService } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";

interface BankItem {
  id?: number | string;
  name: string;
  code?: string;
  slug?: string;
}

export default function BankDetailsPage() {
  const { setUser } = useAuthStore();
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setIsLoadingBanks(true);

    // 1. Fetch live banks from backend (Paystack API)
    profileService
      .getBanks()
      .then((data) => {
        const bankList = Array.isArray(data)
          ? data
          : Array.isArray(data?.banks)
            ? data.banks
            : [];

        let normalizedList: BankItem[] = [];
        if (bankList.length > 0) {
          normalizedList = bankList.map((item: any) =>
            typeof item === "string"
              ? { name: item }
              : {
                  id: item.id,
                  name: item.name,
                  code: item.code,
                  slug: item.slug,
                },
          );
          setBanks(normalizedList);
        }

        // 2. Fetch user's current saved bank details
        profileService
          .getProfile()
          .then((p) => {
            const bank = p?.bankAccount || p?.bankDetails;
            if (bank) {
              setBankName(bank.bankName || "");
              setAccountNumber(bank.accountNumber || "");
              setAccountName(bank.accountName || "");
              if (bank.accountName) {
                setIsVerified(true);
              }
              // Match bank code from bank list
              const matched = normalizedList.find(
                (b) =>
                  b.name.toLowerCase() === (bank.bankName || "").toLowerCase(),
              );
              if (matched?.code) {
                setBankCode(matched.code);
              }
            }
          })
          .catch((err) => {
            console.error("Failed to load profile bank details", err);
          })
          .finally(() => {
            setIsLoading(false);
          });
      })
      .catch((err) => {
        console.error("Failed to fetch live banks from backend", err);
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoadingBanks(false);
      });
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Real-time automatic account verification when 10 digits and bank are selected
  useEffect(() => {
    const cleanAccount = accountNumber.trim().replace(/\D/g, "");

    if (cleanAccount.length === 10 && bankCode) {
      setIsResolving(true);
      setResolveError(null);

      profileService
        .resolveBankAccount(cleanAccount, bankCode)
        .then((res: any) => {
          const resolvedName = res?.accountName || res?.account_name;
          if (resolvedName) {
            setAccountName(resolvedName);
            setIsVerified(true);
            setResolveError(null);
          } else {
            setIsVerified(false);
            setResolveError(
              "Could not verify account name with selected bank.",
            );
          }
        })
        .catch((err: any) => {
          setIsVerified(false);
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Could not verify account number with selected bank.";
          setResolveError(msg);
        })
        .finally(() => {
          setIsResolving(false);
        });
    } else {
      if (cleanAccount.length < 10) {
        setIsVerified(false);
        setResolveError(null);
      }
    }
  }, [accountNumber, bankCode]);

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()),
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setStatusMsg({
        type: "error",
        text: "Please fill in all bank account details.",
      });
      return;
    }

    setIsSaving(true);
    setStatusMsg(null);

    try {
      const res = await profileService.updateBankDetails({
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
      });

      // Refresh live profile to sync state and KYC step
      const freshProfile = await profileService.getProfile();
      if (freshProfile) setUser(freshProfile);

      setStatusMsg({
        type: "success",
        text: "Bank payout account saved successfully!",
      });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      const errorDetail =
        err.response?.data?.message ||
        err.message ||
        "Failed to update bank details";
      setStatusMsg({ type: "error", text: errorDetail });
    } finally {
      setIsSaving(false);
    }
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
          <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F]">
            Payout Settings
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Bank Payout Account
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Where your released escrow funds and NGN withdrawals will be
            automatically settled.
          </p>
        </div>

        {statusMsg && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
              statusMsg.type === "success"
                ? "bg-[#EBF7F0] border-[#32A05F]/30 text-[#32A05F]"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {isLoading ? (
          <div className="p-12 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#32A05F]" />
            <p className="text-xs font-medium">
              Loading bank account details...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSave}
            className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5"
          >
            {/* Custom Bank Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Bank Name
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setBankSearch("");
                }}
                className={`w-full px-4 py-3.5 rounded-xl bg-slate-50 border text-left text-sm flex items-center justify-between transition-all ${
                  isDropdownOpen
                    ? "bg-white border-[#32A05F] ring-2 ring-[#32A05F]/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <span
                    className={
                      bankName
                        ? "text-slate-900 font-medium truncate"
                        : "text-slate-400"
                    }
                  >
                    {bankName || "Select your bank..."}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180 text-[#32A05F]" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search banks..."
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        autoFocus
                        className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#32A05F]"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                    {isLoadingBanks ? (
                      <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#32A05F]" />
                        <span>Fetching live bank directory...</span>
                      </div>
                    ) : filteredBanks.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No bank found matching &ldquo;{bankSearch}&rdquo;
                      </div>
                    ) : (
                      filteredBanks.map((bank) => {
                        const isSelected = bankName === bank.name;
                        return (
                          <button
                            type="button"
                            key={bank.code || bank.name}
                            onClick={() => {
                              setBankName(bank.name);
                              setBankCode(bank.code || "");
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                              isSelected
                                ? "bg-[#EBF7F0] text-[#32A05F] font-bold"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span className="truncate">{bank.name}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#32A05F] shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Account Number (10-Digit NUBAN)
              </label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="0123456789"
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(e.target.value.replace(/\D/g, ""))
                }
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono tracking-wider focus:bg-white focus:outline-none focus:border-[#32A05F] focus:ring-2 focus:ring-[#32A05F]/20 transition-all placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter your 10-digit NUBAN account number for automatic name
                verification.
              </p>
            </div>

            {/* Account Name with Automatic Verification Status */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Account Name
                </label>
                {isResolving && (
                  <span className="text-[11px] font-semibold text-[#32A05F] flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying with Paystack...</span>
                  </span>
                )}
                {isVerified && !isResolving && (
                  <span className="text-[11px] font-bold text-[#32A05F] bg-[#EBF7F0] px-2 py-0.5 rounded-md border border-[#32A05F]/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Account
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={
                    isResolving
                      ? "Resolving account name..."
                      : !bankCode
                        ? "Select bank & enter account number"
                        : "e.g. John Doe"
                  }
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className={`w-full px-4 py-3.5 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-[#32A05F] focus:ring-2 focus:ring-[#32A05F]/20 transition-all placeholder:text-slate-400 ${
                    isVerified
                      ? "border-[#32A05F]/50 bg-[#EBF7F0]/20 font-bold"
                      : "border-slate-200"
                  }`}
                />
              </div>

              {resolveError && (
                <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{resolveError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving || isResolving}
              className="w-full py-4 rounded-xl font-bold bg-[#32A05F] hover:bg-[#28874E] active:scale-[0.98] text-white text-sm shadow-md shadow-[#32A05F]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Payout Account...</span>
                </>
              ) : (
                <span>Save Payout Account</span>
              )}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
