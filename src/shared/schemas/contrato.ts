import { z } from "zod";

export const ContratoSchema = z.object({
  propiedad_id: z.string().uuid(),
  inquilino_id: z.string().uuid(),
  fecha_inicio: z.string().datetime(),
  fecha_fin: z.string().datetime(),
  renta_mensual: z.number().positive(),
  dia_cobro: z.number().int().min(1).max(31).default(1),
  fianza: z.number().min(0),
  clausulas_adicionales: z.string().max(5000).optional(),
});

export type ContratoForm = z.infer<typeof ContratoSchema>;
