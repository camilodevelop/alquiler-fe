import type { EChartsOption } from "echarts";
import { CHART_COLORS } from "../../constants";
import type { ReportChartBlock } from "../../types";
import { formatEuro } from "../../utils/format";

function isMoneyChart(chart: ReportChartBlock): boolean {
  return (
    chart.id.includes("ing") ||
    chart.id.includes("gas") ||
    chart.id.includes("saldo") ||
    chart.id.includes("valor") ||
    chart.id.includes("rent") ||
    chart.id.includes("pend") ||
    chart.type === "grouped-bar"
  );
}

function fmtAxis(value: number, money?: boolean): string {
  if (money) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M €`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k €`;
    return `${value} €`;
  }
  return String(value);
}

const baseGrid = { left: 12, right: 16, top: 48, bottom: 8, containLabel: true };

const axisStyle = {
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: { color: "#64748b", fontSize: 11 },
  splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" as const } },
};

export function buildChartOption(chart: ReportChartBlock): EChartsOption {
  const colors = chart.colors ?? CHART_COLORS;
  const money = isMoneyChart(chart);
  const data =
    chart.type === "grouped-bar" || chart.type === "line"
      ? chart.data
      : chart.data.filter((d) => (d.value ?? 0) > 0);

  if (data.length === 0) {
    return {
      title: {
        text: "Sin datos en el periodo",
        left: "center",
        top: "center",
        textStyle: { color: "#94a3b8", fontSize: 13, fontWeight: 400 },
      },
    };
  }

  if (chart.type === "donut") {
    return {
      color: colors,
      tooltip: {
        trigger: "item",
        backgroundColor: "#fff",
        borderColor: "#e2e8f0",
        textStyle: { color: "#334155", fontSize: 12 },
        formatter: (params) => {
          const p = Array.isArray(params) ? params[0] : params;
          const val = Number(p.value ?? 0);
          const pct = Number((p as { percent?: number }).percent ?? 0);
          return `<b>${p.name}</b><br/>${money ? formatEuro(val) : val} (${pct.toFixed(1)}%)`;
        },
      },
      legend: {
        orient: "vertical",
        right: 8,
        top: "center",
        textStyle: { fontSize: 11, color: "#64748b" },
      },
      series: [
        {
          type: "pie",
          radius: ["42%", "68%"],
          center: ["38%", "50%"],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 12, fontWeight: 600 },
            scaleSize: 6,
          },
          data: data.map((d) => ({ name: d.name, value: d.value ?? 0 })),
        },
      ],
    };
  }

  if (chart.type === "line") {
    const lineColor = colors[0] ?? CHART_COLORS[1];
    return {
      color: colors,
      grid: baseGrid,
      tooltip: {
        trigger: "axis",
        backgroundColor: "#fff",
        borderColor: "#e2e8f0",
        valueFormatter: (v) => (money ? formatEuro(Number(v)) : String(v)),
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.name),
        ...axisStyle,
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        ...axisStyle,
        axisLabel: { ...axisStyle.axisLabel, formatter: (v: number) => fmtAxis(v, money) },
      },
      series: [
        {
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 7,
          lineStyle: { width: 3, color: lineColor },
          itemStyle: { color: lineColor },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${lineColor}40` },
                { offset: 1, color: `${lineColor}05` },
              ],
            },
          },
          data: data.map((d) => d.value ?? 0),
        },
      ],
    };
  }

  if (chart.type === "hbar") {
    const sorted = [...data].sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
    return {
      color: colors,
      grid: { ...baseGrid, left: 8 },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        valueFormatter: (v) => (money ? formatEuro(Number(v)) : String(v)),
      },
      xAxis: {
        type: "value",
        ...axisStyle,
        axisLabel: { ...axisStyle.axisLabel, formatter: (v: number) => fmtAxis(v, money) },
      },
      yAxis: {
        type: "category",
        data: sorted.map((d) => d.name),
        ...axisStyle,
        splitLine: { show: false },
        axisLabel: { ...axisStyle.axisLabel, width: 100, overflow: "truncate" },
      },
      series: [
        {
          type: "bar",
          data: sorted.map((d, i) => ({
            value: d.value ?? 0,
            itemStyle: {
              color: colors[i % colors.length],
              borderRadius: [0, 6, 6, 0],
            },
          })),
          barMaxWidth: 22,
        },
      ],
    };
  }

  const primary = chart.dataKeys?.primary ?? "value";
  const secondary = chart.dataKeys?.secondary;
  const isGrouped = chart.type === "grouped-bar" && secondary;

  if (isGrouped) {
    return {
      color: colors,
      grid: baseGrid,
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        valueFormatter: (v) => formatEuro(Number(v)),
      },
      legend: {
        top: 4,
        textStyle: { fontSize: 11, color: "#64748b" },
        data: ["Ingresos", "Gastos"],
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.name),
        ...axisStyle,
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        ...axisStyle,
        axisLabel: { ...axisStyle.axisLabel, formatter: (v: number) => fmtAxis(v, true) },
      },
      series: [
        {
          name: "Ingresos",
          type: "bar",
          data: data.map((d) => Number(d[primary] ?? 0)),
          itemStyle: { color: colors[0], borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 28,
        },
        {
          name: "Gastos",
          type: "bar",
          data: data.map((d) => Number(d[secondary] ?? 0)),
          itemStyle: { color: colors[1] ?? "#f59e0b", borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 28,
        },
      ],
    };
  }

  return {
    color: colors,
    grid: baseGrid,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v) => (money ? formatEuro(Number(v)) : String(v)),
    },
    xAxis: {
      type: "category",
      data: data.map((d) => d.name),
      ...axisStyle,
      splitLine: { show: false },
      axisLabel: { ...axisStyle.axisLabel, rotate: data.length > 6 ? 24 : 0 },
    },
    yAxis: {
      type: "value",
      ...axisStyle,
      axisLabel: { ...axisStyle.axisLabel, formatter: (v: number) => fmtAxis(v, money) },
    },
    series: [
      {
        type: "bar",
        data: data.map((d, i) => ({
          value: d.value ?? 0,
          itemStyle: {
            color: colors[i % colors.length],
            borderRadius: [6, 6, 0, 0],
          },
        })),
        barMaxWidth: 36,
      },
    ],
  };
}

export function chartHeight(chart: ReportChartBlock): number {
  if (chart.type === "hbar") {
    return Math.max(280, Math.min(420, chart.data.length * 38 + 80));
  }
  return chart.type === "grouped-bar" ? 320 : 300;
}
