import { getReporteTabAction, getReportesCatalogAction } from "@/app/actions/reportes";
import type { ReportFilters, ReportTabId } from "../types";

export const reportesService = {
  getCatalog: () => getReportesCatalogAction(),
  getTabData: (tab: ReportTabId, filters: ReportFilters) =>
    getReporteTabAction(tab, filters),
};
