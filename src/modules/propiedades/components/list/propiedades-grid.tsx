"use client";

import Link from "next/link";
import { Bath, BedDouble, Eye, MapPin, Maximize2, Pencil, Trash2 } from "lucide-react";
import { PropiedadFoto } from "../propiedad-foto";
import { PropiedadEstadoBadge } from "../propiedad-estado-badge";
import type { Propiedad } from "../../types";
import {
  formatPrecio,
  getTipoPropiedadLabel,
  getTipoRentaLabel,
} from "../../utils/labels";

interface PropiedadesGridProps {
  propiedades: Propiedad[];
  onDelete: (id: string) => void;
  deletingId?: string | null;
}

export function PropiedadesGrid({
  propiedades,
  onDelete,
  deletingId,
}: PropiedadesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {propiedades.map((p, index) => (
        <article
          key={p.id}
          className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-brand-200/60 animate-fade-in-up"
          style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
        >
          <Link
            href={`/dashboard/propiedades/${p.id}`}
            className="relative block aspect-[16/10] overflow-hidden bg-gray-100"
          >
            <PropiedadFoto
              src={p.foto_principal_url}
              alt={p.titulo}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              iconSize={28}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
            <div className="absolute top-3 right-3">
              <PropiedadEstadoBadge estado={p.estado} />
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-lg font-bold text-white drop-shadow-sm line-clamp-1">
                {p.titulo}
              </p>
              <p className="flex items-center gap-1 text-xs text-white/90 mt-0.5">
                <MapPin size={12} className="shrink-0" />
                <span className="line-clamp-1">
                  {p.ciudad} · {p.direccion}
                </span>
              </p>
            </div>
          </Link>

          <div className="flex flex-1 flex-col p-4 sm:p-5 gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">
                  {formatPrecio(p.precio_mes)}
                  <span className="text-sm font-normal text-gray-500">/mes</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getTipoPropiedadLabel(p.tipo_propiedad)} · {getTipoRentaLabel(p.tipo_renta)}
                </p>
              </div>
            </div>

            {(p.habitaciones > 0 || p.banos > 0 || p.metros_cuadrados) && (
              <ul className="flex flex-wrap gap-3 text-xs text-gray-600">
                {p.habitaciones > 0 && (
                  <li className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1">
                    <BedDouble size={14} className="text-gray-400" />
                    {p.habitaciones} hab.
                  </li>
                )}
                {p.banos > 0 && (
                  <li className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1">
                    <Bath size={14} className="text-gray-400" />
                    {p.banos} baños
                  </li>
                )}
                {p.metros_cuadrados != null && p.metros_cuadrados > 0 && (
                  <li className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1">
                    <Maximize2 size={14} className="text-gray-400" />
                    {p.metros_cuadrados} m²
                  </li>
                )}
              </ul>
            )}

            <div className="mt-auto flex items-center gap-2 pt-1 border-t border-gray-100">
              <Link
                href={`/dashboard/propiedades/${p.id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Eye size={15} />
                Ver
              </Link>
              <Link
                href={`/dashboard/propiedades/${p.id}/editar`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800 hover:bg-brand-100 transition-colors"
              >
                <Pencil size={15} />
                Editar
              </Link>
              <button
                type="button"
                onClick={() => onDelete(p.id)}
                disabled={deletingId === p.id}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Eliminar"
                aria-label={`Eliminar ${p.titulo}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
