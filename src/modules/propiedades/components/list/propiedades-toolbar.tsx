"use client";

import { LayoutGrid, List } from "lucide-react";

export type PropiedadesViewMode = "grid" | "table";

interface PropiedadesToolbarProps {
  count: number;
  totalCount: number;
  viewMode: PropiedadesViewMode;
  onViewModeChange: (mode: PropiedadesViewMode) => void;
  hasActiveFilters: boolean;
}

export function PropiedadesToolbar({
  count,
  totalCount,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
}: PropiedadesToolbarProps) {
  const countLabel =
    hasActiveFilters && count !== totalCount
      ? `${count} de ${totalCount} propiedades`
      : count === 1
        ? "1 propiedad"
        : `${count} propiedades`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-900">{countLabel}</span>
        {hasActiveFilters ? (
          <span className="text-gray-400"> · filtros activos</span>
        ) : null}
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
