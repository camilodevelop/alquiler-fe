import type { LucideIcon } from "lucide-react";
import {
  Building2,
  FileText,
  Landmark,
  LayoutDashboard,
  Users,
  Wrench,
} from "lucide-react";
import type { ReportTabId } from "./types";

export const REPORT_TABS: { id: ReportTabId; label: string; icon: LucideIcon }[] = [
  { id: "general", label: "General", icon: LayoutDashboard },
  { id: "propiedades", label: "Propiedades", icon: Building2 },
  { id: "inquilinos", label: "Inquilinos", icon: Users },
  { id: "contratos", label: "Contratos", icon: FileText },
  { id: "mantenimiento", label: "Mantenimiento", icon: Wrench },
  { id: "contabilidad", label: "Contabilidad", icon: Landmark },
];

export const CHART_COLORS = [
  "#09b850",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#64748b",
];

export const MESES_CORTOS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export const PROPIEDAD_ESTADO_LABEL: Record<string, string> = {
  disponible: "Disponible",
  alquilada: "Alquilada",
  mantenimiento: "Mantenimiento",
  inactiva: "Inactiva",
};

export const INQUILINO_STATUS_LABEL: Record<string, string> = {
  candidato: "Candidato",
  en_revision: "En revisión",
  aprobado: "Aprobado",
  activo: "Activo",
  moroso: "Moroso",
  finalizado: "Finalizado",
  rechazado: "Rechazado",
  inactivo: "Inactivo",
};

export const CONTRATO_ESTADO_LABEL: Record<string, string> = {
  borrador: "Borrador",
  pendiente_firma: "Pendiente firma",
  firmado: "Firmado",
  activo: "Activo",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export const MANITAS_ESTADO_LABEL: Record<string, string> = {
  disponible: "Disponible",
  ocupado: "Ocupado",
  inactivo: "Inactivo",
  suspendido: "Suspendido",
};

export const TICKET_URGENCIA_LABEL: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  critica: "Crítica",
};

export const TICKET_TIPO_LABEL: Record<string, string> = {
  plomeria: "Plomería",
  electricidad: "Electricidad",
  cerrajeria: "Cerrajería",
  pintura: "Pintura",
  electrodomesticos: "Electrodomésticos",
  muebles: "Muebles",
  internet_tecnologia: "Internet / TI",
  limpieza: "Limpieza",
  humedad_filtraciones: "Humedad",
  danos_estructurales: "Daños estructurales",
  otro: "Otro",
};

export const MANITAS_ESPECIALIDAD_LABEL: Record<string, string> = {
  plomeria: "Plomería",
  electricidad: "Electricidad",
  cerrajeria: "Cerrajería",
  pintura: "Pintura",
  limpieza: "Limpieza",
  general: "General",
  otro: "Otro",
};

export const TICKET_ESTADO_LABEL: Record<string, string> = {
  nuevo: "Nuevo",
  asignado: "Asignado",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};

export const SCORING_LABEL: Record<string, string> = {
  sin_evaluar: "Sin evaluar",
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
  excelente: "Excelente",
};

export const KPI_ICONS: Record<string, string> = {
  prop: "building",
  ocup: "home",
  disp: "key",
  ing: "trending-up",
  gas: "trending-down",
  saldo: "wallet",
  tickets: "wrench",
  contratos: "file",
};
