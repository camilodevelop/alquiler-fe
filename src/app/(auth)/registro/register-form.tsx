"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Building2, Briefcase, KeyRound, Wrench } from "lucide-react";
import { RegisterSchema, type RegisterForm } from "@/shared";
import { createClient } from "@/lib/supabase/client";
import { signUpAdminAction } from "@/app/actions/auth";

const ROLES = [
  {
    value: "propietario",
    label: "Propietario",
    description: "Gestiono mis propias viviendas",
    icon: Building2,
    color: "text-brand-600",
    bg: "bg-brand-50",
    activeBorder: "border-brand-500",
    activeBg: "bg-brand-50",
  },
  {
    value: "gestor",
    label: "Gestor",
    description: "Administro viviendas de terceros",
    icon: Briefcase,
    color: "text-violet-600",
    bg: "bg-violet-50",
    activeBorder: "border-violet-500",
    activeBg: "bg-violet-50",
  },
  {
    value: "inquilino",
    label: "Inquilino",
    description: "Busco o tengo un alquiler",
    icon: KeyRound,
    color: "text-amber-600",
    bg: "bg-amber-50",
    activeBorder: "border-amber-500",
    activeBg: "bg-amber-50",
  },
  {
    value: "manitas",
    label: "Manitas",
    description: "Realizo trabajos de mantenimiento",
    icon: Wrench,
    color: "text-orange-600",
    bg: "bg-orange-50",
    activeBorder: "border-orange-500",
    activeBg: "bg-orange-50",
  },
] as const;

export function RegisterForm() {
  const supabase = createClient();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { rol: "propietario", pais_codigo: "ES" },
  });

  const selectedRol = watch("rol");

  async function onSubmit(data: RegisterForm) {
    setServerError(null);

    const result = await signUpAdminAction(
      data.email,
      data.password,
      data.rol,
      data.nombre,
      data.apellidos,
      data.telefono,
      data.pais_codigo,
    );

    if (result.error) {
      setServerError(result.error);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      setServerError("Cuenta creada, pero no se pudo iniciar sesión. Usa /login.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Nombre y apellidos */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            {...register("nombre")}
            id="nombre"
            type="text"
            placeholder="Juan"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
        </div>
        <div>
          <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
          <input
            {...register("apellidos")}
            id="apellidos"
            type="text"
            placeholder="García López"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {errors.apellidos && <p className="mt-1 text-xs text-red-600">{errors.apellidos.message}</p>}
        </div>
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
        <input
          {...register("telefono")}
          id="telefono"
          type="tel"
          autoComplete="tel"
          placeholder="612 345 678"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {errors.telefono && <p className="mt-1 text-xs text-red-600">{errors.telefono.message}</p>}
      </div>

      {/* Rol */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Soy...</label>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((rol) => {
            const Icon = rol.icon;
            const active = selectedRol === rol.value;
            return (
              <label
                key={rol.value}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none
                  ${active
                    ? `${rol.activeBorder} ${rol.activeBg} shadow-md scale-[1.03]`
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm hover:scale-[1.01]"
                  }`}
              >
                <input
                  type="radio"
                  value={rol.value}
                  checked={active}
                  onChange={() => setValue("rol", rol.value)}
                  className="sr-only"
                />
                {/* Checkmark */}
                {active && (
                  <span className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center ${rol.color} bg-white shadow-sm border ${rol.activeBorder}`}>
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                {/* Icono */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active ? `${rol.bg} ${rol.color}` : "bg-gray-100 text-gray-400"}`}>
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-semibold transition-colors ${active ? "text-gray-900" : "text-gray-600"}`}>
                    {rol.label}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{rol.description}</p>
                </div>
              </label>
            );
          })}
        </div>
        {errors.rol && <p className="mt-1 text-xs text-red-600">{errors.rol.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          {...register("email")}
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      {/* Contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <input
          {...register("password")}
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmar_password" className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar contraseña
        </label>
        <input
          {...register("confirmar_password")}
          id="confirmar_password"
          type="password"
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {errors.confirmar_password && (
          <p className="mt-1 text-xs text-red-600">{errors.confirmar_password.message}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta gratis"}
      </button>

    </form>
  );
}
