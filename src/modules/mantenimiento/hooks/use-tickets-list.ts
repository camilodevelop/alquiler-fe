"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { TicketFilters, TicketMantenimiento } from "../types";
import { mantenimientoService } from "../services/mantenimiento.service";

export function useTicketsList(initialData: TicketMantenimiento[] = []) {
  const [filters, setFilters] = useState<TicketFilters>({});
  const [tickets, setTickets] = useState<TicketMantenimiento[]>(initialData);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const { data, error: err } = await mantenimientoService.getTickets(filters);
      setTickets(data);
      setError(err);
    });
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
  }, [refresh]);

  const allTickets = useMemo(() => initialData, [initialData]);

  return {
    tickets,
    allTickets,
    filters,
    setFilters,
    refresh,
    isLoading: isPending,
    error,
  };
}
