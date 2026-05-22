"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { propiedadesService } from "../services/propiedades.service";
import type { Propiedad, PropiedadFilters } from "../types";

export function usePropiedadesList(initialData: Propiedad[], initialFilters: PropiedadFilters = {}) {
  const [propiedades, setPropiedades] = useState<Propiedad[]>(initialData);
  const [filters, setFilters] = useState<PropiedadFilters>(initialFilters);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchList = useCallback((nextFilters: PropiedadFilters) => {
    startTransition(async () => {
      const { data, error: fetchError } = await propiedadesService.list(nextFilters);
      if (fetchError) {
        setError(fetchError);
        return;
      }
      setError(null);
      setPropiedades(data);
    });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchList(filters), 300);
    return () => clearTimeout(timeout);
  }, [filters, fetchList]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta propiedad? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    const { error: deleteError } = await propiedadesService.remove(id);
    setDeletingId(null);
    if (deleteError) {
      setError(deleteError);
      return;
    }
    fetchList(filters);
  };

  return {
    propiedades,
    filters,
    setFilters,
    error,
    isLoading: isPending,
    deletingId,
    handleDelete,
  };
}
