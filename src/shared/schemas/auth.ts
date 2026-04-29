import { z } from "zod";

export const CodigoPaisSchema = z.enum(["ES"]);

const telefonoPorPais: Record<string, { regex: RegExp; mensaje: string }> = {
  ES: {
    regex: /^[6-9]\d{8}$/,
    mensaje: "Teléfono español inválido (9 dígitos, empieza por 6-9)",
  },
};

export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export const RegisterSchema = z
  .object({
    nombre: z.string().min(2, "Mínimo 2 caracteres"),
    apellidos: z.string().min(2, "Mínimo 2 caracteres"),
    pais_codigo: CodigoPaisSchema,
    telefono: z.string().min(1, "Teléfono requerido"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmar_password: z.string(),
    rol: z.enum(["propietario", "gestor", "inquilino", "manitas"]),
  })
  .refine((d) => d.password === d.confirmar_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_password"],
  })
  .refine(
    (d) => {
      const cfg = telefonoPorPais[d.pais_codigo];
      return cfg ? cfg.regex.test(d.telefono) : true;
    },
    (d) => ({
      message: telefonoPorPais[d.pais_codigo]?.mensaje ?? "Teléfono inválido",
      path: ["telefono"],
    })
  );

export const ResetPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const NewPasswordSchema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmar_password: z.string(),
  })
  .refine((d) => d.password === d.confirmar_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_password"],
  });

export type LoginForm = z.infer<typeof LoginSchema>;
export type RegisterForm = z.infer<typeof RegisterSchema>;
export type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>;
export type NewPasswordForm = z.infer<typeof NewPasswordSchema>;
export type CodigoPaisForm = z.infer<typeof CodigoPaisSchema>;
