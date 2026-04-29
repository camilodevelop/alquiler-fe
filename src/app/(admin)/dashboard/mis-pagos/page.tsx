"use client";

import { CalendarClock, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui";

type EstadoPago = "cobrado" | "pendiente" | "impagado";

interface PagoMock {
  mes: string;
  importe: string;
  fecha_pago: string;
  metodo: string;
  estado: EstadoPago;
}

const PAGOS: PagoMock[] = [
  {
    mes: "Abril 2026",
    importe: "€950",
    fecha_pago: "—",
    metodo: "—",
    estado: "pendiente",
  },
  {
    mes: "Marzo 2026",
    importe: "€950",
    fecha_pago: "01/03/2026",
    metodo: "Transferencia bancaria",
    estado: "cobrado",
  },
  {
    mes: "Febrero 2026",
    importe: "€950",
    fecha_pago: "01/02/2026",
    metodo: "Transferencia bancaria",
    estado: "cobrado",
  },
  {
    mes: "Enero 2026",
    importe: "€950",
    fecha_pago: "02/01/2026",
    metodo: "Transferencia bancaria",
    estado: "cobrado",
  },
  {
    mes: "Diciembre 2025",
    importe: "€950",
    fecha_pago: "—",
    metodo: "—",
    estado: "impagado",
  },
  {
    mes: "Noviembre 2025",
    importe: "€950",
    fecha_pago: "03/11/2025",
    metodo: "Domiciliación",
    estado: "cobrado",
  },
  {
    mes: "Octubre 2025",
    importe: "€950",
    fecha_pago: "01/10/2025",
    metodo: "Domiciliación",
    estado: "cobrado",
  },
  {
    mes: "Septiembre 2025",
    importe: "€950",
    fecha_pago: "01/09/2025",
    metodo: "Domiciliación",
    estado: "cobrado",
  },
];

const ESTADO_CONFIG: Record<
  EstadoPago,
  { variant: "success" | "warning" | "danger"; label: string }
> = {
  cobrado: { variant: "success", label: "Pagado" },
  pendiente: { variant: "warning", label: "Pendiente" },
  impagado: { variant: "danger", label: "Impagado" },
};

export default function MisPagosPage() {
  const totalPagado = PAGOS.filter((p) => p.estado === "cobrado").length * 950;
  const impagados = PAGOS.filter((p) => p.estado === "impagado").length;
  const pendientes = PAGOS.filter((p) => p.estado === "pendiente").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Pagos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Historial de pagos de tu contrato de arrendamiento
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Próximo pago */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Próximo pago</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">€950</p>
              <p className="mt-1 text-xs text-gray-400">Vence el 01/05/2026</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
              <CalendarClock size={22} className="text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Total pagado */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total pagado</p>
              <p className="mt-2 text-3xl font-bold text-green-700">
                €{totalPagado.toLocaleString("es-ES")}
              </p>
              <p className="mt-1 text-xs text-gray-400">Desde inicio del contrato</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={22} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Pagos pendientes / impagados */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pagos pendientes</p>
              <p className="mt-2 text-3xl font-bold text-orange-600">
                {pendientes + impagados}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {pendientes} pendiente · {impagados} impagado
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={22} className="text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla historial */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Historial de pagos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Mes", "Importe", "Fecha de pago", "Método", "Estado"].map((col) => (
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
              {PAGOS.map((pago, i) => {
                const estado = ESTADO_CONFIG[pago.estado];
                return (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{pago.mes}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {pago.importe}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{pago.fecha_pago}</td>
                    <td className="px-4 py-3 text-gray-600">{pago.metodo}</td>
                    <td className="px-4 py-3">
                      <Badge variant={estado.variant}>{estado.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
