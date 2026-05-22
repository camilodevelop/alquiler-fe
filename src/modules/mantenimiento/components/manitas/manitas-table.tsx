"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { MANITAS_ESPECIALIDAD_CONFIG } from "../../constants";
import { ManitasEstadoBadge } from "./manitas-estado-badge";
import type { Manitas } from "../../types";
import { manitasNombreCompleto } from "../../utils/labels";
import { ManitasAvatar } from "./manitas-avatar";
import { ManitasRatingDisplay } from "./manitas-rating";

export function ManitasTable({
  list,
  onDelete,
}: {
  list: Manitas[];
  onDelete: (m: Manitas) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-200">
            {["Técnico", "Especialidad", "Estado", "Puntuación", "Activos", "Completados", "Contacto", ""].map(
              (col) => (
                <th
                  key={col || "actions"}
                  className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {list.map((m) => {
            const esp = MANITAS_ESPECIALIDAD_CONFIG[m.especialidad];
            return (
              <tr key={m.id} className="hover:bg-gray-50/80 group">
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/mantenimiento/maestros/${m.id}`}
                    className="flex items-center gap-3 min-w-[200px]"
                  >
                    <ManitasAvatar manitas={m} size="sm" />
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-violet-700">
                        {manitasNombreCompleto(m)}
                      </p>
                      {m.zona_cobertura && (
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">{m.zona_cobertura}</p>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">{esp.label}</td>
                <td className="px-4 py-3">
                  <ManitasEstadoBadge estado={m.estado} />
                </td>
                <td className="px-4 py-3">
                  <ManitasRatingDisplay value={m.rating} size={14} />
                </td>
                <td className="px-4 py-3 text-center font-medium tabular-nums">{m.tickets_asignados}</td>
                <td className="px-4 py-3 text-center font-medium text-emerald-700 tabular-nums">
                  {m.tickets_completados}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  <p>{m.telefono}</p>
                  <p className="truncate max-w-[160px]">{m.email}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-0.5">
                    <Link
                      href={`/dashboard/mantenimiento/maestros/${m.id}`}
                      className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                    >
                      <Eye size={16} />
                    </Link>
                    <Link
                      href={`/dashboard/mantenimiento/maestros/${m.id}/editar`}
                      className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(m)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
