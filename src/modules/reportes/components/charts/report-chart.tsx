"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { ReportChartBlock } from "../../types";
import { buildChartOption, chartHeight } from "./chart-options";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  ),
});

export function ReportChart({ chart }: { chart: ReportChartBlock }) {
  const option = useMemo(() => buildChartOption(chart), [chart]);
  const height = useMemo(() => chartHeight(chart), [chart]);

  const hasData =
    chart.type === "grouped-bar"
      ? chart.data.length > 0
      : chart.type === "line"
        ? chart.data.length > 0
        : chart.data.some((d) => (d.value ?? 0) > 0);

  if (!hasData) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-xl bg-slate-50/80 border border-dashed border-slate-200">
        <p className="text-sm text-slate-400">Sin datos en el periodo seleccionado</p>
      </div>
    );
  }

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      opts={{ renderer: "canvas" }}
      notMerge
      lazyUpdate
    />
  );
}
