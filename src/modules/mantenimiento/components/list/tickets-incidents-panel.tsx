"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Propiedad } from "@/modules/propiedades/types";
import { sortPropiedadesByTitulo } from "@/modules/propiedades/utils/sort";
import {
  TICKET_ESTADO_CONFIG,
  TICKET_ESTADO_TAB_ORDER,
  TICKET_ESTADO_TAB_STYLES,
  TICKET_TIPOS_OPTIONS,
  TICKET_URGENCIAS_OPTIONS,
} from "../../constants";
import type { Manitas, TicketEstado, TicketFilters, TicketMantenimiento, TicketTabId } from "../../types";
import { filterTickets, hasActiveTicketFilters } from "../../utils/filters";
import { computeTicketsStats, countTicketsByEstado } from "../../utils/stats";
import { mantenimientoService } from "../../services/mantenimiento.service";
import { ChangeStatusDialog } from "../change-status-dialog";
import { TicketsIncidentCard } from "./tickets-incident-card";
import { TicketsEmpty } from "./tickets-empty";

const selectClass =
  "h-9 text-sm border-0 bg-gray-100 rounded-lg px-3 text-gray-700 focus:ring-2 focus:ring-brand-500/25 focus:bg-white";

export function TicketsIncidentsPanel({
  allTickets,
  filteredBySearch,
  filters,
  onFiltersChange,
  activeTab,
  onTabChange,
  propiedades,
  manitasList,
  onAssign,
  onRefresh,
}: {
  allTickets: TicketMantenimiento[];
  filteredBySearch: TicketMantenimiento[];
  filters: TicketFilters;
  onFiltersChange: (f: TicketFilters) => void;
  activeTab: TicketTabId;
  onTabChange: (tab: TicketTabId) => void;
  propiedades: Propiedad[];
  manitasList: Manitas[];
  onAssign: (t: TicketMantenimiento) => void;
  onRefresh: () => void;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resolveTicket, setResolveTicket] = useState<TicketMantenimiento | null>(null);

  const counts = useMemo(() => countTicketsByEstado(allTickets), [allTickets]);
  const stats = useMemo(() => computeTicketsStats(allTickets), [allTickets]);

  const visibleTickets = useMemo(
    () =>
      filterTickets(filteredBySearch, {
        ...filters,
        estado: activeTab === "todos" ? "" : activeTab,
      }),
    [filteredBySearch, filters, activeTab],
  );

  const hasSecondaryFilters = hasActiveTicketFilters({ ...filters, estado: "" });

  const setFilter = (patch: Partial<TicketFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  const clearFilters = () => {
    onTabChange("todos");
    onFiltersChange({});
  };

  const handleQuickStatus = async (ticket: TicketMantenimiento, estado: TicketEstado) => {
    if (estado === "resuelto") {
      setResolveTicket(ticket);
      return;
    }
    setUpdatingId(ticket.id);
    await mantenimientoService.changeStatus(ticket.id, estado);
    setUpdatingId(null);
    onRefresh();
  };

  const TAB_ACTIVE_CLASS: Record<TicketTabId, string> = {
    todos: "border-gray-900 text-gray-900",
    nuevo: "border-sky-500 text-sky-800",
    asignado: "border-violet-500 text-violet-800",
    en_proceso: "border-amber-500 text-amber-900",
    resuelto: "border-emerald-500 text-emerald-800",
    cerrado: "border-gray-400 text-gray-700",
    cancelado: "border-gray-300 text-gray-600",
  };

  const tabs: { id: TicketTabId; label: string; count: number; dot?: string }[] = [
    { id: "todos", label: "Todos", count: counts.todos },
    ...TICKET_ESTADO_TAB_ORDER.map((estado) => ({
      id: estado as TicketTabId,
      label: TICKET_ESTADO_CONFIG[estado].label,
      count: counts[estado],
      dot: TICKET_ESTADO_TAB_STYLES[estado].dot,
    })),
  ];

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
      {/* Barra de métricas */}
      <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50/80 via-white to-amber-50/30 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
        <span>
          <strong className="text-gray-900 font-semibold tabular-nums">{stats.total}</strong> incidentes
        </span>
        <span className="hidden sm:inline text-gray-300">|</span>
        <span>
          <strong className="text-brand-700 tabular-nums">{stats.abiertos}</strong> abiertos
        </span>
        <span>
          <strong className="text-violet-700 tabular-nums">{stats.enProceso}</strong> en curso
        </span>
        {stats.criticos > 0 && (
          <span className="text-red-700 font-medium">
            {stats.criticos} crítico{stats.criticos !== 1 ? "s" : ""}
          </span>
        )}
        {stats.sinAsignar > 0 && (
          <span className="text-amber-700 font-medium">{stats.sinAsignar} sin asignar</span>
        )}
      </div>

      {/* Tabs de estado — estilo pipeline */}
      <div
        className="flex overflow-x-auto border-b border-gray-200 scrollbar-thin"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              title={
                tab.id === "todos"
                  ? "Todos los incidentes"
                  : TICKET_ESTADO_CONFIG[tab.id as TicketEstado]?.description
              }
              onClick={() => onTabChange(tab.id)}
              className={[
                "relative shrink-0 flex items-center gap-2 px-4 sm:px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                isActive
                  ? `${TAB_ACTIVE_CLASS[tab.id]} bg-white`
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50/80",
              ].join(" ")}
            >
              {tab.dot && (
                <span className={`h-2 w-2 rounded-full shrink-0 ${tab.dot}`} aria-hidden />
              )}
              <span className="whitespace-nowrap">{tab.label}</span>
              <span
                className={[
                  "tabular-nums text-xs font-bold rounded-full min-w-[1.35rem] h-5 flex items-center justify-center px-1.5",
                  isActive ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600",
                ].join(" ")}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="p-4 sm:p-5 border-b border-gray-100 space-y-3 bg-gray-50/40">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="search"
              value={filters.search ?? ""}
              onChange={(e) => setFilter({ search: e.target.value })}
              placeholder="Buscar por código, título, propiedad o inquilino..."
              className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <select
              value={filters.urgencia ?? ""}
              onChange={(e) =>
                setFilter({ urgencia: (e.target.value || undefined) as TicketFilters["urgencia"] })
              }
              className={`${selectClass} min-w-[120px]`}
              aria-label="Filtrar urgencia"
            >
              <option value="">Urgencia</option>
              {TICKET_URGENCIAS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={[
                "inline-flex h-11 items-center gap-2 px-4 rounded-xl text-sm font-medium border transition-colors",
                showFilters || hasSecondaryFilters
                  ? "border-brand-300 bg-brand-50 text-brand-800"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
              ].join(" ")}
            >
              <SlidersHorizontal size={16} />
              Más
            </button>
            {hasSecondaryFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-11 items-center gap-1 px-3 rounded-xl text-sm text-gray-500 border border-gray-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                title="Limpiar filtros"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 pt-1">
            <select
              value={filters.tipo ?? ""}
              onChange={(e) => setFilter({ tipo: (e.target.value || undefined) as TicketFilters["tipo"] })}
              className={selectClass}
            >
              <option value="">Tipo de avería</option>
              {TICKET_TIPOS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={filters.propiedad_id ?? ""}
              onChange={(e) => setFilter({ propiedad_id: e.target.value || undefined })}
              className={`${selectClass} max-w-[220px]`}
            >
              <option value="">Propiedad</option>
              {sortPropiedadesByTitulo(propiedades).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo}
                </option>
              ))}
            </select>
            <select
              value={filters.manitas_id ?? ""}
              onChange={(e) => setFilter({ manitas_id: e.target.value || undefined })}
              className={`${selectClass} max-w-[200px]`}
            >
              <option value="">Manitas</option>
              {manitasList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombres} {m.apellidos}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filters.fecha_desde ?? ""}
              onChange={(e) => setFilter({ fecha_desde: e.target.value || undefined })}
              className={selectClass}
            />
            <input
              type="date"
              value={filters.fecha_hasta ?? ""}
              onChange={(e) => setFilter({ fecha_hasta: e.target.value || undefined })}
              className={selectClass}
            />
          </div>
        )}

        <p className="text-xs text-gray-500">
          {visibleTickets.length} incidente{visibleTickets.length !== 1 ? "s" : ""}
          {activeTab !== "todos" && (
            <>
              {" "}
              en <span className="font-medium text-gray-700">{TICKET_ESTADO_CONFIG[activeTab].label}</span>
            </>
          )}
        </p>
      </div>

      {/* Lista de tarjetas */}
      <div className="p-4 sm:p-5 space-y-3 bg-slate-50/30 min-h-[200px]">
        {visibleTickets.length === 0 ? (
          <TicketsEmpty
            variant={hasSecondaryFilters || activeTab !== "todos" ? "tab" : "filters"}
            onClearFilters={clearFilters}
          />
        ) : (
          visibleTickets.map((ticket) => (
            <TicketsIncidentCard
              key={ticket.id}
              ticket={ticket}
              onAssign={onAssign}
              onQuickStatus={handleQuickStatus}
              isUpdating={updatingId === ticket.id}
            />
          ))
        )}
      </div>

      <ChangeStatusDialog
        ticket={resolveTicket}
        open={!!resolveTicket}
        presetEstado="resuelto"
        onClose={() => setResolveTicket(null)}
        onSuccess={() => {
          setResolveTicket(null);
          onRefresh();
        }}
      />
    </div>
  );
}
