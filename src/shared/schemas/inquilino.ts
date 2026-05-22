import { z } from "zod";

const phoneRegex = /^[+]?[\d\s()-]{9,18}$/;

export const InquilinoStep1Schema = z.object({
  nombres: z.string().min(2, "Indica los nombres"),
  apellidos: z.string().min(2, "Indica los apellidos"),
  tipo_documento: z.enum(["dni", "nie", "pasaporte", "cedula", "otro"]),
  numero_documento: z.string().min(4, "Documento obligatorio").max(20),
  fecha_nacimiento: z.string().optional(),
  nacionalidad: z.string().optional(),
  telefono: z.string().regex(phoneRegex, "Teléfono inválido"),
  email: z.string().email("Email inválido"),
  direccion_actual: z.string().optional(),
  ciudad: z.string().optional(),
  pais: z.string().optional(),
});

export const InquilinoStep2Schema = z.object({
  ocupacion: z.string().optional(),
  empresa: z.string().optional(),
  tipo_contrato_laboral: z
    .enum(["indefinido", "temporal", "autonomo", "pensionado", "estudiante", "desempleado", "otro"])
    .optional(),
  ingresos_mensuales: z.coerce.number().min(0).optional(),
  antiguedad_laboral: z.string().optional(),
  referencia_laboral: z.string().optional(),
  telefono_referencia_laboral: z.string().optional(),
  observaciones_financieras: z.string().optional(),
});

export const InquilinoStep3Schema = z.object({
  propiedad_id: z.string().optional(),
  unidad_id: z.string().optional(),
  fecha_ingreso: z.string().optional(),
  fecha_salida: z.string().optional(),
  canon_mensual: z.coerce.number().min(0).optional(),
  deposito: z.coerce.number().min(0).optional(),
  responsable_servicios: z.enum(["propietario", "inquilino", "compartido"]).optional(),
  ocupantes: z.coerce.number().min(1).max(20).optional(),
  status: z.enum([
    "candidato",
    "en_revision",
    "aprobado",
    "activo",
    "moroso",
    "finalizado",
    "rechazado",
    "inactivo",
  ]),
});

export const InquilinoReferenciasSchema = z.object({
  nombre_personal: z.string().optional(),
  telefono_personal: z.string().optional(),
  relacion: z.string().optional(),
  nombre_arrendador: z.string().optional(),
  telefono_arrendador: z.string().optional(),
  comentario: z.string().optional(),
});

export const InquilinoScoringSchema = z.object({
  nivel: z.enum(["sin_evaluar", "bajo", "medio", "alto", "excelente"]),
  documentacion_completa: z.boolean(),
  ingresos_suficientes: z.boolean(),
  historial_pagos: z.boolean(),
  referencias_positivas: z.boolean(),
  estabilidad_laboral: z.boolean(),
  comportamiento_reportado: z.boolean(),
  danos_previos: z.boolean(),
  observaciones_gestor: z.string().optional(),
});

export const InquilinoFormSchema = InquilinoStep1Schema.merge(InquilinoStep2Schema)
  .merge(InquilinoStep3Schema)
  .merge(
    z.object({
      referencias: InquilinoReferenciasSchema.optional(),
      scoring: InquilinoScoringSchema.optional(),
    }),
  );

export type InquilinoFormValues = z.infer<typeof InquilinoFormSchema>;

/** @deprecated usar InquilinoFormValues */
export const InquilinoSchema = InquilinoStep1Schema;
export type InquilinoForm = InquilinoFormValues;
