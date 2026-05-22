"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Save } from "lucide-react";
import { Button, Card, CardContent, CardHeader } from "@/components/ui";
import { ManitasFormSchema, type ManitasFormValues } from "@/shared/schemas/mantenimiento";
import {
  MANITAS_ESPECIALIDADES_OPTIONS,
  MANITAS_ESTADOS_OPTIONS,
} from "../../constants";
import type { Manitas } from "../../types";
import { mantenimientoService } from "../../services/mantenimiento.service";
import { ManitasAvatar } from "./manitas-avatar";
import { ManitasRatingInput } from "./manitas-rating";

const fieldClass =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400";

export function ManitasForm({
  mode,
  manitasId,
  initial,
}: {
  mode: "create" | "edit";
  manitasId?: string;
  initial?: Manitas | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(initial?.foto_url ?? null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const defaultValues: ManitasFormValues = initial
    ? {
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
      }
    : {
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
      };

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<ManitasFormValues>({
    resolver: zodResolver(ManitasFormSchema),
    defaultValues,
  });

  const watchNames = watch(["nombres", "apellidos"]);

  const onFile = (file: File | null) => {
    if (!file) return;
    setPendingFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setSubmitError(null);

    if (mode === "create") {
      const { data, error } = await mantenimientoService.createManitas(values);
      if (error || !data) {
        setSubmitError(error ?? "Error al crear");
        setLoading(false);
        return;
      }
      if (pendingFile) {
        const fd = new FormData();
        fd.append("file", pendingFile);
        await mantenimientoService.uploadFoto(data.id, fd);
      }
      router.push(`/dashboard/mantenimiento/maestros/${data.id}`);
    } else if (manitasId) {
      const { error } = await mantenimientoService.updateManitas(manitasId, values);
      if (error) {
        setSubmitError(error);
        setLoading(false);
        return;
      }
      if (pendingFile) {
        const fd = new FormData();
        fd.append("file", pendingFile);
        await mantenimientoService.uploadFoto(manitasId, fd);
      }
      router.push(`/dashboard/mantenimiento/maestros/${manitasId}`);
    }
    setLoading(false);
  });

  const avatarManitas = {
    nombres: watchNames[0] || "M",
    apellidos: watchNames[1] || "",
    foto_url: fotoPreview,
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-4xl">
      <Card>
        <CardHeader className="px-5 py-4 border-gray-100">
          <h2 className="font-semibold text-gray-900">Foto y puntuación</h2>
        </CardHeader>
        <CardContent className="px-5 pb-6 flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex flex-col items-center gap-3">
            <ManitasAvatar manitas={avatarManitas} size="xl" />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            <Button type="button" variant="secondary" size="sm" className="gap-1" onClick={() => fileRef.current?.click()}>
              <Camera size={14} />
              {fotoPreview ? "Cambiar foto" : "Subir foto"}
            </Button>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-gray-700">Puntuación</label>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <ManitasRatingInput value={field.value} onChange={field.onChange} />
              )}
            />
            <p className="text-xs text-gray-500">Valoración interna basada en desempeño y feedback.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-5 py-4 border-gray-100">
          <h2 className="font-semibold text-gray-900">Datos de contacto</h2>
        </CardHeader>
        <CardContent className="px-5 pb-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nombres *</label>
            <input {...register("nombres")} className={`mt-1.5 ${fieldClass}`} />
            {errors.nombres && <p className="text-xs text-red-600 mt-1">{errors.nombres.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Apellidos *</label>
            <input {...register("apellidos")} className={`mt-1.5 ${fieldClass}`} />
            {errors.apellidos && <p className="text-xs text-red-600 mt-1">{errors.apellidos.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Teléfono *</label>
            <input {...register("telefono")} className={`mt-1.5 ${fieldClass}`} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email *</label>
            <input type="email" {...register("email")} className={`mt-1.5 ${fieldClass}`} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Especialidad</label>
            <select {...register("especialidad")} className={`mt-1.5 ${fieldClass}`}>
              {MANITAS_ESPECIALIDADES_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Estado</label>
            <select {...register("estado")} className={`mt-1.5 ${fieldClass}`}>
              {MANITAS_ESTADOS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Zona de cobertura</label>
            <input {...register("zona_cobertura")} className={`mt-1.5 ${fieldClass}`} placeholder="Ej. Madrid centro, M-30..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-5 py-4 border-gray-100">
          <h2 className="font-semibold text-gray-900">Hoja de vida</h2>
          <p className="text-xs text-gray-500 mt-0.5">Experiencia, certificaciones y referencias</p>
        </CardHeader>
        <CardContent className="px-5 pb-6">
          <textarea
            {...register("hoja_vida")}
            rows={10}
            placeholder="Describe la experiencia profesional, certificados, años de oficio, tipos de trabajos realizados..."
            className={`${fieldClass} resize-y min-h-[200px]`}
          />
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader className="px-5 py-4 border-gray-100">
          <h2 className="font-semibold text-gray-900">Disponibilidad</h2>
        </CardHeader>
        <CardContent className="px-5 pb-6">
          <textarea
            {...register("disponibilidad_notas")}
            rows={3}
            placeholder="Horarios, días preferidos, limitaciones..."
            className={fieldClass}
          />
        </CardContent>
      </Card>

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{submitError}</p>
      )}

      <div className="flex flex-wrap gap-3 pb-8">
        <Button type="submit" variant="primary" className="gap-2" disabled={loading}>
          <Save size={16} />
          {loading ? "Guardando..." : mode === "create" ? "Registrar manitas" : "Guardar perfil"}
        </Button>
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}
