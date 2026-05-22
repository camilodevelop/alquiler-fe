import type { Manitas, TicketEstado, TicketMantenimiento } from "../types";
import { TICKET_ESTADOS_ACTIVOS } from "../constants";

export interface TicketsStatsSummary {
  total: number;
  abiertos: number;
  criticos: number;
  sinAsignar: number;
  enProceso: number;
  resueltos: number;
}

export function computeTicketsStats(tickets: TicketMantenimiento[]): TicketsStatsSummary {
  const abiertos = tickets.filter((t) => !["cerrado", "cancelado"].includes(t.estado)).length;
  const criticos = tickets.filter(
    (t) => t.urgencia === "critica" && !["cerrado", "cancelado"].includes(t.estado),
  ).length;
  const sinAsignar = tickets.filter((t) => t.estado === "nuevo").length;
  const enProceso = tickets.filter((t) => TICKET_ESTADOS_ACTIVOS.includes(t.estado)).length;
  const resueltos = tickets.filter((t) => t.estado === "resuelto").length;

  return {
    total: tickets.length,
    abiertos,
    criticos,
    sinAsignar,
    enProceso,
    resueltos,
  };
}

export function countTicketsByEstado(
  tickets: TicketMantenimiento[],
): Record<TicketEstado, number> & { todos: number } {
  const counts = {
    todos: tickets.length,
    nuevo: 0,
    asignado: 0,
    en_proceso: 0,
    resuelto: 0,
    cerrado: 0,
    cancelado: 0,
  } satisfies Record<TicketEstado | "todos", number>;

  for (const t of tickets) {
    counts[t.estado] += 1;
  }
  return counts;
}

export interface ManitasPortfolioStats {
  total: number;
  disponibles: number;
  ocupados: number;
  ratingPromedio: number;
  trabajosCompletados: number;
}

export function computeManitasPortfolioStats(list: Manitas[]): ManitasPortfolioStats {
  const disponibles = list.filter((m) => m.estado === "disponible").length;
  const ocupados = list.filter((m) => m.estado === "ocupado").length;
  const conRating = list.filter((m) => m.rating > 0);
  const ratingPromedio =
    conRating.length > 0
      ? conRating.reduce((s, m) => s + m.rating, 0) / conRating.length
      : 0;
  const trabajosCompletados = list.reduce((s, m) => s + m.tickets_completados, 0);

  return {
    total: list.length,
    disponibles,
    ocupados,
    ratingPromedio,
    trabajosCompletados,
  };
}
