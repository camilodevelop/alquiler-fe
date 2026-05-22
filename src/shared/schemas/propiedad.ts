import { z } from "zod";

export const TipoRentaSchema = z.enum(["tradicional", "habitaciones", "temporal", "comercial"]);
export const TipoPropiedadSchema = z.enum([
  "apartamento",
  "casa",
  "apartaestudio",
  "habitacion",
  "local",
  "oficina",
  "bodega",
  "finca",
  "garaje",
  "deposito",
]);
export const EstadoPropiedadSchema = z.enum([
  "disponible",
  "alquilada",
  "mantenimiento",
  "inactiva",
]);

const emptyToUndefined = (val: unknown) => {
  if (val === "" || val === undefined || val === null) return undefined;
  if (typeof val === "number" && Number.isNaN(val)) return undefined;
  return val;
};

const optionalPositiveInt = z.preprocess(
  emptyToUndefined,
  z.number().int().min(0).optional(),
);
const optionalPositiveNumber = z.preprocess(
  emptyToUndefined,
  z.number().positive().optional(),
);
const optionalDuracionDias = z.preprocess(
  emptyToUndefined,
  z.number().int().min(1).max(365).optional(),
);

/** Reglas condicionales según tipo de renta (reutilizado en paso 2 y formulario completo) */
function refineByTipoRenta(
  data: {
    tipo_renta: z.infer<typeof TipoRentaSchema>;
    habitaciones?: number;
    banos?: number;
    metros_cuadrados?: number;
    duracion_minima_dias?: number;
  },
  ctx: z.RefinementCtx,
) {
  if (data.tipo_renta === "tradicional") {
    if (data.habitaciones === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica el número de habitaciones",
        path: ["habitaciones"],
      });
    }
    if (data.banos === undefined || data.banos < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica al menos 1 baño",
        path: ["banos"],
      });
    }
  }

  if (data.tipo_renta === "habitaciones") {
    if (data.habitaciones === undefined || data.habitaciones < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica cuántas habitaciones se alquilan",
        path: ["habitaciones"],
      });
    }
  }

  if (data.tipo_renta === "temporal") {
    if (!data.duracion_minima_dias) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica la estancia mínima en días",
        path: ["duracion_minima_dias"],
      });
    }
  }

  if (data.tipo_renta === "comercial") {
    if (!data.metros_cuadrados) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Los inmuebles comerciales requieren metros cuadrados",
        path: ["metros_cuadrados"],
      });
    }
  }
}

export const PropiedadStep1Schema = z.object({
  titulo: z.string().min(5, "Mínimo 5 caracteres").max(120),
  descripcion: z.string().max(2000).optional().or(z.literal("")),
  tipo_propiedad: TipoPropiedadSchema,
});

export const PropiedadStep2Schema = z
  .object({
    tipo_renta: TipoRentaSchema,
    habitaciones: optionalPositiveInt,
    banos: optionalPositiveInt,
    metros_cuadrados: optionalPositiveNumber,
    duracion_minima_dias: optionalDuracionDias,
  })
  .superRefine(refineByTipoRenta);

export const PropiedadStep3Schema = z.object({
  direccion: z.string().min(5, "Indica la dirección completa"),
  ciudad: z.string().min(2, "Indica la ciudad"),
  codigo_postal: z
    .string()
    .min(4, "Código postal inválido")
    .max(10, "Código postal inválido"),
});

export const PropiedadStep4Schema = z.object({
  precio_mes: z.coerce.number().positive("El precio debe ser mayor que 0"),
  estado: EstadoPropiedadSchema,
});

export const PropiedadFormSchema = z
  .object({
    titulo: z.string().min(5, "Mínimo 5 caracteres").max(120),
    descripcion: z.string().max(2000).optional().or(z.literal("")),
    tipo_propiedad: TipoPropiedadSchema,
    tipo_renta: TipoRentaSchema,
    direccion: z.string().min(5, "Indica la dirección completa"),
    ciudad: z.string().min(2, "Indica la ciudad"),
    codigo_postal: z
      .string()
      .min(4, "Código postal inválido")
      .max(10, "Código postal inválido"),
    precio_mes: z.coerce.number().positive("El precio debe ser mayor que 0"),
    estado: EstadoPropiedadSchema,
    habitaciones: optionalPositiveInt,
    banos: optionalPositiveInt,
    metros_cuadrados: optionalPositiveNumber,
    duracion_minima_dias: optionalDuracionDias,
  })
  .superRefine(refineByTipoRenta);

export type PropiedadFormValues = z.infer<typeof PropiedadFormSchema>;

// Legacy alias
export const PropiedadSchema = PropiedadFormSchema;
export type PropiedadForm = PropiedadFormValues;
