"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui";
import type { Manitas, ManitasFilters } from "@/modules/mantenimiento/types";
import { filterManitas } from "@/modules/mantenimiento/utils/filters";
import { ManitasToolbar, type ManitasViewMode } from "@/modules/mantenimiento/components/manitas/manitas-toolbar";
import { ManitasGrid } from "@/modules/mantenimiento/components/manitas/manitas-grid";
import { ManitasTable } from "@/modules/mantenimiento/components/manitas/manitas-table";
import { mantenimientoService } from "@/modules/mantenimiento/services/mantenimiento.service";
import { MANITAS_ESPECIALIDADES_OPTIONS, MANITAS_ESTADOS_OPTIONS } from "@/modules/mantenimiento/constants";

export function MaestrosPageClient({
  initialList,
  dbError,
}: {
  initialList: Manitas[];
  dbError?: string;
}) {
  const [list, setList] = useState(initialList);
  const [filters, setFilters] = useState<ManitasFilters>({});
  const [viewMode, setViewMode] = useState<ManitasViewMode>("grid");

  const filtered = filterManitas(list, filters);

  const refresh = async () => {
    const { data } = await mantenimientoService.getManitasList();
    setList(data);
  };

  const handleDelete = async (m: Manitas) => {
    if (!confirm(`¿Eliminar a ${m.nombres} ${m.apellidos}?`)) return;
    const { error } = await mantenimientoService.deleteManitas(m.id);
    if (error) alert(error);
    else await refresh();
  };

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 border-b border-gray-100">
        <div className="relative flex-1 max-w-xl">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar nombre, email, teléfono, zona..."
            value={filters.search ?? ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/25"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.estado ?? ""}
            onChange={(e) =>
              setFilters({ ...filters, estado: e.target.value as ManitasFilters["estado"] })
            }
            className="h-10 text-sm border border-gray-200 rounded-lg px-3"
          >
            <option value="">Estado</option>
            {MANITAS_ESTADOS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={filters.especialidad ?? ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                especialidad: e.target.value as ManitasFilters["especialidad"],
              })
            }
            className="h-10 text-sm border border-gray-200 rounded-lg px-3"
          >
            <option value="">Especialidad</option>
            {MANITAS_ESPECIALIDADES_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Link href="/dashboard/mantenimiento/maestros/nuevo">
            <Button variant="primary" className="gap-2 h-10">
              <Plus size={16} />
              Nuevo manitas
            </Button>
          </Link>
        </div>
      </div>

      {dbError && (
        <p className="text-sm text-amber-800 bg-amber-50 border-b border-amber-100 px-5 py-3">
          {dbError}. Ejecuta{" "}
          <code className="text-xs bg-amber-100 px-1 rounded">supabase/scripts/08_manitas_perfil.sql</code>
        </p>
      )}

      <ManitasToolbar count={filtered.length} viewMode={viewMode} onViewModeChange={setViewMode} />

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No hay técnicos registrados.</p>
      ) : viewMode === "grid" ? (
        <ManitasGrid list={filtered} onDelete={handleDelete} />
      ) : (
        <ManitasTable list={filtered} onDelete={handleDelete} />
      )}
    </div>
  );
}
