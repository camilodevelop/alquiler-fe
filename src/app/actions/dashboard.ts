"use server";

import { listContratosAction } from "@/app/actions/contratos";
import { listMovimientosAction } from "@/app/actions/finanzas";
import { listInquilinosAction } from "@/app/actions/inquilinos";
import { listTicketsAction } from "@/app/actions/mantenimiento";
import { listPropiedadesAction } from "@/app/actions/propiedades";
import { buildDashboardData } from "@/modules/dashboard/utils/build-dashboard";
import type { DashboardData } from "@/modules/dashboard/types";

const EMPTY_DASHBOARD: DashboardData = {
  stats: [],
  ingresosMensuales: [],
  resumenFinanciero: {
    ingresosTotales: "€0",
    gastosTotales: "€0",
    beneficioNeto: "€0",
    rentabilidadMedia: "0.0%",
  },
  propiedadesRecientes: [],
  pagosMora: { totalPendiente: "€0", count: 0, rows: [] },
  fechaActualizacion: new Date().toLocaleDateString("es-ES"),
};

export async function getDashboardDataAction(): Promise<{
  data: DashboardData;
  error?: string;
}> {
  const [propRes, inqRes, conRes, tickRes, movRes] = await Promise.all([
    listPropiedadesAction(),
    listInquilinosAction(),
    listContratosAction(),
    listTicketsAction(),
    listMovimientosAction(),
  ]);

  const error =
    propRes.error ??
    inqRes.error ??
    conRes.error ??
    tickRes.error ??
    movRes.error;

  if (error && !propRes.data.length && !movRes.data.length) {
    return { data: EMPTY_DASHBOARD, error };
  }

  const data = buildDashboardData({
    propiedades: propRes.data,
    inquilinos: inqRes.data,
    contratos: conRes.data,
    tickets: tickRes.data,
    movimientos: movRes.data,
  });

  return { data, error: error ?? undefined };
}
