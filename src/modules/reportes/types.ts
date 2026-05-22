import type { ReportFiltersInput } from "@/shared/schemas/reportes";
import type { ReportTabId } from "@/shared/schemas/reportes";

export type { ReportTabId };
export type ReportFilters = ReportFiltersInput;

export interface ReportKpi {
  id: string;
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}

export interface ChartPoint {
  name: string;
  value?: number;
  [key: string]: string | number | undefined;
}

export interface ReportTableColumn {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
}

export interface ReportTableRow {
  id: string;
  cells: Record<string, string | number>;
}

export interface ReportTabPayload {
  kpis: ReportKpi[];
  charts: ReportChartBlock[];
  table: {
    title?: string;
    columns: ReportTableColumn[];
    rows: ReportTableRow[];
  };
  secondaryTable?: {
    title?: string;
    columns: ReportTableColumn[];
    rows: ReportTableRow[];
  };
}

export interface ReportChartBlock {
  id: string;
  title: string;
  subtitle?: string;
  type: "bar" | "line" | "donut" | "hbar" | "grouped-bar";
  data: ChartPoint[];
  dataKeys?: { primary: string; secondary?: string };
  colors?: string[];
  layout?: "horizontal";
}

export interface ReportesCatalog {
  propiedades: { id: string; titulo: string }[];
  inquilinos: { id: string; nombre: string }[];
  manitas: { id: string; nombre: string }[];
}
