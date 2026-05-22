"use client";

import { AlertTriangle, ClipboardList, Ticket, UserX, Wrench } from "lucide-react";
import type { TicketMantenimiento } from "../../types";
import { computeTicketsStats } from "../../utils/stats";

export function TicketsStats({ tickets }: { tickets: TicketMantenimiento[] }) {
  const s = computeTicketsStats(tickets);
  const items = [
    {
      label: "Total tickets",
      value: s.total,
      icon: Ticket,
      accent: "bg-slate-50 text-slate-700 border-slate-200",
    },
    {
      label: "Abiertos",
      value: s.abiertos,
      icon: ClipboardList,
      accent: "bg-brand-50 text-brand-700 border-brand-100",
    },
    {
      label: "En curso",
      value: s.enProceso,
      icon: Wrench,
      accent: "bg-violet-50 text-violet-700 border-violet-100",
    },
    {
      label: "Críticos",
      value: s.criticos,
      icon: AlertTriangle,
      accent: "bg-red-50 text-red-700 border-red-100",
    },
    {
      label: "Sin asignar",
      value: s.sinAsignar,
      icon: UserX,
      accent: "bg-amber-50 text-amber-800 border-amber-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {items.map(({ label, value, icon: Icon, accent }) => (
        <div
          key={label}
          className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 flex flex-col gap-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide leading-tight">
              {label}
            </span>
            <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${accent}`}>
              <Icon size={16} />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  );
}
