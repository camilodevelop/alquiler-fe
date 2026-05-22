"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Propiedad } from "@/modules/propiedades/types";
import { PropiedadesFilters } from "@/modules/propiedades/components/list/propiedades-filters";
import { PropiedadesTable } from "@/modules/propiedades/components/list/propiedades-table";
import { PropiedadesGrid } from "@/modules/propiedades/components/list/propiedades-grid";
import { PropiedadesStats } from "@/modules/propiedades/components/list/propiedades-stats";
import { PropiedadesEmpty } from "@/modules/propiedades/components/list/propiedades-empty";
import {
  PropiedadesToolbar,
  type PropiedadesViewMode,
} from "@/modules/propiedades/components/list/propiedades-toolbar";
import { usePropiedadesList } from "@/modules/propiedades/hooks/use-propiedades-list";
import {
  computePropiedadesStats,
  hasActiveFilters,
} from "@/modules/propiedades/utils/stats";

interface PropiedadesPageClientProps {
  initialData: Propiedad[];
  ciudades: string[];
}

export function PropiedadesPageClient({ initialData, ciudades }: PropiedadesPageClientProps) {
  const [viewMode, setViewMode] = useState<PropiedadesViewMode>("grid");
  const [totalCount] = useState(initialData.length);

  const {
    propiedades,
    filters,
    setFilters,
    error,
    isLoading,
    deletingId,
    handleDelete,
  } = usePropiedadesList(initialData);

  const stats = useMemo(() => computePropiedadesStats(propiedades), [propiedades]);
  const filtersActive = hasActiveFilters(filters);
  const isPortfolioEmpty = totalCount === 0;
  const isFilterEmpty = !isPortfolioEmpty && propiedades.length === 0;

  const clearFilters = () => setFilters({});

  if (isPortfolioEmpty) {
    return <PropiedadesEmpty variant="portfolio" />;
  }

  return (
    <div className="space-y-6">
      <PropiedadesStats stats={stats} filtered={filtersActive} />

      <PropiedadesFilters filters={filters} ciudades={ciudades} onChange={setFilters} />

      <div className="relative space-y-4">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center min-h-[200px] bg-white/70 backdrop-blur-[1px] rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
              <span className="text-xs text-gray-500 font-medium">Actualizando listado…</span>
            </div>
          </div>
        )}

        <PropiedadesToolbar
          count={propiedades.length}
          totalCount={totalCount}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          hasActiveFilters={filtersActive}
        />

        {error ? (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isFilterEmpty ? (
          <PropiedadesEmpty variant="filters" onClearFilters={clearFilters} />
        ) : viewMode === "grid" ? (
          <PropiedadesGrid
            propiedades={propiedades}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        ) : (
          <PropiedadesTable
            propiedades={propiedades}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </div>
    </div>
  );
}
