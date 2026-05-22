"use client";

import type { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import type { PropiedadFormValues } from "@/shared/schemas/propiedad";
import { TIPOS_RENTA } from "../../../constants";
import type { TipoRenta } from "../../../types";
import { FormField, inputClassName } from "../form-field";

interface StepTipoRentaProps {
  register: UseFormRegister<PropiedadFormValues>;
  errors: FieldErrors<PropiedadFormValues>;
  watch: UseFormWatch<PropiedadFormValues>;
}

function ConditionalFields({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-gradient-to-b from-gray-50/80 to-white p-4 sm:p-5 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      {children}
    </div>
  );
}

export function StepTipoRenta({ register, errors, watch }: StepTipoRentaProps) {
  const tipoRenta = watch("tipo_renta") as TipoRenta;

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-medium text-gray-800 mb-3">
          Modelo de alquiler <span className="text-red-500">*</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIPOS_RENTA.map((tipo) => (
            <label
              key={tipo.value}
              className={`relative flex cursor-pointer rounded-xl border p-4 sm:p-5 transition-all ${
                tipoRenta === tipo.value
                  ? "border-brand-500 bg-brand-50/80 ring-2 ring-brand-500/15 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <input
                type="radio"
                value={tipo.value}
                {...register("tipo_renta")}
                className="sr-only"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">{tipo.label}</p>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{tipo.description}</p>
              </div>
            </label>
          ))}
        </div>
        {errors.tipo_renta ? (
          <p className="text-xs text-red-600 font-medium mt-2" role="alert">
            {errors.tipo_renta.message}
          </p>
        ) : null}
      </fieldset>

      {tipoRenta === "tradicional" && (
        <ConditionalFields title="Vivienda en alquiler completo">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Habitaciones" error={errors.habitaciones?.message} required>
              <input
                type="number"
                min={0}
                max={20}
                {...register("habitaciones", { valueAsNumber: true })}
                className={inputClassName}
              />
            </FormField>
            <FormField label="Baños" error={errors.banos?.message} required>
              <input
                type="number"
                min={1}
                max={10}
                {...register("banos", { valueAsNumber: true })}
                className={inputClassName}
              />
            </FormField>
            <div className="col-span-2">
              <FormField label="Metros cuadrados" error={errors.metros_cuadrados?.message} hint="Opcional">
                <input
                  type="number"
                  min={1}
                  {...register("metros_cuadrados", { valueAsNumber: true })}
                  className={inputClassName}
                  placeholder="Ej: 85"
                />
              </FormField>
            </div>
          </div>
        </ConditionalFields>
      )}

      {tipoRenta === "habitaciones" && (
        <ConditionalFields title="Alquiler por habitaciones">
          <FormField
            label="Habitaciones en alquiler"
            error={errors.habitaciones?.message}
            required
            hint="Número de habitaciones que ofreces individualmente"
          >
            <input
              type="number"
              min={1}
              max={20}
              {...register("habitaciones", { valueAsNumber: true })}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Baños compartidos" error={errors.banos?.message}>
            <input
              type="number"
              min={1}
              max={10}
              {...register("banos", { valueAsNumber: true })}
              className={inputClassName}
            />
          </FormField>
        </ConditionalFields>
      )}

      {tipoRenta === "temporal" && (
        <ConditionalFields title="Estancia temporal">
          <FormField
            label="Estancia mínima (días)"
            error={errors.duracion_minima_dias?.message}
            required
          >
            <input
              type="number"
              min={1}
              max={365}
              {...register("duracion_minima_dias", { valueAsNumber: true })}
              className={inputClassName}
              placeholder="Ej: 7"
            />
          </FormField>
          <FormField label="Metros cuadrados" error={errors.metros_cuadrados?.message}>
            <input
              type="number"
              min={1}
              {...register("metros_cuadrados", { valueAsNumber: true })}
              className={inputClassName}
              placeholder="Ej: 45"
            />
          </FormField>
        </ConditionalFields>
      )}

      {tipoRenta === "comercial" && (
        <ConditionalFields title="Local u oficina">
          <FormField
            label="Metros cuadrados"
            error={errors.metros_cuadrados?.message}
            required
          >
            <input
              type="number"
              min={1}
              {...register("metros_cuadrados", { valueAsNumber: true })}
              className={inputClassName}
              placeholder="Ej: 120"
            />
          </FormField>
          <FormField label="Baños / aseos" error={errors.banos?.message}>
            <input
              type="number"
              min={0}
              {...register("banos", { valueAsNumber: true })}
              className={inputClassName}
            />
          </FormField>
        </ConditionalFields>
      )}
    </div>
  );
}
