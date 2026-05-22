"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Loader2, Settings2 } from "lucide-react";
import type { Propiedad } from "@/modules/propiedades/types";
import type { Inquilino } from "@/modules/inquilinos/types";
import type { ContractListItem, ContractTemplate } from "@/modules/contratos/types";
import { useContractsList } from "@/modules/contratos/hooks/use-contracts-list";
import { computeContractsStats } from "@/modules/contratos/utils/stats";
import { hasActiveFilters } from "@/modules/contratos/utils/filters";
import { ContractsStats } from "@/modules/contratos/components/list/contracts-stats";
import { ContractsFilters } from "@/modules/contratos/components/list/contracts-filters";
import { ContractsTable } from "@/modules/contratos/components/list/contracts-table";
import { ContractsEmpty } from "@/modules/contratos/components/list/contracts-empty";
import { Button } from "@/components/ui";

export function ContratosPageClient({
  initialData,
  propiedades,
  inquilinos,
  templates,
  dbError,
}: {
  initialData: ContractListItem[];
  propiedades: Propiedad[];
  inquilinos: Inquilino[];
  templates: ContractTemplate[];
  dbError?: string;
}) {
  const { contracts, allContracts, filters, setFilters, isLoading, error } =
    useContractsList(initialData);

  const stats = useMemo(() => computeContractsStats(allContracts), [allContracts]);
  const filtersActive = hasActiveFilters(filters);
  const isEmpty = !dbError && initialData.length === 0 && !filtersActive;
  const isFilterEmpty = !isEmpty && contracts.length === 0;

  if (isEmpty) {
    return <ContractsEmpty variant="empty" />;
  }

  return (
    <div className="space-y-6 relative">
      {(isLoading || dbError) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-2xl min-h-[120px] pointer-events-none">
          {isLoading && <Loader2 className="h-7 w-7 animate-spin text-brand-600" />}
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2 -mt-2">
        <Link href="/dashboard/contratos/tipos">
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Settings2 size={14} />
            Tipos de contrato
          </Button>
        </Link>
      </div>

      {(error || dbError) && (
        <p className="text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 px-4 py-2">
          {error ?? dbError}
        </p>
      )}

      <ContractsStats stats={stats} />
      <ContractsFilters
        filters={filters}
        propiedades={propiedades}
        inquilinos={inquilinos}
        templates={templates}
        onChange={setFilters}
      />

      {isFilterEmpty ? (
        <ContractsEmpty variant="filters" onClearFilters={() => setFilters({})} />
      ) : (
        <ContractsTable contracts={contracts} />
      )}
    </div>
  );
}
