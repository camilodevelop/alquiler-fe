"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Propiedad } from "@/modules/propiedades/types";
import type { Inquilino } from "@/modules/inquilinos/types";
import { InquilinosFilters } from "@/modules/inquilinos/components/list/inquilinos-filters";
import { InquilinosGrid } from "@/modules/inquilinos/components/list/inquilinos-grid";
import { InquilinosTable } from "@/modules/inquilinos/components/list/inquilinos-table";
import { InquilinosStats } from "@/modules/inquilinos/components/list/inquilinos-stats";
import { InquilinosEmpty } from "@/modules/inquilinos/components/list/inquilinos-empty";
import { InquilinosToolbar, type InquilinosViewMode } from "@/modules/inquilinos/components/list/inquilinos-toolbar";
import { useInquilinosList } from "@/modules/inquilinos/hooks/use-inquilinos-list";
import { computeInquilinosStats } from "@/modules/inquilinos/utils/stats";
import { hasActiveFilters } from "@/modules/inquilinos/utils/filters";

export function InquilinosPageClient({
  initialData,
  propiedades,
  dbError,
}: {
  initialData: Inquilino[];
  propiedades: Propiedad[];
  dbError?: string;
}) {
  const [viewMode, setViewMode] = useState<InquilinosViewMode>("grid");

  const {
    inquilinos,
    filters,
    setFilters,
    error,
    isLoading,
    handleDeactivate,
  } = useInquilinosList(initialData);

  const stats = useMemo(() => computeInquilinosStats(inquilinos), [inquilinos]);
  const filtersActive = hasActiveFilters(filters);
  const isEmpty = !dbError && initialData.length === 0 && !filtersActive;
  const isFilterEmpty = !isEmpty && inquilinos.length === 0;

  if (isEmpty) {
    return <InquilinosEmpty variant="empty" />;
  }

  return (
    <div className="space-y-6 relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-2xl min-h-[120px]">
          <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
        </div>
      )}

      <InquilinosStats stats={stats} />
      <InquilinosFilters filters={filters} propiedades={propiedades} onChange={setFilters} />
      <InquilinosToolbar count={inquilinos.length} viewMode={viewMode} onViewModeChange={setViewMode} />

      {(error || dbError) && (
        <p className="text-sm text-red-600">{error ?? dbError}</p>
      )}

      {isFilterEmpty ? (
        <InquilinosEmpty variant="filters" onClearFilters={() => setFilters({})} />
      ) : viewMode === "grid" ? (
        <InquilinosGrid inquilinos={inquilinos} onDeactivate={handleDeactivate} />
      ) : (
        <>
          <div className="md:hidden">
            <InquilinosGrid inquilinos={inquilinos} onDeactivate={handleDeactivate} />
          </div>
          <InquilinosTable inquilinos={inquilinos} onDeactivate={handleDeactivate} />
        </>
      )}
    </div>
  );
}
