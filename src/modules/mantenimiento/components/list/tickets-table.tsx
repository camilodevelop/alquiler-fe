"use client";

import Link from "next/link";
import {
  Building2,
  Calendar,
  Eye,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  User,
  UserPlus,
} from "lucide-react";
import type { TicketMantenimiento, TicketUrgencia } from "../../types";
import { TicketStatusBadge } from "../ticket-status-badge";
import { TicketUrgenciaBadge } from "../ticket-urgencia-badge";
import { formatFecha, getTicketTipoLabel } from "../../utils/labels";

const URGENCIA_BORDER: Record<TicketUrgencia, string> = {
  baja: "border-l-emerald-400",
  media: "border-l-amber-400",
  alta: "border-l-orange-500",
  critica: "border-l-red-500",
};

export function TicketsTable({
  tickets,
  onAssign,
  onChangeStatus,
}: {
  tickets: TicketMantenimiento[];
  onAssign: (t: TicketMantenimiento) => void;
  onChangeStatus: (t: TicketMantenimiento) => void;
}) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              {["Ticket", "Propiedad", "Tipo", "Urgencia", "Estado", "Manitas", "Fechas", ""].map(
                (col) => (
                  <th
                    key={col || "actions"}
                    className="px-4 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.map((t) => (
              <tr
                key={t.id}
                className={`group hover:bg-gray-50/80 transition-colors border-l-4 ${URGENCIA_BORDER[t.urgencia]}`}
              >
                <td className="px-4 py-4">
                  <Link
                    href={`/dashboard/mantenimiento/${t.id}`}
                    className="block group/link"
                  >
                    <span className="font-mono text-xs font-bold text-brand-700">{t.codigo}</span>
                    <p className="font-medium text-gray-900 mt-0.5 group-hover/link:text-brand-700 line-clamp-1">
                      {t.titulo}
                    </p>
                    {t.inquilino_nombre && (
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <User size={11} />
                        {t.inquilino_nombre}
                      </p>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-4 max-w-[160px]">
                  <p className="font-medium text-gray-800 truncate flex items-center gap-1">
                    <Building2 size={13} className="text-gray-400 shrink-0" />
                    {t.propiedad_nombre}
                  </p>
                  {t.unidad && <p className="text-xs text-gray-500 mt-0.5">{t.unidad}</p>}
                </td>
                <td className="px-4 py-4 text-gray-600 whitespace-nowrap text-xs">
                  {getTicketTipoLabel(t.tipo)}
                </td>
                <td className="px-4 py-4">
                  <TicketUrgenciaBadge urgencia={t.urgencia} />
                </td>
                <td className="px-4 py-4">
                  <TicketStatusBadge status={t.estado} />
                </td>
                <td className="px-4 py-4 text-gray-600 text-xs">
                  {t.manitas_nombre ?? (
                    <span className="text-amber-600 font-medium">Sin asignar</span>
                  )}
                </td>
                <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatFecha(t.fecha_reporte)}
                  </div>
                  {t.fecha_estimada_solucion && (
                    <p className="mt-0.5 text-gray-400">→ {formatFecha(t.fecha_estimada_solucion)}</p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-0.5 opacity-80 group-hover:opacity-100">
                    <Link
                      href={`/dashboard/mantenimiento/${t.id}`}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      title="Ver"
                    >
                      <Eye size={16} />
                    </Link>
                    <Link
                      href={`/dashboard/mantenimiento/${t.id}/editar`}
                      className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onAssign(t)}
                      className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                      title="Asignar"
                    >
                      <UserPlus size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeStatus(t)}
                      className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                      title="Estado"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet cards */}
      <div className="lg:hidden divide-y divide-gray-100">
        {tickets.map((t) => (
          <article
            key={t.id}
            className={`p-4 border-l-4 ${URGENCIA_BORDER[t.urgencia]} hover:bg-gray-50/50`}
          >
            <div className="flex items-start justify-between gap-3">
              <Link href={`/dashboard/mantenimiento/${t.id}`} className="min-w-0 flex-1">
                <span className="font-mono text-xs font-bold text-brand-700">{t.codigo}</span>
                <h3 className="font-semibold text-gray-900 mt-0.5 line-clamp-2">{t.titulo}</h3>
                <p className="text-xs text-gray-500 mt-1">{t.propiedad_nombre}</p>
              </Link>
              <TicketUrgenciaBadge urgencia={t.urgencia} />
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <TicketStatusBadge status={t.estado} />
              <span className="text-xs text-gray-500">{getTicketTipoLabel(t.tipo)}</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {t.manitas_nombre ?? "Sin manitas"} · {formatFecha(t.fecha_reporte)}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onAssign(t)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-violet-50 hover:text-violet-600"
                >
                  <UserPlus size={16} />
                </button>
                <Link
                  href={`/dashboard/mantenimiento/${t.id}`}
                  className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                >
                  <MoreHorizontal size={16} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
