import { CHART_COLORS, PROPIEDAD_ESTADO_LABEL } from "../constants";
import type { ChartPoint, ReportTabPayload } from "../types";
import { formatEuro, formatNum, formatPct } from "./format";
import {
  filterSnapshot,
  ingresosGastosPropiedad,
  movimientosByPropiedad,
  type ReportesSnapshot,
} from "./snapshot";
import type { ReportFilters } from "../types";

const TIPO_RENTA_LABEL: Record<string, string> = {
  tradicional: "Tradicional",
  habitaciones: "Habitaciones",
  temporal: "Temporal",
  comercial: "Comercial",
};

export function buildPropiedadesReport(
  raw: ReportesSnapshot,
  filters: ReportFilters,
): ReportTabPayload {
  const snap = filterSnapshot(raw, filters, "propiedades");
  const { propiedades, movimientos } = snap;

  const stats = propiedades.map((p) => {
    const movs = movimientosByPropiedad(movimientos, p.id);
    const { ingresos, gastos, saldo } = ingresosGastosPropiedad(movs);
    const rentabilidad = ingresos > 0 ? (saldo / ingresos) * 100 : 0;
    return { p, ingresos, gastos, saldo, rentabilidad };
  });

  const bestIngresos = [...stats].sort((a, b) => b.ingresos - a.ingresos)[0];
  const maxGastos = [...stats].sort((a, b) => b.gastos - a.gastos)[0];

  const byEstado: ChartPoint[] = Object.entries(
    propiedades.reduce<Record<string, number>>((acc, p) => {
      const k = PROPIEDAD_ESTADO_LABEL[p.estado] ?? p.estado;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const byTipoRenta: ChartPoint[] = Object.entries(
    propiedades.reduce<Record<string, number>>((acc, p) => {
      const k = TIPO_RENTA_LABEL[p.tipo_renta] ?? p.tipo_renta;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const topIngresos = [...stats]
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, 8)
    .map((s) => ({ name: s.p.titulo.slice(0, 24), value: s.ingresos }));

  const topGastos = [...stats]
    .sort((a, b) => b.gastos - a.gastos)
    .slice(0, 8)
    .map((s) => ({ name: s.p.titulo.slice(0, 24), value: s.gastos }));

  const rentabilidad = [...stats]
    .sort((a, b) => b.rentabilidad - a.rentabilidad)
    .slice(0, 8)
    .map((s) => ({ name: s.p.titulo.slice(0, 24), value: Math.round(s.rentabilidad) }));

  return {
    kpis: [
      { id: "total", label: "Total propiedades", value: formatNum(propiedades.length) },
      {
        id: "ocup",
        label: "Ocupadas",
        value: formatNum(propiedades.filter((p) => p.estado === "alquilada").length),
        tone: "success",
      },
      {
        id: "disp",
        label: "Disponibles",
        value: formatNum(propiedades.filter((p) => p.estado === "disponible").length),
        tone: "info",
      },
      {
        id: "mant",
        label: "En mantenimiento",
        value: formatNum(propiedades.filter((p) => p.estado === "mantenimiento").length),
        tone: "warning",
      },
      {
        id: "best",
        label: "Mejor por ingresos",
        value: bestIngresos ? bestIngresos.p.titulo.slice(0, 28) : "—",
        sub: bestIngresos ? formatEuro(bestIngresos.ingresos) : undefined,
      },
      {
        id: "max-gasto",
        label: "Más gastos",
        value: maxGastos ? maxGastos.p.titulo.slice(0, 28) : "—",
        sub: maxGastos ? formatEuro(maxGastos.gastos) : undefined,
      },
    ],
    charts: [
      { id: "estado", title: "Propiedades por estado", type: "donut", data: byEstado, colors: CHART_COLORS },
      { id: "tipo", title: "Por tipo de renta", type: "bar", data: byTipoRenta, colors: CHART_COLORS },
      { id: "ing", title: "Ingresos por propiedad", type: "hbar", data: topIngresos, colors: [CHART_COLORS[0]] },
      { id: "gas", title: "Gastos por propiedad", type: "hbar", data: topGastos, colors: [CHART_COLORS[3]] },
      { id: "rent", title: "Rentabilidad por propiedad", type: "bar", data: rentabilidad, colors: [CHART_COLORS[1]] },
    ],
    table: {
      columns: [
        { key: "propiedad", label: "Propiedad" },
        { key: "tipo", label: "Tipo renta" },
        { key: "estado", label: "Estado" },
        { key: "ingresos", label: "Ingresos", align: "right" },
        { key: "gastos", label: "Gastos", align: "right" },
        { key: "saldo", label: "Saldo neto", align: "right" },
        { key: "rent", label: "Rentabilidad", align: "right" },
      ],
      rows: stats.map(({ p, ingresos, gastos, saldo, rentabilidad }) => ({
        id: p.id,
        cells: {
          propiedad: p.titulo,
          tipo: TIPO_RENTA_LABEL[p.tipo_renta] ?? p.tipo_renta,
          estado: PROPIEDAD_ESTADO_LABEL[p.estado] ?? p.estado,
          ingresos: formatEuro(ingresos),
          gastos: formatEuro(gastos),
          saldo: formatEuro(saldo),
          rent: formatPct(rentabilidad),
        },
      })),
    },
  };
}
