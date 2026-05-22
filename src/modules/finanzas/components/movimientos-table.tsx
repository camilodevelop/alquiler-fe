"use client";

import Link from "next/link";
import { Building2, Eye, Pencil, Trash2, FileText } from "lucide-react";
import type { MovimientoFinanciero } from "../types";
import { MovimientoEstadoBadge } from "./movimiento-estado-badge";
import { MovimientoTipoBadge } from "./movimiento-tipo-badge";
import {
  formatFecha,
  formatMesCorrespondiente,
  formatPrecio,
  getCategoriaLabel,
  getMetodoPagoLabel,
} from "../utils/labels";
import { MovimientosEmpty } from "./movimientos-empty";

const ROW_ACCENT: Record<MovimientoFinanciero["tipo"], string> = {
  ingreso: "border-l-emerald-500",
  gasto: "border-l-rose-500",
};

export function MovimientosTable({
  movimientos,
  onView,
  onDelete,
  deletingId,
  onClearFilters,
}: {
  movimientos: MovimientoFinanciero[];
  onView: (m: MovimientoFinanciero) => void;
  onDelete: (m: MovimientoFinanciero) => void;
  deletingId?: string | null;
  onClearFilters?: () => void;
}) {
  if (movimientos.length === 0) {
    return <MovimientosEmpty variant="filters" onClearFilters={onClearFilters} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[1100px]">
        <thead>
          <tr className="bg-slate-50/90 border-b border-gray-200">
            {[
              "Fecha",
              "Movimiento",
              "Propiedad",
              "Relaciones",
              "Categoría",
              "Valor",
              "Pago",
              "",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap first:pl-5 last:pr-5"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {movimientos.map((m) => (
            <tr
              key={m.id}
              className={[
                "group border-l-[3px] transition-colors",
                ROW_ACCENT[m.tipo],
                m.estado === "cancelado" ? "opacity-60 bg-gray-50/50" : "hover:bg-slate-50/80 bg-white",
                deletingId === m.id ? "opacity-40 pointer-events-none" : "",
              ].join(" ")}
            >
              <td className="px-4 py-3.5 pl-5 whitespace-nowrap">
                <span className="font-medium text-gray-900 tabular-nums">
                  {formatFecha(m.fecha_movimiento)}
                </span>
                {m.mes_correspondiente && (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {formatMesCorrespondiente(m.mes_correspondiente)}
                  </p>
                )}
              </td>
              <td className="px-4 py-3.5 min-w-[200px]">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <MovimientoTipoBadge tipo={m.tipo} />
                  <MovimientoEstadoBadge estado={m.estado} />
                </div>
                <p className="font-medium text-gray-900 leading-snug line-clamp-2" title={m.concepto}>
                  {m.concepto}
                </p>
              </td>
              <td className="px-4 py-3.5">
                <span className="inline-flex items-center gap-1.5 text-gray-800 max-w-[160px]">
                  <Building2 size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate font-medium">{m.propiedad_nombre}</span>
                </span>
              </td>
              <td className="px-4 py-3.5 text-xs text-gray-600 space-y-0.5 min-w-[120px]">
                {m.inquilino_nombre && <p className="truncate">{m.inquilino_nombre}</p>}
                {m.contrato_codigo && (
                  <p className="font-mono text-gray-500">{m.contrato_codigo}</p>
                )}
                {m.ticket_codigo && (
                  <Link
                    href={`/dashboard/mantenimiento/${m.ticket_id}`}
                    className="font-mono text-brand-600 hover:underline inline-block"
                  >
                    {m.ticket_codigo}
                  </Link>
                )}
                {!m.inquilino_nombre && !m.contrato_codigo && !m.ticket_codigo && (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-4 py-3.5">
                <span className="text-gray-600">{getCategoriaLabel(m.categoria)}</span>
              </td>
              <td className="px-4 py-3.5 text-right whitespace-nowrap">
                <span
                  className={`text-base font-bold tabular-nums tracking-tight ${
                    m.tipo === "ingreso" ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {formatPrecio(m.valor, m.tipo)}
                </span>
                {m.valor_esperado != null && m.estado === "parcial" && (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    de {formatPrecio(m.valor_esperado)}
                  </p>
                )}
              </td>
              <td className="px-4 py-3.5">
                <span className="text-gray-600">{getMetodoPagoLabel(m.metodo_pago)}</span>
                {m.fecha_pago && (
                  <p className="text-[11px] text-gray-400 mt-0.5 tabular-nums">
                    {formatFecha(m.fecha_pago)}
                  </p>
                )}
              </td>
              <td className="px-4 py-3.5 pr-5">
                <div className="flex items-center justify-end gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {m.comprobante_url && (
                    <a
                      href={m.comprobante_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50"
                      title="Comprobante"
                    >
                      <FileText size={15} />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => onView(m)}
                    className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50"
                    title="Ver detalle"
                  >
                    <Eye size={15} />
                  </button>
                  <Link
                    href={`/dashboard/finanzas/${m.id}/editar`}
                    className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50"
                    title="Editar"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(m)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
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
  );
}
