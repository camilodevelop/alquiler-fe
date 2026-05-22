"use client";

import { Building2, CircleDollarSign, KeyRound, Sparkles } from "lucide-react";
import type { PropiedadesPortfolioStats } from "../../utils/stats";
import { formatPrecio } from "../../utils/labels";

interface PropiedadesStatsProps {
  stats: PropiedadesPortfolioStats;
  filtered?: boolean;
}

const STAT_ITEMS = [
  {
    key: "total" as const,
    label: "En cartera",
    icon: Building2,
    accent: "bg-brand-50 text-brand-700 border-brand-100",
    value: (s: PropiedadesPortfolioStats) => String(s.total),
  },
  {
    key: "disponibles" as const,
    label: "Disponibles",
    icon: Sparkles,
    accent: "bg-blue-50 text-blue-700 border-blue-100",
    value: (s: PropiedadesPortfolioStats) => String(s.disponibles),
  },
  {
    key: "alquiladas" as const,
    label: "Alquiladas",
    icon: KeyRound,
    accent: "bg-emerald-50 text-emerald-700 border-emerald-100",
    value: (s: PropiedadesPortfolioStats) => String(s.alquiladas),
  },
  {
    key: "ingresos" as const,
    label: "Ingresos / mes",
    icon: CircleDollarSign,
    accent: "bg-amber-50 text-amber-800 border-amber-100",
    value: (s: PropiedadesPortfolioStats) => formatPrecio(s.ingresosMensuales),
  },
];

export function PropiedadesStats({ stats, filtered }: PropiedadesStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {STAT_ITEMS.map(({ label, icon: Icon, accent, value }) => (
        <div
          key={label}
          className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 sm:p-5 flex flex-col gap-3 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {label}
            </span>
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${accent}`}
            >
              <Icon size={18} strokeWidth={2} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {value(stats)}
          </p>
          {filtered && label === "En cartera" ? (
            <p className="text-xs text-gray-400 -mt-1">Con filtros aplicados</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
