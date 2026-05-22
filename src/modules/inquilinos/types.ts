import type { TipoRenta } from "@/modules/propiedades/types";

/** Estado del inquilino en el ciclo de vida */
export type InquilinoStatus =
  | "candidato"
  | "en_revision"
  | "aprobado"
  | "activo"
  | "moroso"
  | "finalizado"
  | "rechazado"
  | "inactivo";

export type TipoDocumentoIdentidad = "dni" | "nie" | "pasaporte" | "cedula" | "otro";

export type TipoContratoLaboral =
  | "indefinido"
  | "temporal"
  | "autonomo"
  | "pensionado"
  | "estudiante"
  | "desempleado"
  | "otro";

export type EstadoPagoInquilino = "al_dia" | "pendiente" | "vencido" | "impagado";

export type NivelScoring = "sin_evaluar" | "bajo" | "medio" | "alto" | "excelente";

export type TipoDocumentoInquilino =
  | "identidad"
  | "contrato_laboral"
  | "nomina"
  | "vida_laboral"
  | "carta_recomendacion"
  | "certificado_bancario"
  | "otro";

export type EstadoDocumentoInquilino = "pendiente" | "en_revision" | "aprobado" | "rechazado";

export type ResponsableServicios = "propietario" | "inquilino" | "compartido";

export interface InquilinoDocumento {
  id: string;
  inquilino_id: string;
  tipo: TipoDocumentoInquilino;
  nombre_archivo: string;
  fecha_carga: string;
  estado: EstadoDocumentoInquilino;
  observaciones?: string;
  url?: string;
}

export interface InquilinoReferencia {
  nombre_personal?: string;
  telefono_personal?: string;
  relacion?: string;
  nombre_arrendador?: string;
  telefono_arrendador?: string;
  comentario?: string;
}

export interface InquilinoScoring {
  nivel: NivelScoring;
  documentacion_completa: boolean;
  ingresos_suficientes: boolean;
  historial_pagos: boolean;
  referencias_positivas: boolean;
  estabilidad_laboral: boolean;
  comportamiento_reportado: boolean;
  danos_previos: boolean;
  observaciones_gestor?: string;
  actualizado_at: string;
}

export interface InquilinoAsignacionPropiedad {
  propiedad_id: string;
  propiedad_nombre?: string;
  tipo_renta?: TipoRenta;
  unidad_id?: string;
  unidad_nombre?: string;
  fecha_ingreso?: string;
  fecha_salida?: string;
  canon_mensual?: number;
  deposito?: number;
  responsable_servicios?: ResponsableServicios;
  ocupantes?: number;
}

export interface InquilinoPagoResumen {
  estado: EstadoPagoInquilino;
  total_pagado: number;
  total_pendiente: number;
  pagos_vencidos: number;
}

export interface InquilinoHistorialEntry {
  id: string;
  fecha: string;
  tipo:
    | "creado"
    | "documento"
    | "propiedad"
    | "contrato"
    | "pago"
    | "incidencia"
    | "estado"
    | "scoring";
  descripcion: string;
}

export interface Inquilino {
  id: string;
  nombres: string;
  apellidos: string;
  tipo_documento: TipoDocumentoIdentidad;
  numero_documento: string;
  fecha_nacimiento?: string;
  nacionalidad?: string;
  telefono: string;
  email: string;
  direccion_actual?: string;
  ciudad?: string;
  pais?: string;
  ocupacion?: string;
  empresa?: string;
  tipo_contrato_laboral?: TipoContratoLaboral;
  ingresos_mensuales?: number;
  antiguedad_laboral?: string;
  referencia_laboral?: string;
  telefono_referencia_laboral?: string;
  observaciones_financieras?: string;
  status: InquilinoStatus;
  asignacion?: InquilinoAsignacionPropiedad;
  referencias?: InquilinoReferencia;
  scoring?: InquilinoScoring;
  documentos: InquilinoDocumento[];
  pago_resumen: InquilinoPagoResumen;
  historial: InquilinoHistorialEntry[];
  created_at: string;
  updated_at: string;
}

export interface InquilinoListItem extends Inquilino {}

export interface InquilinoFilters {
  search?: string;
  status?: InquilinoStatus | "";
  propiedad_id?: string;
  tipo_renta?: TipoRenta | "";
  estado_pago?: EstadoPagoInquilino | "";
  fecha_ingreso_desde?: string;
  fecha_ingreso_hasta?: string;
  scoring?: NivelScoring | "";
}

export type InquilinoWizardStep = 1 | 2 | 3 | 4 | 5 | 6;

/** Alias en inglés — preparado para API futura */
export type Tenant = Inquilino;
export type TenantStatus = InquilinoStatus;
export type TenantDocument = InquilinoDocumento;
export type TenantReference = InquilinoReferencia;
export type TenantScoring = InquilinoScoring;
export type TenantPropertyAssignment = InquilinoAsignacionPropiedad;
export type TenantPaymentSummary = InquilinoPagoResumen;
