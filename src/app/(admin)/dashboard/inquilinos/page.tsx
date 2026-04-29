"use client";

import { useState } from "react";
import { Plus, Search, Mail, Phone } from "lucide-react";
import { Button, Badge } from "@/components/ui";

type EstadoPago = "al_dia" | "pendiente" | "impagado";

interface InquilinoMock {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  propiedad: string;
  ciudad: string;
  renta: string;
  estado_pago: EstadoPago;
}

const INQUILINOS: InquilinoMock[] = [
  {
    id: "1",
    nombre: "Ana García López",
    email: "ana.garcia@email.com",
    telefono: "+34 612 345 678",
    propiedad: "Calle Mayor 12, 3ºA",
    ciudad: "Madrid",
    renta: "€950",
    estado_pago: "al_dia",
  },
  {
    id: "2",
    nombre: "Carlos Martínez Ruiz",
    email: "carlos.martinez@email.com",
    telefono: "+34 623 456 789",
    propiedad: "Av. Diagonal 88, 2ºB",
    ciudad: "Barcelona",
    renta: "€1.200",
    estado_pago: "al_dia",
  },
  {
    id: "3",
    nombre: "Laura Sánchez Pérez",
    email: "laura.sanchez@email.com",
    telefono: "+34 634 567 890",
    propiedad: "Calle Goya 31, 4ºA",
    ciudad: "Madrid",
    renta: "€1.050",
    estado_pago: "pendiente",
  },
  {
    id: "4",
    nombre: "Miguel Torres Vega",
    email: "miguel.torres@email.com",
    telefono: "+34 645 678 901",
    propiedad: "Calle Serrano 44, 5ºD",
    ciudad: "Madrid",
    renta: "€1.800",
    estado_pago: "al_dia",
  },
  {
    id: "5",
    nombre: "Sofía Ramírez Castro",
    email: "sofia.ramirez@email.com",
    telefono: "+34 656 789 012",
    propiedad: "Gran Vía 22, 6ºA",
    ciudad: "Madrid",
    renta: "€1.100",
    estado_pago: "impagado",
  },
  {
    id: "6",
    nombre: "Pedro Jiménez Blanco",
    email: "pedro.jimenez@email.com",
    telefono: "+34 667 890 123",
    propiedad: "Calle Alcalá 55, 2ºC",
    ciudad: "Madrid",
    renta: "€870",
    estado_pago: "al_dia",
  },
];

const ESTADO_PAGO_CONFIG: Record<
  EstadoPago,
  { variant: "success" | "warning" | "danger"; label: string }
> = {
  al_dia: { variant: "success", label: "Al día" },
  pendiente: { variant: "warning", label: "Pendiente" },
  impagado: { variant: "danger", label: "Impagado" },
};

export default function InquilinosPage() {
  const [search, setSearch] = useState("");

  const filtered = INQUILINOS.filter(
    (i) =>
      i.nombre.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase()) ||
      i.propiedad.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquilinos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {INQUILINOS.length} inquilinos registrados
          </p>
        </div>
        <Button variant="primary" size="md" className="gap-2 self-start sm:self-auto">
          <Plus size={16} />
          Añadir inquilino
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
            placeholder="Buscar por nombre, email o propiedad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-400"
          />
        </div>
      </div>

      {/* Grid de cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center text-gray-400">
          No se encontraron inquilinos
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((inquilino) => {
            const estadoPago = ESTADO_PAGO_CONFIG[inquilino.estado_pago];
            const initial = inquilino.nombre.charAt(0).toUpperCase();

            // Color de avatar según estado de pago
            const avatarBg =
              inquilino.estado_pago === "al_dia"
                ? "bg-green-100"
                : inquilino.estado_pago === "pendiente"
                ? "bg-yellow-100"
                : "bg-red-100";
            const avatarText =
              inquilino.estado_pago === "al_dia"
                ? "text-green-700"
                : inquilino.estado_pago === "pendiente"
                ? "text-yellow-700"
                : "text-red-700";

            return (
              <div
                key={inquilino.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${avatarBg}`}
                    >
                      <span className={`text-base font-bold ${avatarText}`}>
                        {initial}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {inquilino.nombre}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {inquilino.ciudad}
                      </p>
                    </div>
                  </div>
                  <Badge variant={estadoPago.variant}>{estadoPago.label}</Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{inquilino.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} className="text-gray-400 flex-shrink-0" />
                    <span>{inquilino.telefono}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Propiedad asignada</p>
                    <p className="text-xs font-medium text-gray-700 mt-0.5 truncate max-w-[150px]">
                      {inquilino.propiedad}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Renta mensual</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {inquilino.renta}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
