"use client";

import { useEffect, useState } from "react";
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import type { InquilinoFormValues } from "@/shared/schemas/inquilino";
import type { Propiedad } from "@/modules/propiedades/types";
import { sortPropiedadesByTitulo } from "@/modules/propiedades/utils/sort";
import { INQUILINO_STATUSES } from "../../../constants";
import { inquilinosService } from "../../../services/inquilinos.service";
import { FormField, inputClassName, selectClassName } from "@/modules/propiedades/components/form/form-field";

export function StepPropiedad({
  register,
  errors,
  watch,
  setValue,
  propiedades,
  inquilinoId,
}: {
  register: UseFormRegister<InquilinoFormValues>;
  errors: FieldErrors<InquilinoFormValues>;
  watch: UseFormWatch<InquilinoFormValues>;
  setValue: UseFormSetValue<InquilinoFormValues>;
  propiedades: Propiedad[];
  inquilinoId?: string;
}) {
  const propiedadId = watch("propiedad_id");
  const prop = propiedades.find((p) => p.id === propiedadId);
  const activas = sortPropiedadesByTitulo(
    propiedades.filter((p) => p.estado !== "inactiva"),
  );
  const [unidades, setUnidades] = useState<{ id: string; nombre: string; disponible: boolean }[]>([]);

  useEffect(() => {
    if (!prop || prop.tipo_renta !== "habitaciones") {
      setUnidades([]);
      setValue("unidad_id", "");
      return;
    }
    void inquilinosService
      .getUnidades(prop.id, prop.habitaciones || 4, inquilinoId)
      .then(setUnidades);
  }, [prop, inquilinoId, setValue]);

  useEffect(() => {
    if (prop && !watch("canon_mensual")) {
      setValue("canon_mensual", prop.precio_mes);
    }
  }, [prop, setValue, watch]);

  return (
    <div className="space-y-5">
      <FormField label="Estado del inquilino" error={errors.status?.message} required>
        <select {...register("status")} className={selectClassName}>
          {INQUILINO_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Propiedad asociada" error={errors.propiedad_id?.message} hint="Solo propiedades activas">
        <select {...register("propiedad_id")} className={selectClassName}>
          <option value="">Sin asignar (candidato)</option>
          {activas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.titulo} — {p.ciudad} ({p.tipo_renta})
            </option>
          ))}
        </select>
      </FormField>

      {prop?.tipo_renta === "habitaciones" && (
        <FormField label="Habitación" error={errors.unidad_id?.message} hint="Solo habitaciones disponibles">
          <select {...register("unidad_id")} className={selectClassName}>
            <option value="">Seleccionar habitación</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id} disabled={!u.disponible}>
                {u.nombre}{!u.disponible ? " (ocupada)" : ""}
              </option>
            ))}
          </select>
        </FormField>
      )}

      {prop && prop.tipo_renta !== "habitaciones" && (
        <p className="text-sm text-brand-800 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2">
          Renta {prop.tipo_renta}: el inquilino se asocia a toda la propiedad.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Fecha estimada de ingreso" error={errors.fecha_ingreso?.message}>
          <input type="date" {...register("fecha_ingreso")} className={inputClassName} />
        </FormField>
        <FormField label="Fecha estimada de salida" error={errors.fecha_salida?.message}>
          <input type="date" {...register("fecha_salida")} className={inputClassName} />
        </FormField>
        <FormField label="Canon mensual (€)" error={errors.canon_mensual?.message}>
          <input type="number" min={0} {...register("canon_mensual", { valueAsNumber: true })} className={inputClassName} />
        </FormField>
        <FormField label="Depósito / fianza (€)" error={errors.deposito?.message}>
          <input type="number" min={0} {...register("deposito", { valueAsNumber: true })} className={inputClassName} />
        </FormField>
        <FormField label="Responsable servicios" error={errors.responsable_servicios?.message}>
          <select {...register("responsable_servicios")} className={selectClassName}>
            <option value="inquilino">Inquilino</option>
            <option value="propietario">Propietario</option>
            <option value="compartido">Compartido</option>
          </select>
        </FormField>
        <FormField label="Nº ocupantes" error={errors.ocupantes?.message}>
          <input type="number" min={1} max={20} {...register("ocupantes", { valueAsNumber: true })} className={inputClassName} />
        </FormField>
      </div>
    </div>
  );
}
