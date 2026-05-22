"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Users } from "lucide-react";
import type { Propiedad } from "@/modules/propiedades/types";
import type { Manitas, TicketMantenimiento, TicketTabId } from "@/modules/mantenimiento/types";
import { useTicketsList } from "@/modules/mantenimiento/hooks/use-tickets-list";
import { filterTickets, hasActiveTicketFilters } from "@/modules/mantenimiento/utils/filters";
import { TicketsIncidentsPanel } from "@/modules/mantenimiento/components/list/tickets-incidents-panel";
import { TicketsEmpty } from "@/modules/mantenimiento/components/list/tickets-empty";
import { AssignTicketDialog } from "@/modules/mantenimiento/components/assign-ticket-dialog";
import { Button } from "@/components/ui";

export function MantenimientoPageClient({
  initialData,
  propiedades,
  manitasList,
  assignableManitas,
  dbError,
}: {
  initialData: TicketMantenimiento[];
  propiedades: Propiedad[];
  manitasList: Manitas[];
  assignableManitas: Manitas[];
  dbError?: string;
}) {
  const [activeTab, setActiveTab] = useState<TicketTabId>("todos");
  const { tickets, allTickets, filters, setFilters, isLoading, error, refresh } =
    useTicketsList(initialData);

  const [assignTicket, setAssignTicket] = useState<TicketMantenimiento | null>(null);

  const sourceList = allTickets.length ? allTickets : tickets;

  const filteredBySearch = useMemo(
    () => filterTickets(sourceList, { ...filters, estado: "" }),
    [sourceList, filters],
  );

  const filtersActive = hasActiveTicketFilters({ ...filters, estado: "" });
  const isEmpty = !dbError && initialData.length === 0 && !filtersActive;

  const handleAssignSuccess = useCallback(() => {
    refresh();
    setAssignTicket(null);
  }, [refresh]);

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <TicketsEmpty variant="empty" />
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {(isLoading || dbError) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 rounded-2xl min-h-[200px]">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-brand-600" />}
        </div>
      )}

      <div className="flex justify-end">
        <Link href="/dashboard/mantenimiento/maestros">
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Users size={14} />
            Equipo manitas
          </Button>
        </Link>
      </div>

      {(error || dbError) && (
        <p className="text-sm text-red-600 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          {error ?? dbError}
        </p>
      )}

      <TicketsIncidentsPanel
        allTickets={sourceList}
        filteredBySearch={filteredBySearch}
        filters={filters}
        onFiltersChange={setFilters}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        propiedades={propiedades}
        manitasList={manitasList}
        onAssign={setAssignTicket}
        onRefresh={refresh}
      />

      <AssignTicketDialog
        ticket={assignTicket}
        manitasList={assignableManitas}
        open={!!assignTicket}
        onClose={() => setAssignTicket(null)}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
}
