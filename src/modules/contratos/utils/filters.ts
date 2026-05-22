import type { Contract, ContractFilters } from "../types";
import { getSignatureSummary } from "./labels";

export function filterContracts(contracts: Contract[], filters: ContractFilters): Contract[] {
  let list = [...contracts];

  if (filters.estado) {
    list = list.filter((c) => c.estado === filters.estado);
  }
  if (filters.propiedad_id) {
    list = list.filter((c) => c.propiedad_id === filters.propiedad_id);
  }
  if (filters.inquilino_id) {
    list = list.filter((c) => c.inquilino_id === filters.inquilino_id);
  }
  if (filters.tipo_contrato_id) {
    list = list.filter((c) => c.tipo_contrato_id === filters.tipo_contrato_id);
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.codigo.toLowerCase().includes(q) ||
        c.propiedad_nombre.toLowerCase().includes(q) ||
        c.inquilino_nombre.toLowerCase().includes(q) ||
        c.tipo_contrato_nombre.toLowerCase().includes(q),
    );
  }

  return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function hasActiveFilters(filters: ContractFilters): boolean {
  return Boolean(
    filters.search?.trim() ||
      filters.estado ||
      filters.propiedad_id ||
      filters.inquilino_id ||
      filters.tipo_contrato_id,
  );
}

export function toListItem(c: Contract) {
  return { ...c, estado_firma: getSignatureSummary(c.firmas) };
}
