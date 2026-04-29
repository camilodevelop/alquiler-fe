"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, SlidersHorizontal, Eye, Pencil, Trash2, X } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { PropiedadSchema, type PropiedadForm } from "@/shared/schemas/propiedad";

type EstadoPropiedad = "disponible" | "alquilada" | "mantenimiento";

interface PropiedadMock {
  id: string;
  direccion: string;
  ciudad: string;
  tipo: string;
  inquilino: string;
  renta: string;
  estado: EstadoPropiedad;
}

const PROPIEDADES_INICIAL: PropiedadMock[] = [
  { id: "1", direccion: "Calle Mayor 12, 3ºA", ciudad: "Madrid", tipo: "Piso", inquilino: "Ana García López", renta: "€950", estado: "alquilada" },
  { id: "2", direccion: "Av. Diagonal 88, 2ºB", ciudad: "Barcelona", tipo: "Piso", inquilino: "Carlos Martínez", renta: "€1.200", estado: "alquilada" },
  { id: "3", direccion: "Plaza España 5, 1ºC", ciudad: "Valencia", tipo: "Estudio", inquilino: "—", renta: "€780", estado: "disponible" },
  { id: "4", direccion: "Calle Goya 31, 4ºA", ciudad: "Madrid", tipo: "Piso", inquilino: "Laura Sánchez", renta: "€1.050", estado: "alquilada" },
  { id: "5", direccion: "Paseo Castellana 14, BJ", ciudad: "Madrid", tipo: "Local", inquilino: "—", renta: "€650", estado: "mantenimiento" },
  { id: "6", direccion: "Calle Serrano 44, 5ºD", ciudad: "Madrid", tipo: "Ático", inquilino: "Miguel Torres", renta: "€1.800", estado: "alquilada" },
];

const ESTADO_CONFIG: Record<EstadoPropiedad, { variant: "success" | "info" | "warning"; label: string }> = {
  alquilada: { variant: "success", label: "Alquilada" },
  disponible: { variant: "info", label: "Disponible" },
  mantenimiento: { variant: "warning", label: "Mantenimiento" },
};

const TIPO_ALQUILER_LABELS: Record<string, string> = {
  tradicional: "Tradicional",
  habitaciones: "Por habitaciones",
  corta_estancia: "Corta estancia",
  flipping: "Flipping",
};

// ── Campo de formulario reutilizable ──
function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-400 disabled:bg-gray-50";
const selectCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-700 bg-white";

// ── Modal nueva propiedad ──
function NuevaPropiedadModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (data: PropiedadForm) => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PropiedadForm>({
    resolver: zodResolver(PropiedadSchema),
    defaultValues: { estado: "disponible", habitaciones: 1, banos: 1 },
  });

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const onSubmit = (data: PropiedadForm) => {
    onSave(data);
    onClose();
  };

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nueva propiedad</h2>
            <p className="text-sm text-gray-500 mt-0.5">Completa los datos de la propiedad</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto px-6 py-5 space-y-5">

            {/* Título */}
            <Field label="Título de la propiedad" error={errors.titulo?.message} required>
              <input {...register("titulo")} placeholder="Ej: Piso luminoso en el centro" className={inputCls} />
            </Field>

            {/* Dirección */}
            <Field label="Dirección" error={errors.direccion?.message} required>
              <input {...register("direccion")} placeholder="Calle, número, piso..." className={inputCls} />
            </Field>

            {/* Ciudad + CP */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ciudad" error={errors.ciudad?.message} required>
                <input {...register("ciudad")} placeholder="Madrid" className={inputCls} />
              </Field>
              <Field label="Código postal" error={errors.codigo_postal?.message} required>
                <input {...register("codigo_postal")} placeholder="28001" className={inputCls} />
              </Field>
            </div>

            {/* Tipo + Estado */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo de alquiler" error={errors.tipo_alquiler?.message} required>
                <select {...register("tipo_alquiler")} className={selectCls}>
                  <option value="">Seleccionar...</option>
                  {Object.entries(TIPO_ALQUILER_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </Field>
              <Field label="Estado" error={errors.estado?.message} required>
                <select {...register("estado")} className={selectCls}>
                  <option value="disponible">Disponible</option>
                  <option value="alquilada">Alquilada</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="inactiva">Inactiva</option>
                </select>
              </Field>
            </div>

            {/* Precio + m² */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Precio / mes (€)" error={errors.precio_mes?.message} required>
                <input {...register("precio_mes", { valueAsNumber: true })} type="number" min={0} placeholder="950" className={inputCls} />
              </Field>
              <Field label="Metros cuadrados" error={errors.metros_cuadrados?.message}>
                <input {...register("metros_cuadrados", { valueAsNumber: true })} type="number" min={0} placeholder="75" className={inputCls} />
              </Field>
            </div>

            {/* Habitaciones + Baños */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Habitaciones" error={errors.habitaciones?.message} required>
                <input {...register("habitaciones", { valueAsNumber: true })} type="number" min={0} max={20} className={inputCls} />
              </Field>
              <Field label="Baños" error={errors.banos?.message} required>
                <input {...register("banos", { valueAsNumber: true })} type="number" min={1} max={10} className={inputCls} />
              </Field>
            </div>

            {/* Descripción */}
            <Field label="Descripción" error={errors.descripcion?.message}>
              <textarea
                {...register("descripcion")}
                rows={3}
                placeholder="Describe la propiedad (opcional)..."
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <Button type="submit" variant="primary" size="md" loading={isSubmitting}>
              Guardar propiedad
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ── Página principal ──
export default function PropiedadesPage() {
  const [propiedades, setPropiedades] = useState<PropiedadMock[]>(PROPIEDADES_INICIAL);
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = propiedades.filter((p) => {
    const matchSearch =
      p.direccion.toLowerCase().includes(search.toLowerCase()) ||
      p.ciudad.toLowerCase().includes(search.toLowerCase()) ||
      p.inquilino.toLowerCase().includes(search.toLowerCase());
    const matchEstado = estadoFilter === "" || p.estado === estadoFilter;
    return matchSearch && matchEstado;
  });

  const handleSave = (data: PropiedadForm) => {
    const nueva: PropiedadMock = {
      id: String(Date.now()),
      direccion: data.direccion,
      ciudad: data.ciudad,
      tipo: TIPO_ALQUILER_LABELS[data.tipo_alquiler] ?? data.tipo_alquiler,
      inquilino: "—",
      renta: `€${data.precio_mes.toLocaleString("es-ES")}`,
      estado: (data.estado === "inactiva" ? "mantenimiento" : data.estado) as EstadoPropiedad,
    };
    setPropiedades((prev) => [nueva, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
          <p className="text-sm text-gray-500 mt-1">{propiedades.length} propiedades en tu cartera</p>
        </div>
        <Button variant="primary" size="md" className="gap-2 self-start sm:self-auto" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Nueva propiedad
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por dirección, ciudad o inquilino..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-gray-400 flex-shrink-0" />
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
            >
              {[
                { value: "", label: "Todos los estados" },
                { value: "alquilada", label: "Alquilada" },
                { value: "disponible", label: "Disponible" },
                { value: "mantenimiento", label: "Mantenimiento" },
              ].map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Dirección", "Ciudad", "Tipo", "Inquilino", "Renta/mes", "Estado", "Acciones"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    No se encontraron propiedades
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const estado = ESTADO_CONFIG[p.estado];
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px]">{p.direccion}</td>
                      <td className="px-4 py-3 text-gray-600">{p.ciudad}</td>
                      <td className="px-4 py-3 text-gray-600">{p.tipo}</td>
                      <td className="px-4 py-3 text-gray-600">{p.inquilino}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{p.renta}</td>
                      <td className="px-4 py-3">
                        <Badge variant={estado.variant}>{estado.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Eye size={15} />
                          </button>
                          <button className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setPropiedades((prev) => prev.filter((x) => x.id !== p.id))}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <NuevaPropiedadModal
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
