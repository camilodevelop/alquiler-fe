"use client";

import Link from "next/link";
import { Building2, Calendar, Eye, Mail, Pencil, Phone, UserX } from "lucide-react";
import type { Inquilino } from "../../types";
import { nombreCompleto, formatFecha, formatPrecio } from "../../utils/labels";
import { InquilinoEstadoBadge } from "../inquilino-estado-badge";
import { InquilinoPagoBadge } from "../inquilino-pago-badge";
import { InquilinoScoringBadge } from "../inquilino-scoring-badge";

export function InquilinosGrid({
  inquilinos,
  onDeactivate,
}: {
  inquilinos: Inquilino[];
  onDeactivate: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {inquilinos.map((inq) => {
        const nombre = nombreCompleto(inq.nombres, inq.apellidos);
        const initial = inq.nombres.charAt(0).toUpperCase();
        const moroso = inq.status === "moroso";

        return (
          <article
            key={inq.id}
            className={`flex flex-col rounded-2xl border bg-white shadow-sm overflow-hidden transition-all hover:shadow-md ${
              moroso ? "border-red-200 ring-1 ring-red-100" : "border-gray-200/90 hover:border-brand-200/60"
            }`}
          >
            <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold ${
                      moroso ? "bg-red-100 text-red-700" : "bg-brand-50 text-brand-700"
                    }`}
                  >
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{nombre}</p>
                    <p className="text-xs text-gray-500">{inq.tipo_documento.toUpperCase()} {inq.numero_documento}</p>
                  </div>
                </div>
                <InquilinoEstadoBadge status={inq.status} />
              </div>

              <div className="space-y-1.5 text-xs text-gray-600">
                <p className="flex items-center gap-2 truncate">
                  <Mail size={13} className="text-gray-400 shrink-0" />
                  {inq.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={13} className="text-gray-400 shrink-0" />
                  {inq.telefono}
                </p>
              </div>

              {inq.asignacion?.propiedad_nombre ? (
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-xs">
                  <p className="flex items-center gap-1.5 font-medium text-gray-800 truncate">
                    <Building2 size={13} className="text-gray-400 shrink-0" />
                    {inq.asignacion.propiedad_nombre}
                  </p>
                  {inq.asignacion.unidad_nombre ? (
                    <p className="text-gray-500 mt-0.5 pl-5">{inq.asignacion.unidad_nombre}</p>
                  ) : null}
                  {inq.asignacion.fecha_ingreso ? (
                    <p className="flex items-center gap-1 text-gray-500 mt-1 pl-5">
                      <Calendar size={12} /> Ingreso: {formatFecha(inq.asignacion.fecha_ingreso)}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Sin propiedad asignada</p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
                <InquilinoPagoBadge estado={inq.pago_resumen.estado} />
                <InquilinoScoringBadge nivel={inq.scoring?.nivel ?? "sin_evaluar"} />
                {inq.asignacion?.canon_mensual ? (
                  <span className="text-xs font-semibold text-gray-800 ml-auto">
                    {formatPrecio(inq.asignacion.canon_mensual)}/mes
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex border-t border-gray-100 bg-gray-50/50">
              <Link
                href={`/dashboard/inquilinos/${inq.id}`}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-gray-600 hover:text-brand-700 hover:bg-white transition-colors"
              >
                <Eye size={14} /> Ver
              </Link>
              <Link
                href={`/dashboard/inquilinos/${inq.id}/editar`}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-gray-600 hover:text-brand-700 hover:bg-white border-l border-gray-100 transition-colors"
              >
                <Pencil size={14} /> Editar
              </Link>
              <button
                type="button"
                onClick={() => onDeactivate(inq.id)}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-white border-l border-gray-100 transition-colors"
              >
                <UserX size={14} /> Desactivar
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
