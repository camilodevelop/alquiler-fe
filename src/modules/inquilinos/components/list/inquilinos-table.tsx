"use client";

import Link from "next/link";
import { Eye, Pencil, UserX } from "lucide-react";
import type { Inquilino } from "../../types";
import { nombreCompleto, formatFecha, formatPrecio } from "../../utils/labels";
import { InquilinoEstadoBadge } from "../inquilino-estado-badge";
import { InquilinoPagoBadge } from "../inquilino-pago-badge";
import { InquilinoScoringBadge } from "../inquilino-scoring-badge";

export function InquilinosTable({
  inquilinos,
  onDeactivate,
}: {
  inquilinos: Inquilino[];
  onDeactivate: (id: string) => void;
}) {
  return (
    <div className="hidden md:block bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-left">
              {["Inquilino", "Documento", "Contacto", "Propiedad", "Ingreso", "Canon", "Estado pagos", "Estado", "Scoring", "Acciones"].map(
              (h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {inquilinos.map((inq) => (
            <tr
              key={inq.id}
              className={`hover:bg-gray-50 ${inq.status === "moroso" ? "bg-red-50/40" : ""}`}
            >
              <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                {nombreCompleto(inq.nombres, inq.apellidos)}
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{inq.numero_documento}</td>
              <td className="px-4 py-3 text-gray-600">
                <div className="text-xs">{inq.email}</div>
                <div className="text-xs text-gray-400">{inq.telefono}</div>
              </td>
              <td className="px-4 py-3 text-gray-600 max-w-[160px]">
                <div className="truncate">{inq.asignacion?.propiedad_nombre ?? "—"}</div>
                {inq.asignacion?.unidad_nombre ? (
                  <div className="text-xs text-gray-400">{inq.asignacion.unidad_nombre}</div>
                ) : null}
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {formatFecha(inq.asignacion?.fecha_ingreso)}
              </td>
              <td className="px-4 py-3 font-medium whitespace-nowrap">
                {inq.asignacion?.canon_mensual ? formatPrecio(inq.asignacion.canon_mensual) : "—"}
              </td>
              <td className="px-4 py-3">
                <InquilinoPagoBadge estado={inq.pago_resumen.estado} />
              </td>
              <td className="px-4 py-3">
                <InquilinoEstadoBadge status={inq.status} />
              </td>
              <td className="px-4 py-3">
                <InquilinoScoringBadge nivel={inq.scoring?.nivel ?? "sin_evaluar"} />
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <Link href={`/dashboard/inquilinos/${inq.id}`} className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="Ver">
                    <Eye size={15} />
                  </Link>
                  <Link href={`/dashboard/inquilinos/${inq.id}/editar`} className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50" title="Editar">
                    <Pencil size={15} />
                  </Link>
                  <button type="button" onClick={() => onDeactivate(inq.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50" title="Desactivar">
                    <UserX size={15} />
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
