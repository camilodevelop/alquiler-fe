"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssignTicketSchema, type AssignTicketFormValues } from "@/shared/schemas/mantenimiento";
import { Button } from "@/components/ui";
import type { Manitas, TicketMantenimiento } from "../types";
import { mantenimientoService } from "../services/mantenimiento.service";
import { getManitasEspecialidadLabel, manitasNombreCompleto } from "../utils/labels";
import { MANITAS_ESTADO_CONFIG } from "../constants";

export function AssignTicketDialog({
  ticket,
  manitasList,
  open,
  onClose,
  onSuccess,
}: {
  ticket: TicketMantenimiento | null;
  manitasList: Manitas[];
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AssignTicketFormValues>({
    resolver: zodResolver(AssignTicketSchema),
    defaultValues: { manitas_id: "", fecha_atencion_estimada: "", observacion: "" },
  });

  if (!open || !ticket) return null;

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);
    const { error: err } = await mantenimientoService.assignTicket(ticket.id, values);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    reset();
    onSuccess();
    onClose();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Asignar manitas</h2>
        <p className="text-sm text-gray-500">
          Ticket <span className="font-mono text-brand-700">{ticket.codigo}</span> — {ticket.titulo}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Manitas</label>
            <select
              {...register("manitas_id")}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Seleccionar...</option>
              {manitasList.map((m) => (
                <option key={m.id} value={m.id}>
                  {manitasNombreCompleto(m)} — {getManitasEspecialidadLabel(m.especialidad)} (
                  {MANITAS_ESTADO_CONFIG[m.estado].label}, {m.tickets_asignados} activos)
                </option>
              ))}
            </select>
            {errors.manitas_id && (
              <p className="text-xs text-red-600 mt-1">{errors.manitas_id.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Fecha estimada de atención</label>
            <input
              type="date"
              {...register("fecha_atencion_estimada")}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Observación</label>
            <textarea
              {...register("observacion")}
              rows={3}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Asignando..." : "Asignar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
