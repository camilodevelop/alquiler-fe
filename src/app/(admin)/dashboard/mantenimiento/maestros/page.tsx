"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Phone, Mail, Star } from "lucide-react";
import { Button, Badge } from "@/components/ui";

type Especialidad =
  | "fontaneria"
  | "electricidad"
  | "pintura"
  | "cerrajeria"
  | "climatizacion"
  | "general";

interface MaestroMock {
  id: string;
  nombre: string;
  especialidad: Especialidad;
  telefono: string;
  email: string;
  valoracion: number;
  trabajosRealizados: number;
  activo: boolean;
}

const MAESTROS: MaestroMock[] = [
  {
    id: "1",
    nombre: "Juan García Fontanero",
    especialidad: "fontaneria",
    telefono: "+34 612 345 678",
    email: "juan@fontaneria.es",
    valoracion: 4.8,
    trabajosRealizados: 23,
    activo: true,
  },
  {
    id: "2",
    nombre: "Eléctrica Madrid S.L.",
    especialidad: "electricidad",
    telefono: "+34 91 234 5678",
    email: "info@electricamadrid.es",
    valoracion: 4.5,
    trabajosRealizados: 41,
    activo: true,
  },
  {
    id: "3",
    nombre: "Pedro Sánchez Pintor",
    especialidad: "pintura",
    telefono: "+34 634 987 654",
    email: "pedro.pintor@gmail.com",
    valoracion: 4.2,
    trabajosRealizados: 17,
    activo: true,
  },
  {
    id: "4",
    nombre: "Cerrajería López 24h",
    especialidad: "cerrajeria",
    telefono: "+34 900 123 456",
    email: "lopez.cerrajeria@es.com",
    valoracion: 4.9,
    trabajosRealizados: 56,
    activo: true,
  },
  {
    id: "5",
    nombre: "FríoCalor Instalaciones",
    especialidad: "climatizacion",
    telefono: "+34 645 111 222",
    email: "frocalor@climatizacion.es",
    valoracion: 3.8,
    trabajosRealizados: 9,
    activo: false,
  },
  {
    id: "6",
    nombre: "Manitas Express",
    especialidad: "general",
    telefono: "+34 655 333 444",
    email: "hola@manitasexpress.es",
    valoracion: 4.6,
    trabajosRealizados: 38,
    activo: true,
  },
];

const ESPECIALIDAD_CONFIG: Record<
  Especialidad,
  { variant: "success" | "info" | "warning" | "default" | "danger"; label: string }
> = {
  fontaneria: { variant: "info", label: "Fontanería" },
  electricidad: { variant: "warning", label: "Electricidad" },
  pintura: { variant: "default", label: "Pintura" },
  cerrajeria: { variant: "default", label: "Cerrajería" },
  climatizacion: { variant: "info", label: "Climatización" },
  general: { variant: "success", label: "General" },
};

const ESPECIALIDAD_OPTIONS = [
  { value: "", label: "Todas las especialidades" },
  { value: "fontaneria", label: "Fontanería" },
  { value: "electricidad", label: "Electricidad" },
  { value: "pintura", label: "Pintura" },
  { value: "cerrajeria", label: "Cerrajería" },
  { value: "climatizacion", label: "Climatización" },
  { value: "general", label: "General" },
];

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={13} className="fill-amber-400 text-amber-400" />
      <span className="text-sm font-medium text-gray-700">{value.toFixed(1)}</span>
    </div>
  );
}

export default function MaestrosPage() {
  const [maestros, setMaestros] = useState<MaestroMock[]>(MAESTROS);
  const [search, setSearch] = useState("");
  const [especialidadFilter, setEspecialidadFilter] = useState("");

  const filtered = maestros.filter((m) => {
    const matchSearch =
      m.nombre.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.telefono.includes(search);
    const matchEsp = especialidadFilter === "" || m.especialidad === especialidadFilter;
    return matchSearch && matchEsp;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maestros / Técnicos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {maestros.filter((m) => m.activo).length} activos de {maestros.length} en el catálogo
          </p>
        </div>
        <Button variant="primary" size="md" className="gap-2 self-start sm:self-auto">
          <Plus size={16} />
          Añadir técnico
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
          <select
            value={especialidadFilter}
            onChange={(e) => setEspecialidadFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
          >
            {ESPECIALIDAD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-400">
            No se encontraron técnicos
          </div>
        ) : (
          filtered.map((m) => {
            const esp = ESPECIALIDAD_CONFIG[m.especialidad];
            return (
              <div
                key={m.id}
                className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-4 transition-opacity ${
                  m.activo ? "border-gray-200" : "border-gray-100 opacity-60"
                }`}
              >
                {/* Cabecera */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-brand-700 font-bold text-sm">
                        {m.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{m.nombre}</p>
                      <Badge variant={esp.variant}>{esp.label}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setMaestros((prev) => prev.filter((x) => x.id !== m.id))}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Contacto */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{m.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{m.email}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <StarRating value={m.valoracion} />
                  <span className="text-xs text-gray-400">
                    {m.trabajosRealizados} trabajos
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      m.activo
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {m.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
