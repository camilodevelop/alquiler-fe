import type {
  EstadoDocumentoInquilino,
  EstadoPagoInquilino,
  InquilinoStatus,
  NivelScoring,
  TipoContratoLaboral,
  TipoDocumentoIdentidad,
  TipoDocumentoInquilino,
} from "./types";

export const INQUILINO_STATUSES: { value: InquilinoStatus; label: string }[] = [
  { value: "candidato", label: "Candidato" },
  { value: "en_revision", label: "En revisión" },
  { value: "aprobado", label: "Aprobado" },
  { value: "activo", label: "Activo" },
  { value: "moroso", label: "Moroso" },
  { value: "finalizado", label: "Finalizado" },
  { value: "rechazado", label: "Rechazado" },
  { value: "inactivo", label: "Inactivo" },
];

export const STATUS_BADGE_VARIANT: Record<
  InquilinoStatus,
  "default" | "success" | "warning" | "danger" | "info" | "purple"
> = {
  candidato: "info",
  en_revision: "warning",
  aprobado: "success",
  activo: "success",
  moroso: "danger",
  finalizado: "default",
  rechazado: "danger",
  inactivo: "default",
};

export const ESTADOS_PAGO: { value: EstadoPagoInquilino; label: string }[] = [
  { value: "al_dia", label: "Al día" },
  { value: "pendiente", label: "Pendiente" },
  { value: "vencido", label: "Vencido" },
  { value: "impagado", label: "Impagado" },
];

export const PAGO_BADGE_VARIANT: Record<
  EstadoPagoInquilino,
  "success" | "warning" | "danger" | "default"
> = {
  al_dia: "success",
  pendiente: "warning",
  vencido: "danger",
  impagado: "danger",
};

export const TIPOS_DOCUMENTO_IDENTIDAD: { value: TipoDocumentoIdentidad; label: string }[] = [
  { value: "dni", label: "DNI" },
  { value: "nie", label: "NIE" },
  { value: "pasaporte", label: "Pasaporte" },
  { value: "cedula", label: "Cédula" },
  { value: "otro", label: "Otro" },
];

export const TIPOS_CONTRATO_LABORAL: { value: TipoContratoLaboral; label: string }[] = [
  { value: "indefinido", label: "Indefinido" },
  { value: "temporal", label: "Temporal" },
  { value: "autonomo", label: "Autónomo" },
  { value: "pensionado", label: "Pensionado" },
  { value: "estudiante", label: "Estudiante" },
  { value: "desempleado", label: "Desempleado" },
  { value: "otro", label: "Otro" },
];

export const TIPOS_DOCUMENTO_INQUILINO: { value: TipoDocumentoInquilino; label: string }[] = [
  { value: "identidad", label: "Documento de identidad" },
  { value: "contrato_laboral", label: "Contrato laboral" },
  { value: "nomina", label: "Nómina" },
  { value: "vida_laboral", label: "Vida laboral" },
  { value: "carta_recomendacion", label: "Carta de recomendación" },
  { value: "certificado_bancario", label: "Certificado bancario" },
  { value: "otro", label: "Otro" },
];

export const ESTADOS_DOCUMENTO: { value: EstadoDocumentoInquilino; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_revision", label: "En revisión" },
  { value: "aprobado", label: "Aprobado" },
  { value: "rechazado", label: "Rechazado" },
];

export const NIVELES_SCORING: { value: NivelScoring; label: string; color: string }[] = [
  { value: "sin_evaluar", label: "Sin evaluar", color: "bg-gray-100 text-gray-600" },
  { value: "bajo", label: "Bajo", color: "bg-red-100 text-red-700" },
  { value: "medio", label: "Medio", color: "bg-amber-100 text-amber-800" },
  { value: "alto", label: "Alto", color: "bg-blue-100 text-blue-700" },
  { value: "excelente", label: "Excelente", color: "bg-emerald-100 text-emerald-800" },
];

export const WIZARD_STEPS = [
  { id: 1, label: "Datos personales" },
  { id: 2, label: "Laboral y financiera" },
  { id: 3, label: "Estado" },
  { id: 4, label: "Documentos" },
  { id: 5, label: "Referencias" },
  { id: 6, label: "Scoring" },
] as const;

export const STORAGE_KEY = "alquiler_inquilinos_v1";

export const INQUILINOS_STORAGE_BUCKET = "inquilinos";
