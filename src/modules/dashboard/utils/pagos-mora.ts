import { CATEGORIAS_INGRESO } from "@/modules/finanzas/constants";
import type { MovimientoFinanciero } from "@/modules/finanzas/types";
import { daysBetween, toIsoDate } from "@/modules/reportes/utils/dates";
import { formatEuro } from "@/modules/reportes/utils/format";
import type { DashboardMoraRow, DashboardPagosMora } from "../types";

function categoriaLabel(cat: string): string {
  return CATEGORIAS_INGRESO.find((c) => c.value === cat)?.label ?? cat;
}

function importePendiente(m: MovimientoFinanciero): number {
  if (m.estado === "parcial" && m.valor_esperado != null) {
    return Math.max(0, m.valor_esperado - m.valor);
  }
  return m.valor_esperado ?? m.valor;
}

export function isMovimientoEnMora(m: MovimientoFinanciero, hoyIso: string): boolean {
  if (m.tipo !== "ingreso" || m.estado === "cancelado" || m.estado === "pagado") {
    return false;
  }
  if (m.estado === "vencido" || m.categoria === "penalizacion_mora") return true;
  if (m.estado === "parcial") return importePendiente(m) > 0;
  const vence = (m.fecha_vencimiento ?? m.fecha_movimiento).slice(0, 10);
  return m.estado === "pendiente" && vence < hoyIso;
}

function periodoLabel(m: MovimientoFinanciero): string {
  if (m.mes_correspondiente) {
    const [y, mm] = m.mes_correspondiente.split("-");
    const meses = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];
    const idx = parseInt(mm, 10) - 1;
    return `${meses[idx] ?? mm} ${y}`;
  }
  return new Date(m.fecha_movimiento).toLocaleDateString("es-ES");
}

const ESTADO_MORA_LABEL: Record<string, string> = {
  vencido: "Vencido",
  pendiente: "Pendiente",
  parcial: "Pago parcial",
};

export function buildPagosMora(movimientos: MovimientoFinanciero[]): DashboardPagosMora {
  const hoyIso = toIsoDate(new Date());

  const rows: DashboardMoraRow[] = movimientos
    .filter((m) => isMovimientoEnMora(m, hoyIso))
    .map((m) => {
      const ref = (m.fecha_vencimiento ?? m.fecha_movimiento).slice(0, 10);
      const importe = importePendiente(m);
      return {
        id: m.id,
        propiedad_id: m.propiedad_id,
        inquilino_id: m.inquilino_id ?? null,
        propiedad: m.propiedad_nombre,
        inquilino: m.inquilino_nombre ?? "—",
        concepto: m.concepto || categoriaLabel(m.categoria),
        periodo: periodoLabel(m),
        importe,
        importeLabel: formatEuro(importe),
        diasMora: daysBetween(ref, hoyIso),
        estadoLabel: ESTADO_MORA_LABEL[m.estado] ?? m.estado,
      };
    })
    .sort((a, b) => b.diasMora - a.diasMora || b.importe - a.importe);

  const total = rows.reduce((s, r) => s + r.importe, 0);

  return {
    totalPendiente: formatEuro(total),
    count: rows.length,
    rows,
  };
}
