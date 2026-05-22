"use client";

import type { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import type { PropiedadFormValues } from "@/shared/schemas/propiedad";
import { TIPOS_PROPIEDAD } from "../../../constants";
import type { TipoPropiedad } from "../../../types";
import { FormField, inputClassName, textareaClassName } from "../form-field";

interface StepBasicaProps {
  register: UseFormRegister<PropiedadFormValues>;
  errors: FieldErrors<PropiedadFormValues>;
  watch: UseFormWatch<PropiedadFormValues>;
}

export function StepBasica({ register, errors, watch }: StepBasicaProps) {
  const tipoPropiedad = watch("tipo_propiedad") as TipoPropiedad;

  return (
    <div className="space-y-6">
      <FormField label="Título de la propiedad" error={errors.titulo?.message} required>
        <input
          {...register("titulo")}
          placeholder="Ej: Piso luminoso en el centro"
          className={inputClassName}
          autoFocus
        />
      </FormField>

      <FormField label="Descripción" error={errors.descripcion?.message} hint="Opcional — visible en la ficha del inmueble">
        <textarea
          {...register("descripcion")}
          rows={4}
          placeholder="Describe la propiedad, servicios incluidos, normas de convivencia..."
          className={textareaClassName}
        />
      </FormField>

      <fieldset>
        <legend className="text-sm font-medium text-gray-800 mb-3">
          Tipo de inmueble <span className="text-red-500">*</span>
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {TIPOS_PROPIEDAD.map((tipo) => (
            <label
              key={tipo.value}
              className={`relative flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-center transition-all ${
                tipoPropiedad === tipo.value
                  ? "border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20 shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                value={tipo.value}
                {...register("tipo_propiedad")}
                className="sr-only"
              />
              <span className="text-sm font-medium leading-tight">{tipo.label}</span>
            </label>
          ))}
        </div>
        {errors.tipo_propiedad ? (
          <p className="text-xs text-red-600 font-medium mt-2" role="alert">
            {errors.tipo_propiedad.message}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}
