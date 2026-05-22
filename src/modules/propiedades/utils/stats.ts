import type { Propiedad, PropiedadFilters } from "../types";

export function hasActiveFilters(filters: PropiedadFilters): boolean {
  return !!(
    filters.search?.trim() ||
    filters.ciudad ||
    filters.estado ||
    filters.tipo_renta ||
    filters.tipo_propiedad
  );
}

export interface PropiedadesPortfolioStats {
  total: number;
  disponibles: number;
  alquiladas: number;
  mantenimiento: number;
  ingresosMensuales: number;
}

export function computePropiedadesStats(
  propiedades: Propiedad[],
): PropiedadesPortfolioStats {
  const disponibles = propiedades.filter((p) => p.estado === "disponible").length;
  const alquiladas = propiedades.filter((p) => p.estado === "alquilada").length;
  const mantenimiento = propiedades.filter((p) => p.estado === "mantenimiento").length;
  const ingresosMensuales = propiedades
    .filter((p) => p.estado === "alquilada")
    .reduce((sum, p) => sum + p.precio_mes, 0);

  return {
    total: propiedades.length,
    disponibles,
    alquiladas,
    mantenimiento,
    ingresosMensuales,
  };
}
