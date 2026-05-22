"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Calendar,
  FileImage,
  Lock,
  Save,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader } from "@/components/ui";
import { TicketFormSchema, type TicketFormValues } from "@/shared/schemas/mantenimiento";
import type { Propiedad } from "@/modules/propiedades/types";
import { sortPropiedadesByTitulo } from "@/modules/propiedades/utils/sort";
import type { Inquilino } from "@/modules/inquilinos/types";
import {
  TICKET_TIPOS_OPTIONS,
  TICKET_URGENCIA_PILL_STYLES,
  TICKET_URGENCIAS_OPTIONS,
} from "../../constants";
import type { TicketMantenimiento, TicketUrgencia } from "../../types";
import { mantenimientoService } from "../../services/mantenimiento.service";

const fieldClass =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400";
const labelClass = "text-sm font-medium text-gray-700";

function FormSection({
  icon: Icon,
  title,
  description,
  children,
  variant = "default",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
  variant?: "default" | "muted";
}) {
  return (
    <Card
      className={
        variant === "muted"
          ? "border-dashed border-gray-200 bg-gray-50/40"
          : "border-gray-200/90 shadow-sm"
      }
    >
      <CardHeader className="px-5 sm:px-6 py-4 border-gray-100">
        <div className="flex gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              variant === "muted" ? "bg-gray-200/60 text-gray-500" : "bg-amber-50 text-amber-700"
            }`}
          >
            <Icon size={20} />
          </span>
          <div>
            <h2 className="font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 sm:px-6 pb-6 pt-0 space-y-4">{children}</CardContent>
    </Card>
  );
}

export function TicketForm({
  mode,
  ticketId,
  initialTicket,
  propiedades,
  inquilinos,
}: {
  mode: "create" | "edit";
  ticketId?: string;
  initialTicket?: TicketMantenimiento | null;
  propiedades: Propiedad[];
  inquilinos: Inquilino[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const defaultValues: TicketFormValues = initialTicket
    ? {
        propiedad_id: initialTicket.propiedad_id,
        inquilino_id: initialTicket.inquilino_id ?? "",
        unidad: initialTicket.unidad ?? "",
        tipo: initialTicket.tipo,
        urgencia: initialTicket.urgencia,
        titulo: initialTicket.titulo,
        descripcion: initialTicket.descripcion,
        fecha_reporte: initialTicket.fecha_reporte.slice(0, 10),
        fecha_estimada_solucion: initialTicket.fecha_estimada_solucion?.slice(0, 10) ?? "",
        observaciones_internas: initialTicket.observaciones_internas ?? "",
      }
    : {
        propiedad_id: "",
        inquilino_id: "",
        unidad: "",
        tipo: "plomeria",
        urgencia: "media",
        titulo: "",
        descripcion: "",
        fecha_reporte: new Date().toISOString().slice(0, 10),
        fecha_estimada_solucion: "",
        observaciones_internas: "",
      };

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(TicketFormSchema),
    defaultValues,
  });

  const propiedadId = watch("propiedad_id");
  const inquilinosFiltrados = inquilinos.filter(
    (i) => !propiedadId || i.asignacion?.propiedad_id === propiedadId,
  );

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter(
      (f) => f.type.startsWith("image/") || f.type === "application/pdf",
    );
    setFiles((prev) => [...prev, ...list].slice(0, 8));
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setSubmitError(null);
    const payload = {
      ...values,
      inquilino_id: values.inquilino_id || null,
      fecha_estimada_solucion: values.fecha_estimada_solucion || null,
    };

    if (mode === "create") {
      const { data, error } = await mantenimientoService.createTicket(payload);
      if (error || !data) {
        setSubmitError(error ?? "Error al crear");
        setLoading(false);
        return;
      }
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        await mantenimientoService.uploadEvidencia(data.id, fd);
      }
      router.push(`/dashboard/mantenimiento/${data.id}`);
    } else if (ticketId) {
      const { error } = await mantenimientoService.updateTicket(ticketId, payload);
      if (error) {
        setSubmitError(error);
        setLoading(false);
        return;
      }
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        await mantenimientoService.uploadEvidencia(ticketId, fd);
      }
      router.push(`/dashboard/mantenimiento/${ticketId}`);
    }
    setLoading(false);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-4xl">
      <FormSection icon={Building2} title="Ubicación" description="¿Dónde ocurre la incidencia?">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Propiedad *</label>
            <select {...register("propiedad_id")} className={`mt-1.5 ${fieldClass}`}>
              <option value="">Selecciona una propiedad</option>
              {sortPropiedadesByTitulo(propiedades).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo}
                  {p.direccion ? ` — ${p.direccion}` : ""}
                </option>
              ))}
            </select>
            {errors.propiedad_id && (
              <p className="text-xs text-red-600 mt-1">{errors.propiedad_id.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Inquilino que reporta</label>
            <select {...register("inquilino_id")} className={`mt-1.5 ${fieldClass}`}>
              <option value="">No especificado</option>
              {inquilinosFiltrados.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombres} {i.apellidos}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Unidad / habitación</label>
            <input
              {...register("unidad")}
              placeholder="Ej. 3ºA, Habitación 2"
              className={`mt-1.5 ${fieldClass}`}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        icon={Sparkles}
        title="Clasificación"
        description="Tipo de avería y nivel de prioridad"
      >
        <div>
          <label className={labelClass}>Tipo de ticket *</label>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TICKET_TIPOS_OPTIONS.map((o) => (
              <label
                key={o.value}
                className="relative flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 px-3 py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:border-amber-300 hover:bg-amber-50/30 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50 has-[:checked]:text-amber-900 has-[:checked]:ring-2 has-[:checked]:ring-amber-500/20"
              >
                <input type="radio" value={o.value} {...register("tipo")} className="sr-only" />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Urgencia *</label>
          <Controller
            name="urgencia"
            control={control}
            render={({ field }) => (
              <div className="mt-2 flex flex-wrap gap-2">
                {TICKET_URGENCIAS_OPTIONS.map((o) => {
                  const styles = TICKET_URGENCIA_PILL_STYLES[o.value as TicketUrgencia];
                  const active = field.value === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => field.onChange(o.value)}
                      className={[
                        "rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
                        active ? styles.active : styles.idle,
                      ].join(" ")}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={Calendar} title="Detalle de la incidencia">
        <div>
          <label className={labelClass}>Título *</label>
          <input
            {...register("titulo")}
            placeholder="Resumen breve del problema"
            className={`mt-1.5 ${fieldClass}`}
          />
          {errors.titulo && <p className="text-xs text-red-600 mt-1">{errors.titulo.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Descripción *</label>
          <textarea
            {...register("descripcion")}
            rows={5}
            placeholder="Describe el problema con el mayor detalle posible..."
            className={`mt-1.5 ${fieldClass} resize-y min-h-[120px]`}
          />
          {errors.descripcion && (
            <p className="text-xs text-red-600 mt-1">{errors.descripcion.message}</p>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fecha de reporte *</label>
            <input type="date" {...register("fecha_reporte")} className={`mt-1.5 ${fieldClass}`} />
          </div>
          <div>
            <label className={labelClass}>Fecha estimada de solución</label>
            <input
              type="date"
              {...register("fecha_estimada_solucion")}
              className={`mt-1.5 ${fieldClass}`}
            />
          </div>
        </div>
      </FormSection>

      {mode === "create" && (
        <FormSection icon={FileImage} title="Evidencias" description="Fotos o PDF (máx. 8 archivos)">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
            }}
            className={[
              "relative rounded-xl border-2 border-dashed p-8 text-center transition-colors",
              dragOver ? "border-amber-400 bg-amber-50/50" : "border-gray-200 bg-gray-50/30",
            ].join(" ")}
          >
            <Upload className="mx-auto text-gray-400 mb-3" size={28} />
            <p className="text-sm font-medium text-gray-700">Arrastra archivos aquí</p>
            <p className="text-xs text-gray-500 mt-1">o</p>
            <label className="mt-3 inline-block">
              <span className="text-sm font-medium text-brand-600 hover:text-brand-700 cursor-pointer">
                selecciona desde tu dispositivo
              </span>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="sr-only"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </label>
          </div>
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white border border-gray-100 px-3 py-2 text-sm"
                >
                  <span className="truncate text-gray-700">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </FormSection>
      )}

      <FormSection
        icon={Lock}
        title="Uso interno"
        description="Solo visible para el equipo de gestión"
        variant="muted"
      >
        <textarea
          {...register("observaciones_internas")}
          rows={3}
          placeholder="Notas internas, instrucciones para el manitas..."
          className={`${fieldClass} bg-white`}
        />
      </FormSection>

      {submitError && (
        <p className="text-sm text-red-600 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          {submitError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2 pb-8">
        <Button type="submit" variant="primary" size="md" className="gap-2 min-w-[180px]" disabled={loading}>
          <Save size={16} />
          {loading ? "Guardando..." : mode === "create" ? "Registrar ticket" : "Guardar cambios"}
        </Button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-medium text-gray-500 hover:text-gray-800 px-4 py-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
