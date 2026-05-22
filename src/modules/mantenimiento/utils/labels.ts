import {
  MANITAS_ESPECIALIDAD_CONFIG,
  MANITAS_ESTADO_CONFIG,
  TICKET_ESTADO_CONFIG,
  TICKET_TIPO_CONFIG,
  TICKET_URGENCIA_CONFIG,
} from "../constants";
import type { ManitasEspecialidad, ManitasEstado, TicketEstado, TicketTipo, TicketUrgencia } from "../types";

export function formatFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = iso.includes("T") ? iso.slice(0, 10) : iso;
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return iso;
  return `${day}/${m}/${y}`;
}

export function formatPrecio(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

export function manitasNombreCompleto(m: { nombres: string; apellidos: string }): string {
  return `${m.nombres} ${m.apellidos}`.trim();
}

export function getTicketEstadoLabel(e: TicketEstado): string {
  return TICKET_ESTADO_CONFIG[e]?.label ?? e;
}

export function getTicketTipoLabel(t: TicketTipo): string {
  return TICKET_TIPO_CONFIG[t]?.label ?? t;
}

export function getTicketUrgenciaLabel(u: TicketUrgencia): string {
  return TICKET_URGENCIA_CONFIG[u]?.label ?? u;
}

export function getManitasEstadoLabel(e: ManitasEstado): string {
  return MANITAS_ESTADO_CONFIG[e]?.label ?? e;
}

export function getManitasEspecialidadLabel(e: ManitasEspecialidad): string {
  return MANITAS_ESPECIALIDAD_CONFIG[e]?.label ?? e;
}
