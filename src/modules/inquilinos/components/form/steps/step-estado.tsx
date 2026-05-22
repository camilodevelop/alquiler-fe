"use client";

import Link from "next/link";
import type { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import type { InquilinoFormValues } from "@/shared/schemas/inquilino";
import { INQUILINO_STATUSES } from "../../../constants";
import { FormField, selectClassName } from "@/modules/propiedades/components/form/form-field";
import { FileText } from "lucide-react";

/** Estados iniciales en alta (sin activo). */
const STATUSES_MANUAL = INQUILINO_STATUSES.filter((s) => s.value !== "activo");

/** Transiciones permitidas cuando ya está activo por contrato. */
const STATUSES_DESDE_ACTIVO: InquilinoFormValues["status"][] = [
  "activo",
  "moroso",
  "finalizado",
  "inactivo",
];

export function StepEstado({
  register,
  errors,
  watch,
  hasContratoAsignado,
}: {
  register: UseFormRegister<InquilinoFormValues>;
  errors: FieldErrors<InquilinoFormValues>;
  watch: UseFormWatch<InquilinoFormValues>;
  hasContratoAsignado?: boolean;
}) {
  const currentStatus = watch("status");
  const isActivoPorContrato = currentStatus === "activo";

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-brand-900">
        <p className="font-medium flex items-center gap-2">
          <FileText size={16} className="shrink-0" />
          Vinculación al inmueble
        </p>
        <p className="mt-1.5 text-brand-800/90 leading-relaxed">
          No se asigna una propiedad desde el ficha del inquilino. Crea y activa un{" "}
          <Link href="/dashboard/contratos/nuevo" className="font-semibold underline hover:text-brand-950">
            contrato de arrendamiento
          </Link>{" "}
          para asociar inquilino e inmueble.
        </p>
      </div>

      {hasContratoAsignado && isActivoPorContrato && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Este inquilino está activo y vinculado a un inmueble mediante un contrato. Los datos de
          arriendo se gestionan en el contrato.
        </p>
      )}

      <FormField label="Estado del inquilino" error={errors.status?.message} required>
        {isActivoPorContrato ? (
          <div className="space-y-2">
            <select {...register("status")} className={selectClassName} aria-describedby="estado-activo-hint">
              {STATUSES_DESDE_ACTIVO.map((value) => {
                const label = INQUILINO_STATUSES.find((s) => s.value === value)?.label ?? value;
                return (
                  <option key={value} value={value}>
                    {value === "activo" ? `${label} (vía contrato)` : label}
                  </option>
                );
              })}
            </select>
            <p id="estado-activo-hint" className="text-xs text-gray-500">
              La vinculación al inmueble se gestiona en Contratos. No puedes volver a candidato sin
              finalizar el arriendo.
            </p>
          </div>
        ) : (
          <select {...register("status")} className={selectClassName}>
            {STATUSES_MANUAL.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}
      </FormField>
    </div>
  );
}
