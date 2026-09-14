"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Building2,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { CountryFlag } from "@/components/ui/CountryFlag";
import {
  PasswordStrengthIndicator,
  checkPasswordCriteria,
} from "@/components/ui/PasswordStrengthIndicator";
import {
  DEFAULT_COUNTRY,
  Country,
  detectUserCountrySync,
  detectUserCountryAsync,
} from "@/data/countries";
import { authService } from "@/services/api";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref") || searchParams.get("referral") || "";

  const [accountType, setAccountType] = useState<"individual" | "business">("individual");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [tin, setTin] = useState("");
  const [businessType, setBusinessType] = useState("Technology & Services");
  const [businessAddress, setBusinessAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>(() => detectUserCountrySync());
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(refParam.toUpperCase());
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (refParam) {
      setReferralCode(refParam.toUpperCase());
    }
  }, [refParam]);

  useEffect(() => {
    detectUserCountryAsync().then((detected) => {
      if (detected) {
        setCountry((prev) => (prev.code === DEFAULT_COUNTRY.code ? detected : prev));
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !phone) {
      setErrorMessage("Please fill in all required contact and security fields.");
      return;
    }

    if (accountType === "business" && !companyName) {
      setErrorMessage("Please enter your registered Company / Entity Name.");
      return;
    }

    const passwordStats = checkPasswordCriteria(password);
    if (!passwordStats.isValid) {
      setErrorMessage(
        "Please provide a secure password (at least 8 characters with uppercase, lowercase, and numbers)."
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      await authService.register({
        accountType,
        email: email.trim().toLowerCase(),
        password,
        firstName,
        lastName,
        phone: phone.trim(),
        country: country.name,
        referralCode: referralCode.trim() || undefined,
        companyName: accountType === "business" ? companyName.trim() : undefined,
        rcNumber: accountType === "business" ? rcNumber.trim() : undefined,
        tin: accountType === "business" ? tin.trim() : undefined,
        businessType: accountType === "business" ? businessType : undefined,
        businessAddress: accountType === "business" ? businessAddress.trim() : undefined,
      });

      router.push(`/register/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err: any) {
      console.error("Registration error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. An account with this email or phone may already exist.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl"
    >
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#32A05F] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Global Escrow Platform
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          Join PayTrust
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {accountType === "business"
            ? "Create a verified corporate account for B2B milestone agreements, automated tax handling, and institutional escrow."
            : "Start trading safely with milestone-protected digital escrow & multi-currency wallets worldwide."}
        </p>
      </div>

      {/* Account Type Selector Tab */}
      <div className="mb-6 p-1 rounded-2xl bg-slate-100 grid grid-cols-2 gap-1 border border-slate-200/80">
        <button
          type="button"
          onClick={() => setAccountType("individual")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            accountType === "individual"
              ? "bg-white text-slate-900 shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal (Individual / P2P)</span>
        </button>
        <button
          type="button"
          onClick={() => setAccountType("business")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            accountType === "business"
              ? "bg-[#32A05F] text-white shadow-sm shadow-[#32A05F]/20"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Corporate (Business / B2B)</span>
        </button>
      </div>

      {errorMessage && (
        <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Corporate Fields (When accountType === 'business') */}
        {accountType === "business" && (
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#32A05F] flex items-center gap-1.5">
              <span>🏢 Business & Corporate Identity</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Registered Company / Entity Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Zenith Tech Solutions Ltd"
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] text-sm font-medium transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  CAC / RC Registration No.
                </label>
                <input
                  type="text"
                  value={rcNumber}
                  onChange={(e) => setRcNumber(e.target.value)}
                  placeholder="e.g. RC-1849203"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] text-sm font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Tax ID (TIN)</span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  placeholder="e.g. 23849102-0001"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Business Category / Industry
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] text-sm font-medium transition-all cursor-pointer"
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
          </div>
        )}

        {/* Authorized Representative / Full Legal Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {accountType === "business" ? "Authorized Representative Name *" : "Full Legal Name *"}
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={accountType === "business" ? "e.g. Tolulope Balogun (MD/CEO)" : "e.g. Tolulope Lanre Balogun"}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {accountType === "business" ? "Official Corporate Email *" : "Email Address *"}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={accountType === "business" ? "finance@company.com" : "you@example.com"}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* International Phone Number */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {accountType === "business" ? "Company / Rep Phone Number *" : "Phone Number *"}
            </label>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <CountryFlag code={country.code} name={country.name} size="sm" />
              <span>{country.name}</span>
            </div>
          </div>
          <PhoneInput
            required
            value={phone}
            onChange={(fullE164, selectedCountry) => {
              setPhone(fullE164);
              setCountry(selectedCountry);
            }}
            onCountryChange={(selectedCountry) => setCountry(selectedCountry)}
          />
        </div>

        {/* Password with Real-time Strength & Criteria */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              className="w-full pl-10 pr-11 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] text-sm font-medium transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <PasswordStrengthIndicator password={password} />
        </div>

        {/* Referral Code */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Referral Code</span>
            <span className="text-slate-400 font-normal lowercase">
              {refParam ? "(applied from invite)" : "(optional)"}
            </span>
          </label>
          <div className="relative">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="e.g. PAY12345"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#32A05F]/20 focus:border-[#32A05F] text-sm font-medium transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl font-bold bg-[#32A05F] hover:bg-[#28874E] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#32A05F]/25 transition-all active:scale-[0.98] disabled:opacity-50 text-sm mt-4 cursor-pointer"
        >
          {isLoading
            ? "Creating Account & Sending OTP..."
            : accountType === "business"
              ? "Create Business Account"
              : "Create Personal Account"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2 justify-center">
        <CheckCircle2 className="w-4 h-4 text-[#32A05F]" /> 256-bit encryption & global escrow security
      </div>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative overflow-hidden">
      <header className="p-6 sm:p-8 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10">
        <Logo size="md" href="/" />
        <Link
          href="/login"
          className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#32A05F] transition-colors"
        >
          Already have an account? <span className="text-[#32A05F]">Log In</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <Suspense fallback={<div className="text-slate-400">Loading form...</div>}>
          <RegisterForm />
        </Suspense>
      </main>

      <footer className="p-6 text-center text-xs text-slate-400 relative z-10">
        By registering, you agree to our Terms of Service and Privacy Policy.
      </footer>
    </div>
  );
}
