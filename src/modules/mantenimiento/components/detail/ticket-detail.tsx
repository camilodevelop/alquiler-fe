"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, UserPlus } from "lucide-react";
import { Button } from "@/components/ui";
import type { Manitas, TicketMantenimiento } from "../../types";
import { TicketStatusBadge } from "../ticket-status-badge";
import { TicketUrgenciaBadge } from "../ticket-urgencia-badge";
import {
  formatFecha,
  formatPrecio,
  getTicketTipoLabel,
} from "../../utils/labels";
import { mantenimientoService } from "../../services/mantenimiento.service";
import { AssignTicketDialog } from "../assign-ticket-dialog";
import { ChangeStatusDialog } from "../change-status-dialog";

export function TicketDetail({
  ticket: initial,
  assignableManitas,
}: {
  ticket: TicketMantenimiento;
  assignableManitas: Manitas[];
}) {
  const [ticket, setTicket] = useState(initial);
  const [comment, setComment] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const { data } = await mantenimientoService.getTicket(ticket.id);
    if (data) setTicket(data);
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    setLoading(true);
    await mantenimientoService.addComment(ticket.id, comment.trim());
    setComment("");
    await refresh();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/mantenimiento"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600"
        >
          <ArrowLeft size={16} />
          Volver al listado
        </Link>
        <div className="flex-1" />
        <Button variant="secondary" size="sm" className="gap-1" onClick={() => setAssignOpen(true)}>
          <UserPlus size={14} />
          Asignar manitas
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setStatusOpen(true)}>
          Cambiar estado
        </Button>
        <Link href={`/dashboard/mantenimiento/${ticket.id}/editar`}>
          <Button variant="primary" size="sm" className="gap-1">
            <Pencil size={14} />
            Editar
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-sm font-semibold text-brand-700">{ticket.codigo}</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{ticket.titulo}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {ticket.propiedad_nombre}
              {ticket.unidad ? ` · ${ticket.unidad}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TicketStatusBadge status={ticket.estado} />
            <TicketUrgenciaBadge urgencia={ticket.urgencia} />
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Tipo</dt>
            <dd className="font-medium">{getTicketTipoLabel(ticket.tipo)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Inquilino</dt>
            <dd className="font-medium">{ticket.inquilino_nombre ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Manitas</dt>
            <dd className="font-medium">{ticket.manitas_nombre ?? "Sin asignar"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Fecha reporte</dt>
            <dd>{formatFecha(ticket.fecha_reporte)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Est. solución</dt>
            <dd>{formatFecha(ticket.fecha_estimada_solucion)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Est. atención</dt>
            <dd>{formatFecha(ticket.fecha_atencion_estimada)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Presupuesto</dt>
            <dd>{formatPrecio(ticket.presupuesto)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Factura</dt>
            <dd>{formatPrecio(ticket.factura)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Costo reparación</dt>
            <dd className="font-medium text-emerald-800">{formatPrecio(ticket.costo)}</dd>
          </div>
        </dl>

        <div>
          <h3 className="text-sm font-semibold text-gray-700">Descripción</h3>
          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{ticket.descripcion}</p>
        </div>
        {ticket.observaciones_internas && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Observaciones internas</h3>
            <p className="text-sm text-gray-600 mt-1">{ticket.observaciones_internas}</p>
          </div>
        )}
      </div>

      {ticket.evidencias.length > 0 && (
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Evidencias</h2>
          <ul className="flex flex-wrap gap-3">
            {ticket.evidencias.map((e) => (
              <li key={e.id}>
                {e.url ? (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-brand-600 hover:underline"
                  >
                    {e.nombre_archivo}
                  </a>
                ) : (
                  <span className="text-sm text-gray-600">{e.nombre_archivo}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Historial</h2>
          <ul className="space-y-3 max-h-80 overflow-y-auto">
            {ticket.historial.map((h) => (
              <li key={h.id} className="text-sm border-l-2 border-brand-200 pl-3">
                <p className="text-gray-800">{h.descripcion}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatFecha(h.fecha)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Comentarios internos</h2>
          <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {ticket.comentarios.map((c) => (
              <li key={c.id} className="text-sm bg-gray-50 rounded-lg px-3 py-2">
                {c.contenido}
                <p className="text-xs text-gray-400 mt-1">{formatFecha(c.created_at)}</p>
              </li>
            ))}
          </ul>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Nuevo comentario..."
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <Button
            className="mt-2"
            size="sm"
            variant="primary"
            onClick={addComment}
            disabled={loading}
          >
            Agregar comentario
          </Button>
        </section>
      </div>

      <AssignTicketDialog
        ticket={ticket}
        manitasList={assignableManitas}
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onSuccess={refresh}
      />
      <ChangeStatusDialog
        ticket={ticket}
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
