"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { PropiedadFoto } from "../propiedad-foto";
import type { Propiedad } from "../../types";
import { PropiedadEstadoBadge } from "../propiedad-estado-badge";
import {
  formatPrecio,
  getTipoPropiedadLabel,
  getTipoRentaLabel,
} from "../../utils/labels";

interface PropiedadesTableProps {
  propiedades: Propiedad[];
  onDelete: (id: string) => void;
  deletingId?: string | null;
}

export function PropiedadesTable({
  propiedades,
  onDelete,
  deletingId,
}: PropiedadesTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {["Propiedad", "Ciudad", "Tipo", "Renta", "Precio/mes", "Estado", "Acciones"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {propiedades.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <PropiedadFoto
                        src={p.foto_principal_url}
                        alt={p.titulo}
                        sizes="40px"
                        iconSize={16}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{p.titulo}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{p.direccion}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.ciudad}</td>
                <td className="px-4 py-3 text-gray-600">
                  {getTipoPropiedadLabel(p.tipo_propiedad)}
                </td>
                <td className="px-4 py-3 text-gray-600">{getTipoRentaLabel(p.tipo_renta)}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {formatPrecio(p.precio_mes)}
                </td>
                <td className="px-4 py-3">
                  <PropiedadEstadoBadge estado={p.estado} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/propiedades/${p.id}`}
                      className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Ver detalle"
                    >
                      <Eye size={15} />
                    </Link>
                    <Link
                      href={`/dashboard/propiedades/${p.id}/editar`}
                      className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
