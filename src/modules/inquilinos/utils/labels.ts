import {
  ESTADOS_DOCUMENTO,
  ESTADOS_PAGO,
  INQUILINO_STATUSES,
  NIVELES_SCORING,
  TIPOS_CONTRATO_LABORAL,
  TIPOS_DOCUMENTO_IDENTIDAD,
  TIPOS_DOCUMENTO_INQUILINO,
} from "../constants";
import type {
  EstadoDocumentoInquilino,
  EstadoPagoInquilino,
  InquilinoStatus,
  NivelScoring,
  TipoContratoLaboral,
  TipoDocumentoIdentidad,
  TipoDocumentoInquilino,
} from "../types";

export function nombreCompleto(nombres: string, apellidos: string): string {
  return `${nombres} ${apellidos}`.trim();
}

export function getStatusLabel(s: InquilinoStatus): string {
  return INQUILINO_STATUSES.find((x) => x.value === s)?.label ?? s;
}

export function getPagoLabel(s: EstadoPagoInquilino): string {
  return ESTADOS_PAGO.find((x) => x.value === s)?.label ?? s;
}

export function getScoringLabel(s: NivelScoring): string {
  return NIVELES_SCORING.find((x) => x.value === s)?.label ?? s;
}

export function getTipoDocumentoLabel(t: TipoDocumentoIdentidad): string {
  return TIPOS_DOCUMENTO_IDENTIDAD.find((x) => x.value === t)?.label ?? t;
}

export function getTipoContratoLabel(t: TipoContratoLaboral): string {
  return TIPOS_CONTRATO_LABORAL.find((x) => x.value === t)?.label ?? t;
}

export function getDocInquilinoLabel(t: TipoDocumentoInquilino): string {
  return TIPOS_DOCUMENTO_INQUILINO.find((x) => x.value === t)?.label ?? t;
}

export function getEstadoDocumentoLabel(s: EstadoDocumentoInquilino): string {
  return ESTADOS_DOCUMENTO.find((x) => x.value === s)?.label ?? s;
}

export function formatPrecio(value: number, locale = "es-ES"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatFecha(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
