import { z } from "zod";

const ticketTipo = z.enum([
  "plomeria",
  "electricidad",
  "cerrajeria",
  "pintura",
  "electrodomesticos",
  "muebles",
  "internet_tecnologia",
  "limpieza",
  "humedad_filtraciones",
  "danos_estructurales",
  "otro",
]);

const ticketUrgencia = z.enum(["baja", "media", "alta", "critica"]);

const ticketEstado = z.enum([
  "nuevo",
  "asignado",
  "en_proceso",
  "resuelto",
  "cerrado",
  "cancelado",
]);

const manitasEspecialidad = z.enum([
  "plomeria",
  "electricidad",
  "cerrajeria",
  "pintura",
  "limpieza",
  "general",
  "otro",
]);

const manitasEstado = z.enum(["disponible", "ocupado", "inactivo", "suspendido"]);

export const TicketFormSchema = z.object({
  propiedad_id: z.string().min(1, "Selecciona una propiedad"),
  inquilino_id: z.string().optional().nullable(),
  unidad: z.string().max(80).optional().nullable(),
  tipo: ticketTipo,
  urgencia: ticketUrgencia,
  titulo: z.string().min(3, "Título obligatorio").max(200),
  descripcion: z.string().min(10, "Descripción obligatoria").max(5000),
  fecha_reporte: z.string().min(1, "Fecha de reporte obligatoria"),
  fecha_estimada_solucion: z.string().optional().nullable(),
  observaciones_internas: z.string().max(2000).optional().nullable(),
});

export type TicketFormValues = z.infer<typeof TicketFormSchema>;

export const TicketStatusSchema = z
  .object({
    estado: ticketEstado,
    observacion: z.string().max(500).optional().nullable(),
    costo: z.coerce.number().positive("El costo debe ser mayor que 0").optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.estado === "resuelto" && (data.costo == null || Number.isNaN(data.costo))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica el costo de la reparación para marcar como resuelto",
        path: ["costo"],
      });
    }
  });

export type TicketStatusFormValues = z.infer<typeof TicketStatusSchema>;

export const AssignTicketSchema = z.object({
  manitas_id: z.string().min(1, "Selecciona un manitas"),
  fecha_atencion_estimada: z.string().optional().nullable(),
  observacion: z.string().max(500).optional().nullable(),
});

export type AssignTicketFormValues = z.infer<typeof AssignTicketSchema>;

export const TicketCommentSchema = z.object({
  contenido: z.string().min(1, "Escribe un comentario").max(2000),
});

export const TicketPresupuestoSchema = z.object({
  presupuesto: z.coerce.number().min(0).optional().nullable(),
  factura: z.coerce.number().min(0).optional().nullable(),
  presupuesto_notas: z.string().max(1000).optional().nullable(),
});

export const ManitasFormSchema = z.object({
  nombres: z.string().min(2, "Nombre obligatorio").max(80),
  apellidos: z.string().min(2, "Apellidos obligatorios").max(80),
  telefono: z.string().min(6, "Teléfono obligatorio").max(30),
  email: z.string().email("Email inválido"),
  especialidad: manitasEspecialidad,
  zona_cobertura: z.string().max(200).optional().nullable(),
  estado: manitasEstado,
  rating: z.coerce.number().min(0).max(5),
  hoja_vida: z.string().max(15000).optional().nullable(),
  disponibilidad_notas: z.string().max(500).optional().nullable(),
});

export type ManitasFormValues = z.infer<typeof ManitasFormSchema>;

export const ManitasTrabajoFormSchema = z.object({
  titulo: z.string().min(2, "Título obligatorio").max(200),
  descripcion: z.string().max(2000).optional().nullable(),
  propiedad_nombre: z.string().max(200).optional().nullable(),
  fecha: z.string().min(1, "Fecha obligatoria"),
});

export type ManitasTrabajoFormValues = z.infer<typeof ManitasTrabajoFormSchema>;
