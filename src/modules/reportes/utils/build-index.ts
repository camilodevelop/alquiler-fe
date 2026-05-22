import type { ReportTabId, ReportTabPayload } from "../types";
import type { ReportFilters } from "../types";
import { buildContabilidadReport } from "./build-contabilidad";
import { buildContratosReport } from "./build-contratos";
import { buildGeneralReport } from "./build-general";
import { buildInquilinosReport } from "./build-inquilinos";
import { buildMantenimientoReport } from "./build-mantenimiento";
import { buildPropiedadesReport } from "./build-propiedades";
import type { ReportesSnapshot } from "./snapshot";

export function buildReportTab(
  tab: ReportTabId,
  snapshot: ReportesSnapshot,
  filters: ReportFilters,
): ReportTabPayload {
  switch (tab) {
    case "general":
      return buildGeneralReport(snapshot, filters);
    case "propiedades":
      return buildPropiedadesReport(snapshot, filters);
    case "inquilinos":
      return buildInquilinosReport(snapshot, filters);
    case "contratos":
      return buildContratosReport(snapshot, filters);
    case "mantenimiento":
      return buildMantenimientoReport(snapshot, filters);
    case "contabilidad":
      return buildContabilidadReport(snapshot, filters);
    default:
      return buildGeneralReport(snapshot, filters);
  }
}
