import type { EstadoPropiedad, TipoPropiedad, TipoRenta } from "../types";
import { ESTADOS_PROPIEDAD, TIPOS_PROPIEDAD, TIPOS_RENTA } from "../constants";

export function getTipoRentaLabel(value: TipoRenta): string {
  return TIPOS_RENTA.find((t) => t.value === value)?.label ?? value;
}

export function getTipoPropiedadLabel(value: TipoPropiedad): string {
  return TIPOS_PROPIEDAD.find((t) => t.value === value)?.label ?? value;
}

export function getEstadoLabel(value: EstadoPropiedad): string {
  return ESTADOS_PROPIEDAD.find((e) => e.value === value)?.label ?? value;
}

export function formatPrecio(value: number, locale = "es-ES"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
