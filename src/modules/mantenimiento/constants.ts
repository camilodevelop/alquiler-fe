import type {
  ManitasEstado,
  ManitasEspecialidad,
  TicketEstado,
  TicketTipo,
  TicketUrgencia,
} from "./types";

export const TICKET_ESTADO_CONFIG: Record<
  TicketEstado,
  { label: string; description: string; variant: "default" | "warning" | "info" | "success" | "danger" }
> = {
  nuevo: {
    label: "Nuevo",
    description: "Ticket recién creado",
    variant: "info",
  },
  asignado: {
    label: "Asignado",
    description: "Ya tiene manitas asignado",
    variant: "info",
  },
  en_proceso: {
    label: "En proceso",
    description: "El manitas está trabajando",
    variant: "warning",
  },
  resuelto: {
    label: "Resuelto",
    description: "El trabajo terminó",
    variant: "success",
  },
  cerrado: {
    label: "Cerrado",
    description: "Solución confirmada por administrador o inquilino",
    variant: "default",
  },
  cancelado: {
    label: "Cancelado",
    description: "Ticket anulado",
    variant: "default",
  },
};

export const TICKET_TIPO_CONFIG: Record<TicketTipo, { label: string }> = {
  plomeria: { label: "Plomería" },
  electricidad: { label: "Electricidad" },
  cerrajeria: { label: "Cerrajería" },
  pintura: { label: "Pintura" },
  electrodomesticos: { label: "Electrodomésticos" },
  muebles: { label: "Muebles" },
  internet_tecnologia: { label: "Internet / tecnología" },
  limpieza: { label: "Limpieza" },
  humedad_filtraciones: { label: "Humedad / filtraciones" },
  danos_estructurales: { label: "Daños estructurales" },
  otro: { label: "Otro" },
};

export const TICKET_URGENCIA_CONFIG: Record<
  TicketUrgencia,
  { label: string; variant: "default" | "warning" | "info" | "success" | "danger" }
> = {
  baja: { label: "Baja", variant: "success" },
  media: { label: "Media", variant: "warning" },
  alta: { label: "Alta", variant: "warning" },
  critica: { label: "Crítica", variant: "danger" },
};

export const MANITAS_ESTADO_CONFIG: Record<
  ManitasEstado,
  { label: string; variant: "default" | "warning" | "info" | "success" | "danger" }
> = {
  disponible: { label: "Disponible", variant: "success" },
  ocupado: { label: "Ocupado", variant: "warning" },
  inactivo: { label: "Inactivo", variant: "default" },
  suspendido: { label: "Suspendido", variant: "danger" },
};

export const MANITAS_ESPECIALIDAD_CONFIG: Record<ManitasEspecialidad, { label: string }> = {
  plomeria: { label: "Plomería" },
  electricidad: { label: "Electricidad" },
  cerrajeria: { label: "Cerrajería" },
  pintura: { label: "Pintura" },
  limpieza: { label: "Limpieza" },
  general: { label: "General" },
  otro: { label: "Otro" },
};

export const ASSIGNABLE_MANITAS_ESTADOS: ManitasEstado[] = ["disponible", "ocupado"];

export const MANTENIMIENTO_STORAGE_BUCKET = "mantenimiento";

/** Orden de tabs en el listado (flujo operativo) */
export const TICKET_ESTADO_TAB_ORDER: TicketEstado[] = [
  "nuevo",
  "asignado",
  "en_proceso",
  "resuelto",
  "cerrado",
  "cancelado",
];

export const TICKET_ESTADO_TAB_STYLES: Record<
  TicketEstado,
  { dot: string; active: string; ring: string }
> = {
  nuevo: { dot: "bg-sky-500", active: "bg-sky-50 text-sky-800 border-sky-200", ring: "ring-sky-500/30" },
  asignado: {
    dot: "bg-violet-500",
    active: "bg-violet-50 text-violet-800 border-violet-200",
    ring: "ring-violet-500/30",
  },
  en_proceso: {
    dot: "bg-amber-500",
    active: "bg-amber-50 text-amber-900 border-amber-200",
    ring: "ring-amber-500/30",
  },
  resuelto: {
    dot: "bg-emerald-500",
    active: "bg-emerald-50 text-emerald-800 border-emerald-200",
    ring: "ring-emerald-500/30",
  },
  cerrado: { dot: "bg-gray-400", active: "bg-gray-50 text-gray-700 border-gray-200", ring: "ring-gray-400/30" },
  cancelado: { dot: "bg-gray-300", active: "bg-gray-50 text-gray-600 border-gray-200", ring: "ring-gray-300/30" },
};

export const TICKET_URGENCIA_PILL_STYLES: Record<
  TicketUrgencia,
  { idle: string; active: string }
> = {
  baja: {
    idle: "border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50",
    active: "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20",
  },
  media: {
    idle: "border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-amber-50/50",
    active: "border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20",
  },
  alta: {
    idle: "border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50/50",
    active: "border-orange-500 bg-orange-50 text-orange-900 ring-2 ring-orange-500/20",
  },
  critica: {
    idle: "border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50/50",
    active: "border-red-500 bg-red-50 text-red-800 ring-2 ring-red-500/20",
  },
};

export const TICKET_ESTADOS_OPTIONS = Object.entries(TICKET_ESTADO_CONFIG).map(
  ([value, { label }]) => ({ value: value as TicketEstado, label }),
);

export const TICKET_TIPOS_OPTIONS = Object.entries(TICKET_TIPO_CONFIG).map(
  ([value, { label }]) => ({ value: value as TicketTipo, label }),
);

export const TICKET_URGENCIAS_OPTIONS = Object.entries(TICKET_URGENCIA_CONFIG).map(
  ([value, { label }]) => ({ value: value as TicketUrgencia, label }),
);

export const MANITAS_ESTADOS_OPTIONS = Object.entries(MANITAS_ESTADO_CONFIG).map(
  ([value, { label }]) => ({ value: value as ManitasEstado, label }),
);

export const MANITAS_ESPECIALIDADES_OPTIONS = Object.entries(MANITAS_ESPECIALIDAD_CONFIG).map(
  ([value, { label }]) => ({ value: value as ManitasEspecialidad, label }),
);

/** Estados activos (manitas con trabajo pendiente) */
export const TICKET_ESTADOS_ACTIVOS: TicketEstado[] = ["asignado", "en_proceso"];
