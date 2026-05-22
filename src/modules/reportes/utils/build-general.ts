import { computeContabilidadTotales } from "@/modules/finanzas/utils/stats";
import { CHART_COLORS, CONTRATO_ESTADO_LABEL, PROPIEDAD_ESTADO_LABEL, TICKET_ESTADO_LABEL } from "../constants";
import type { ChartPoint, ReportTabPayload } from "../types";
import { monthBuckets, monthLabel } from "./dates";
import { formatEuro, formatNum } from "./format";
import {
  filterSnapshot,
  ingresosGastosPropiedad,
  movimientosByPropiedad,
  ticketsAbiertos,
  type ReportesSnapshot,
} from "./snapshot";
import type { ReportFilters } from "../types";

function countBy<T>(items: T[], keyFn: (item: T) => string): ChartPoint[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = keyFn(item);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

export function buildGeneralReport(
  raw: ReportesSnapshot,
  filters: ReportFilters,
): ReportTabPayload {
  const snap = filterSnapshot(raw, filters, "general");
  const { propiedades, contratos, tickets, movimientos } = snap;
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

  const ocupacion = countBy(propiedades, (p) => PROPIEDAD_ESTADO_LABEL[p.estado] ?? p.estado);
  const ticketsEstado = countBy(tickets, (t) => TICKET_ESTADO_LABEL[t.estado] ?? t.estado);
  const contratosEstado = countBy(contratos, (c) => CONTRATO_ESTADO_LABEL[c.estado] ?? c.estado);

  const tableRows = propiedades.map((p) => {
    const movs = movimientosByPropiedad(movimientos, p.id);
    const { ingresos, gastos, saldo } = ingresosGastosPropiedad(movs);
    const abiertos = ticketsAbiertos(tickets.filter((t) => t.propiedad_id === p.id));
    return {
      id: p.id,
      cells: {
        propiedad: p.titulo,
        ingresos: formatEuro(ingresos),
        gastos: formatEuro(gastos),
        saldo: formatEuro(saldo),
        tickets: String(abiertos),
        ocupacion: PROPIEDAD_ESTADO_LABEL[p.estado] ?? p.estado,
      },
    };
  });

  return {
    kpis: [
      { id: "prop", label: "Total propiedades", value: formatNum(propiedades.length) },
      {
        id: "ocup",
        label: "Propiedades ocupadas",
        value: formatNum(propiedades.filter((p) => p.estado === "alquilada").length),
        tone: "success",
      },
      {
        id: "disp",
        label: "Propiedades disponibles",
        value: formatNum(propiedades.filter((p) => p.estado === "disponible").length),
        tone: "info",
      },
      { id: "ing", label: "Ingresos del periodo", value: formatEuro(totales.ingresosPagados), tone: "success" },
      { id: "gas", label: "Gastos del periodo", value: formatEuro(totales.gastosPagados), tone: "danger" },
      { id: "saldo", label: "Saldo neto", value: formatEuro(totales.saldoNeto) },
      {
        id: "tickets",
        label: "Tickets abiertos",
        value: formatNum(ticketsAbiertos(tickets)),
        tone: ticketsAbiertos(tickets) > 0 ? "warning" : "default",
      },
      {
        id: "contratos",
        label: "Contratos activos",
        value: formatNum(contratos.filter((c) => c.estado === "activo").length),
      },
    ],
    charts: [
      {
        id: "ing-gas",
        title: "Ingresos vs gastos por mes",
        type: "grouped-bar",
        data: ingresosGastosData,
        dataKeys: { primary: "ingresos", secondary: "gastos" },
        colors: [CHART_COLORS[0], CHART_COLORS[3]],
      },
      {
        id: "ocupacion",
        title: "Ocupación de propiedades",
        type: "donut",
        data: ocupacion,
        colors: CHART_COLORS,
      },
      {
        id: "tickets-estado",
        title: "Tickets por estado",
        type: "donut",
        data: ticketsEstado,
        colors: CHART_COLORS,
      },
      {
        id: "contratos-estado",
        title: "Contratos por estado",
        type: "bar",
        data: contratosEstado,
        colors: CHART_COLORS,
      },
      {
        id: "saldo-line",
        title: "Saldo neto mensual",
        type: "line",
        data: saldoMensual,
        colors: [CHART_COLORS[1]],
      },
    ],
    table: {
      columns: [
        { key: "propiedad", label: "Propiedad" },
        { key: "ingresos", label: "Ingresos", align: "right" },
        { key: "gastos", label: "Gastos", align: "right" },
        { key: "saldo", label: "Saldo neto", align: "right" },
        { key: "tickets", label: "Tickets abiertos", align: "right" },
        { key: "ocupacion", label: "Ocupación" },
      ],
      rows: tableRows,
    },
  };
}
