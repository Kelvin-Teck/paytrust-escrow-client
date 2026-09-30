"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export default function TablePagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel = "records",
  className = "",
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 ${className}`}
    >
      {/* Left side: Record count summary */}
      <div className="flex items-center gap-2">
        <span>
          Showing{" "}
          <strong className="text-slate-900 font-bold">{startItem}</strong> to{" "}
          <strong className="text-slate-900 font-bold">{endItem}</strong> of{" "}
          <strong className="text-slate-900 font-bold">{totalItems}</strong> {itemLabel}
        </span>

        {/* Page size dropdown */}
        {onPageSizeChange && pageSizeOptions.length > 1 && (
          <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-200">
            <span className="text-slate-500 text-[11px]">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#32A05F]"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Page navigation */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium cursor-pointer"
          title="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-slate-400 font-medium select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === safeCurrentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#32A05F] text-white shadow-2xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium cursor-pointer"
          title="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
