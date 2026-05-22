import type { MovimientoFilters, MovimientoFinanciero } from "../types";

export function filterMovimientos(
  list: MovimientoFinanciero[],
  filters: MovimientoFilters,
): MovimientoFinanciero[] {
  let items = [...list];

  if (filters.propiedad_id) {
    items = items.filter((m) => m.propiedad_id === filters.propiedad_id);
  }
  if (filters.tipo) items = items.filter((m) => m.tipo === filters.tipo);
  if (filters.categoria) items = items.filter((m) => m.categoria === filters.categoria);
  if (filters.estado) items = items.filter((m) => m.estado === filters.estado);
  if (filters.inquilino_id) items = items.filter((m) => m.inquilino_id === filters.inquilino_id);
  if (filters.metodo_pago) items = items.filter((m) => m.metodo_pago === filters.metodo_pago);
  if (filters.fecha_desde) {
    items = items.filter((m) => m.fecha_movimiento >= filters.fecha_desde!);
  }
  if (filters.fecha_hasta) {
    items = items.filter((m) => m.fecha_movimiento <= filters.fecha_hasta!);
  }
  if (filters.solo_pagos_inquilinos) {
    items = items.filter(
      (m) => m.tipo === "ingreso" && m.inquilino_id != null,
    );
  }
  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (m) =>
        m.concepto.toLowerCase().includes(q) ||
        m.propiedad_nombre.toLowerCase().includes(q) ||
        (m.inquilino_nombre?.toLowerCase().includes(q) ?? false) ||
        (m.contrato_codigo?.toLowerCase().includes(q) ?? false) ||
        (m.ticket_codigo?.toLowerCase().includes(q) ?? false),
    );
  }

  return items;
}

export function hasActiveMovimientoFilters(filters: MovimientoFilters): boolean {
  return !!(
    filters.search?.trim() ||
    filters.propiedad_id ||
    filters.tipo ||
    filters.categoria ||
    filters.estado ||
    filters.inquilino_id ||
    filters.metodo_pago ||
    filters.fecha_desde ||
    filters.fecha_hasta ||
    filters.solo_pagos_inquilinos
  );
}
