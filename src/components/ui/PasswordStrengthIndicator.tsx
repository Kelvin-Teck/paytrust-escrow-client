"use client";

import React, { useMemo } from "react";
import { Check, X, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface PasswordCriteria {
  label: string;
  met: boolean;
}

export function checkPasswordCriteria(password: string) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const criteria: PasswordCriteria[] = [
    { label: "At least 8 characters", met: hasMinLength },
    { label: "One uppercase letter (A-Z)", met: hasUppercase },
    { label: "One lowercase letter (a-z)", met: hasLowercase },
    { label: "One number (0-9)", met: hasNumber },
    { label: "One special character (!@#$)", met: hasSpecial },
  ];

  const metCount = criteria.filter((c) => c.met).length;

  let strengthLabel = "Weak";
  let strengthColor = "bg-rose-500";
  let textColor = "text-rose-600";
  let progressPercentage = 20;

  if (metCount === 0) {
    strengthLabel = "Enter password";
    strengthColor = "bg-slate-200";
    textColor = "text-slate-400";
    progressPercentage = 0;
  } else if (metCount <= 2) {
    strengthLabel = "Weak";
    strengthColor = "bg-rose-500";
    textColor = "text-rose-600";
    progressPercentage = 30;
  } else if (metCount === 3) {
    strengthLabel = "Fair";
    strengthColor = "bg-amber-500";
    textColor = "text-amber-600";
    progressPercentage = 60;
  } else if (metCount === 4) {
    strengthLabel = "Good";
    strengthColor = "bg-teal-500";
    textColor = "text-teal-600";
    progressPercentage = 80;
  } else if (metCount === 5) {
    strengthLabel = "Strong & Secure";
    strengthColor = "bg-[#32A05F]";
    textColor = "text-[#32A05F]";
    progressPercentage = 100;
  }

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  return {
    criteria,
    metCount,
    strengthLabel,
    strengthColor,
    textColor,
    progressPercentage,
    isValid,
    isStrong: metCount === 5,
  };
}

interface PasswordStrengthIndicatorProps {
  password: string;
  showWhenEmpty?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showWhenEmpty = false,
}) => {
  const stats = useMemo(() => checkPasswordCriteria(password), [password]);

  if (!password && !showWhenEmpty) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-2.5 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2.5"
    >
      {/* Strength Bar & Label */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600 flex items-center gap-1.5">
          {stats.metCount >= 4 ? (
            <ShieldCheck className="w-3.5 h-3.5 text-[#32A05F]" />
          ) : stats.metCount >= 3 ? (
            <Shield className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          )}
          Password Strength:
        </span>
        <span className={`font-bold text-[11px] ${stats.textColor}`}>
          {stats.strengthLabel}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-5 gap-1.5 h-1.5">
        {[1, 2, 3, 4, 5].map((level) => {
          const isFilled = stats.metCount >= level;
          return (
            <div
              key={level}
              className={`h-full rounded-full transition-all duration-300 ${
                isFilled ? stats.strengthColor : "bg-slate-200"
              }`}
            />
          );
        })}
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
        {stats.criteria.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 text-[11px] transition-colors duration-200 ${
              item.met
                ? "text-emerald-700 font-semibold"
                : "text-slate-400 font-normal"
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                item.met
                  ? "bg-emerald-100 text-[#32A05F]"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              {item.met ? (
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              ) : (
                <span className="w-1 h-1 rounded-full bg-slate-400" />
              )}
            </div>
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

