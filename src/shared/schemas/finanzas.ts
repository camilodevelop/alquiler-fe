import { z } from "zod";

const movimientoTipo = z.enum(["ingreso", "gasto"]);
const movimientoEstado = z.enum(["pendiente", "pagado", "vencido", "cancelado", "parcial"]);
const metodoPago = z.enum([
  "transferencia",
  "efectivo",
  "tarjeta",
  "bizum",
  "domiciliacion",
  "otro",
]);

const categoriasIngreso = z.enum([
  "pago_arriendo",
  "deposito_fianza",
  "administracion_comunidad",
  "servicios_publicos",
  "penalizacion_mora",
  "otro_ingreso",
]);

const categoriasGasto = z.enum([
  "reparacion",
  "mantenimiento",
  "servicios_publicos",
  "administracion_comunidad",
  "impuestos",
  "seguro",
  "limpieza",
  "comision",
  "publicidad",
  "reforma",
  "otro_gasto",
]);

const baseMovimientoFields = {
  propiedad_id: z.string().min(1, "Selecciona una propiedad"),
  concepto: z.string().min(2, "Concepto obligatorio").max(300),
  valor: z.coerce.number().positive("El valor debe ser mayor que cero"),
  valor_esperado: z.coerce.number().positive().optional().nullable(),
  estado: movimientoEstado,
  metodo_pago: metodoPago.optional().nullable(),
  fecha_movimiento: z.string().min(1, "Fecha obligatoria"),
  fecha_vencimiento: z.string().optional().nullable(),
  fecha_pago: z.string().optional().nullable(),
  mes_correspondiente: z.string().optional().nullable(),
  observaciones: z.string().max(2000).optional().nullable(),
  contrato_id: z.string().optional().nullable(),
  inquilino_id: z.string().optional().nullable(),
  ticket_id: z.string().optional().nullable(),
  manitas_id: z.string().optional().nullable(),
};

function refinePagado(data: {
  estado: string;
  fecha_pago?: string | null;
  tipo?: string;
  valor_esperado?: number | null;
  valor: number;
}, ctx: z.RefinementCtx) {
  if (data.estado === "pagado" && !data.fecha_pago?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Indica la fecha de pago",
      path: ["fecha_pago"],
    });
  }
  if (
    data.estado === "parcial" &&
    data.valor_esperado != null &&
    data.valor >= data.valor_esperado
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El valor pagado debe ser menor al esperado en pagos parciales",
      path: ["valor"],
    });
  }
}

export const IngresoFormSchema = z
  .object({
    ...baseMovimientoFields,
    tipo: z.literal("ingreso"),
    categoria: categoriasIngreso,
  })
  .superRefine(refinePagado);

export const GastoFormSchema = z
  .object({
    ...baseMovimientoFields,
    tipo: z.literal("gasto"),
    categoria: categoriasGasto,
  })
  .superRefine(refinePagado);

export type IngresoFormValues = z.infer<typeof IngresoFormSchema>;
export type GastoFormValues = z.infer<typeof GastoFormSchema>;
