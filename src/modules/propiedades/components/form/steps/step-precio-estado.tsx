"use client";

import type { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import type { PropiedadFormValues } from "@/shared/schemas/propiedad";
import { ESTADOS_PROPIEDAD, ESTADO_BADGE_VARIANT } from "../../../constants";
import type { EstadoPropiedad } from "../../../types";
import { FormField, inputClassName } from "../form-field";
import { Badge } from "@/components/ui";

interface StepPrecioEstadoProps {
  register: UseFormRegister<PropiedadFormValues>;
  errors: FieldErrors<PropiedadFormValues>;
  watch: UseFormWatch<PropiedadFormValues>;
}

export function StepPrecioEstado({ register, errors, watch }: StepPrecioEstadoProps) {
  const estado = watch("estado") as EstadoPropiedad;

  return (
    <div className="space-y-8">
      <FormField
        label="Precio mensual"
        error={errors.precio_mes?.message}
        required
        hint="Para renta temporal, indica el precio de referencia mensual"
      >
        <div className="relative max-w-xs">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
            €
          </span>
          <input
            type="number"
            min={1}
            step={1}
            {...register("precio_mes", { valueAsNumber: true })}
            className={`${inputClassName} pl-9 text-lg font-semibold tabular-nums`}
            placeholder="950"
          />
        </div>
      </FormField>

      <fieldset>
        <legend className="text-sm font-medium text-gray-800 mb-3">
          Estado del inmueble <span className="text-red-500">*</span>
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ESTADOS_PROPIEDAD.map((e) => (
            <label
              key={e.value}
              className={`relative flex flex-col items-center gap-2 cursor-pointer rounded-xl border px-3 py-4 text-center transition-all ${
                estado === e.value
                  ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                value={e.value}
                {...register("estado")}
                className="sr-only"
              />
              <Badge variant={ESTADO_BADGE_VARIANT[e.value]}>{e.label}</Badge>
            </label>
          ))}
        </div>
        {errors.estado ? (
          <p className="text-xs text-red-600 font-medium mt-2" role="alert">
            {errors.estado.message}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}
