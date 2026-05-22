"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { TICKET_ESTADOS_OPTIONS } from "../constants";
import type { TicketEstado, TicketMantenimiento } from "../types";
import { mantenimientoService } from "../services/mantenimiento.service";

export function ChangeStatusDialog({
  ticket,
  open,
  onClose,
  onSuccess,
  presetEstado,
}: {
  ticket: TicketMantenimiento | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Si se define, el estado queda fijado (p. ej. marcar resuelto desde la tarjeta) */
  presetEstado?: TicketEstado;
}) {
  const [estado, setEstado] = useState<TicketEstado>("nuevo");
  const [costo, setCosto] = useState("");
  const [observacion, setObservacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !ticket) return;
    setEstado(presetEstado ?? ticket.estado);
    setCosto(ticket.costo != null ? String(ticket.costo) : "");
    setObservacion("");
    setError(null);
  }, [open, ticket, presetEstado]);

  if (!open || !ticket) return null;

  const requiresCosto = estado === "resuelto";
  const isResolvePreset = presetEstado === "resuelto";

  const submit = async () => {
    setLoading(true);
    setError(null);

    const costoNum = costo.trim() ? Number(costo.replace(",", ".")) : null;
    const { error: err } = await mantenimientoService.changeStatus(
      ticket.id,
      estado,
      observacion || null,
      costoNum,
    );
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-lg font-bold">
          {isResolvePreset ? "Marcar como resuelto" : "Cambiar estado"}
        </h2>
        <p className="text-sm text-gray-500 font-mono">{ticket.codigo}</p>

        {!presetEstado && (
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as TicketEstado)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {TICKET_ESTADOS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}

        {requiresCosto && (
          <div className="space-y-1.5">
            <label htmlFor="ticket-costo" className="text-sm font-medium text-gray-700">
              Costo de la reparación <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="ticket-costo"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
                placeholder="0,00"
                className="w-full border border-gray-200 rounded-lg pl-3 pr-10 py-2 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                €
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Obligatorio al resolver. Más adelante podrás vincularlo a un gasto en finanzas.
            </p>
          </div>
        )}

        <textarea
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          placeholder="Observación (opcional)"
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submit} disabled={loading}>
            {isResolvePreset ? "Marcar resuelto" : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
