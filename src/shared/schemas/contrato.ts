import { z } from "zod";

export const ContractTemplateSchema = z.object({
  nombre: z.string().min(2, "Nombre obligatorio").max(120),
  descripcion: z.string().max(500).default(""),
  plantilla_html: z.string().min(20, "La plantilla debe tener contenido"),
  activo: z.boolean().default(true),
});

export type ContractTemplateFormValues = z.infer<typeof ContractTemplateSchema>;

export const ContractFormSchema = z
  .object({
    tipo_contrato_id: z.string().min(1, "Selecciona un tipo de contrato"),
    propiedad_id: z.string().min(1, "Selecciona una propiedad"),
    unidad: z.string().max(80).optional().nullable(),
    inquilino_id: z.string().min(1, "Selecciona un inquilino"),
    fecha_inicio: z.string().min(1, "Fecha de inicio obligatoria"),
    fecha_fin: z.string().min(1, "Fecha de fin obligatoria"),
    valor_mensual: z.coerce.number().positive("La renta debe ser mayor que 0"),
    deposito: z.coerce.number().min(0, "La fianza no puede ser negativa"),
    dia_pago: z.coerce.number().int().min(1).max(28),
    observaciones: z.string().max(2000).optional().nullable(),
  })
  .refine((d) => new Date(d.fecha_fin) > new Date(d.fecha_inicio), {
    message: "La fecha de fin debe ser posterior al inicio",
    path: ["fecha_fin"],
  });

export type ContractFormValues = z.infer<typeof ContractFormSchema>;

/** Schema legacy (compatibilidad) */
export const ContratoSchema = z.object({
  propiedad_id: z.string().uuid(),
  inquilino_id: z.string().uuid(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  renta_mensual: z.number().positive(),
  dia_cobro: z.number().int().min(1).max(31).default(1),
  fianza: z.number().min(0),
  clausulas_adicionales: z.string().max(5000).optional(),
});

export type ContratoForm = z.infer<typeof ContratoSchema>;
