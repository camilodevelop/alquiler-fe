"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Propiedad } from "@/modules/propiedades/types";
import { sortPropiedadesByTitulo } from "@/modules/propiedades/utils/sort";
import { TIPOS_RENTA } from "@/modules/propiedades/constants";
import { ESTADOS_PAGO, INQUILINO_STATUSES, NIVELES_SCORING } from "../../constants";
import type { InquilinoFilters } from "../../types";
import { hasActiveFilters } from "../../utils/filters";
import { getStatusLabel, getPagoLabel, getScoringLabel } from "../../utils/labels";

const inputClass =
  "w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30";
const selectClass =
  "w-full h-10 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30";

interface InquilinosFiltersProps {
  filters: InquilinoFilters;
  propiedades: Propiedad[];
  onChange: (f: InquilinoFilters) => void;
}

export function InquilinosFilters({ filters, propiedades, onChange }: InquilinosFiltersProps) {
  const active = hasActiveFilters(filters);
  const chips: { label: string; clear: () => void }[] = [];

  if (filters.search?.trim()) chips.push({ label: `«${filters.search.trim()}»`, clear: () => onChange({ ...filters, search: undefined }) });
  if (filters.status) chips.push({ label: getStatusLabel(filters.status), clear: () => onChange({ ...filters, status: undefined }) });
  if (filters.propiedad_id) {
    const p = propiedades.find((x) => x.id === filters.propiedad_id);
    chips.push({ label: p?.titulo ?? "Propiedad", clear: () => onChange({ ...filters, propiedad_id: undefined }) });
  }
  if (filters.estado_pago) chips.push({ label: getPagoLabel(filters.estado_pago), clear: () => onChange({ ...filters, estado_pago: undefined }) });
  if (filters.scoring) chips.push({ label: getScoringLabel(filters.scoring), clear: () => onChange({ ...filters, scoring: undefined }) });

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <SlidersHorizontal size={16} className="text-brand-600" />
          Buscar y filtrar inquilinos
        </div>
      </div>
      <div className="p-4 sm:p-5 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Nombre, documento, email o teléfono..."
            value={filters.search ?? ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className={`${inputClass} pl-10`}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <select
            value={filters.status ?? ""}
            onChange={(e) => onChange({ ...filters, status: (e.target.value || undefined) as InquilinoFilters["status"] })}
            className={selectClass}
            aria-label="Estado"
          >
            <option value="">Todos los estados</option>
            {INQUILINO_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={filters.propiedad_id ?? ""}
            onChange={(e) => onChange({ ...filters, propiedad_id: e.target.value || undefined })}
            className={selectClass}
            aria-label="Propiedad"
          >
            <option value="">Todas las propiedades</option>
            {sortPropiedadesByTitulo(propiedades).map((p) => (
              <option key={p.id} value={p.id}>{p.titulo}</option>
            ))}
          </select>
          <select
            value={filters.tipo_renta ?? ""}
            onChange={(e) => onChange({ ...filters, tipo_renta: (e.target.value || undefined) as InquilinoFilters["tipo_renta"] })}
            className={selectClass}
          >
            <option value="">Tipo de renta</option>
            {TIPOS_RENTA.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={filters.estado_pago ?? ""}
            onChange={(e) => onChange({ ...filters, estado_pago: (e.target.value || undefined) as InquilinoFilters["estado_pago"] })}
            className={selectClass}
          >
            <option value="">Estado de pago</option>
            {ESTADOS_PAGO.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.fecha_ingreso_desde ?? ""}
            onChange={(e) => onChange({ ...filters, fecha_ingreso_desde: e.target.value || undefined })}
            className={inputClass}
            aria-label="Ingreso desde"
          />
          <select
            value={filters.scoring ?? ""}
            onChange={(e) => onChange({ ...filters, scoring: (e.target.value || undefined) as InquilinoFilters["scoring"] })}
            className={selectClass}
          >
            <option value="">Scoring</option>
            {NIVELES_SCORING.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
        </div>
        {active ? (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500">Activos:</span>
            {chips.map((c) => (
              <span key={c.label} className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-800 border border-brand-100 px-2.5 py-1 text-xs font-medium">
                {c.label}
                <button type="button" onClick={c.clear} aria-label="Quitar"><X size={12} /></button>
              </span>
            ))}
            <button type="button" onClick={() => onChange({})} className="text-xs text-gray-500 hover:text-brand-700 underline">
              Limpiar todo
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
