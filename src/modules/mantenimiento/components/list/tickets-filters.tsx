"use client";

import { useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import type { Propiedad } from "@/modules/propiedades/types";
import { sortPropiedadesByTitulo } from "@/modules/propiedades/utils/sort";
import { TICKET_TIPOS_OPTIONS, TICKET_URGENCIAS_OPTIONS } from "../../constants";
import type { Manitas, TicketFilters } from "../../types";
import { hasActiveTicketFilters } from "../../utils/filters";

const inputClass =
  "text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400";

export function TicketsFilters({
  filters,
  propiedades,
  manitasList,
  onChange,
}: {
  filters: TicketFilters;
  propiedades: Propiedad[];
  manitasList: Manitas[];
  onChange: (f: TicketFilters) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const set = (patch: Partial<TicketFilters>) => onChange({ ...filters, ...patch });
  const hasExtra =
    !!filters.tipo ||
    !!filters.urgencia ||
    !!filters.propiedad_id ||
    !!filters.manitas_id ||
    !!filters.fecha_desde ||
    !!filters.fecha_hasta;

  return (
    <div className="px-4 py-4 space-y-3 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar código, título, propiedad o inquilino..."
            value={filters.search ?? ""}
            onChange={(e) => set({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={[
              "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors",
              expanded || hasExtra
                ? "border-brand-300 bg-brand-50 text-brand-800"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
            ].join(" ")}
          >
            <SlidersHorizontal size={16} />
            Filtros
            <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          {(hasExtra || filters.search?.trim()) && (
            <button
              type="button"
              onClick={() => onChange({ estado: filters.estado })}
              className="inline-flex items-center gap-1 px-3 py-2.5 text-sm text-gray-500 hover:text-red-600 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50"
            >
              <X size={14} />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {(expanded || hasExtra) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          <select
            value={filters.urgencia ?? ""}
            onChange={(e) => set({ urgencia: e.target.value as TicketFilters["urgencia"] })}
            className={inputClass}
          >
            <option value="">Urgencia</option>
            {TICKET_URGENCIAS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={filters.tipo ?? ""}
            onChange={(e) => set({ tipo: e.target.value as TicketFilters["tipo"] })}
            className={inputClass}
          >
            <option value="">Tipo</option>
            {TICKET_TIPOS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={filters.propiedad_id ?? ""}
            onChange={(e) => set({ propiedad_id: e.target.value || undefined })}
            className={`${inputClass} max-w-[220px]`}
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
            onChange={(e) => set({ manitas_id: e.target.value || undefined })}
            className={`${inputClass} max-w-[200px]`}
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
            onChange={(e) => set({ fecha_desde: e.target.value || undefined })}
            className={inputClass}
            title="Desde"
          />
          <input
            type="date"
            value={filters.fecha_hasta ?? ""}
            onChange={(e) => set({ fecha_hasta: e.target.value || undefined })}
            className={inputClass}
            title="Hasta"
          />
        </div>
      )}
    </div>
  );
}
