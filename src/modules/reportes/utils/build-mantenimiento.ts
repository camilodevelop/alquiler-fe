import {
  CHART_COLORS,
  MANITAS_ESPECIALIDAD_LABEL,
  MANITAS_ESTADO_LABEL,
  TICKET_ESTADO_LABEL,
  TICKET_TIPO_LABEL,
  TICKET_URGENCIA_LABEL,
} from "../constants";
import type { ChartPoint, ReportTabPayload } from "../types";
import { daysBetween, monthBuckets, monthLabel } from "./dates";
import { formatNum } from "./format";
import { filterSnapshot, type ReportesSnapshot } from "./snapshot";
import type { ReportFilters } from "../types";

export function buildMantenimientoReport(
  raw: ReportesSnapshot,
  filters: ReportFilters,
): ReportTabPayload {
  const snap = filterSnapshot(raw, filters, "mantenimiento");
  const { tickets, manitas } = snap;
  const hoy = new Date().toISOString().slice(0, 10);

  const countTicket = (estado: string) => tickets.filter((t) => t.estado === estado).length;

  const byTicketEstado: ChartPoint[] = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => {
      const k = TICKET_ESTADO_LABEL[t.estado] ?? t.estado;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const byUrgencia: ChartPoint[] = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => {
      const k = TICKET_URGENCIA_LABEL[t.urgencia] ?? t.urgencia;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const byTipo: ChartPoint[] = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => {
      const k = TICKET_TIPO_LABEL[t.tipo] ?? t.tipo;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const byPropiedad: ChartPoint[] = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => {
      acc[t.propiedad_nombre] = (acc[t.propiedad_nombre] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name: name.slice(0, 22), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const byManitasEstado: ChartPoint[] = Object.entries(
    manitas.reduce<Record<string, number>>((acc, m) => {
      const k = MANITAS_ESTADO_LABEL[m.estado] ?? m.estado;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const ticketsPorManitas: ChartPoint[] = manitas
    .map((m) => ({
      name: `${m.nombres} ${m.apellidos}`.trim().slice(0, 18),
      value: m.tickets_asignados,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const cerradosPorManitas: ChartPoint[] = manitas
    .map((m) => ({
      name: `${m.nombres} ${m.apellidos}`.trim().slice(0, 18),
      value: m.tickets_completados,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const ratingBars: ChartPoint[] = manitas
    .map((m) => ({
      name: `${m.nombres}`.slice(0, 12),
      value: Math.round(m.rating * 10) / 10,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const desde = filters.fecha_desde ?? "";
  const hasta = filters.fecha_hasta ?? "";
  const months = desde && hasta ? monthBuckets(desde, hasta) : [];
  const resolucionMes = new Map(months.map((m) => [m, 0]));
  const resolucionCount = new Map(months.map((m) => [m, 0]));

  for (const t of tickets.filter((x) => ["resuelto", "cerrado"].includes(x.estado))) {
    const fin = t.updated_at;
    const key = fin.slice(0, 7);
    if (!resolucionMes.has(key)) continue;
    const dias = daysBetween(t.fecha_reporte ?? t.created_at, fin);
    resolucionMes.set(key, (resolucionMes.get(key) ?? 0) + dias);
    resolucionCount.set(key, (resolucionCount.get(key) ?? 0) + 1);
  }

  const tiempoLine: ChartPoint[] = months.map((m) => {
    const n = resolucionCount.get(m) ?? 0;
    const avg = n > 0 ? Math.round((resolucionMes.get(m) ?? 0) / n) : 0;
    return { name: monthLabel(m), value: avg };
  });

  const totalCerrados = manitas.reduce((s, m) => s + m.tickets_completados, 0);
  const abiertos = tickets.filter(
    (t) => !["resuelto", "cerrado", "cancelado"].includes(t.estado),
  ).length;

  return {
    kpis: [
      { id: "nuevo", label: "Tickets nuevos", value: formatNum(countTicket("nuevo")) },
      {
        id: "proc",
        label: "En proceso",
        value: formatNum(countTicket("en_proceso")),
        tone: "warning",
      },
      {
        id: "res",
        label: "Resueltos",
        value: formatNum(countTicket("resuelto")),
        tone: "success",
      },
      {
        id: "crit",
        label: "Críticos",
        value: formatNum(tickets.filter((t) => t.urgencia === "critica").length),
        tone: "danger",
      },
      {
        id: "abiertos",
        label: "Tickets abiertos",
        value: formatNum(abiertos),
        tone: abiertos > 0 ? "warning" : "default",
      },
      { id: "total", label: "Manitas activos", value: formatNum(manitas.length) },
      {
        id: "disp",
        label: "Manitas disponibles",
        value: formatNum(manitas.filter((m) => m.estado === "disponible").length),
        tone: "success",
      },
      { id: "cerr", label: "Tickets cerrados (manitas)", value: formatNum(totalCerrados), tone: "success" },
    ],
    charts: [
      {
        id: "ticket-estado",
        title: "Tickets por estado",
        type: "donut",
        data: byTicketEstado,
        colors: CHART_COLORS,
      },
      {
        id: "manitas-estado",
        title: "Manitas por estado",
        type: "donut",
        data: byManitasEstado,
        colors: CHART_COLORS,
      },
      {
        id: "urg",
        title: "Tickets por urgencia",
        type: "bar",
        data: byUrgencia,
        colors: CHART_COLORS,
      },
      {
        id: "tipo",
        title: "Tickets por tipo",
        type: "bar",
        data: byTipo,
        colors: CHART_COLORS,
      },
      {
        id: "prop",
        title: "Tickets por propiedad",
        type: "hbar",
        data: byPropiedad,
        colors: [CHART_COLORS[1]],
      },
      {
        id: "tickets-manitas",
        title: "Tickets asignados por manitas",
        type: "bar",
        data: ticketsPorManitas,
        colors: CHART_COLORS,
      },
      {
        id: "cerrados-manitas",
        title: "Tickets cerrados por manitas",
        type: "bar",
        data: cerradosPorManitas,
        colors: [CHART_COLORS[0]],
      },
      {
        id: "rating",
        title: "Rating por manitas",
        type: "bar",
        data: ratingBars,
        colors: [CHART_COLORS[2]],
      },
      {
        id: "tiempo",
        title: "Tiempo promedio de resolución (días)",
        type: "line",
        data: tiempoLine,
        colors: [CHART_COLORS[1]],
      },
    ],
    table: {
      title: "Tickets de mantenimiento",
      columns: [
        { key: "ticket", label: "Ticket" },
        { key: "propiedad", label: "Propiedad" },
        { key: "tipo", label: "Tipo" },
        { key: "urgencia", label: "Urgencia" },
        { key: "estado", label: "Estado" },
        { key: "manitas", label: "Manitas" },
        { key: "creacion", label: "Creación" },
        { key: "dias", label: "Días abierto", align: "right" },
      ],
      rows: tickets.map((t) => ({
        id: t.id,
        cells: {
          ticket: t.codigo,
          propiedad: t.propiedad_nombre,
          tipo: TICKET_TIPO_LABEL[t.tipo] ?? t.tipo,
          urgencia: TICKET_URGENCIA_LABEL[t.urgencia] ?? t.urgencia,
          estado: TICKET_ESTADO_LABEL[t.estado] ?? t.estado,
          manitas: t.manitas_nombre ?? "—",
          creacion: (t.fecha_reporte ?? t.created_at).slice(0, 10),
          dias: String(
            ["resuelto", "cerrado", "cancelado"].includes(t.estado)
              ? daysBetween(t.fecha_reporte ?? t.created_at, t.updated_at)
              : daysBetween(t.fecha_reporte ?? t.created_at, hoy),
          ),
        },
      })),
    },
    secondaryTable: {
      title: "Rendimiento de manitas",
      columns: [
        { key: "nombre", label: "Manitas" },
        { key: "esp", label: "Especialidad" },
        { key: "estado", label: "Estado" },
        { key: "asig", label: "Asignados", align: "right" },
        { key: "cerr", label: "Cerrados", align: "right" },
        { key: "rating", label: "Rating", align: "right" },
        { key: "tiempo", label: "Tiempo prom. (días)", align: "right" },
      ],
      rows: manitas.map((m) => {
        const cerrados = tickets.filter(
          (t) =>
            t.manitas_id === m.id && ["resuelto", "cerrado"].includes(t.estado),
        );
        let avgDias = 0;
        if (cerrados.length > 0) {
          const sum = cerrados.reduce(
            (s, t) =>
              s +
              daysBetween(t.fecha_reporte ?? t.created_at, t.updated_at),
            0,
          );
          avgDias = Math.round(sum / cerrados.length);
        }
        return {
          id: m.id,
          cells: {
            nombre: `${m.nombres} ${m.apellidos}`.trim(),
            esp: MANITAS_ESPECIALIDAD_LABEL[m.especialidad] ?? m.especialidad,
            estado: MANITAS_ESTADO_LABEL[m.estado] ?? m.estado,
            asig: String(m.tickets_asignados),
            cerr: String(m.tickets_completados),
            rating: String(m.rating),
            tiempo: String(avgDias),
          },
        };
      }),
    },
  };
}
