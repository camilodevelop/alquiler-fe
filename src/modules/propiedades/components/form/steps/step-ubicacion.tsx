"use client";

import { MapPin } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { PropiedadFormValues } from "@/shared/schemas/propiedad";
import { FormField, inputClassName } from "../form-field";

interface StepUbicacionProps {
  register: UseFormRegister<PropiedadFormValues>;
  errors: FieldErrors<PropiedadFormValues>;
}

export function StepUbicacion({ register, errors }: StepUbicacionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm text-brand-900">
        <MapPin size={18} className="shrink-0 mt-0.5 text-brand-600" />
        <p className="leading-relaxed">
          La ciudad se usa para filtrar en tu listado. La dirección completa aparecerá en contratos
          y comunicaciones con inquilinos.
        </p>
      </div>

      <FormField label="Dirección" error={errors.direccion?.message} required>
        <input
          {...register("direccion")}
          placeholder="Calle, número, piso, puerta..."
          className={inputClassName}
          autoComplete="street-address"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Ciudad" error={errors.ciudad?.message} required>
          <input
            {...register("ciudad")}
            placeholder="Madrid"
            className={inputClassName}
            autoComplete="address-level2"
          />
        </FormField>
        <FormField label="Código postal" error={errors.codigo_postal?.message} required>
          <input
            {...register("codigo_postal")}
            placeholder="28001"
            className={inputClassName}
            autoComplete="postal-code"
          />
        </FormField>
      </div>
    </div>
  );
}
