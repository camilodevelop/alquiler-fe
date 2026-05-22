"use client";

import type { ContractsStats } from "../../utils/stats";

export function ContractsStats({ stats }: { stats: ContractsStats }) {
  const items = [
    { label: "Total", value: stats.total, accent: "text-gray-900" },
    { label: "Activos", value: stats.activos, accent: "text-emerald-700" },
    { label: "Pend. firma", value: stats.pendiente_firma, accent: "text-amber-700" },
    { label: "Borradores", value: stats.borrador, accent: "text-gray-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-gray-200/90 bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-medium text-gray-500">{item.label}</p>
          <p className={`text-2xl font-bold mt-0.5 ${item.accent}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
