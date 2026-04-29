"use client";

import { useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { Button, Badge } from "@/components/ui";

type EstadoContrato = "activo" | "vencido" | "pendiente_firma" | "borrador";

interface ContratoMock {
  id: string;
  propiedad: string;
  inquilino: string;
  inicio: string;
  fin: string;
  renta: string;
  estado: EstadoContrato;
}

const CONTRATOS: ContratoMock[] = [
  {
    id: "1",
    propiedad: "Calle Mayor 12, 3ºA",
    inquilino: "Ana García López",
    inicio: "01/06/2024",
    fin: "31/05/2026",
    renta: "€950",
    estado: "activo",
  },
  {
    id: "2",
    propiedad: "Av. Diagonal 88, 2ºB",
    inquilino: "Carlos Martínez",
    inicio: "01/09/2023",
    fin: "31/08/2025",
    renta: "€1.200",
    estado: "vencido",
  },
  {
    id: "3",
    propiedad: "Calle Goya 31, 4ºA",
    inquilino: "Laura Sánchez",
    inicio: "01/03/2026",
    fin: "28/02/2028",
    renta: "€1.050",
    estado: "pendiente_firma",
  },
  {
    id: "4",
    propiedad: "Calle Serrano 44, 5ºD",
    inquilino: "Miguel Torres",
    inicio: "01/01/2025",
    fin: "31/12/2026",
    renta: "€1.800",
    estado: "activo",
  },
  {
    id: "5",
    propiedad: "Gran Vía 22, 6ºA",
    inquilino: "Sofía Ramírez",
    inicio: "—",
    fin: "—",
    renta: "€1.100",
    estado: "borrador",
  },
  {
    id: "6",
    propiedad: "Calle Alcalá 55, 2ºC",
    inquilino: "Pedro Jiménez",
    inicio: "15/07/2023",
    fin: "14/07/2025",
    renta: "€870",
    estado: "vencido",
  },
];

const ESTADO_CONFIG: Record<
  EstadoContrato,
  { variant: "success" | "danger" | "warning" | "default"; label: string }
> = {
  activo: { variant: "success", label: "Activo" },
  vencido: { variant: "danger", label: "Vencido" },
  pendiente_firma: { variant: "warning", label: "Pendiente firma" },
  borrador: { variant: "default", label: "Borrador" },
};

export default function ContratosPage() {
  const [search, setSearch] = useState("");

  const filtered = CONTRATOS.filter(
    (c) =>
      c.propiedad.toLowerCase().includes(search.toLowerCase()) ||
      c.inquilino.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {CONTRATOS.filter((c) => c.estado === "activo").length} contratos
            activos de {CONTRATOS.length} en total
          </p>
        </div>
        <Button variant="primary" size="md" className="gap-2 self-start sm:self-auto">
          <Plus size={16} />
          Nuevo contrato
        </Button>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar por propiedad o inquilino..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Propiedad", "Inquilino", "Inicio", "Fin", "Renta/mes", "Estado", "Acciones"].map(
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
                    No se encontraron contratos
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const estado = ESTADO_CONFIG[c.estado];
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">
                        {c.propiedad}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{c.inquilino}</td>
                      <td className="px-4 py-3 text-gray-600">{c.inicio}</td>
                      <td className="px-4 py-3 text-gray-600">{c.fin}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{c.renta}</td>
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
                          <button className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
    </div>
  );
}
