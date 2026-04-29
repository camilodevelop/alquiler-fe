"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { NewPasswordSchema, type NewPasswordForm } from "@/shared";
import { createClient } from "@/lib/supabase/client";

export function NuevaPasswordForm() {
  const supabase = createClient();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordForm>({ resolver: zodResolver(NewPasswordSchema) });

  async function onSubmit(data: NewPasswordForm) {
    setServerError(null);
    const { error } = await supabase.auth.updateUser({ password: data.password });

    if (error) {
      setServerError("No se pudo actualizar la contraseña. El enlace puede haber expirado.");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 size={48} className="text-brand-600" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">¡Contraseña actualizada!</p>
          <p className="text-sm text-gray-500 mt-1">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        </div>
        <a
          href="/login"
          className="inline-block w-full text-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-all hover:shadow-md"
        >
          Ir al inicio de sesión
        </a>
      </div>
    );
  }

  const inputCls = (hasError: boolean) =>
    `w-full rounded-xl border pl-11 pr-11 py-3 text-sm placeholder-gray-400 outline-none transition-all
    focus:ring-2 focus:ring-brand-500 focus:border-transparent
    ${hasError ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Nueva contraseña
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            {...register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className={inputCls(!!errors.password)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmar_password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Confirmar contraseña
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            {...register("confirmar_password")}
            id="confirmar_password"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repite tu nueva contraseña"
            className={inputCls(!!errors.confirmar_password)}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmar_password && (
          <p className="mt-1 text-xs text-red-600">{errors.confirmar_password.message}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span>⚠</span> {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md hover:-translate-y-0.5 mt-2"
      >
        {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}
