import { z } from "zod";

export const ReportTabIdSchema = z.enum([
  "general",
  "propiedades",
  "inquilinos",
  "contratos",
  "mantenimiento",
  "contabilidad",
]);

export const ReportFiltersSchema = z.object({
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
  propiedad_id: z.string().optional(),
  estado: z.string().optional(),
  tipo_renta: z.string().optional(),
  inquilino_id: z.string().optional(),
  manitas_id: z.string().optional(),
  estado_manitas: z.string().optional(),
});

export type ReportTabId = z.infer<typeof ReportTabIdSchema>;
export type ReportFiltersInput = z.infer<typeof ReportFiltersSchema>;
