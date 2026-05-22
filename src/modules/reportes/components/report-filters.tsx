"use client";

import type { ReactNode } from "react";
import { Calendar, Filter, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui";
import type { TipoRenta } from "@/modules/propiedades/types";
import type { ReportesCatalog, ReportFilters, ReportTabId } from "../types";
import {
  CONTRATO_ESTADO_LABEL,
  INQUILINO_STATUS_LABEL,
  MANITAS_ESTADO_LABEL,
  PROPIEDAD_ESTADO_LABEL,
  TICKET_ESTADO_LABEL,
} from "../constants";
import { defaultReportDateRange } from "../utils/dates";

const TIPOS_RENTA: { value: TipoRenta; label: string }[] = [
  { value: "tradicional", label: "Tradicional" },
  { value: "habitaciones", label: "Habitaciones" },
  { value: "temporal", label: "Temporal" },
  { value: "comercial", label: "Comercial" },
];

function estadoOptionsForTab(tab: ReportTabId): { value: string; label: string }[] {
  switch (tab) {
    case "inquilinos":
      return Object.entries(INQUILINO_STATUS_LABEL).map(([value, label]) => ({ value, label }));
    case "contratos":
      return Object.entries(CONTRATO_ESTADO_LABEL).map(([value, label]) => ({ value, label }));
    case "mantenimiento":
      return Object.entries(TICKET_ESTADO_LABEL).map(([value, label]) => ({ value, label }));
    case "propiedades":
    case "general":
      return Object.entries(PROPIEDAD_ESTADO_LABEL).map(([value, label]) => ({ value, label }));
    default:
      return [];
  }
}

const controlClass =
  "block h-10 w-full min-w-0 text-sm leading-none border border-slate-200 rounded-xl px-3 text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-shadow appearance-none";

function FilterField({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="flex h-4 shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {icon ?? <span className="inline-block w-[11px] shrink-0" aria-hidden />}
        {label}
      </span>
      {children}
    </label>
  );
}

export function ReportFiltersBar({
  tab,
  filters,
  catalog,
  onChange,
  onApply,
}: {
  tab: ReportTabId;
  filters: ReportFilters;
  catalog: ReportesCatalog;
  onChange: (f: ReportFilters) => void;
  onApply: () => void;
}) {
  const estadoOpts = estadoOptionsForTab(tab);
  const showTipoRenta = tab === "general" || tab === "propiedades" || tab === "inquilinos";
  const showInquilino = tab !== "mantenimiento";
  const showManitas = tab === "mantenimiento";
  const showEstadoTicket = estadoOpts.length > 0 && tab !== "contabilidad";
  const showEstadoManitas = tab === "mantenimiento";

  const set = (patch: Partial<ReportFilters>) => onChange({ ...filters, ...patch });

  const reset = () => {
    const next = defaultReportDateRange();
    onChange(next);
    onApply();
  };

  const propiedadesSorted = [...catalog.propiedades].sort((a, b) =>
    a.titulo.localeCompare(b.titulo, "es", { sensitivity: "base" }),
  );

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <SlidersHorizontal size={16} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Filtros de análisis</p>
            <p className="text-[11px] text-slate-500">Ajusta el periodo y el alcance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-slate-600" onClick={reset}>
            <RotateCcw size={14} />
            Restablecer
          </Button>
          <Button type="button" variant="primary" size="sm" className="gap-1.5 shadow-sm" onClick={onApply}>
            <Filter size={14} />
            Aplicar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-end gap-x-3 gap-y-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
        <FilterField label="Desde" icon={<Calendar size={11} className="shrink-0" />}>
          <input
            type="date"
            value={filters.fecha_desde ?? ""}
            onChange={(e) => set({ fecha_desde: e.target.value || undefined })}
            className={`${controlClass} py-0 [&::-webkit-calendar-picker-indicator]:opacity-60`}
          />
        </FilterField>
        <FilterField label="Hasta">
          <input
            type="date"
            value={filters.fecha_hasta ?? ""}
            onChange={(e) => set({ fecha_hasta: e.target.value || undefined })}
            className={`${controlClass} py-0 [&::-webkit-calendar-picker-indicator]:opacity-60`}
          />
        </FilterField>
        <FilterField label="Propiedad">
          <select
            value={filters.propiedad_id ?? ""}
            onChange={(e) => set({ propiedad_id: e.target.value || undefined })}
            className={controlClass}
          >
            <option value="">Todas las propiedades</option>
            {propiedadesSorted.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titulo}
              </option>
            ))}
          </select>
        </FilterField>
        {showEstadoTicket && (
          <FilterField label={tab === "mantenimiento" ? "Estado ticket" : "Estado"}>
            <select
              value={filters.estado ?? ""}
              onChange={(e) => set({ estado: e.target.value || undefined })}
              className={controlClass}
            >
              <option value="">Todos</option>
              {estadoOpts.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FilterField>
        )}
        {showEstadoManitas && (
          <FilterField label="Estado manitas">
            <select
              value={filters.estado_manitas ?? ""}
              onChange={(e) => set({ estado_manitas: e.target.value || undefined })}
              className={controlClass}
            >
              <option value="">Todos</option>
              {Object.entries(MANITAS_ESTADO_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FilterField>
        )}
        {showTipoRenta && (
          <FilterField label="Tipo renta">
            <select
              value={filters.tipo_renta ?? ""}
              onChange={(e) => set({ tipo_renta: e.target.value || undefined })}
              className={controlClass}
            >
              <option value="">Todos</option>
              {TIPOS_RENTA.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </FilterField>
        )}
        {showInquilino && (
          <FilterField label="Inquilino">
            <select
              value={filters.inquilino_id ?? ""}
              onChange={(e) => set({ inquilino_id: e.target.value || undefined })}
              className={controlClass}
            >
              <option value="">Todos</option>
              {[...catalog.inquilinos]
                .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre}
                  </option>
                ))}
            </select>
          </FilterField>
        )}
        {showManitas && (
          <FilterField label="Manitas">
            <select
              value={filters.manitas_id ?? ""}
              onChange={(e) => set({ manitas_id: e.target.value || undefined })}
              className={controlClass}
            >
              <option value="">Todos</option>
              {[...catalog.manitas]
                .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
            </select>
          </FilterField>
        )}
      </div>
    </div>
  );
}
