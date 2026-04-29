import { z } from "zod";

export const DocumentoTipoSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
});

export const MetodoPagoSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  activo: z.boolean(),
});

export const TipoContratoSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  ley: z.string(),
});

export const IndiceActualizacionSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  url: z.string(),
});

export const ModuloFiscalSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
});

export const PaisSchema = z.object({
  codigo: z.enum(["ES", "CO"]),
  nombre: z.string(),
  moneda_codigo: z.string().length(3),
  moneda_simbolo: z.string(),
  locale: z.string(),
  telefono_regex: z.string(),
  telefono_placeholder: z.string(),
  documento_tipos: z.array(DocumentoTipoSchema),
  metodos_pago: z.array(MetodoPagoSchema),
  tipos_contrato: z.array(TipoContratoSchema),
  indices_actualizacion: z.array(IndiceActualizacionSchema),
  fiscal_modulos: z.array(ModuloFiscalSchema),
  iva_residencial: z.number().min(0).max(100),
  iva_comercial: z.number().min(0).max(100),
  fianza_meses_min: z.number().int().min(1),
  fianza_meses_max: z.number().int().min(1),
  activo: z.boolean(),
  created_at: z.string(),
});

export type PaisData = z.infer<typeof PaisSchema>;
