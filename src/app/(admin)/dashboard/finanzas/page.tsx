"use client";

import {
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui";

// ---- Datos mock ----
const DATOS_MENSUALES = [
  { mes: "Nov", ingresos: 6200, gastos: 1400 },
  { mes: "Dic", ingresos: 7100, gastos: 1800 },
  { mes: "Ene", ingresos: 6800, gastos: 1200 },
  { mes: "Feb", ingresos: 7400, gastos: 1100 },
  { mes: "Mar", ingresos: 8000, gastos: 1650 },
  { mes: "Abr", ingresos: 8450, gastos: 950 },
];

type EstadoPago = "cobrado" | "pendiente" | "impagado";

interface TransaccionMock {
  fecha: string;
  concepto: string;
  propiedad: string;
  importe: string;
  tipo: "ingreso" | "gasto";
  estado: EstadoPago;
}

const TRANSACCIONES: TransaccionMock[] = [
  {
    fecha: "01/04/2026",
    concepto: "Renta mensual",
    propiedad: "Calle Mayor 12, 3ºA",
    importe: "+€950",
    tipo: "ingreso",
    estado: "cobrado",
  },
  {
    fecha: "01/04/2026",
    concepto: "Renta mensual",
    propiedad: "Av. Diagonal 88, 2ºB",
    importe: "+€1.200",
    tipo: "ingreso",
    estado: "cobrado",
  },
  {
    fecha: "05/04/2026",
    concepto: "Reparación fontanería",
    propiedad: "Calle Mayor 12, 3ºA",
    importe: "-€350",
    tipo: "gasto",
    estado: "cobrado",
  },
  {
    fecha: "01/04/2026",
    concepto: "Renta mensual",
    propiedad: "Calle Serrano 44, 5ºD",
    importe: "+€1.800",
    tipo: "ingreso",
    estado: "pendiente",
  },
  {
    fecha: "10/04/2026",
    concepto: "Seguro hogar",
    propiedad: "Calle Goya 31, 4ºA",
    importe: "-€600",
    tipo: "gasto",
    estado: "cobrado",
  },
  {
    fecha: "01/04/2026",
    concepto: "Renta mensual",
    propiedad: "Gran Vía 22, 6ºA",
    importe: "+€1.100",
    tipo: "ingreso",
    estado: "impagado",
  },
];

const ESTADO_CONFIG: Record<
  EstadoPago,
  { variant: "success" | "warning" | "danger"; label: string }
> = {
  cobrado: { variant: "success", label: "Cobrado" },
  pendiente: { variant: "warning", label: "Pendiente" },
  impagado: { variant: "danger", label: "Impagado" },
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor = "text-gray-900",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${valueColor}`}>{value}</p>
          <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

export default function FinanzasPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen financiero de tu cartera — 2026
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total ingresos año"
          value="€42.250"
          subtitle="Acumulado 2026"
          icon={TrendingUp}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          valueColor="text-green-700"
        />
        <StatCard
          title="Pendiente de cobro"
          value="€2.900"
          subtitle="3 pagos pendientes"
          icon={Clock}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
          valueColor="text-yellow-700"
        />
        <StatCard
          title="Gastos totales"
          value="€8.100"
          subtitle="Reparaciones y seguros"
          icon={TrendingDown}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          valueColor="text-red-600"
        />
        <StatCard
          title="Rentabilidad neta"
          value="6.8%"
          subtitle="Sobre valor de mercado"
          icon={BarChart3}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          valueColor="text-violet-700"
        />
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900">
            Ingresos vs Gastos
          </h2>
          <p className="text-sm text-gray-500">Comparativa mensual — últimos 6 meses</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={DATOS_MENSUALES}
            margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
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
              formatter={(value: number, name: string) => [
                `€${value.toLocaleString("es-ES")}`,
                name === "ingresos" ? "Ingresos" : "Gastos",
              ]}
            />
            <Legend
              formatter={(value) => (value === "ingresos" ? "Ingresos" : "Gastos")}
              iconType="circle"
              wrapperStyle={{ fontSize: "13px" }}
            />
            <Bar dataKey="ingresos" fill="#09b850" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gastos" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla transacciones */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Transacciones recientes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Fecha", "Concepto", "Propiedad", "Importe", "Estado"].map((col) => (
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
              {TRANSACCIONES.map((t, i) => {
                const estado = ESTADO_CONFIG[t.estado];
                const importeColor =
                  t.tipo === "ingreso" ? "text-green-600" : "text-red-500";
                return (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{t.fecha}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{t.concepto}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                      {t.propiedad}
                    </td>
                    <td className={`px-4 py-3 font-semibold ${importeColor}`}>
                      {t.importe}
                    </td>
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
