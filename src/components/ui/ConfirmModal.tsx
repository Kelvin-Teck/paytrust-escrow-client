"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, AlertOctagon, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "success";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "warning",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, isLoading, onCancel]);

  // Prevent background scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const iconConfig = {
    danger: {
      bg: "bg-rose-50 text-rose-600 border border-rose-100",
      btn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
      icon: <AlertOctagon className="w-7 h-7 text-rose-600" />,
    },
    warning: {
      bg: "bg-amber-50 text-amber-600 border border-amber-100",
      btn: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20",
      icon: <AlertTriangle className="w-7 h-7 text-amber-600" />,
    },
    success: {
      bg: "bg-[#EBF7F0] text-[#32A05F] border border-[#32A05F]/20",
      btn: "bg-[#32A05F] hover:bg-[#28874E] text-white shadow-[#32A05F]/20",
      icon: <CheckCircle2 className="w-7 h-7 text-[#32A05F]" />,
    },
  }[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          aria-modal="true"
          role="dialog"
          aria-labelledby="confirm-modal-title"
        >
          {/* Dimmed & Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => {
              if (!isLoading) onCancel();
            }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10"
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content Body */}
            <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
              {/* Icon Circle */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${iconConfig.bg}`}
              >
                {iconConfig.icon}
              </div>

              <h2
                id="confirm-modal-title"
                className="text-lg font-bold text-slate-900 mb-2"
              >
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 pb-6 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all focus:outline-none disabled:opacity-60 flex items-center justify-center gap-2 ${iconConfig.btn}`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>Processing…</span>
                  </>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

