import type { Manitas, ManitasFilters, TicketFilters, TicketMantenimiento } from "../types";
import { manitasNombreCompleto } from "./labels";

export function filterTickets(
  tickets: TicketMantenimiento[],
  filters: TicketFilters,
): TicketMantenimiento[] {
  const q = filters.search?.trim().toLowerCase();
  return tickets.filter((t) => {
    if (filters.estado && t.estado !== filters.estado) return false;
    if (filters.tipo && t.tipo !== filters.tipo) return false;
    if (filters.urgencia && t.urgencia !== filters.urgencia) return false;
    if (filters.propiedad_id && t.propiedad_id !== filters.propiedad_id) return false;
    if (filters.manitas_id && t.manitas_id !== filters.manitas_id) return false;
    if (filters.fecha_desde && t.fecha_reporte < filters.fecha_desde) return false;
    if (filters.fecha_hasta && t.fecha_reporte > filters.fecha_hasta) return false;
    if (!q) return true;
    const inq = (t.inquilino_nombre ?? "").toLowerCase();
    return (
      t.codigo.toLowerCase().includes(q) ||
      t.titulo.toLowerCase().includes(q) ||
      t.propiedad_nombre.toLowerCase().includes(q) ||
      inq.includes(q)
    );
  });
}

export function filterManitas(list: Manitas[], filters: ManitasFilters): Manitas[] {
  const q = filters.search?.trim().toLowerCase();
  return list.filter((m) => {
    if (filters.estado && m.estado !== filters.estado) return false;
    if (filters.especialidad && m.especialidad !== filters.especialidad) return false;
    if (!q) return true;
    const nombre = manitasNombreCompleto(m).toLowerCase();
    return (
      nombre.includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.telefono.includes(q) ||
      (m.zona_cobertura ?? "").toLowerCase().includes(q)
    );
  });
}

export function hasActiveTicketFilters(f: TicketFilters): boolean {
  return !!(
    f.search?.trim() ||
    f.estado ||
    f.tipo ||
    f.urgencia ||
    f.propiedad_id ||
    f.manitas_id ||
    f.fecha_desde ||
    f.fecha_hasta
  );
}

export function hasActiveManitasFilters(f: ManitasFilters): boolean {
  return !!(f.search?.trim() || f.estado || f.especialidad);
}

export { computeTicketsStats as computeTicketStats, countTicketsByEstado } from "./stats";
