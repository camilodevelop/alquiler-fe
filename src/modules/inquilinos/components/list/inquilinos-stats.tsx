"use client";

import { AlertTriangle, ClipboardList, UserCheck, Users } from "lucide-react";
import type { InquilinosStats } from "../../utils/stats";

export function InquilinosStats({ stats }: { stats: InquilinosStats }) {
  const items = [
    { label: "Total", value: stats.total, icon: Users, accent: "bg-brand-50 text-brand-700 border-brand-100" },
    { label: "Activos", value: stats.activos, icon: UserCheck, accent: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { label: "Morosos", value: stats.morosos, icon: AlertTriangle, accent: "bg-red-50 text-red-700 border-red-100" },
    { label: "En revisión", value: stats.en_revision, icon: ClipboardList, accent: "bg-amber-50 text-amber-800 border-amber-100" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map(({ label, value, icon: Icon, accent }) => (
        <div
          key={label}
          className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 sm:p-5 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${accent}`}>
              <Icon size={18} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
        </div>
      ))}
    </div>
  );
}
