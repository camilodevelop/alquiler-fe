"use client";

import { Search } from "lucide-react";
import type { Propiedad } from "@/modules/propiedades/types";
import { sortPropiedadesByTitulo } from "@/modules/propiedades/utils/sort";
import type { Inquilino } from "@/modules/inquilinos/types";
import type { ContractFilters, ContractStatus, ContractTemplate } from "../../types";
import { CONTRACT_STATUS_CONFIG } from "../../constants";

interface ContractsFiltersProps {
  filters: ContractFilters;
  propiedades: Propiedad[];
  inquilinos: Inquilino[];
  templates: ContractTemplate[];
  onChange: (f: ContractFilters) => void;
}

export function ContractsFilters({
  filters,
  propiedades,
  inquilinos,
  templates,
  onChange,
}: ContractsFiltersProps) {
  const set = (patch: Partial<ContractFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Buscar código, propiedad, inquilino..."
          value={filters.search ?? ""}
          onChange={(e) => set({ search: e.target.value })}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <select
          value={filters.estado ?? ""}
          onChange={(e) => set({ estado: (e.target.value || "") as ContractStatus | "" })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 min-w-[140px]"
        >
          <option value="">Todos los estados</option>
          {(Object.keys(CONTRACT_STATUS_CONFIG) as ContractStatus[]).map((s) => (
            <option key={s} value={s}>
              {CONTRACT_STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
        <select
          value={filters.propiedad_id ?? ""}
          onChange={(e) => set({ propiedad_id: e.target.value || undefined })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 min-w-[160px]"
        >
          <option value="">Todas las propiedades</option>
          {sortPropiedadesByTitulo(propiedades).map((p) => (
            <option key={p.id} value={p.id}>
              {p.titulo}
            </option>
          ))}
        </select>
        <select
          value={filters.inquilino_id ?? ""}
          onChange={(e) => set({ inquilino_id: e.target.value || undefined })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 min-w-[160px]"
        >
          <option value="">Todos los inquilinos</option>
          {inquilinos.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nombres} {i.apellidos}
            </option>
          ))}
        </select>
        <select
          value={filters.tipo_contrato_id ?? ""}
          onChange={(e) => set({ tipo_contrato_id: e.target.value || undefined })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 min-w-[160px]"
        >
          <option value="">Todos los tipos</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
