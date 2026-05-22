"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Pencil, Phone, Wrench } from "lucide-react";
import { Button } from "@/components/ui";
import { MANITAS_ESPECIALIDAD_CONFIG } from "../../constants";
import { ManitasEstadoBadge } from "./manitas-estado-badge";
import type { Manitas } from "../../types";
import { manitasNombreCompleto } from "../../utils/labels";
import { mantenimientoService } from "../../services/mantenimiento.service";
import { ManitasAvatar } from "./manitas-avatar";
import { ManitasRatingDisplay } from "./manitas-rating";
import { ManitasHistorialSection } from "./manitas-historial-section";

export function ManitasProfile({ initial }: { initial: Manitas }) {
  const [manitas, setManitas] = useState(initial);

  const refresh = async () => {
    const { data } = await mantenimientoService.getManitas(manitas.id);
    if (data) setManitas(data);
  };

  const esp = MANITAS_ESPECIALIDAD_CONFIG[manitas.especialidad];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/mantenimiento/maestros"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-700"
      >
        <ArrowLeft size={16} />
        Volver al equipo
      </Link>

      <div className="rounded-2xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-violet-600/10 via-white to-violet-50/40 px-6 py-8 sm:px-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <ManitasAvatar manitas={manitas} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <ManitasEstadoBadge estado={manitas.estado} className="text-[11px] px-2 py-1" />
                <span className="text-sm font-medium text-violet-700">{esp.label}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {manitasNombreCompleto(manitas)}
              </h1>
              <div className="mt-3">
                <ManitasRatingDisplay value={manitas.rating} size={18} />
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Mail size={15} className="text-gray-400" />
                  {manitas.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={15} className="text-gray-400" />
                  {manitas.telefono}
                </span>
                {manitas.zona_cobertura && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-gray-400" />
                    {manitas.zona_cobertura}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-6 mt-5 text-sm">
                <div className="rounded-xl bg-white/80 border border-gray-200/80 px-4 py-2.5">
                  <p className="text-gray-500 text-xs">Tickets activos</p>
                  <p className="text-xl font-bold text-gray-900 tabular-nums">{manitas.tickets_asignados}</p>
                </div>
                <div className="rounded-xl bg-white/80 border border-gray-200/80 px-4 py-2.5">
                  <p className="text-gray-500 text-xs">Completados</p>
                  <p className="text-xl font-bold text-emerald-700 tabular-nums">{manitas.tickets_completados}</p>
                </div>
              </div>
            </div>
            <Link href={`/dashboard/mantenimiento/maestros/${manitas.id}/editar`} className="shrink-0">
              <Button variant="primary" size="sm" className="gap-1.5">
                <Pencil size={14} />
                Editar perfil
              </Button>
            </Link>
          </div>
        </div>

        {manitas.disponibilidad_notas && (
          <div className="px-6 py-3 border-t border-gray-100 bg-amber-50/50 text-sm text-amber-900">
            <Wrench size={14} className="inline mr-2 -mt-0.5" />
            {manitas.disponibilidad_notas}
          </div>
        )}
      </div>

      {manitas.hoja_vida?.trim() && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Hoja de vida</h2>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {manitas.hoja_vida}
          </div>
        </div>
      )}

      <ManitasHistorialSection
        manitasId={manitas.id}
        trabajos={manitas.historial_trabajos ?? []}
        onRefresh={refresh}
      />
    </div>
  );
}
