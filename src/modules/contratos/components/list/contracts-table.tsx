"use client";

import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import type { ContractListItem } from "../../types";
import { ContractStatusBadge } from "../contract-status-badge";
import { SignatureStatusBadge } from "../signature-status-badge";
import { formatFecha, formatPrecio } from "../../utils/labels";

export function ContractsTable({ contracts }: { contracts: ContractListItem[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {[
                "Código",
                "Tipo",
                "Propiedad",
                "Inquilino",
                "Inicio",
                "Fin",
                "Renta/mes",
                "Estado",
                "Firma",
                "Acciones",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contracts.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">
                  {c.codigo}
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-[120px] truncate">{c.tipo_contrato_nombre}</td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">
                  {c.propiedad_nombre}
                </td>
                <td className="px-4 py-3 text-gray-700">{c.inquilino_nombre}</td>
                <td className="px-4 py-3 text-gray-600">{formatFecha(c.fecha_inicio)}</td>
                <td className="px-4 py-3 text-gray-600">{formatFecha(c.fecha_fin)}</td>
                <td className="px-4 py-3 font-semibold">{formatPrecio(c.valor_mensual)}</td>
                <td className="px-4 py-3">
                  <ContractStatusBadge status={c.estado} />
                </td>
                <td className="px-4 py-3">
                  <SignatureStatusBadge summary={c.estado_firma} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Link
                      href={`/dashboard/contratos/${c.id}`}
                      className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      title="Ver detalle"
                    >
                      <Eye size={15} />
                    </Link>
                    {c.estado === "borrador" || c.estado === "pendiente_firma" ? (
                      <Link
                        href={`/dashboard/contratos/${c.id}/editar`}
                        className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </Link>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
