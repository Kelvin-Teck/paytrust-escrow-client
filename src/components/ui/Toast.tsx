"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let listeners: ToastListener[] = [];

const notify = () => {
  listeners.forEach((l) => l([...toasts]));
};

export const toast = {
  success: (message: string, description?: string, duration = 4000) => {
    toast.add({ type: "success", message, description, duration });
  },
  error: (message: string, description?: string, duration = 5000) => {
    toast.add({ type: "error", message, description, duration });
  },
  info: (message: string, description?: string, duration = 4000) => {
    toast.add({ type: "info", message, description, duration });
  },
  warning: (message: string, description?: string, duration = 4500) => {
    toast.add({ type: "warning", message, description, duration });
  },
  add: (item: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...item, id };
    toasts = [...toasts, newToast];
    notify();

    if (item.duration !== Infinity) {
      setTimeout(() => {
        toast.dismiss(id);
      }, item.duration || 4000);
    }
  },
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
};

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<ToastItem[]>(() => [...toasts]);

  useEffect(() => {
    setCurrentToasts([...toasts]);
    const listener = (updated: ToastItem[]) => setCurrentToasts(updated);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div
      id="paytrust-toast-container"
      className="fixed top-5 right-5 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence>
        {currentToasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-start gap-3 relative overflow-hidden ${
              t.type === "success"
                ? "bg-white/95 border-[#32A05F]/30 text-slate-900 shadow-[#32A05F]/10"
                : t.type === "error"
                  ? "bg-white/95 border-rose-200 text-slate-900 shadow-rose-500/10"
                  : t.type === "warning"
                    ? "bg-white/95 border-amber-200 text-slate-900 shadow-amber-500/10"
                    : "bg-white/95 border-blue-200 text-slate-900 shadow-blue-500/10"
            }`}
          >
            {/* Left Icon */}
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && (
                <div className="w-7 h-7 rounded-xl bg-[#EBF7F0] text-[#32A05F] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {t.type === "error" && (
                <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              {t.type === "warning" && (
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              {t.type === "info" && (
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pr-4">
              <p className="text-xs font-bold text-slate-900 leading-snug">
                {t.message}
              </p>
              {t.description && (
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {t.description}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => toast.dismiss(t.id)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ToastContainer;
