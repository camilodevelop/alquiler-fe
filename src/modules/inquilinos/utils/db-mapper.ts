import type { TipoRenta } from "@/modules/propiedades/types";
import type { InquilinoFormValues } from "@/shared/schemas/inquilino";
import type {
  Inquilino,
  InquilinoDocumento,
  InquilinoHistorialEntry,
  InquilinoReferencia,
  InquilinoScoring,
  ResponsableServicios,
} from "../types";

type PropiedadJoin = {
  id: string;
  titulo: string;
  tipo_renta: string;
  habitaciones?: number;
  estado?: string;
} | null;

type InquilinoRow = Record<string, unknown> & {
  id: string;
  owner_id: string;
  nombres: string;
  apellidos: string;
  tipo_documento: string;
  numero_documento: string;
  telefono: string;
  email: string;
  status: string;
  estado_pago: string;
  total_pagado: number;
  total_pendiente: number;
  pagos_vencidos: number;
  created_at: string;
  updated_at: string;
  propiedades?: PropiedadJoin | PropiedadJoin[];
};

export function mapInquilinoFromDb(
  row: InquilinoRow,
  refs?: InquilinoReferencia | null,
  scoring?: InquilinoScoring | null,
  documentos?: InquilinoDocumento[],
  historial?: InquilinoHistorialEntry[],
): Inquilino {
  const prop = Array.isArray(row.propiedades) ? row.propiedades[0] : row.propiedades;

  return {
    id: row.id,
    nombres: row.nombres,
    apellidos: row.apellidos,
    tipo_documento: row.tipo_documento as Inquilino["tipo_documento"],
    numero_documento: row.numero_documento,
    fecha_nacimiento: (row.fecha_nacimiento as string) ?? undefined,
    nacionalidad: (row.nacionalidad as string) ?? undefined,
    telefono: row.telefono,
    email: row.email,
    direccion_actual: (row.direccion_actual as string) ?? undefined,
    ciudad: (row.ciudad as string) ?? undefined,
    pais: (row.pais as string) ?? undefined,
    ocupacion: (row.ocupacion as string) ?? undefined,
    empresa: (row.empresa as string) ?? undefined,
    tipo_contrato_laboral: (row.tipo_contrato_laboral as Inquilino["tipo_contrato_laboral"]) ?? undefined,
    ingresos_mensuales: row.ingresos_mensuales != null ? Number(row.ingresos_mensuales) : undefined,
    antiguedad_laboral: (row.antiguedad_laboral as string) ?? undefined,
    referencia_laboral: (row.referencia_laboral as string) ?? undefined,
    telefono_referencia_laboral: (row.telefono_referencia_laboral as string) ?? undefined,
    observaciones_financieras: (row.observaciones_financieras as string) ?? undefined,
    status: row.status as Inquilino["status"],
    asignacion: row.propiedad_id
      ? {
          propiedad_id: row.propiedad_id as string,
          propiedad_nombre: prop?.titulo,
          tipo_renta: prop?.tipo_renta as TipoRenta | undefined,
          unidad_id: (row.unidad_id as string) ?? undefined,
          unidad_nombre: (row.unidad_nombre as string) ?? undefined,
          fecha_ingreso: (row.fecha_ingreso as string) ?? undefined,
          fecha_salida: (row.fecha_salida as string) ?? undefined,
          canon_mensual: row.canon_mensual != null ? Number(row.canon_mensual) : undefined,
          deposito: row.deposito != null ? Number(row.deposito) : undefined,
          responsable_servicios: (row.responsable_servicios as ResponsableServicios) ?? undefined,
          ocupantes: row.ocupantes != null ? Number(row.ocupantes) : undefined,
        }
      : undefined,
    referencias: refs ?? undefined,
    scoring: scoring ?? undefined,
    documentos: documentos ?? [],
    pago_resumen: {
      estado: row.estado_pago as Inquilino["pago_resumen"]["estado"],
      total_pagado: Number(row.total_pagado),
      total_pendiente: Number(row.total_pendiente),
      pagos_vencidos: Number(row.pagos_vencidos),
    },
    historial: historial ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export type InquilinoAssignmentRow = {
  propiedad_id?: string | null;
  unidad_id?: string | null;
  unidad_nombre?: string | null;
  fecha_ingreso?: string | null;
  fecha_salida?: string | null;
  canon_mensual?: number | null;
  deposito?: number | null;
  responsable_servicios?: string | null;
  ocupantes?: number | null;
};

/** Asignación a propiedad: solo se escribe desde la activación del contrato. */
export function formToInquilinoPayload(
  values: InquilinoFormValues,
  ownerId: string,
  assignment?: InquilinoAssignmentRow | null,
) {
  return {
    owner_id: ownerId,
    nombres: values.nombres,
    apellidos: values.apellidos,
    tipo_documento: values.tipo_documento,
    numero_documento: values.numero_documento.trim(),
    fecha_nacimiento: values.fecha_nacimiento || null,
    nacionalidad: values.nacionalidad || null,
    telefono: values.telefono,
    email: values.email.trim().toLowerCase(),
    direccion_actual: values.direccion_actual || null,
    ciudad: values.ciudad || null,
    pais: values.pais || "España",
    ocupacion: values.ocupacion || null,
    empresa: values.empresa || null,
    tipo_contrato_laboral: values.tipo_contrato_laboral || null,
    ingresos_mensuales: values.ingresos_mensuales ?? null,
    antiguedad_laboral: values.antiguedad_laboral || null,
    referencia_laboral: values.referencia_laboral || null,
    telefono_referencia_laboral: values.telefono_referencia_laboral || null,
    observaciones_financieras: values.observaciones_financieras || null,
    status: values.status,
    propiedad_id: assignment?.propiedad_id ?? null,
    unidad_id: assignment?.unidad_id ?? null,
    unidad_nombre: assignment?.unidad_nombre ?? null,
    fecha_ingreso: assignment?.fecha_ingreso ?? null,
    fecha_salida: assignment?.fecha_salida ?? null,
    canon_mensual: assignment?.canon_mensual ?? null,
    deposito: assignment?.deposito ?? null,
    responsable_servicios: assignment?.responsable_servicios ?? "inquilino",
    ocupantes: assignment?.ocupantes ?? 1,
  };
}

export function formToReferenciasPayload(values: InquilinoFormValues) {
  const r = values.referencias;
  if (!r) return null;
  return {
    nombre_personal: r.nombre_personal || null,
    telefono_personal: r.telefono_personal || null,
    relacion: r.relacion || null,
    nombre_arrendador: r.nombre_arrendador || null,
    telefono_arrendador: r.telefono_arrendador || null,
    comentario: r.comentario || null,
  };
}

export function formToScoringPayload(values: InquilinoFormValues) {
  const s = values.scoring;
  if (!s) return null;
  return {
    nivel: s.nivel,
    documentacion_completa: s.documentacion_completa,
    ingresos_suficientes: s.ingresos_suficientes,
    historial_pagos: s.historial_pagos,
    referencias_positivas: s.referencias_positivas,
    estabilidad_laboral: s.estabilidad_laboral,
    comportamiento_reportado: s.comportamiento_reportado,
    danos_previos: s.danos_previos,
    observaciones_gestor: s.observaciones_gestor || null,
    actualizado_at: new Date().toISOString(),
  };
}
