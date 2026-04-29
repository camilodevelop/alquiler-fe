"use client";

import {
  Building2,
  TrendingUp,
  FileText,
  Wrench,
  ArrowUpRight,
  AlertCircle,
  Clock,
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

// ---- Datos mock ----
const INGRESOS_MENSUALES = [
  { mes: "Nov", importe: 6200 },
  { mes: "Dic", importe: 7100 },
  { mes: "Ene", importe: 6800 },
  { mes: "Feb", importe: 7400 },
  { mes: "Mar", importe: 8000 },
  { mes: "Abr", importe: 8450 },
];

const PROPIEDADES_RECIENTES = [
  {
    direccion: "Calle Mayor 12, 3ºA",
    inquilino: "Ana García López",
    renta: "€950",
    estado: "alquilada" as const,
    proximo_cobro: "01/05/2026",
  },
  {
    direccion: "Av. Diagonal 88, 2ºB",
    inquilino: "Carlos Martínez",
    renta: "€1.200",
    estado: "alquilada" as const,
    proximo_cobro: "01/05/2026",
  },
  {
    direccion: "Plaza España 5, 1ºC",
    inquilino: "—",
    renta: "€780",
    estado: "disponible" as const,
    proximo_cobro: "—",
  },
  {
    direccion: "Calle Goya 31, 4ºA",
    inquilino: "Laura Sánchez",
    renta: "€1.050",
    estado: "alquilada" as const,
    proximo_cobro: "01/05/2026",
  },
  {
    direccion: "Paseo Castellana 14, BJ",
    inquilino: "—",
    renta: "€650",
    estado: "mantenimiento" as const,
    proximo_cobro: "—",
  },
];

const ESTADO_BADGE: Record<string, { variant: "success" | "warning" | "danger" | "default" | "info"; label: string }> = {
  alquilada: { variant: "success", label: "Alquilada" },
  disponible: { variant: "info", label: "Disponible" },
  mantenimiento: { variant: "warning", label: "Mantenimiento" },
};

// ---- Componente stat card ----
interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendType: "positive" | "neutral" | "warning";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

function StatCard({
  title,
  value,
  trend,
  trendType,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  const trendColors = {
    positive: "text-green-600",
    neutral: "text-blue-600",
    warning: "text-orange-500",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>
      <div className={`mt-4 flex items-center gap-1 text-xs font-medium ${trendColors[trendType]}`}>
        {trendType === "positive" ? (
          <ArrowUpRight size={14} />
        ) : trendType === "warning" ? (
          <AlertCircle size={14} />
        ) : (
          <Clock size={14} />
        )}
        <span>{trend}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen de tu cartera de alquileres
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Propiedades activas"
          value="12"
          trend="+2 este mes"
          trendType="positive"
          icon={Building2}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Ingresos del mes"
          value="€8.450"
          trend="+12% vs mes anterior"
          trendType="positive"
          icon={TrendingUp}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Contratos activos"
          value="8"
          trend="3 vencen pronto"
          trendType="neutral"
          icon={FileText}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <StatCard
          title="Incidencias abiertas"
          value="3"
          trend="1 urgente"
          trendType="warning"
          icon={Wrench}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
        />
      </div>

      {/* Gráfico + Tabla */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Gráfico ingresos */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">
              Ingresos mensuales
            </h2>
            <p className="text-sm text-gray-500">Últimos 6 meses</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={INGRESOS_MENSUALES}
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
                formatter={(value: number) => [`€${value.toLocaleString("es-ES")}`, "Ingresos"]}
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
        </div>

        {/* Resumen rápido */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Resumen financiero
            </h2>
            <p className="text-sm text-gray-500">Acumulado 2026</p>
          </div>
          <div className="space-y-4">
            {[
              { label: "Ingresos totales", value: "€42.250", color: "text-green-600" },
              { label: "Gastos totales", value: "€8.100", color: "text-red-500" },
              { label: "Beneficio neto", value: "€34.150", color: "text-gray-900" },
              { label: "Rentabilidad media", value: "6.8%", color: "text-brand-600" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className={`text-sm font-semibold ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Datos actualizados a {new Date().toLocaleDateString("es-ES")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla propiedades recientes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Propiedades recientes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Dirección", "Inquilino", "Renta/mes", "Estado", "Próximo cobro"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PROPIEDADES_RECIENTES.map((p, i) => {
                const badgeInfo =
                  ESTADO_BADGE[p.estado] ?? { variant: "default", label: p.estado };
                return (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {p.direccion}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.inquilino}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {p.renta}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={badgeInfo.variant}>
                        {badgeInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.proximo_cobro}</td>
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
