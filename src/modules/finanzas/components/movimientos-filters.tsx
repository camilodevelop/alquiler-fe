"use client";

import { useState } from "react";
import { Calendar, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import {
  CATEGORIAS_GASTO,
  CATEGORIAS_INGRESO,
  METODOS_PAGO,
  MOVIMIENTO_ESTADOS,
} from "../constants";
import type { MovimientoFilters } from "../types";
import type { Inquilino } from "@/modules/inquilinos/types";
import type { Propiedad } from "@/modules/propiedades/types";
import { sortPropiedadesByTitulo } from "@/modules/propiedades/utils/sort";

const selectClass =
  "h-10 text-sm border border-gray-200/90 rounded-xl px-3 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300";

export function MovimientosFilters({
  filters,
  onChange,
  propiedades,
  inquilinos,
  showPropiedadFilter = true,
}: {
  filters: MovimientoFilters;
  onChange: (f: MovimientoFilters) => void;
  propiedades: Propiedad[];
  inquilinos: Inquilino[];
  showPropiedadFilter?: boolean;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const set = (patch: Partial<MovimientoFilters>) => onChange({ ...filters, ...patch });

  const categorias =
    filters.tipo === "gasto"
      ? CATEGORIAS_GASTO
      : filters.tipo === "ingreso"
        ? CATEGORIAS_INGRESO
        : [...CATEGORIAS_INGRESO, ...CATEGORIAS_GASTO];

  const activeCount = [
    filters.tipo,
    filters.categoria,
    filters.estado,
    filters.inquilino_id,
    filters.metodo_pago,
    filters.fecha_desde,
    filters.fecha_hasta,
    filters.propiedad_id && showPropiedadFilter,
  ].filter(Boolean).length;

  const clearAdvanced = () =>
    onChange({
      search: filters.search,
      propiedad_id: filters.propiedad_id,
      solo_pagos_inquilinos: filters.solo_pagos_inquilinos,
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="search"
            value={filters.search ?? ""}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Buscar por concepto, propiedad, inquilino o código..."
            className="w-full h-11 pl-10 pr-4 text-sm border border-gray-200/90 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
          />
        </div>
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className={[
            "inline-flex h-11 items-center justify-center gap-2 px-4 rounded-xl text-sm font-medium border transition-all shrink-0",
            advancedOpen || activeCount > 0
              ? "border-brand-300 bg-brand-50 text-brand-800 shadow-sm"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
          ].join(" ")}
        >
          <SlidersHorizontal size={16} />
          Filtros
          {activeCount > 0 && (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white px-1">
              {activeCount}
            </span>
          )}
          <ChevronDown
            size={14}
            className={`transition-transform ${advancedOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {advancedOpen && (
        <div className="rounded-xl border border-gray-200/90 bg-slate-50/50 p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {showPropiedadFilter && (
              <select
                value={filters.propiedad_id ?? ""}
                onChange={(e) => set({ propiedad_id: e.target.value || undefined })}
                className={`${selectClass} min-w-[160px] max-w-[220px]`}
              >
                <option value="">Todas las propiedades</option>
                {sortPropiedadesByTitulo(propiedades).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            )}
            <select
              value={filters.tipo ?? ""}
              onChange={(e) =>
                set({
                  tipo: (e.target.value || undefined) as MovimientoFilters["tipo"],
                  categoria: undefined,
                })
              }
              className={selectClass}
            >
              <option value="">Tipo de movimiento</option>
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
            <select
              value={filters.categoria ?? ""}
              onChange={(e) => set({ categoria: e.target.value || undefined })}
              className={`${selectClass} max-w-[240px]`}
            >
              <option value="">Categoría</option>
              {categorias.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              value={filters.estado ?? ""}
              onChange={(e) =>
                set({ estado: (e.target.value || undefined) as MovimientoFilters["estado"] })
              }
              className={selectClass}
            >
              <option value="">Estado</option>
              {MOVIMIENTO_ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
            <select
              value={filters.inquilino_id ?? ""}
              onChange={(e) => set({ inquilino_id: e.target.value || undefined })}
              className={`${selectClass} max-w-[200px]`}
            >
              <option value="">Inquilino</option>
              {inquilinos.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombres} {i.apellidos}
                </option>
              ))}
            </select>
            <select
              value={filters.metodo_pago ?? ""}
              onChange={(e) =>
                set({
                  metodo_pago: (e.target.value || undefined) as MovimientoFilters["metodo_pago"],
                })
              }
              className={selectClass}
            >
              <option value="">Método de pago</option>
              {METODOS_PAGO.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-200/80">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 mr-1">
              <Calendar size={13} />
              Periodo
            </span>
            <input
              type="date"
              value={filters.fecha_desde ?? ""}
              onChange={(e) => set({ fecha_desde: e.target.value || undefined })}
              className={selectClass}
              aria-label="Desde"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="date"
              value={filters.fecha_hasta ?? ""}
              onChange={(e) => set({ fecha_hasta: e.target.value || undefined })}
              className={selectClass}
              aria-label="Hasta"
            />
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAdvanced}
                className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50"
              >
                <X size={14} />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
