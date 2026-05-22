import { computeContabilidadTotales } from "@/modules/finanzas/utils/stats";
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO } from "@/modules/finanzas/constants";
import { CHART_COLORS } from "../constants";
import type { ChartPoint, ReportTabPayload } from "../types";
import { monthBuckets, monthLabel } from "./dates";
import { formatEuro } from "./format";
import {
  filterSnapshot,
  ingresosGastosPropiedad,
  movimientosByPropiedad,
  type ReportesSnapshot,
} from "./snapshot";
import type { ReportFilters } from "../types";

function categoriaLabel(
  cat: string,
  tipo: "ingreso" | "gasto",
): string {
  const list = tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  return list.find((c) => c.value === cat)?.label ?? cat;
}

export function buildContabilidadReport(
  raw: ReportesSnapshot,
  filters: ReportFilters,
): ReportTabPayload {
  const snap = filterSnapshot(raw, filters, "contabilidad");
  const { propiedades, movimientos } = snap;
  const totales = computeContabilidadTotales(movimientos);
  const desde = filters.fecha_desde ?? "";
  const hasta = filters.fecha_hasta ?? "";
  const months = desde && hasta ? monthBuckets(desde, hasta) : [];

  const ingresosPorMes = new Map(months.map((m) => [m, 0]));
  const gastosPorMes = new Map(months.map((m) => [m, 0]));
  for (const m of movimientos) {
    const key = m.fecha_movimiento.slice(0, 7);
    if (!ingresosPorMes.has(key)) continue;
    if (m.tipo === "ingreso" && m.estado === "pagado") {
      ingresosPorMes.set(key, (ingresosPorMes.get(key) ?? 0) + m.valor);
    }
    if (m.tipo === "gasto" && m.estado === "pagado") {
      gastosPorMes.set(key, (gastosPorMes.get(key) ?? 0) + m.valor);
    }
  }

  const ingresosGastosData: ChartPoint[] = months.map((m) => ({
    name: monthLabel(m),
    ingresos: ingresosPorMes.get(m) ?? 0,
    gastos: gastosPorMes.get(m) ?? 0,
  }));

  const saldoMensual: ChartPoint[] = months.map((m) => ({
    name: monthLabel(m),
    value: (ingresosPorMes.get(m) ?? 0) - (gastosPorMes.get(m) ?? 0),
  }));

  const gastosCat: ChartPoint[] = Object.entries(
    movimientos
      .filter((m) => m.tipo === "gasto" && m.estado === "pagado")
      .reduce<Record<string, number>>((acc, m) => {
        const k = categoriaLabel(m.categoria, "gasto");
        acc[k] = (acc[k] ?? 0) + m.valor;
        return acc;
      }, {}),
  ).map(([name, value]) => ({ name, value }));

  const ingresosCat: ChartPoint[] = Object.entries(
    movimientos
      .filter((m) => m.tipo === "ingreso" && m.estado === "pagado")
      .reduce<Record<string, number>>((acc, m) => {
        const k = categoriaLabel(m.categoria, "ingreso");
        acc[k] = (acc[k] ?? 0) + m.valor;
        return acc;
      }, {}),
  ).map(([name, value]) => ({ name, value }));

  const pendienteCobrarProp: ChartPoint[] = propiedades
    .map((p) => {
      const movs = movimientosByPropiedad(movimientos, p.id);
      const pend = movs
        .filter(
          (m) =>
            m.tipo === "ingreso" &&
            (m.estado === "pendiente" || m.estado === "vencido" || m.estado === "parcial"),
        )
        .reduce((s, m) => s + (m.valor_esperado ?? m.valor), 0);
      return { name: p.titulo.slice(0, 22), value: pend };
    })
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const gastosProp: ChartPoint[] = propiedades
    .map((p) => {
      const movs = movimientosByPropiedad(movimientos, p.id);
      const { gastos } = ingresosGastosPropiedad(movs);
      return { name: p.titulo.slice(0, 22), value: gastos };
    })
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const tableRows = propiedades.map((p) => {
    const movs = movimientosByPropiedad(movimientos, p.id);
    const pagados = ingresosGastosPropiedad(movs);
    const pendCobrar = movs
      .filter(
        (m) =>
          m.tipo === "ingreso" &&
          (m.estado === "pendiente" || m.estado === "vencido" || m.estado === "parcial"),
      )
      .reduce((s, m) => s + (m.valor_esperado ?? m.valor), 0);
    const pendPagar = movs
      .filter((m) => m.tipo === "gasto" && (m.estado === "pendiente" || m.estado === "vencido"))
      .reduce((s, m) => s + m.valor, 0);
    return {
      id: p.id,
      cells: {
        propiedad: p.titulo,
        ingresos: formatEuro(pagados.ingresos),
        gastos: formatEuro(pagados.gastos),
        cobrar: formatEuro(pendCobrar),
        pagar: formatEuro(pendPagar),
        saldo: formatEuro(pagados.saldo),
      },
    };
  });

  return {
    kpis: [
      { id: "ing", label: "Ingresos pagados", value: formatEuro(totales.ingresosPagados), tone: "success" },
      { id: "gas", label: "Gastos pagados", value: formatEuro(totales.gastosPagados), tone: "danger" },
      { id: "cob", label: "Pendiente por cobrar", value: formatEuro(totales.pendienteCobrar), tone: "warning" },
      { id: "pag", label: "Pendiente por pagar", value: formatEuro(totales.pendientePagar), tone: "warning" },
      { id: "saldo", label: "Saldo neto", value: formatEuro(totales.saldoNeto) },
    ],
    charts: [
      {
        id: "ing-gas",
        title: "Ingresos vs gastos por mes",
        type: "grouped-bar",
        data: ingresosGastosData,
        dataKeys: { primary: "ingresos", secondary: "gastos" },
        colors: [CHART_COLORS[0], CHART_COLORS[4]],
      },
      { id: "saldo", title: "Saldo neto mensual", type: "line", data: saldoMensual, colors: [CHART_COLORS[1]] },
      { id: "gas-cat", title: "Gastos por categoría", type: "donut", data: gastosCat, colors: CHART_COLORS },
      { id: "ing-cat", title: "Ingresos por categoría", type: "donut", data: ingresosCat, colors: CHART_COLORS },
      { id: "pend", title: "Pagos pendientes por propiedad", type: "bar", data: pendienteCobrarProp, colors: CHART_COLORS },
      { id: "gas-prop", title: "Gastos por propiedad", type: "hbar", data: gastosProp, colors: [CHART_COLORS[3]] },
    ],
    table: {
      columns: [
        { key: "propiedad", label: "Propiedad" },
        { key: "ingresos", label: "Ingresos pagados", align: "right" },
        { key: "gastos", label: "Gastos pagados", align: "right" },
        { key: "cobrar", label: "Pend. cobrar", align: "right" },
        { key: "pagar", label: "Pend. pagar", align: "right" },
        { key: "saldo", label: "Saldo neto", align: "right" },
      ],
      rows: tableRows,
    },
  };
}
