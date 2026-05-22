"use client";

import { Building2, LayoutGrid } from "lucide-react";
import type { Propiedad } from "@/modules/propiedades/types";
import { sortPropiedadesByTitulo } from "@/modules/propiedades/utils/sort";

export function ContabilidadPropiedadSwitcher({
  propiedades,
  selectedId,
  onSelect,
}: {
  propiedades: Propiedad[];
  selectedId?: string;
  onSelect: (propiedadId: string | null) => void;
}) {
  if (propiedades.length === 0) return null;

  const sorted = sortPropiedadesByTitulo(propiedades);
  const todasActive = !selectedId;

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-3 sm:p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2.5 px-0.5">
        Propiedad
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin -mx-0.5 px-0.5">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={[
            "shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all",
            todasActive
              ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20"
              : "bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-300 hover:bg-white hover:text-brand-700",
          ].join(" ")}
        >
          <LayoutGrid size={13} />
          Todas
        </button>
        {sorted.map((p) => {
          const active = selectedId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={[
                "shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-all max-w-[200px]",
                active
                  ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-300 hover:bg-white hover:text-brand-700",
              ].join(" ")}
            >
              <Building2 size={13} className="shrink-0" />
              <span className="truncate">{p.titulo}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
