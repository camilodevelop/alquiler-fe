"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  TrendingUp,
  FileText,
  Wrench,
  ArrowUpRight,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui";
import type { DashboardData, DashboardStat } from "@/modules/dashboard/types";

const ESTADO_BADGE: Record<
  string,
  { variant: "success" | "warning" | "danger" | "default" | "info"; label: string }
> = {
  alquilada: { variant: "success", label: "Alquilada" },
  disponible: { variant: "info", label: "Disponible" },
  mantenimiento: { variant: "warning", label: "Mantenimiento" },
  inactiva: { variant: "default", label: "Inactiva" },
};

const STAT_ICONS: Record<
  string,
  { icon: React.ElementType; iconBg: string; iconColor: string }
> = {
  prop: { icon: Building2, iconBg: "bg-green-50", iconColor: "text-green-600" },
  ing: { icon: TrendingUp, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  contratos: { icon: FileText, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
  tickets: { icon: Wrench, iconBg: "bg-orange-50", iconColor: "text-orange-500" },
  mora: { icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-600" },
};

function StatCard({ stat }: { stat: DashboardStat }) {
  const meta = STAT_ICONS[stat.id] ?? STAT_ICONS.prop;
  const Icon = meta.icon;
  const trendColors = {
    positive: "text-green-600",
    neutral: "text-blue-600",
    warning: "text-orange-500",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.iconBg}`}
        >
          <Icon size={22} className={meta.iconColor} />
        </div>
      </div>
      <div
        className={`mt-4 flex items-center gap-1 text-xs font-medium ${trendColors[stat.trendType]}`}
      >
        {stat.trendType === "positive" ? (
          <ArrowUpRight size={14} />
        ) : stat.trendType === "warning" ? (
          <AlertCircle size={14} />
        ) : (
          <Clock size={14} />
        )}
        <span>{stat.trend}</span>
      </div>
    </div>
  );
}

export function DashboardPageClient({
  data,
  error,
}: {
  data: DashboardData;
  error?: string;
}) {
  const year = new Date().getFullYear();
  const hasChartData = data.ingresosMensuales.some((m) => m.importe > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen de tu cartera de alquileres</p>
      </div>

      {error && (
        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {data.stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">Ingresos mensuales</h2>
            <p className="text-sm text-gray-500">Últimos 6 meses · ingresos pagados</p>
          </div>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={data.ingresosMensuales}
                margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorImporte" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#09b850" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#09b850" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [
                    `€${value.toLocaleString("es-ES")}`,
                    "Ingresos",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="importe"
                  stroke="#09b850"
                  strokeWidth={2.5}
                  fill="url(#colorImporte)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#09b850" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center rounded-lg bg-gray-50 border border-dashed border-gray-200">
              <p className="text-sm text-gray-400">Sin ingresos registrados en el periodo</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">Resumen financiero</h2>
            <p className="text-sm text-gray-500">Acumulado {year}</p>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Ingresos totales",
                value: data.resumenFinanciero.ingresosTotales,
                color: "text-green-600",
              },
              {
                label: "Gastos totales",
                value: data.resumenFinanciero.gastosTotales,
                color: "text-red-500",
              },
              {
                label: "Beneficio neto",
                value: data.resumenFinanciero.beneficioNeto,
                color: "text-gray-900",
              },
              {
                label: "Margen sobre ingresos",
                value: data.resumenFinanciero.rentabilidadMedia,
                color: "text-brand-600",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
            <p className="text-xs text-gray-400">
              Datos actualizados a {data.fechaActualizacion}
            </p>
            <Link
              href="/dashboard/finanzas"
              className="text-xs font-medium text-brand-600 hover:underline shrink-0"
            >
              Ver contabilidad
            </Link>
          </div>
        </div>
      </div>

      <div
        className={[
          "rounded-xl border shadow-sm overflow-hidden",
          data.pagosMora.count > 0
            ? "border-red-200/80 bg-white"
            : "border-gray-200 bg-white",
        ].join(" ")}
      >
        <div
          className={[
            "px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3",
            data.pagosMora.count > 0
              ? "border-red-100 bg-red-50/50"
              : "border-gray-100 bg-gray-50/50",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <span
              className={[
                "flex h-10 w-10 items-center justify-center rounded-xl",
                data.pagosMora.count > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600",
              ].join(" ")}
            >
              {data.pagosMora.count > 0 ? (
                <AlertTriangle size={20} />
              ) : (
                <CheckCircle2 size={20} />
              )}
            </span>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Pagos en mora</h2>
              <p className="text-sm text-gray-500">
                {data.pagosMora.count > 0
                  ? `${data.pagosMora.count} cobro${data.pagosMora.count !== 1 ? "s" : ""} · ${data.pagosMora.totalPendiente} pendiente`
                  : "No hay arriendos vencidos ni pagos atrasados"}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/finanzas"
            className="text-sm font-medium text-brand-600 hover:underline shrink-0"
          >
            Ir a contabilidad
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Propiedad",
                  "Inquilino",
                  "Concepto",
                  "Periodo",
                  "Importe",
                  "Días en mora",
                  "Estado",
                ].map((col) => (
                  <th
                    key={col}
                    className={[
                      "px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap",
                      col === "Importe" || col === "Días en mora" ? "text-right" : "text-left",
                    ].join(" ")}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.pagosMora.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    Todos los pagos de arriendo están al día.
                  </td>
                </tr>
              ) : (
                data.pagosMora.rows.slice(0, 12).map((row) => (
                  <tr key={row.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                      <Link
                        href={`/dashboard/propiedades/${row.propiedad_id}`}
                        className="hover:text-brand-600 hover:underline"
                      >
                        {row.propiedad}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[160px] truncate">
                      {row.inquilino_id ? (
                        <Link
                          href={`/dashboard/inquilinos/${row.inquilino_id}`}
                          className="hover:text-brand-600 hover:underline"
                        >
                          {row.inquilino}
                        </Link>
                      ) : (
                        row.inquilino
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[180px] truncate">
                      {row.concepto}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.periodo}</td>
                    <td className="px-6 py-4 text-right font-semibold text-red-700 tabular-nums">
                      {row.importeLabel}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums">
                      <span
                        className={
                          row.diasMora > 30
                            ? "font-semibold text-red-700"
                            : row.diasMora > 7
                              ? "font-medium text-orange-600"
                              : "text-gray-600"
                        }
                      >
                        {row.diasMora} d
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="danger">{row.estadoLabel}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data.pagosMora.rows.length > 12 && (
          <p className="px-6 py-3 text-xs text-gray-500 border-t border-gray-100 bg-gray-50/50">
            Mostrando 12 de {data.pagosMora.count}. Revisa el resto en{" "}
            <Link href="/dashboard/finanzas" className="text-brand-600 hover:underline font-medium">
              contabilidad
            </Link>
            .
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900">Propiedades recientes</h2>
          <Link
            href="/dashboard/propiedades"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Ver todas
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Propiedad", "Inquilino", "Renta/mes", "Estado", "Próximo cobro"].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.propiedadesRecientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No hay propiedades registradas.{" "}
                    <Link href="/dashboard/propiedades/nueva" className="text-brand-600 hover:underline">
                      Crear la primera
                    </Link>
                  </td>
                </tr>
              ) : (
                data.propiedadesRecientes.map((p) => {
                  const badgeInfo =
                    ESTADO_BADGE[p.estado] ?? { variant: "default" as const, label: p.estado };
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <Link
                          href={`/dashboard/propiedades/${p.id}`}
                          className="hover:text-brand-600 hover:underline"
                        >
                          {p.direccion}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{p.inquilino}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{p.renta}</td>
                      <td className="px-6 py-4">
                        <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{p.proximo_cobro}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
