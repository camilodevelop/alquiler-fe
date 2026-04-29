"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send } from "lucide-react";
import { ResetPasswordSchema, type ResetPasswordForm } from "@/shared";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const supabase = createClient();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(ResetPasswordSchema) });

  async function onSubmit(data: ResetPasswordForm) {
    setServerError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${location.origin}/auth/callback?next=/nueva-password`,
    });

    if (error) {
      setServerError("Error al enviar el email. Inténtalo de nuevo.");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-brand-50 border border-brand-200 p-6 text-center space-y-3">
        <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
          <Send size={22} className="text-brand-600" />
        </div>
        <p className="text-sm font-semibold text-gray-900">Revisa tu correo</p>
        <p className="text-sm text-gray-500">
          Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            {...register("email")}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            className={`w-full rounded-xl border pl-11 pr-4 py-3 text-sm placeholder-gray-400 outline-none transition-all
              focus:ring-2 focus:ring-brand-500 focus:border-transparent
              ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
          />
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      {serverError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span>⚠</span> {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md hover:-translate-y-0.5"
      >
        {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
      </button>
    </form>
  );
}
