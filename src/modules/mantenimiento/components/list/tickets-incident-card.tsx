"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  ChevronRight,
  Pencil,
  User,
  UserPlus,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui";
import { TICKET_ESTADO_CONFIG, TICKET_URGENCIA_CONFIG } from "../../constants";
import type { TicketEstado, TicketMantenimiento } from "../../types";
import { TicketStatusBadge } from "../ticket-status-badge";
import { formatFecha, formatPrecio, getTicketTipoLabel } from "../../utils/labels";

const URGENCIA_ACCENT: Record<
  TicketMantenimiento["urgencia"],
  { border: string; bg: string; text: string }
> = {
  baja: { border: "border-l-emerald-500", bg: "bg-emerald-50/80", text: "text-emerald-700" },
  media: { border: "border-l-amber-400", bg: "bg-amber-50/60", text: "text-amber-800" },
  alta: { border: "border-l-orange-500", bg: "bg-orange-50/60", text: "text-orange-800" },
  critica: { border: "border-l-red-500", bg: "bg-red-50/70", text: "text-red-800" },
};

function quickActionFor(estado: TicketEstado): { label: string; next: TicketEstado } | null {
  switch (estado) {
    case "asignado":
      return { label: "Iniciar trabajo", next: "en_proceso" };
    case "en_proceso":
      return { label: "Marcar resuelto", next: "resuelto" };
    case "resuelto":
      return { label: "Cerrar ticket", next: "cerrado" };
    default:
      return null;
  }
}

export function TicketsIncidentCard({
  ticket,
  onAssign,
  onQuickStatus,
  isUpdating,
}: {
  ticket: TicketMantenimiento;
  onAssign: (t: TicketMantenimiento) => void;
  onQuickStatus: (t: TicketMantenimiento, estado: TicketEstado) => void;
  isUpdating?: boolean;
}) {
  const accent = URGENCIA_ACCENT[ticket.urgencia];
  const urgenciaLabel = TICKET_URGENCIA_CONFIG[ticket.urgencia].label;
  const quick = quickActionFor(ticket.estado);
  const isClosed = ticket.estado === "cerrado" || ticket.estado === "cancelado";

  return (
    <article
      className={[
        "group relative rounded-xl border border-gray-200/90 bg-white shadow-sm transition-all",
        "hover:shadow-md hover:border-gray-300/90 border-l-[4px]",
        accent.border,
        isClosed ? "opacity-[0.92]" : "",
      ].join(" ")}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-gray-800 tracking-tight">
                {ticket.codigo}
              </span>
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${accent.bg} ${accent.text}`}
              >
                {urgenciaLabel}
              </span>
              <TicketStatusBadge status={ticket.estado} />
            </div>
            <Link
              href={`/dashboard/mantenimiento/${ticket.id}`}
              className="block text-base sm:text-[17px] font-semibold text-gray-900 leading-snug hover:text-brand-700 transition-colors"
            >
              {ticket.titulo}
            </Link>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ticket.descripcion}</p>
          </div>
          <Link
            href={`/dashboard/mantenimiento/${ticket.id}`}
            className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-colors"
            aria-label="Ver detalle"
          >
            <ChevronRight size={18} />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-sm">
          <div className="flex items-center gap-2 min-w-0 text-gray-600">
            <Building2 size={15} className="text-gray-400 shrink-0" />
            <span className="truncate">
              <span className="font-medium text-gray-800">{ticket.propiedad_nombre}</span>
              {ticket.unidad ? ` · ${ticket.unidad}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 min-w-0">
            <User size={15} className="text-gray-400 shrink-0" />
            <span className="truncate">{ticket.inquilino_nombre ?? "Sin inquilino"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 min-w-0">
            <Wrench size={15} className="text-gray-400 shrink-0" />
            {ticket.manitas_nombre ? (
              <span className="truncate font-medium text-gray-800">{ticket.manitas_nombre}</span>
            ) : (
              <span className="text-amber-700 font-medium">Sin asignar</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
            <Calendar size={15} className="text-gray-400 shrink-0" />
            <span>
              {formatFecha(ticket.fecha_reporte)}
              {ticket.fecha_estimada_solucion
                ? ` · est. ${formatFecha(ticket.fecha_estimada_solucion)}`
                : ""}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-600">
            {getTicketTipoLabel(ticket.tipo)}
          </span>
          <span className="text-gray-400">·</span>
          <span>{TICKET_ESTADO_CONFIG[ticket.estado].description}</span>
          {ticket.costo != null && (
            <>
              <span className="text-gray-400">·</span>
              <span className="font-medium text-emerald-700">Costo {formatPrecio(ticket.costo)}</span>
            </>
          )}
        </div>
      </div>

      {!isClosed && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50/60 rounded-b-xl">
          <div className="flex flex-wrap gap-2">
            {ticket.estado === "nuevo" && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="gap-1.5 h-8 text-xs"
                disabled={isUpdating}
                onClick={() => onAssign(ticket)}
              >
                <UserPlus size={14} />
                Asignar manitas
              </Button>
            )}
            {quick && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5 h-8 text-xs"
                disabled={isUpdating}
                onClick={() => onQuickStatus(ticket, quick.next)}
              >
                {quick.label}
                <ArrowRight size={14} />
              </Button>
            )}
            {(ticket.estado === "asignado" || ticket.estado === "en_proceso") && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1 h-8 text-xs"
                disabled={isUpdating}
                onClick={() => onAssign(ticket)}
              >
                <UserPlus size={13} />
                Reasignar
              </Button>
            )}
          </div>
          <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Link
              href={`/dashboard/mantenimiento/${ticket.id}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-brand-700 rounded-lg hover:bg-white"
            >
              Detalle
            </Link>
            <Link
              href={`/dashboard/mantenimiento/${ticket.id}/editar`}
              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-white"
              title="Editar"
            >
              <Pencil size={15} />
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}
