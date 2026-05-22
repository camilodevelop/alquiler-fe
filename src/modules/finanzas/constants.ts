import type { CategoriaGasto, CategoriaIngreso, MovimientoEstado, MovimientoTipo } from "./types";

export const FINANZAS_STORAGE_BUCKET = "finanzas";

export const MOVIMIENTO_TIPO_CONFIG: Record<
  MovimientoTipo,
  { label: string; sign: "+" | "-" }
> = {
  ingreso: { label: "Ingreso", sign: "+" },
  gasto: { label: "Gasto", sign: "-" },
};

export const CATEGORIAS_INGRESO: { value: CategoriaIngreso; label: string }[] = [
  { value: "pago_arriendo", label: "Pago de arriendo" },
  { value: "deposito_fianza", label: "Depósito / fianza" },
  { value: "administracion_comunidad", label: "Administración / comunidad" },
  { value: "servicios_publicos", label: "Servicios públicos" },
  { value: "penalizacion_mora", label: "Penalización por mora" },
  { value: "otro_ingreso", label: "Otro ingreso" },
];

export const CATEGORIAS_GASTO: { value: CategoriaGasto; label: string }[] = [
  { value: "reparacion", label: "Reparación" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "servicios_publicos", label: "Servicios públicos" },
  { value: "administracion_comunidad", label: "Administración / comunidad" },
  { value: "impuestos", label: "Impuestos" },
  { value: "seguro", label: "Seguro" },
  { value: "limpieza", label: "Limpieza" },
  { value: "comision", label: "Comisión" },
  { value: "publicidad", label: "Publicidad" },
  { value: "reforma", label: "Reforma" },
  { value: "otro_gasto", label: "Otro gasto" },
];

export const MOVIMIENTO_ESTADOS: { value: MovimientoEstado; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "pagado", label: "Pagado" },
  { value: "parcial", label: "Parcial" },
  { value: "vencido", label: "Vencido" },
  { value: "cancelado", label: "Cancelado" },
];

export const METODOS_PAGO: { value: string; label: string }[] = [
  { value: "transferencia", label: "Transferencia" },
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "bizum", label: "Bizum" },
  { value: "domiciliacion", label: "Domiciliación" },
  { value: "otro", label: "Otro" },
];

export const MOVIMIENTO_ESTADO_STYLES: Record<
  MovimientoEstado,
  { badge: string; dot: string }
> = {
  pendiente: { badge: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-amber-500" },
  pagado: { badge: "bg-emerald-50 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
  parcial: { badge: "bg-sky-50 text-sky-800 border-sky-200", dot: "bg-sky-500" },
  vencido: { badge: "bg-red-50 text-red-800 border-red-200", dot: "bg-red-500" },
  cancelado: { badge: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" },
};
