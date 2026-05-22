"use client";

import { LayoutGrid } from "lucide-react";
import {
  TICKET_ESTADO_CONFIG,
  TICKET_ESTADO_TAB_ORDER,
  TICKET_ESTADO_TAB_STYLES,
} from "../../constants";
import type { TicketMantenimiento, TicketTabId } from "../../types";
import { countTicketsByEstado } from "../../utils/stats";

export function TicketsStatusTabs({
  tickets,
  activeTab,
  onTabChange,
}: {
  tickets: TicketMantenimiento[];
  activeTab: TicketTabId;
  onTabChange: (tab: TicketTabId) => void;
}) {
  const counts = countTicketsByEstado(tickets);

  const tabs: {
    id: TicketTabId;
    label: string;
    title?: string;
    count: number;
    dot?: string;
    activeStyle?: string;
    ring?: string;
  }[] = [
    {
      id: "todos",
      label: "Todos",
      count: counts.todos,
      activeStyle: "bg-gray-900 text-white border-gray-900",
      ring: "ring-gray-900/20",
    },
    ...TICKET_ESTADO_TAB_ORDER.map((estado) => {
      const cfg = TICKET_ESTADO_CONFIG[estado];
      const style = TICKET_ESTADO_TAB_STYLES[estado];
      return {
        id: estado,
        label: cfg.label,
        title: cfg.description,
        count: counts[estado],
        dot: style.dot,
        activeStyle: style.active,
        ring: style.ring,
      };
    }),
  ];

  return (
    <div className="border-b border-gray-100 bg-gray-50/50 px-2 sm:px-4 pt-3">
      <div
        className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-300"
        role="tablist"
        aria-label="Estados del ticket"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              title={tab.title}
              onClick={() => onTabChange(tab.id)}
              className={[
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                isActive
                  ? `${tab.activeStyle ?? "bg-brand-600 text-white border-brand-600"} shadow-sm ring-2 ${tab.ring ?? "ring-brand-500/25"}`
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
              ].join(" ")}
            >
              {tab.id === "todos" ? (
                <LayoutGrid size={14} className={isActive ? "opacity-90" : "text-gray-400"} />
              ) : tab.dot ? (
                <span className={`h-2 w-2 rounded-full shrink-0 ${tab.dot}`} aria-hidden />
              ) : null}
              <span className="whitespace-nowrap">{tab.label}</span>
              <span
                className={[
                  "min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                  isActive ? "bg-white/25 text-inherit" : "bg-gray-100 text-gray-600",
                ].join(" ")}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
