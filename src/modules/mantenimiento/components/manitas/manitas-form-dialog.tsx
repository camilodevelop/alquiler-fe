"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ManitasFormSchema, type ManitasFormValues } from "@/shared/schemas/mantenimiento";
import { Button } from "@/components/ui";
import {
  MANITAS_ESPECIALIDADES_OPTIONS,
  MANITAS_ESTADOS_OPTIONS,
} from "../../constants";
import type { Manitas } from "../../types";
import { mantenimientoService } from "../../services/mantenimiento.service";

export function ManitasFormDialog({
  open,
  initial,
  onClose,
  onSuccess,
}: {
  open: boolean;
  initial?: Manitas | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ManitasFormValues>({
    resolver: zodResolver(ManitasFormSchema),
    defaultValues: {
      nombres: "",
      apellidos: "",
      telefono: "",
      email: "",
      especialidad: "general",
      zona_cobertura: "",
      estado: "disponible",
      disponibilidad_notas: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      reset({
        nombres: initial.nombres,
        apellidos: initial.apellidos,
        telefono: initial.telefono,
        email: initial.email,
        especialidad: initial.especialidad,
        zona_cobertura: initial.zona_cobertura ?? "",
        estado: initial.estado,
        rating: initial.rating,
        hoja_vida: initial.hoja_vida ?? "",
        disponibilidad_notas: initial.disponibilidad_notas ?? "",
      });
    } else {
      reset({
        nombres: "",
        apellidos: "",
        telefono: "",
        email: "",
        especialidad: "general",
        zona_cobertura: "",
        estado: "disponible",
        rating: 0,
        hoja_vida: "",
        disponibilidad_notas: "",
      });
    }
  }, [open, initial, reset]);

  if (!open) return null;

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);
    if (initial) {
      const { error: err } = await mantenimientoService.updateManitas(initial.id, values);
      if (err) setError(err);
      else {
        onSuccess();
        onClose();
      }
    } else {
      const { error: err } = await mantenimientoService.createManitas(values);
      if (err) setError(err);
      else {
        onSuccess();
        onClose();
      }
    }
    setLoading(false);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">
          {initial ? "Editar manitas" : "Nuevo manitas"}
        </h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Nombres</label>
              <input {...register("nombres")} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
              {errors.nombres && <p className="text-xs text-red-600">{errors.nombres.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Apellidos</label>
              <input {...register("apellidos")} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
              {errors.apellidos && <p className="text-xs text-red-600">{errors.apellidos.message}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Teléfono</label>
            <input {...register("telefono")} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input {...register("email")} type="email" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Especialidad</label>
              <select {...register("especialidad")} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                {MANITAS_ESPECIALIDADES_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Estado</label>
              <select {...register("estado")} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                {MANITAS_ESTADOS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Zona de cobertura</label>
            <input {...register("zona_cobertura")} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Disponibilidad / notas</label>
            <textarea {...register("disponibilidad_notas")} rows={2} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
