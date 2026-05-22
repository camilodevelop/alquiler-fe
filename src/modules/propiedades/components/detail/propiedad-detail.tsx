"use client";

import Link from "next/link";
import { MapPin, Pencil } from "lucide-react";
import { PropiedadFoto } from "../propiedad-foto";
import { Button } from "@/components/ui";
import type { Propiedad } from "../../types";
import { PropiedadEstadoBadge } from "../propiedad-estado-badge";
import {
  formatPrecio,
  getEstadoLabel,
  getTipoPropiedadLabel,
  getTipoRentaLabel,
} from "../../utils/labels";

interface PropiedadDetailProps {
  propiedad: Propiedad;
}

export function PropiedadDetail({ propiedad }: PropiedadDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{propiedad.titulo}</h1>
            <PropiedadEstadoBadge estado={propiedad.estado} />
          </div>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <MapPin size={14} />
            {propiedad.direccion}, {propiedad.ciudad} ({propiedad.codigo_postal})
          </p>
        </div>
        <Link href={`/dashboard/propiedades/${propiedad.id}/editar`}>
          <Button variant="primary" size="md" className="gap-2">
            <Pencil size={16} />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <PropiedadFoto
              src={propiedad.foto_principal_url}
              alt={propiedad.titulo}
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              iconSize={48}
            />
          </div>
          {propiedad.descripcion && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Descripción</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{propiedad.descripcion}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Precio mensual</p>
              <p className="text-2xl font-bold text-brand-600 mt-1">
                {formatPrecio(propiedad.precio_mes)}
              </p>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Tipo de propiedad</dt>
                <dd className="font-medium text-gray-900">
                  {getTipoPropiedadLabel(propiedad.tipo_propiedad)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Tipo de renta</dt>
                <dd className="font-medium text-gray-900">
                  {getTipoRentaLabel(propiedad.tipo_renta)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Estado</dt>
                <dd className="font-medium text-gray-900">
                  {getEstadoLabel(propiedad.estado)}
                </dd>
              </div>
              {propiedad.habitaciones > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Habitaciones</dt>
                  <dd className="font-medium text-gray-900">{propiedad.habitaciones}</dd>
                </div>
              )}
              {propiedad.banos > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Baños</dt>
                  <dd className="font-medium text-gray-900">{propiedad.banos}</dd>
                </div>
              )}
              {propiedad.metros_cuadrados && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Metros²</dt>
                  <dd className="font-medium text-gray-900">{propiedad.metros_cuadrados} m²</dd>
                </div>
              )}
              {propiedad.duracion_minima_dias && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Estancia mínima</dt>
                  <dd className="font-medium text-gray-900">
                    {propiedad.duracion_minima_dias} días
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
