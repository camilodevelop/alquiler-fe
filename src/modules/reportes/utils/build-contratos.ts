import { CHART_COLORS, CONTRATO_ESTADO_LABEL } from "../constants";
import type { ChartPoint, ReportTabPayload } from "../types";
import { monthBuckets, monthLabel, toIsoDate } from "./dates";
import { formatEuro, formatNum } from "./format";
import { filterSnapshot, type ReportesSnapshot } from "./snapshot";
import type { ReportFilters } from "../types";

export function buildContratosReport(
  raw: ReportesSnapshot,
  filters: ReportFilters,
): ReportTabPayload {
  const snap = filterSnapshot(raw, filters, "contratos");
  const { contratos } = snap;
  const hoy = toIsoDate(new Date());
  const en60 = toIsoDate(new Date(Date.now() + 60 * 86400000));

  const activos = contratos.filter((c) => c.estado === "activo");
  const proximosVencer = contratos.filter(
    (c) => c.estado === "activo" && c.fecha_fin >= hoy && c.fecha_fin <= en60,
  );
  const vencidos = contratos.filter(
    (c) => c.estado === "activo" && c.fecha_fin < hoy,
  );

  const byEstado: ChartPoint[] = Object.entries(
    contratos.reduce<Record<string, number>>((acc, c) => {
      const k = CONTRATO_ESTADO_LABEL[c.estado] ?? c.estado;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const vencerMes = new Map<string, number>();
  for (const c of proximosVencer) {
    const key = c.fecha_fin.slice(0, 7);
    vencerMes.set(key, (vencerMes.get(key) ?? 0) + 1);
  }
  const vencerBars: ChartPoint[] = [...vencerMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, value]) => ({ name: monthLabel(k), value }));

  const desde = filters.fecha_desde ?? "";
  const hasta = filters.fecha_hasta ?? "";
  const months = desde && hasta ? monthBuckets(desde, hasta) : [];
  const valorMes = new Map(months.map((m) => [m, 0]));
  for (const c of activos) {
    const key = c.fecha_inicio.slice(0, 7);
    if (valorMes.has(key)) {
      valorMes.set(key, (valorMes.get(key) ?? 0) + c.valor_mensual);
    }
  }
  const valorLine: ChartPoint[] = months.map((m) => ({
    name: monthLabel(m),
    value: valorMes.get(m) ?? 0,
  }));

  const firmasPend = contratos.filter((c) =>
    c.firmas.some((f) => f.estado === "pendiente"),
  ).length;
  const firmasOk = contratos.filter((c) =>
    c.firmas.every((f) => f.estado === "firmado"),
  ).length;

  const byTipo: ChartPoint[] = Object.entries(
    contratos.reduce<Record<string, number>>((acc, c) => {
      const k = c.tipo_contrato_nombre.slice(0, 20);
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .slice(0, 8);

  return {
    kpis: [
      { id: "act", label: "Contratos activos", value: formatNum(activos.length), tone: "success" },
      {
        id: "pend",
        label: "Pendientes de firma",
        value: formatNum(contratos.filter((c) => c.estado === "pendiente_firma").length),
        tone: "warning",
      },
      {
        id: "prox",
        label: "Próximos a vencer",
        value: formatNum(proximosVencer.length),
        tone: "warning",
      },
      { id: "venc", label: "Vencidos", value: formatNum(vencidos.length), tone: "danger" },
      {
        id: "fin",
        label: "Finalizados",
        value: formatNum(contratos.filter((c) => c.estado === "finalizado").length),
      },
    ],
    charts: [
      { id: "estado", title: "Contratos por estado", type: "donut", data: byEstado, colors: CHART_COLORS },
      {
        id: "vencer",
        title: "Próximos a vencer por mes",
        type: "bar",
        data: vencerBars.length ? vencerBars : [{ name: "—", value: 0 }],
        colors: CHART_COLORS,
      },
      { id: "valor", title: "Valor mensual contratado", type: "line", data: valorLine, colors: [CHART_COLORS[0]] },
      {
        id: "firmas",
        title: "Firmas pendientes vs firmadas",
        type: "bar",
        data: [
          { name: "Pendientes", value: firmasPend },
          { name: "Completas", value: firmasOk },
        ],
        colors: [CHART_COLORS[3], CHART_COLORS[0]],
      },
      { id: "tipo", title: "Contratos por tipo", type: "bar", data: byTipo, colors: CHART_COLORS },
    ],
    table: {
      columns: [
        { key: "codigo", label: "Contrato" },
        { key: "propiedad", label: "Propiedad" },
        { key: "inquilino", label: "Inquilino" },
        { key: "estado", label: "Estado" },
        { key: "inicio", label: "Inicio" },
        { key: "fin", label: "Fin" },
        { key: "valor", label: "Valor mensual", align: "right" },
        { key: "firma", label: "Firma" },
      ],
      rows: contratos.map((c) => {
        const firmaOk = c.firmas.every((f) => f.estado === "firmado");
        const firmaParcial = c.firmas.some((f) => f.estado === "firmado");
        return {
          id: c.id,
          cells: {
            codigo: c.codigo,
            propiedad: c.propiedad_nombre,
            inquilino: c.inquilino_nombre,
            estado: CONTRATO_ESTADO_LABEL[c.estado] ?? c.estado,
            inicio: c.fecha_inicio,
            fin: c.fecha_fin,
            valor: formatEuro(c.valor_mensual),
            firma: firmaOk ? "Completa" : firmaParcial ? "Parcial" : "Pendiente",
          },
        };
      }),
    },
  };
}
