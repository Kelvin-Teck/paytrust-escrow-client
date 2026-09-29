"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown, Check } from "lucide-react";
import { ExportColumn, exportToExcel, exportToCsv } from "@/lib/exportUtils";

interface ExportTableButtonProps<T = any> {
  data: T[];
  columns: ExportColumn<T>[];
  filenamePrefix?: string;
  label?: string;
}

export default function ExportTableButton<T = any>({
  data,
  columns,
  filenamePrefix = "paytrust-export",
  label = "Export",
}: ExportTableButtonProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<"excel" | "csv" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportExcel = () => {
    if (data.length === 0) return;
    const ok = exportToExcel(data, columns, filenamePrefix);
    if (ok) {
      setDownloadSuccess("excel");
      setTimeout(() => {
        setDownloadSuccess(null);
        setIsOpen(false);
      }, 1200);
    }
  };

  const handleExportCsv = () => {
    if (data.length === 0) return;
    const ok = exportToCsv(data, columns, filenamePrefix);
    if (ok) {
      setDownloadSuccess("csv");
      setTimeout(() => {
        setDownloadSuccess(null);
        setIsOpen(false);
      }, 1200);
    }
  };

  const isEmpty = !data || data.length === 0;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={isEmpty}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        title={isEmpty ? "No data to export" : "Export table data"}
      >
        <Download className="w-3.5 h-3.5 text-slate-500" />
        <span>{label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-900/10 z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Export Format
            </p>
            <p className="text-[10px] text-slate-400">
              {data.length} {data.length === 1 ? "record" : "records"} ready
            </p>
          </div>

          <div className="p-1 space-y-0.5">
            <button
              type="button"
              onClick={handleExportExcel}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-emerald-800 text-xs">
                    Excel Spreadsheet
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">.xlsx</div>
                </div>
              </div>
              {downloadSuccess === "excel" && (
                <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in duration-150" />
              )}
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-800 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-blue-800 text-xs">
                    CSV Document
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">.csv</div>
                </div>
              </div>
              {downloadSuccess === "csv" && (
                <Check className="w-4 h-4 text-blue-600 animate-in zoom-in duration-150" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
