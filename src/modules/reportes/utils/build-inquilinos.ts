import { CHART_COLORS, INQUILINO_STATUS_LABEL, SCORING_LABEL } from "../constants";
import type { ChartPoint, ReportTabPayload } from "../types";
import { monthBuckets, monthLabel } from "./dates";
import { formatEuro, formatNum } from "./format";
import { filterSnapshot, type ReportesSnapshot } from "./snapshot";
import type { ReportFilters } from "../types";

const PAGO_LABEL: Record<string, string> = {
  al_dia: "Al día",
  pendiente: "Pendiente",
  vencido: "Vencido",
  impagado: "Impagado",
};

export function buildInquilinosReport(
  raw: ReportesSnapshot,
  filters: ReportFilters,
): ReportTabPayload {
  const snap = filterSnapshot(raw, filters, "inquilinos");
  const { inquilinos, movimientos } = snap;
  const desde = filters.fecha_desde ?? "";
  const hasta = filters.fecha_hasta ?? "";
  const months = desde && hasta ? monthBuckets(desde, hasta) : [];

  const byStatus: ChartPoint[] = Object.entries(
    inquilinos.reduce<Record<string, number>>((acc, i) => {
      const k = INQUILINO_STATUS_LABEL[i.status] ?? i.status;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const byPago: ChartPoint[] = Object.entries(
    inquilinos.reduce<Record<string, number>>((acc, i) => {
      const k = PAGO_LABEL[i.pago_resumen.estado] ?? i.pago_resumen.estado;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const moraMes = new Map(months.map((m) => [m, 0]));
  for (const mov of movimientos) {
    if (mov.tipo !== "ingreso") continue;
    const esMora =
      mov.estado === "vencido" ||
      mov.categoria === "penalizacion_mora" ||
      (mov.estado === "pendiente" && mov.categoria === "pago_arriendo");
    if (!esMora) continue;
    const key = (mov.mes_correspondiente ?? mov.fecha_movimiento).slice(0, 7);
    if (moraMes.has(key)) moraMes.set(key, (moraMes.get(key) ?? 0) + 1);
  }
  const moraLine: ChartPoint[] = months.map((m) => ({
    name: monthLabel(m),
    value: moraMes.get(m) ?? 0,
  }));

  const scoringBars: ChartPoint[] = Object.entries(
    inquilinos.reduce<Record<string, number>>((acc, i) => {
      const nivel = i.scoring?.nivel ?? "sin_evaluar";
      const k = SCORING_LABEL[nivel] ?? nivel;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const byPropiedad: ChartPoint[] = Object.entries(
    inquilinos.reduce<Record<string, number>>((acc, i) => {
      const k = i.asignacion?.propiedad_nombre ?? "Sin asignar";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name: name.slice(0, 22), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return {
    kpis: [
      { id: "total", label: "Total inquilinos", value: formatNum(inquilinos.length) },
      {
        id: "activos",
        label: "Activos",
        value: formatNum(inquilinos.filter((i) => i.status === "activo").length),
        tone: "success",
      },
      {
        id: "morosos",
        label: "Morosos",
        value: formatNum(inquilinos.filter((i) => i.status === "moroso").length),
        tone: "danger",
      },
      {
        id: "cand",
        label: "Candidatos",
        value: formatNum(inquilinos.filter((i) => i.status === "candidato").length),
        tone: "info",
      },
      {
        id: "fin",
        label: "Finalizados",
        value: formatNum(inquilinos.filter((i) => i.status === "finalizado").length),
      },
    ],
    charts: [
      { id: "status", title: "Inquilinos por estado", type: "donut", data: byStatus, colors: CHART_COLORS },
      { id: "pago", title: "Pagos por estado", type: "bar", data: byPago, colors: CHART_COLORS },
      { id: "mora", title: "Morosidad por mes", type: "line", data: moraLine, colors: [CHART_COLORS[4]] },
      { id: "scoring", title: "Scoring de inquilinos", type: "bar", data: scoringBars, colors: CHART_COLORS },
      { id: "prop", title: "Inquilinos por propiedad", type: "bar", data: byPropiedad, colors: CHART_COLORS },
    ],
    table: {
      columns: [
        { key: "inquilino", label: "Inquilino" },
        { key: "propiedad", label: "Propiedad" },
        { key: "estado", label: "Estado" },
        { key: "pend", label: "Pagos pendientes", align: "right" },
        { key: "venc", label: "Pagos vencidos", align: "right" },
        { key: "scoring", label: "Scoring" },
        { key: "ingreso", label: "Fecha ingreso" },
      ],
      rows: inquilinos.map((i) => ({
        id: i.id,
        cells: {
          inquilino: `${i.nombres} ${i.apellidos}`.trim(),
          propiedad: i.asignacion?.propiedad_nombre ?? "—",
          estado: INQUILINO_STATUS_LABEL[i.status] ?? i.status,
          pend: formatEuro(i.pago_resumen.total_pendiente),
          venc: String(i.pago_resumen.pagos_vencidos),
          scoring: SCORING_LABEL[i.scoring?.nivel ?? "sin_evaluar"] ?? "—",
          ingreso: i.asignacion?.fecha_ingreso?.slice(0, 10) ?? "—",
        },
      })),
    },
  };
}
