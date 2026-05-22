"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { inquilinosService } from "../services/inquilinos.service";
import type { Inquilino, InquilinoFilters } from "../types";

export function useInquilinosList(initialData: Inquilino[]) {
  const [inquilinos, setInquilinos] = useState<Inquilino[]>(initialData);
  const [filters, setFilters] = useState<InquilinoFilters>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchList = useCallback((nextFilters: InquilinoFilters) => {
    startTransition(async () => {
      const { data, error: fetchError } = await inquilinosService.getTenants(nextFilters);
      if (fetchError) {
        setError(fetchError);
        return;
      }
      setError(null);
      setInquilinos(data);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchList(filters), 250);
    return () => clearTimeout(t);
  }, [filters, fetchList]);

  const handleDeactivate = async (id: string) => {
    if (!confirm("¿Desactivar este inquilino? Pasará a estado Inactivo.")) return;
    const { error: err } = await inquilinosService.deleteTenant(id);
    if (err) {
      setError(err);
      return;
    }
    fetchList(filters);
  };

  return {
    inquilinos,
    filters,
    setFilters,
    error,
    isLoading: isPending,
    handleDeactivate,
  };
}
