"use client";

import { BarChart2, Loader2 } from "lucide-react";
import type { ReportTabPayload } from "../types";
import { ReportChart } from "./charts/report-chart";
import { ReportExportButton } from "./report-export-button";
import { ReportKpiGrid } from "./report-kpi-grid";
import { ReportSummaryTable } from "./report-summary-table";

function chartSpan(chart: { type: string; id: string }): string {
  if (chart.type === "hbar" || chart.id === "ing-gas") return "lg:col-span-2";
  if (chart.type === "donut") return "";
  return "";
}

export function ReportTabPanel({
  data,
  isLoading,
  error,
}: {
  data: ReportTabPayload | null;
  isLoading: boolean;
  error?: string | null;
}) {
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 inline-block">
          {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-9 w-9 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-b-2xl">
          <Loader2 className="h-9 w-9 animate-spin text-brand-600" />
        </div>
      )}

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <BarChart2 size={14} className="text-brand-600" />
            Vista de solo lectura · datos según filtros aplicados
          </p>
          <ReportExportButton />
        </div>

        <ReportKpiGrid kpis={data.kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          {data.charts.map((chart) => (
            <div
              key={chart.id}
              className={[
                "group rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden",
                "hover:shadow-md hover:border-slate-300/80 transition-all",
                chartSpan(chart),
              ].join(" ")}
            >
              <div className="p-5 sm:p-6">
                <div className="mb-1">
                  <h3 className="font-semibold text-slate-900 text-sm tracking-tight">
                    {chart.title}
                  </h3>
                  {chart.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5">{chart.subtitle}</p>
                  )}
                </div>
                <div className="mt-4">
                  <ReportChart chart={chart} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <ReportSummaryTable
          title={data.table.title ?? "Detalle por registro"}
          columns={data.table.columns}
          rows={data.table.rows}
        />
        {data.secondaryTable && (
          <ReportSummaryTable
            title={data.secondaryTable.title ?? "Detalle adicional"}
            columns={data.secondaryTable.columns}
            rows={data.secondaryTable.rows}
          />
        )}
      </div>
    </div>
  );
}
