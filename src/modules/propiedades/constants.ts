import type { EstadoPropiedad, TipoPropiedad, TipoRenta } from "./types";

export const TIPOS_RENTA: { value: TipoRenta; label: string; description: string }[] = [
  {
    value: "tradicional",
    label: "Renta tradicional",
    description: "Contrato a largo plazo con precio mensual fijo.",
  },
  {
    value: "habitaciones",
    label: "Renta por habitaciones",
    description: "Alquiler por habitaciones en vivienda compartida.",
  },
  {
    value: "temporal",
    label: "Renta temporal",
    description: "Estancias cortas o medias con estancia mínima.",
  },
  {
    value: "comercial",
    label: "Renta comercial",
    description: "Locales, oficinas y espacios para actividad económica.",
  },
];

export const TIPOS_PROPIEDAD: { value: TipoPropiedad; label: string }[] = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "apartaestudio", label: "Apartaestudio" },
  { value: "habitacion", label: "Habitación" },
  { value: "local", label: "Local" },
  { value: "oficina", label: "Oficina" },
  { value: "bodega", label: "Bodega" },
  { value: "finca", label: "Finca" },
  { value: "garaje", label: "Garaje" },
  { value: "deposito", label: "Depósito" },
];

export const ESTADOS_PROPIEDAD: { value: EstadoPropiedad; label: string }[] = [
  { value: "disponible", label: "Disponible" },
  { value: "alquilada", label: "Alquilada" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "inactiva", label: "Inactiva" },
];

export const ESTADO_BADGE_VARIANT: Record<
  EstadoPropiedad,
  "success" | "info" | "warning" | "default"
> = {
  disponible: "info",
  alquilada: "success",
  mantenimiento: "warning",
  inactiva: "default",
};

export const WIZARD_STEPS = [
  { id: 1, label: "Información básica" },
  { id: 2, label: "Tipo de renta" },
  { id: 3, label: "Ubicación" },
  { id: 4, label: "Precio y estado" },
  { id: 5, label: "Foto principal" },
] as const;

export const STORAGE_BUCKET = "propiedades";
