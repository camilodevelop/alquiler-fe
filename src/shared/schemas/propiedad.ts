import { z } from "zod";

export const PropiedadSchema = z.object({
  titulo: z.string().min(5, "Mínimo 5 caracteres").max(100),
  descripcion: z.string().min(10).max(2000).optional(),
  direccion: z.string().min(5),
  ciudad: z.string().min(2),
  codigo_postal: z.string().regex(/^\d{5}$/, "Código postal inválido"),
  precio_mes: z.number().positive("El precio debe ser positivo"),
  habitaciones: z.number().int().min(0).max(20),
  banos: z.number().int().min(1).max(10),
  metros_cuadrados: z.number().positive().optional(),
  tipo_alquiler: z.enum(["tradicional", "habitaciones", "corta_estancia", "flipping"]),
  estado: z.enum(["disponible", "alquilada", "mantenimiento", "inactiva"]),
});

export type PropiedadForm = z.infer<typeof PropiedadSchema>;
