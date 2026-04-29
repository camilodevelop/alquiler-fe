"use client";

import { Plus, RotateCcw, X } from "lucide-react";
import { Button, Badge } from "@/components/ui";

type EstadoInvitacion = "pendiente" | "aceptada" | "expirada";

interface InvitacionMock {
  id: string;
  email: string;
  rol: string;
  fecha_envio: string;
  estado: EstadoInvitacion;
}

const INVITACIONES: InvitacionMock[] = [
  {
    id: "1",
    email: "nuevo.inquilino@email.com",
    rol: "Inquilino",
    fecha_envio: "15/04/2026",
    estado: "pendiente",
  },
  {
    id: "2",
    email: "gestor.colaborador@email.com",
    rol: "Gestor",
    fecha_envio: "10/04/2026",
    estado: "aceptada",
  },
  {
    id: "3",
    email: "otro.inquilino@email.com",
    rol: "Inquilino",
    fecha_envio: "01/03/2026",
    estado: "expirada",
  },
  {
    id: "4",
    email: "tecnico.manitas@email.com",
    rol: "Manitas",
    fecha_envio: "18/04/2026",
    estado: "pendiente",
  },
];

const ESTADO_CONFIG: Record<
  EstadoInvitacion,
  { variant: "warning" | "success" | "default"; label: string }
> = {
  pendiente: { variant: "warning", label: "Pendiente" },
  aceptada: { variant: "success", label: "Aceptada" },
  expirada: { variant: "default", label: "Expirada" },
};

const ROL_BADGE: Record<string, string> = {
  Inquilino: "bg-blue-50 text-blue-700",
  Gestor: "bg-violet-50 text-violet-700",
  Manitas: "bg-orange-50 text-orange-700",
  Agente: "bg-teal-50 text-teal-700",
};

export default function InvitacionesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invitaciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona el acceso de usuarios a tu plataforma
          </p>
        </div>
        <Button variant="primary" size="md" className="gap-2 self-start sm:self-auto">
          <Plus size={16} />
          Invitar usuario
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Email", "Rol", "Fecha envío", "Estado", "Acciones"].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {INVITACIONES.map((inv) => {
                const estado = ESTADO_CONFIG[inv.estado];
                const rolClass = ROL_BADGE[inv.rol] ?? "bg-gray-100 text-gray-700";

                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {inv.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${rolClass}`}
                      >
                        {inv.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{inv.fecha_envio}</td>
                    <td className="px-4 py-3">
                      <Badge variant={estado.variant}>{estado.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {inv.estado !== "aceptada" && (
                          <button
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-brand-600 hover:bg-green-50 transition-colors"
                            title="Reenviar invitación"
                          >
                            <RotateCcw size={13} />
                            Reenviar
                          </button>
                        )}
                        {inv.estado === "pendiente" && (
                          <button
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                            title="Cancelar invitación"
                          >
                            <X size={13} />
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        Las invitaciones pendientes expiran automáticamente a los 7 días del envío.
      </div>
    </div>
  );
}
