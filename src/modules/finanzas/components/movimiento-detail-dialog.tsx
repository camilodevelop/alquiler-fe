"use client";

import Link from "next/link";
import { X, Pencil, FileText, Building2 } from "lucide-react";
import { Button } from "@/components/ui";
import type { MovimientoFinanciero } from "../types";
import { getEstadoLabel } from "../utils/labels";
import {
  formatFecha,
  formatMesCorrespondiente,
  formatPrecio,
  getCategoriaLabel,
  getMetodoPagoLabel,
} from "../utils/labels";

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-gray-50/80 border border-gray-100 px-3.5 py-2.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5">{children}</dd>
    </div>
  );
}

export function MovimientoDetailDialog({
  movimiento,
  open,
  onClose,
  onEdit,
}: {
  movimiento: MovimientoFinanciero | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}) {
  if (!open || !movimiento) return null;

  const m = movimiento;
  const isIngreso = m.tipo === "ingreso";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={[
            "px-6 py-5 border-b",
            isIngreso
              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 border-emerald-600/20 text-white"
              : "bg-gradient-to-r from-rose-600 to-rose-500 border-rose-600/20 text-white",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white border border-white/25">
                  {isIngreso ? "Ingreso" : "Gasto"}
                </span>
                <span className="inline-flex rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white/95 border border-white/20">
                  {getEstadoLabel(m.estado)}
                </span>
              </div>
              <h2 className="text-lg font-bold leading-snug pr-2">{m.concepto}</h2>
              <p className="text-sm text-white/80 mt-1 inline-flex items-center gap-1">
                <Building2 size={14} />
                {m.propiedad_nombre}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-white/80 hover:bg-white/15 hover:text-white shrink-0"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-3xl font-bold tabular-nums mt-4 tracking-tight">
            {formatPrecio(m.valor, m.tipo)}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <dl className="grid grid-cols-2 gap-2.5">
            <DetailItem label="Categoría">{getCategoriaLabel(m.categoria)}</DetailItem>
            <DetailItem label="Fecha movimiento">{formatFecha(m.fecha_movimiento)}</DetailItem>
            {m.fecha_vencimiento && (
              <DetailItem label="Vencimiento">{formatFecha(m.fecha_vencimiento)}</DetailItem>
            )}
            {m.fecha_pago && (
              <DetailItem label="Fecha pago">{formatFecha(m.fecha_pago)}</DetailItem>
            )}
            {m.mes_correspondiente && (
              <DetailItem label="Mes">{formatMesCorrespondiente(m.mes_correspondiente)}</DetailItem>
            )}
            {m.valor_esperado != null && (
              <DetailItem label="Valor esperado">{formatPrecio(m.valor_esperado)}</DetailItem>
            )}
            <DetailItem label="Método">{getMetodoPagoLabel(m.metodo_pago)}</DetailItem>
            {m.inquilino_nombre && (
              <DetailItem label="Inquilino">{m.inquilino_nombre}</DetailItem>
            )}
            {m.contrato_codigo && (
              <DetailItem label="Contrato">
                <span className="font-mono text-xs">{m.contrato_codigo}</span>
              </DetailItem>
            )}
            {m.ticket_codigo && (
              <DetailItem label="Ticket">
                <Link
                  href={`/dashboard/mantenimiento/${m.ticket_id}`}
                  className="font-mono text-xs text-brand-600 hover:underline"
                >
                  {m.ticket_codigo}
                </Link>
              </DetailItem>
            )}
            {m.manitas_nombre && (
              <DetailItem label="Proveedor">{m.manitas_nombre}</DetailItem>
            )}
          </dl>

          {m.observaciones && (
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
                Observaciones
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.observaciones}</p>
            </div>
          )}

          {m.comprobante_url && (
            <a
              href={m.comprobante_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <FileText size={16} />
              Abrir comprobante
            </a>
          )}
        </div>

        <div className="flex gap-2 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
          <Button variant="secondary" className="flex-1 sm:flex-none" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="primary" className="flex-1 sm:flex-none gap-1.5" onClick={onEdit}>
            <Pencil size={15} />
            Editar movimiento
          </Button>
        </div>
      </div>
    </div>
  );
}
