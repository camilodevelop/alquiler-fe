import { z } from "zod";

export const InquilinoSchema = z.object({
  nombre: z.string().min(2).max(100),
  apellidos: z.string().min(2).max(100),
  email: z.string().email(),
  telefono: z.string().regex(/^[+\d\s-]{9,15}$/, "Teléfono inválido"),
  dni_nie: z.string().regex(/^[0-9XYZ][0-9]{7}[A-Z]$/, "DNI/NIE inválido"),
});

export type InquilinoForm = z.infer<typeof InquilinoSchema>;
