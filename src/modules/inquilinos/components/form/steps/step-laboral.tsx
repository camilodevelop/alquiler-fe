"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { InquilinoFormValues } from "@/shared/schemas/inquilino";
import { TIPOS_CONTRATO_LABORAL } from "../../../constants";
import { FormField, inputClassName, selectClassName, textareaClassName } from "@/modules/propiedades/components/form/form-field";

export function StepLaboral({
  register,
  errors,
}: {
  register: UseFormRegister<InquilinoFormValues>;
  errors: FieldErrors<InquilinoFormValues>;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Ocupación" error={errors.ocupacion?.message}>
          <input {...register("ocupacion")} className={inputClassName} />
        </FormField>
        <FormField label="Empresa" error={errors.empresa?.message}>
          <input {...register("empresa")} className={inputClassName} />
        </FormField>
        <FormField label="Tipo de contrato laboral" error={errors.tipo_contrato_laboral?.message}>
          <select {...register("tipo_contrato_laboral")} className={selectClassName}>
            {TIPOS_CONTRATO_LABORAL.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Ingresos mensuales (€)" error={errors.ingresos_mensuales?.message}>
          <input type="number" min={0} {...register("ingresos_mensuales", { valueAsNumber: true })} className={inputClassName} />
        </FormField>
        <FormField label="Antigüedad laboral" error={errors.antiguedad_laboral?.message}>
          <input {...register("antiguedad_laboral")} placeholder="Ej: 3 años" className={inputClassName} />
        </FormField>
        <FormField label="Referencia laboral" error={errors.referencia_laboral?.message}>
          <input {...register("referencia_laboral")} className={inputClassName} />
        </FormField>
        <FormField label="Tel. referencia laboral" error={errors.telefono_referencia_laboral?.message}>
          <input {...register("telefono_referencia_laboral")} className={inputClassName} />
        </FormField>
      </div>
      <FormField label="Observaciones financieras" error={errors.observaciones_financieras?.message}>
        <textarea {...register("observaciones_financieras")} rows={3} className={textareaClassName} />
      </FormField>
    </div>
  );
}
