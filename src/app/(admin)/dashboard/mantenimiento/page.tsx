"use client";

import { useState } from "react";
import { Plus, Search, SlidersHorizontal, Eye, Pencil } from "lucide-react";
import { Button, Badge } from "@/components/ui";

type EstadoTicket = "pendiente" | "en_curso" | "finalizado" | "cancelado";
type Urgencia = "baja" | "media" | "alta" | "emergencia";

interface TicketMock {
  id: string;
  propiedad: string;
  descripcion: string;
  urgencia: Urgencia;
  estado: EstadoTicket;
  tecnico: string;
  fecha: string;
}

const TICKETS: TicketMock[] = [
  {
    id: "1",
    propiedad: "Calle Mayor 12, 3ºA",
    descripcion: "Fuga de agua en el baño principal",
    urgencia: "alta",
    estado: "en_curso",
    tecnico: "Juan Fontanero",
    fecha: "18/04/2026",
  },
  {
    id: "2",
    propiedad: "Av. Diagonal 88, 2ºB",
    descripcion: "Calefacción no funciona",
    urgencia: "emergencia",
    estado: "pendiente",
    tecnico: "Sin asignar",
    fecha: "19/04/2026",
  },
  {
    id: "3",
    propiedad: "Calle Goya 31, 4ºA",
    descripcion: "Persiana rota en dormitorio",
    urgencia: "baja",
    estado: "pendiente",
    tecnico: "Sin asignar",
    fecha: "15/04/2026",
  },
  {
    id: "4",
    propiedad: "Calle Serrano 44, 5ºD",
    descripcion: "Pintura en mal estado en salón",
    urgencia: "media",
    estado: "finalizado",
    tecnico: "Pedro Pintor",
    fecha: "10/04/2026",
  },
  {
    id: "5",
    propiedad: "Paseo Castellana 14, BJ",
    descripcion: "Cambio de cerradura puerta principal",
    urgencia: "media",
    estado: "en_curso",
    tecnico: "Cerrajería López",
    fecha: "17/04/2026",
  },
  {
    id: "6",
    propiedad: "Gran Vía 22, 6ºA",
    descripcion: "Revisión instalación eléctrica",
    urgencia: "alta",
    estado: "cancelado",
    tecnico: "Eléctrica Madrid",
    fecha: "05/04/2026",
  },
];

const URGENCIA_CONFIG: Record<
  Urgencia,
  { variant: "default" | "warning" | "danger" | "info"; label: string }
> = {
  baja: { variant: "default", label: "Baja" },
  media: { variant: "warning", label: "Media" },
  alta: { variant: "danger", label: "Alta" },
  emergencia: { variant: "danger", label: "Emergencia" },
};

const ESTADO_CONFIG: Record<
  EstadoTicket,
  { variant: "warning" | "info" | "success" | "default"; label: string }
> = {
  pendiente: { variant: "warning", label: "Pendiente" },
  en_curso: { variant: "info", label: "En curso" },
  finalizado: { variant: "success", label: "Finalizado" },
  cancelado: { variant: "default", label: "Cancelado" },
};

const ESTADOS_FILTER: Array<{ value: string; label: string }> = [
  { value: "", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_curso", label: "En curso" },
  { value: "finalizado", label: "Finalizado" },
  { value: "cancelado", label: "Cancelado" },
];

export default function MantenimientoPage() {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");

  const filtered = TICKETS.filter((t) => {
    const matchSearch =
      t.propiedad.toLowerCase().includes(search.toLowerCase()) ||
      t.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      t.tecnico.toLowerCase().includes(search.toLowerCase());
    const matchEstado = estadoFilter === "" || t.estado === estadoFilter;
    return matchSearch && matchEstado;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mantenimiento</h1>
          <p className="text-sm text-gray-500 mt-1">
            {TICKETS.filter((t) => t.estado === "pendiente" || t.estado === "en_curso").length}{" "}
            tickets abiertos de {TICKETS.length} en total
          </p>
        </div>
        <Button variant="primary" size="md" className="gap-2 self-start sm:self-auto">
          <Plus size={16} />
          Nuevo ticket
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar por propiedad, descripción o técnico..."
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
              {ESTADOS_FILTER.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
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
                {["Propiedad", "Descripción", "Urgencia", "Estado", "Técnico", "Fecha", "Acciones"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    No se encontraron tickets
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const urgencia = URGENCIA_CONFIG[t.urgencia];
                  const estado = ESTADO_CONFIG[t.estado];
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">
                        {t.propiedad}
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[200px]">
                        {t.descripcion}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={urgencia.variant}>{urgencia.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={estado.variant}>{estado.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{t.tecnico}</td>
                      <td className="px-4 py-3 text-gray-600">{t.fecha}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Eye size={15} />
                          </button>
                          <button className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                            <Pencil size={15} />
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
    </div>
  );
}
