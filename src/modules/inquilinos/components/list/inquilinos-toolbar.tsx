"use client";

import { LayoutGrid, List } from "lucide-react";

export type InquilinosViewMode = "grid" | "table";

export function InquilinosToolbar({
  count,
  viewMode,
  onViewModeChange,
}: {
  count: number;
  viewMode: InquilinosViewMode;
  onViewModeChange: (m: InquilinosViewMode) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-900">
          {count === 1 ? "1 inquilino" : `${count} inquilinos`}
        </span>
      </p>
      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50/80 p-0.5 self-start">
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
            viewMode === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
          }`}
        >
          <LayoutGrid size={15} /> Tarjetas
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("table")}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
            viewMode === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
          }`}
        >
          <List size={15} /> Tabla
        </button>
      </div>
    </div>
  );
}
