"use client";

import { LayoutGrid, List } from "lucide-react";

export type ManitasViewMode = "grid" | "table";

export function ManitasToolbar({
  count,
  viewMode,
  onViewModeChange,
}: {
  count: number;
  viewMode: ManitasViewMode;
  onViewModeChange: (m: ManitasViewMode) => void;
}) {
  const countLabel = count === 1 ? "1 técnico" : `${count} técnicos`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100">
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-900">{countLabel}</span>
      </p>

      <div
        className="inline-flex self-start sm:self-auto rounded-lg border border-gray-200 bg-gray-50/80 p-0.5"
        role="tablist"
        aria-label="Vista del listado"
      >
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "grid"}
          onClick={() => onViewModeChange("grid")}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            viewMode === "grid"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <LayoutGrid size={15} />
          Tarjetas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "table"}
          onClick={() => onViewModeChange("table")}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            viewMode === "table"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <List size={15} />
          Tabla
        </button>
      </div>
    </div>
  );
}
