"use client";

import Link from "next/link";
import { Eye, Mail, MapPin, Pencil, Phone, Trash2, Wrench } from "lucide-react";
import { Badge } from "@/components/ui";
import { MANITAS_ESTADO_CONFIG, MANITAS_ESPECIALIDAD_CONFIG } from "../../constants";
import type { Manitas } from "../../types";
import { manitasNombreCompleto } from "../../utils/labels";
import { ManitasAvatar } from "./manitas-avatar";
import { ManitasRatingDisplay } from "./manitas-rating";

export function ManitasGrid({
  list,
  onDelete,
}: {
  list: Manitas[];
  onDelete: (m: Manitas) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-5">
      {list.map((m) => {
        const st = MANITAS_ESTADO_CONFIG[m.estado];
        const esp = MANITAS_ESPECIALIDAD_CONFIG[m.especialidad];
        return (
          <article
            key={m.id}
            className="flex flex-col rounded-2xl border border-gray-200/90 bg-white shadow-sm overflow-hidden hover:shadow-md hover:border-violet-200/60 transition-all"
          >
            <div className="p-5 flex-1 flex flex-col gap-4">
              <div className="flex gap-4">
                <ManitasAvatar manitas={m} size="lg" />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/mantenimiento/maestros/${m.id}`}
                    className="font-semibold text-gray-900 hover:text-violet-700 line-clamp-1"
                  >
                    {manitasNombreCompleto(m)}
                  </Link>
                  <p className="text-xs text-violet-700 font-medium mt-0.5">{esp.label}</p>
                  <div className="mt-2">
                    <ManitasRatingDisplay value={m.rating} />
                  </div>
                </div>
                <Badge variant={st.variant}>{st.label}</Badge>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600">
                <p className="flex items-center gap-2 truncate">
                  <Mail size={13} className="text-gray-400 shrink-0" />
                  {m.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={13} className="text-gray-400 shrink-0" />
                  {m.telefono}
                </p>
                {m.zona_cobertura && (
                  <p className="flex items-center gap-2">
                    <MapPin size={13} className="text-gray-400 shrink-0" />
                    {m.zona_cobertura}
                  </p>
                )}
              </div>

              <div className="flex gap-4 text-xs rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5 mt-auto">
                <span>
                  <Wrench size={12} className="inline mr-1 text-violet-500" />
                  <strong className="text-gray-900">{m.tickets_asignados}</strong> activos
                </span>
                <span>
                  <strong className="text-emerald-700">{m.tickets_completados}</strong> completados
                </span>
              </div>
            </div>

            <div className="flex border-t border-gray-100 divide-x divide-gray-100">
              <Link
                href={`/dashboard/mantenimiento/maestros/${m.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-600 hover:bg-violet-50 hover:text-violet-700"
              >
                <Eye size={14} /> Perfil
              </Link>
              <Link
                href={`/dashboard/mantenimiento/maestros/${m.id}/editar`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                <Pencil size={14} /> Editar
              </Link>
              <button
                type="button"
                onClick={() => onDelete(m)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
