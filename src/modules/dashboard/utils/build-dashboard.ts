import type { Contract } from "@/modules/contratos/types";
import { computeContabilidadTotales } from "@/modules/finanzas/utils/stats";
import type { Inquilino } from "@/modules/inquilinos/types";
import type { TicketMantenimiento } from "@/modules/mantenimiento/types";
import type { MovimientoFinanciero } from "@/modules/finanzas/types";
import type { Propiedad } from "@/modules/propiedades/types";
import { monthBuckets, monthLabel, toIsoDate } from "@/modules/reportes/utils/dates";
import { formatEuro, formatNum, formatPct } from "@/modules/reportes/utils/format";
import type { DashboardData, DashboardSnapshot } from "../types";
import { buildPagosMora } from "./pagos-mora";

function pctTrend(curr: number, prev: number): { text: string; type: "positive" | "neutral" | "warning" } {
  if (prev === 0) {
    if (curr === 0) return { text: "Sin variación vs mes anterior", type: "neutral" };
    return { text: "Primer ingreso registrado este mes", type: "positive" };
  }
  const pct = Math.round(((curr - prev) / prev) * 100);
  return {
    text: `${pct >= 0 ? "+" : ""}${pct}% vs mes anterior`,
    type: pct >= 0 ? "positive" : "warning",
  };
}

function inquilinoPorPropiedad(
  inquilinos: Inquilino[],
  contratos: Contract[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const i of inquilinos) {
    if (
      i.asignacion?.propiedad_id &&
      ["activo", "moroso", "aprobado"].includes(i.status)
    ) {
      map.set(i.asignacion.propiedad_id, `${i.nombres} ${i.apellidos}`.trim());
    }
  }
  for (const c of contratos) {
    if (c.estado === "activo" && !map.has(c.propiedad_id)) {
      map.set(c.propiedad_id, c.inquilino_nombre);
    }
  }
  return map;
}

function proximoCobro(movimientos: MovimientoFinanciero[], propiedadId: string): string {
  const pending = movimientos
    .filter(
      (m) =>
        m.propiedad_id === propiedadId &&
        m.tipo === "ingreso" &&
        (m.estado === "pendiente" || m.estado === "vencido" || m.estado === "parcial") &&
        m.categoria === "pago_arriendo",
    )
    .sort((a, b) => a.fecha_movimiento.localeCompare(b.fecha_movimiento));
  if (!pending[0]) return "—";
  return new Date(pending[0].fecha_movimiento).toLocaleDateString("es-ES");
}

function ticketsAbiertos(tickets: TicketMantenimiento[]): TicketMantenimiento[] {
  return tickets.filter((t) => !["resuelto", "cerrado", "cancelado"].includes(t.estado));
}

export function buildDashboardData(raw: DashboardSnapshot): DashboardData {
  const { propiedades, inquilinos, contratos, tickets, movimientos } = raw;
  const hoy = new Date();
  const yearStart = `${hoy.getFullYear()}-01-01`;
  const thisMonthKey = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  const prevDate = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  const activas = propiedades.filter((p) => p.estado !== "inactiva");
  const alquiladas = propiedades.filter((p) => p.estado === "alquilada").length;
  const disponibles = propiedades.filter((p) => p.estado === "disponible").length;

  const ingresosMes = new Map<string, number>();
  for (const m of movimientos) {
    if (m.estado === "cancelado" || m.tipo !== "ingreso" || m.estado !== "pagado") continue;
    const key = m.fecha_movimiento.slice(0, 7);
    ingresosMes.set(key, (ingresosMes.get(key) ?? 0) + m.valor);
  }

  const ingresoActual = ingresosMes.get(thisMonthKey) ?? 0;
  const ingresoAnterior = ingresosMes.get(prevMonthKey) ?? 0;
  const ingresoTrend = pctTrend(ingresoActual, ingresoAnterior);

  const contratosActivos = contratos.filter((c) => c.estado === "activo");
  const hoyIso = toIsoDate(hoy);
  const en60 = toIsoDate(new Date(Date.now() + 60 * 86400000));
  const proximosVencer = contratosActivos.filter(
    (c) => c.fecha_fin >= hoyIso && c.fecha_fin <= en60,
  ).length;

  const abiertos = ticketsAbiertos(tickets);
  const criticos = abiertos.filter((t) => t.urgencia === "critica").length;

  const chartDesde = toIsoDate(new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1));
  const chartHasta = toIsoDate(hoy);
  const months = monthBuckets(chartDesde, chartHasta);
  const ingresosMensuales = months.map((m) => ({
    mes: monthLabel(m),
    importe: ingresosMes.get(m) ?? 0,
  }));

  const movimientosYtd = movimientos.filter(
    (m) => m.fecha_movimiento >= yearStart && m.estado !== "cancelado",
  );
  const totalesYtd = computeContabilidadTotales(movimientosYtd);
  const rentabilidad =
    totalesYtd.ingresosPagados > 0
      ? (totalesYtd.saldoNeto / totalesYtd.ingresosPagados) * 100
      : 0;

  const pagosMora = buildPagosMora(movimientos);
  const inquilinosMorosos = inquilinos.filter((i) => i.status === "moroso").length;

  const inquilinosMap = inquilinoPorPropiedad(inquilinos, contratos);
  const propiedadesRecientes = [...propiedades]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      direccion: p.titulo || p.direccion,
      inquilino: inquilinosMap.get(p.id) ?? "—",
      renta: formatEuro(p.precio_mes),
      estado: p.estado,
      proximo_cobro: proximoCobro(movimientos, p.id),
    }));

  return {
    stats: [
      {
        id: "prop",
        title: "Propiedades activas",
        value: formatNum(activas.length),
        trend: `${formatNum(alquiladas)} alquiladas · ${formatNum(disponibles)} disponibles`,
        trendType: "positive",
      },
      {
        id: "ing",
        title: "Ingresos del mes",
        value: formatEuro(ingresoActual),
        trend: ingresoTrend.text,
        trendType: ingresoTrend.type,
      },
      {
        id: "contratos",
        title: "Contratos activos",
        value: formatNum(contratosActivos.length),
        trend:
          proximosVencer > 0
            ? `${formatNum(proximosVencer)} vencen en 60 días`
            : "Ninguno vence pronto",
        trendType: proximosVencer > 0 ? "warning" : "neutral",
      },
      {
        id: "tickets",
        title: "Incidencias abiertas",
        value: formatNum(abiertos.length),
        trend:
          criticos > 0
            ? `${formatNum(criticos)} urgente${criticos !== 1 ? "s" : ""}`
            : abiertos.length > 0
              ? "Sin urgencias críticas"
              : "Todo al día",
        trendType: criticos > 0 ? "warning" : abiertos.length > 0 ? "neutral" : "positive",
      },
      {
        id: "mora",
        title: "Pagos en mora",
        value: pagosMora.totalPendiente,
        trend:
          pagosMora.count > 0
            ? `${formatNum(pagosMora.count)} cobro${pagosMora.count !== 1 ? "s" : ""} pendiente${pagosMora.count !== 1 ? "s" : ""}`
            : inquilinosMorosos > 0
              ? `${formatNum(inquilinosMorosos)} inquilino${inquilinosMorosos !== 1 ? "s" : ""} marcado${inquilinosMorosos !== 1 ? "s" : ""} moroso${inquilinosMorosos !== 1 ? "s" : ""}`
              : "Cartera al día",
        trendType: pagosMora.count > 0 || inquilinosMorosos > 0 ? "warning" : "positive",
      },
    ],
    ingresosMensuales,
    resumenFinanciero: {
      ingresosTotales: formatEuro(totalesYtd.ingresosPagados),
      gastosTotales: formatEuro(totalesYtd.gastosPagados),
      beneficioNeto: formatEuro(totalesYtd.saldoNeto),
      rentabilidadMedia: formatPct(rentabilidad),
    },
    propiedadesRecientes,
    pagosMora,
    fechaActualizacion: hoy.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}
