"use client";

import { useCallback, useState, useTransition } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { REPORT_TABS } from "@/modules/reportes/constants";
import { ReportFiltersBar } from "@/modules/reportes/components/report-filters";
import { ReportTabPanel } from "@/modules/reportes/components/report-tab-panel";
import { reportesService } from "@/modules/reportes/services/reportes.service";
import type {
  ReportesCatalog,
  ReportFilters,
  ReportTabId,
  ReportTabPayload,
} from "@/modules/reportes/types";
import { defaultReportDateRange } from "@/modules/reportes/utils/dates";

export function ReportesPageClient({
  initialCatalog,
  initialTab,
  initialData,
  catalogError,
}: {
  initialCatalog: ReportesCatalog;
  initialTab: ReportTabId;
  initialData: ReportTabPayload;
  catalogError?: string;
}) {
  const [tab, setTab] = useState<ReportTabId>(initialTab);
  const [filters, setFilters] = useState<ReportFilters>(defaultReportDateRange());
  const [catalog] = useState(initialCatalog);
  const [data, setData] = useState<ReportTabPayload | null>(initialData);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchTab = useCallback((t: ReportTabId, f: ReportFilters) => {
    startTransition(async () => {
      const { data: payload, error } = await reportesService.getTabData(t, f);
      if (error) {
        setFetchError(error);
        return;
      }
      setFetchError(null);
      if (payload) setData(payload);
    });
  }, []);

  const handleTab = (id: ReportTabId) => {
    setTab(id);
    const next = { ...filters, estado: undefined, estado_manitas: undefined };
    setFilters(next);
    fetchTab(id, next);
  };

  const handleApply = () => fetchTab(tab, filters);

  const activeTab = REPORT_TABS.find((t) => t.id === tab);

  return (
    <div className="space-y-6 pb-8">
      <header className="relative overflow-hidden rounded-2xl border border-slate-800/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-8 sm:px-10 shadow-xl">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-sm">
            <BarChart3 size={28} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-400/90 mb-1.5">
              Centro de análisis
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Informes</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              KPIs, gráficos y tablas consolidados de tu cartera. Solo lectura — los datos
              respetan el periodo y los filtros que apliques.
            </p>
          </div>
        </div>
      </header>

      {catalogError && (
        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          {catalogError}
        </p>
      )}

      <ReportFiltersBar
        tab={tab}
        filters={filters}
        catalog={catalog}
        onChange={setFilters}
        onApply={handleApply}
      />

      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-md overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/60 scrollbar-thin">
          {REPORT_TABS.map((t) => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTab(t.id)}
                className={[
                  "relative flex shrink-0 items-center gap-2 px-4 sm:px-5 py-3.5 text-sm font-medium transition-all whitespace-nowrap",
                  active
                    ? "text-brand-800 bg-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/70",
                ].join(" ")}
              >
                <Icon
                  size={16}
                  className={active ? "text-brand-600" : "text-slate-400"}
                  strokeWidth={2}
                />
                {t.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-brand-600"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>

        {activeTab && (
          <p className="px-5 sm:px-6 py-2 text-[11px] text-slate-500 border-b border-slate-100 bg-white">
            Vista: <span className="font-semibold text-slate-700">{activeTab.label}</span>
          </p>
        )}

        <ReportTabPanel data={data} isLoading={isPending} error={fetchError} />
      </div>
    </div>
  );
}
