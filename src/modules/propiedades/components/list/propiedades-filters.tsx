"use client";

import { MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import {
  ESTADOS_PROPIEDAD,
  TIPOS_PROPIEDAD,
  TIPOS_RENTA,
} from "../../constants";
import type { PropiedadFilters } from "../../types";
import { hasActiveFilters } from "../../utils/stats";
import { getEstadoLabel, getTipoPropiedadLabel, getTipoRentaLabel } from "../../utils/labels";
import { selectClassName, inputClassName } from "../form/form-field";

interface PropiedadesFiltersProps {
  filters: PropiedadFilters;
  ciudades: string[];
  onChange: (filters: PropiedadFilters) => void;
}

const EMPTY_FILTERS: PropiedadFilters = {};

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-800 border border-brand-100 px-2.5 py-1 text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-brand-100 transition-colors"
        aria-label={`Quitar filtro ${label}`}
      >
        <X size={12} />
      </button>
    </span>
  );
}

export function PropiedadesFilters({ filters, ciudades, onChange }: PropiedadesFiltersProps) {
  const active = hasActiveFilters(filters);

  const chips: { label: string; clear: () => void }[] = [];

  if (filters.search?.trim()) {
    chips.push({
      label: `«${filters.search.trim()}»`,
      clear: () => onChange({ ...filters, search: undefined }),
    });
  }
  if (filters.ciudad) {
    chips.push({
      label: filters.ciudad,
      clear: () => onChange({ ...filters, ciudad: undefined }),
    });
  }
  if (filters.estado) {
    chips.push({
      label: getEstadoLabel(filters.estado),
      clear: () => onChange({ ...filters, estado: undefined }),
    });
  }
  if (filters.tipo_renta) {
    chips.push({
      label: getTipoRentaLabel(filters.tipo_renta),
      clear: () => onChange({ ...filters, tipo_renta: undefined }),
    });
  }
  if (filters.tipo_propiedad) {
    chips.push({
      label: getTipoPropiedadLabel(filters.tipo_propiedad),
      clear: () => onChange({ ...filters, tipo_propiedad: undefined }),
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <SlidersHorizontal size={16} className="text-brand-600" />
          Buscar y filtrar
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Encuentra propiedades por ciudad, estado o tipo de renta
        </p>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="search"
            placeholder="Título, dirección o ciudad..."
            value={filters.search ?? ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className={`${inputClassName} pl-10 h-11 text-base sm:text-sm`}
            aria-label="Buscar propiedades"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <MapPin size={12} />
              Ciudad
            </span>
            <select
              value={filters.ciudad ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  ciudad: e.target.value || undefined,
                })
              }
              className={selectClassName}
            >
              <option value="">Todas las ciudades</option>
              {ciudades.map((ciudad) => (
                <option key={ciudad} value={ciudad}>
                  {ciudad}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500">Estado</span>
            <select
              value={filters.estado ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  estado: (e.target.value || undefined) as PropiedadFilters["estado"],
                })
              }
              className={selectClassName}
            >
              <option value="">Todos</option>
              {ESTADOS_PROPIEDAD.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500">Tipo de renta</span>
            <select
              value={filters.tipo_renta ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  tipo_renta: (e.target.value || undefined) as PropiedadFilters["tipo_renta"],
                })
              }
              className={selectClassName}
            >
              <option value="">Todas</option>
              {TIPOS_RENTA.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500">Tipo de inmueble</span>
            <select
              value={filters.tipo_propiedad ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  tipo_propiedad: (e.target.value ||
                    undefined) as PropiedadFilters["tipo_propiedad"],
                })
              }
              className={selectClassName}
            >
              <option value="">Todos</option>
              {TIPOS_PROPIEDAD.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {active ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-gray-500 mr-1">Activos:</span>
            {chips.map((chip) => (
              <FilterChip key={chip.label} label={chip.label} onRemove={chip.clear} />
            ))}
            <button
              type="button"
              onClick={() => onChange(EMPTY_FILTERS)}
              className="text-xs font-medium text-gray-500 hover:text-brand-700 underline-offset-2 hover:underline ml-1"
            >
              Limpiar todo
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
