"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/hooks/use-pagination";

export function TablePagination({
  page,
  pageSize,
  totalPages,
  total,
  rangeStart,
  rangeEnd,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}: {
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: readonly number[];
}) {
  if (total === 0) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pageButtons = (): number[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  };

  const visible = pageButtons();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-3.5 border-t border-gray-100 bg-slate-50/50">
      <p className="text-xs text-gray-500 order-2 sm:order-1">
        Mostrando{" "}
        <span className="font-semibold text-gray-700 tabular-nums">
          {rangeStart}–{rangeEnd}
        </span>{" "}
        de <span className="font-semibold text-gray-700 tabular-nums">{total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-3 order-1 sm:order-2">
        <label className="flex items-center gap-2 text-xs text-gray-500">
          Filas
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <nav className="flex items-center gap-1" aria-label="Paginación">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>

          {visible.map((p, idx) => {
            const prev = visible[idx - 1];
            const showEllipsis = prev != null && p - prev > 1;
            return (
              <span key={p} className="flex items-center gap-1">
                {showEllipsis && (
                  <span className="px-1 text-gray-400 text-xs select-none">…</span>
                )}
                <button
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={[
                    "min-w-[2rem] h-8 px-2 rounded-lg text-xs font-semibold tabular-nums transition-colors",
                    p === page
                      ? "bg-brand-600 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
                  ].join(" ")}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
              </span>
            );
          })}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      </div>
    </div>
  );
}
