import {
  CATEGORIAS_GASTO,
  CATEGORIAS_INGRESO,
  METODOS_PAGO,
  MOVIMIENTO_ESTADOS,
  MOVIMIENTO_TIPO_CONFIG,
} from "../constants";
import type { MovimientoCategoria, MovimientoEstado, MovimientoTipo } from "../types";

export function formatFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = iso.includes("T") ? iso.slice(0, 10) : iso;
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return iso;
  return `${day}/${m}/${y}`;
}

export function formatMesCorrespondiente(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = iso.slice(0, 10);
  const [y, m] = d.split("-");
  if (!y || !m) return iso;
  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  return `${months[parseInt(m, 10) - 1]} ${y}`;
}

export function formatPrecio(n: number | null | undefined, tipo?: MovimientoTipo): string {
  if (n == null) return "—";
  const formatted = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
  if (!tipo) return formatted;
  const sign = MOVIMIENTO_TIPO_CONFIG[tipo].sign;
  return tipo === "gasto" ? `−${formatted.replace("−", "")}` : `+${formatted}`;
}

export function getCategoriaLabel(categoria: MovimientoCategoria): string {
  const all = [...CATEGORIAS_INGRESO, ...CATEGORIAS_GASTO];
  return all.find((c) => c.value === categoria)?.label ?? categoria;
}

export function getEstadoLabel(estado: MovimientoEstado): string {
  return MOVIMIENTO_ESTADOS.find((e) => e.value === estado)?.label ?? estado;
}

export function getMetodoPagoLabel(codigo: string | null | undefined): string {
  if (!codigo) return "—";
  return METODOS_PAGO.find((m) => m.value === codigo)?.label ?? codigo;
}

export function getTipoLabel(tipo: MovimientoTipo): string {
  return MOVIMIENTO_TIPO_CONFIG[tipo].label;
}
