import type { Contract } from "@/modules/contratos/types";
import type { MovimientoFinanciero } from "@/modules/finanzas/types";
import type { Manitas, TicketMantenimiento } from "@/modules/mantenimiento/types";
import type { Inquilino } from "@/modules/inquilinos/types";
import type { Propiedad } from "@/modules/propiedades/types";
import type { ReportFilters, ReportTabId } from "../types";
import { inDateRange } from "./dates";

export interface ReportesSnapshot {
  propiedades: Propiedad[];
  inquilinos: Inquilino[];
  contratos: Contract[];
  tickets: TicketMantenimiento[];
  movimientos: MovimientoFinanciero[];
  manitas: Manitas[];
}

/** Aplica filtros según la pestaña activa (evita mezclar estados entre entidades). */
export function filterSnapshot(
  raw: ReportesSnapshot,
  filters: ReportFilters,
  tab: ReportTabId,
): ReportesSnapshot {
  const {
    fecha_desde,
    fecha_hasta,
    propiedad_id,
    tipo_renta,
    inquilino_id,
    manitas_id,
    estado,
    estado_manitas,
  } = filters;

  let propiedades = raw.propiedades;
  if (propiedad_id) propiedades = propiedades.filter((p) => p.id === propiedad_id);
  if (tipo_renta) propiedades = propiedades.filter((p) => p.tipo_renta === tipo_renta);
  if (estado && (tab === "general" || tab === "propiedades")) {
    propiedades = propiedades.filter((p) => p.estado === estado);
  }

  const propIds = new Set(propiedades.map((p) => p.id));

  let inquilinos = raw.inquilinos;
  if (inquilino_id) inquilinos = inquilinos.filter((i) => i.id === inquilino_id);
  if (propiedad_id) {
    inquilinos = inquilinos.filter((i) => i.asignacion?.propiedad_id === propiedad_id);
  } else if (tipo_renta) {
    inquilinos = inquilinos.filter(
      (i) => !i.asignacion?.propiedad_id || propIds.has(i.asignacion.propiedad_id),
    );
  }
  if (estado && tab === "inquilinos") {
    inquilinos = inquilinos.filter((i) => i.status === estado);
  }

  let contratos = raw.contratos.filter((c) => propIds.has(c.propiedad_id));
  if (inquilino_id) contratos = contratos.filter((c) => c.inquilino_id === inquilino_id);
  if (estado && tab === "contratos") {
    contratos = contratos.filter((c) => c.estado === estado);
  }

  let tickets = raw.tickets.filter((t) => propIds.has(t.propiedad_id));
  if (manitas_id) tickets = tickets.filter((t) => t.manitas_id === manitas_id);
  if (estado && tab === "mantenimiento") {
    tickets = tickets.filter((t) => t.estado === estado);
  }
  tickets = tickets.filter((t) =>
    inDateRange(t.fecha_reporte ?? t.created_at, fecha_desde, fecha_hasta),
  );

  let movimientos = raw.movimientos.filter((m) => propIds.has(m.propiedad_id));
  if (inquilino_id) movimientos = movimientos.filter((m) => m.inquilino_id === inquilino_id);
  movimientos = movimientos.filter(
    (m) => inDateRange(m.fecha_movimiento, fecha_desde, fecha_hasta) && m.estado !== "cancelado",
  );

  let manitas = raw.manitas;
  if (manitas_id) manitas = manitas.filter((m) => m.id === manitas_id);
  if (estado_manitas && tab === "mantenimiento") {
    manitas = manitas.filter((m) => m.estado === estado_manitas);
  }

  return { propiedades, inquilinos, contratos, tickets, movimientos, manitas };
}

export function movimientosByPropiedad(
  movimientos: MovimientoFinanciero[],
  propiedadId: string,
) {
  return movimientos.filter((m) => m.propiedad_id === propiedadId);
}

export function ingresosGastosPropiedad(movs: MovimientoFinanciero[]) {
  const ingresos = movs
    .filter((m) => m.tipo === "ingreso" && m.estado === "pagado")
    .reduce((s, m) => s + m.valor, 0);
  const gastos = movs
    .filter((m) => m.tipo === "gasto" && m.estado === "pagado")
    .reduce((s, m) => s + m.valor, 0);
  return { ingresos, gastos, saldo: ingresos - gastos };
}

export function ticketsAbiertos(tickets: TicketMantenimiento[]): number {
  return tickets.filter((t) => !["resuelto", "cerrado", "cancelado"].includes(t.estado)).length;
}
