"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { ContractFilters, ContractListItem } from "../types";
import { contractService } from "../services/contracts.service";

export function useContractsList(initialData: ContractListItem[] = []) {
  const [filters, setFilters] = useState<ContractFilters>({});
  const [contracts, setContracts] = useState<ContractListItem[]>(initialData);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const { data, error: err } = await contractService.getContracts(filters);
      setContracts(data);
      setError(err);
    });
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
  }, [refresh]);

  const allContracts = useMemo(() => initialData, [initialData]);

  return {
    contracts,
    allContracts,
    filters,
    setFilters,
    refresh,
    isLoading: isPending,
    error,
  };
}
