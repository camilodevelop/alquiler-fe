"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { InquilinoFormValues } from "@/shared/schemas/inquilino";
import { FormField, inputClassName, textareaClassName } from "@/modules/propiedades/components/form/form-field";

export function StepReferencias({
  register,
  errors,
}: {
  register: UseFormRegister<InquilinoFormValues>;
  errors: FieldErrors<InquilinoFormValues>;
}) {
  const e = errors.referencias;
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">Referencia personal</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Nombre" error={e?.nombre_personal?.message}>
            <input {...register("referencias.nombre_personal")} className={inputClassName} />
          </FormField>
          <FormField label="Teléfono" error={e?.telefono_personal?.message}>
            <input {...register("referencias.telefono_personal")} className={inputClassName} />
          </FormField>
          <FormField label="Relación" error={e?.relacion?.message}>
            <input {...register("referencias.relacion")} className={inputClassName} />
          </FormField>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">Arrendador anterior</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Nombre" error={e?.nombre_arrendador?.message}>
            <input {...register("referencias.nombre_arrendador")} className={inputClassName} />
          </FormField>
          <FormField label="Teléfono" error={e?.telefono_arrendador?.message}>
            <input {...register("referencias.telefono_arrendador")} className={inputClassName} />
          </FormField>
        </div>
        <FormField label="Comentario" error={e?.comentario?.message}>
          <textarea {...register("referencias.comentario")} rows={3} className={textareaClassName} />
        </FormField>
      </div>
    </div>
  );
}
