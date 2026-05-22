import type { ContractStatus, ContractHistorialTipo } from "./types";

export const STORAGE_TEMPLATES_KEY = "alquiler_contract_templates_v1";
export const STORAGE_CONTRACTS_KEY = "alquiler_contracts_v1";

export const TEMPLATE_VARIABLES = [
  { key: "{{tenant_name}}", label: "Nombre inquilino" },
  { key: "{{tenant_document}}", label: "Documento inquilino" },
  { key: "{{property_name}}", label: "Nombre propiedad" },
  { key: "{{property_address}}", label: "Dirección propiedad" },
  { key: "{{unit}}", label: "Habitación/unidad" },
  { key: "{{monthly_rent}}", label: "Renta mensual" },
  { key: "{{deposit}}", label: "Depósito/fianza" },
  { key: "{{start_date}}", label: "Fecha inicio" },
  { key: "{{end_date}}", label: "Fecha fin" },
  { key: "{{payment_day}}", label: "Día de pago" },
  { key: "{{contract_code}}", label: "Código contrato" },
] as const;

export const CONTRACT_STATUS_CONFIG: Record<
  ContractStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  borrador: { label: "Borrador", variant: "default" },
  pendiente_firma: { label: "Pendiente firma", variant: "warning" },
  firmado: { label: "Firmado", variant: "info" },
  activo: { label: "Activo", variant: "success" },
  finalizado: { label: "Finalizado", variant: "default" },
  cancelado: { label: "Cancelado", variant: "danger" },
};

export const SIGNATURE_SUMMARY_CONFIG = {
  pendiente: { label: "Sin firmar", variant: "warning" as const },
  parcial: { label: "Firma parcial", variant: "info" as const },
  completa: { label: "Firmado", variant: "success" as const },
};

export const HISTORIAL_LABELS: Record<ContractHistorialTipo, string> = {
  creado: "Contrato creado",
  editado: "Contrato editado",
  firma_admin: "Firma administrador",
  firma_inquilino: "Firma inquilino",
  activado: "Contrato activado",
  finalizado: "Contrato finalizado",
  cancelado: "Contrato cancelado",
};
