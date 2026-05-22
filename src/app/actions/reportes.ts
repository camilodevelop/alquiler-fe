"use server";

import { listContratosAction } from "@/app/actions/contratos";
import { listMovimientosAction } from "@/app/actions/finanzas";
import { listInquilinosAction } from "@/app/actions/inquilinos";
import { listManitasAction, listTicketsAction } from "@/app/actions/mantenimiento";
import { listPropiedadesAction } from "@/app/actions/propiedades";
import { sortPropiedadesByTitulo } from "@/modules/propiedades/utils/sort";
import { buildReportTab } from "@/modules/reportes/utils/build-index";
import { defaultReportDateRange } from "@/modules/reportes/utils/dates";
import type { ReportesSnapshot } from "@/modules/reportes/utils/snapshot";
import type { ReportesCatalog, ReportFilters, ReportTabId, ReportTabPayload } from "@/modules/reportes/types";
import { ReportFiltersSchema, ReportTabIdSchema } from "@/shared/schemas/reportes";

async function loadSnapshot(filters: ReportFilters): Promise<ReportesSnapshot> {
  const range = {
    fecha_desde: filters.fecha_desde,
    fecha_hasta: filters.fecha_hasta,
  };

  const [propRes, inqRes, conRes, tickRes, movRes, manRes] = await Promise.all([
    listPropiedadesAction(),
    listInquilinosAction({ propiedad_id: filters.propiedad_id }),
    listContratosAction({
      propiedad_id: filters.propiedad_id,
      inquilino_id: filters.inquilino_id,
    }),
    listTicketsAction({
      propiedad_id: filters.propiedad_id,
      manitas_id: filters.manitas_id,
      fecha_desde: range.fecha_desde,
      fecha_hasta: range.fecha_hasta,
    }),
    listMovimientosAction({
      propiedad_id: filters.propiedad_id,
      inquilino_id: filters.inquilino_id,
      fecha_desde: range.fecha_desde,
      fecha_hasta: range.fecha_hasta,
    }),
    listManitasAction(),
  ]);

  return {
    propiedades: propRes.data,
    inquilinos: inqRes.data,
    contratos: conRes.data,
    tickets: tickRes.data,
    movimientos: movRes.data,
    manitas: manRes.data,
  };
}

export async function getReportesCatalogAction(): Promise<{
  data: ReportesCatalog;
  error?: string;
}> {
  const [propRes, inqRes, manRes] = await Promise.all([
    listPropiedadesAction(),
    listInquilinosAction(),
    listManitasAction(),
  ]);

  if (propRes.error || inqRes.error || manRes.error) {
    return {
      data: { propiedades: [], inquilinos: [], manitas: [] },
      error: propRes.error ?? inqRes.error ?? manRes.error,
    };
  }

  return {
    data: {
      propiedades: sortPropiedadesByTitulo(propRes.data).map((p) => ({
        id: p.id,
        titulo: p.titulo,
      })),
      inquilinos: inqRes.data.map((i) => ({
        id: i.id,
        nombre: `${i.nombres} ${i.apellidos}`.trim(),
      })),
      manitas: manRes.data.map((m) => ({
        id: m.id,
        nombre: `${m.nombres} ${m.apellidos}`.trim(),
      })),
    },
  };
}

export async function getReporteTabAction(
  tab: string,
  filters: ReportFilters = {},
): Promise<{ data: ReportTabPayload | null; error?: string }> {
  const tabParsed = ReportTabIdSchema.safeParse(tab);
  if (!tabParsed.success) {
    return { data: null, error: "Pestaña de reporte no válida" };
  }

  const merged: ReportFilters = {
    ...defaultReportDateRange(),
    ...ReportFiltersSchema.parse(filters),
  };

  const snapshot = await loadSnapshot(merged);
  const data = buildReportTab(tabParsed.data, snapshot, merged);
  return { data };
}
