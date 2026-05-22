import type { Contract } from "@/modules/contratos/types";
import type { MovimientoFinanciero } from "@/modules/finanzas/types";
import type { Inquilino } from "@/modules/inquilinos/types";
import type { TicketMantenimiento } from "@/modules/mantenimiento/types";
import type { EstadoPropiedad, Propiedad } from "@/modules/propiedades/types";

export type DashboardTrendType = "positive" | "neutral" | "warning";

export interface DashboardStat {
  id: string;
  title: string;
  value: string;
  trend: string;
  trendType: DashboardTrendType;
}

export interface DashboardIngresoMes {
  mes: string;
  importe: number;
}

export interface DashboardPropiedadRow {
  id: string;
  direccion: string;
  inquilino: string;
  renta: string;
  estado: EstadoPropiedad;
  proximo_cobro: string;
}

export interface DashboardMoraRow {
  id: string;
  propiedad_id: string;
  inquilino_id: string | null;
  propiedad: string;
  inquilino: string;
  concepto: string;
  periodo: string;
  importe: number;
  importeLabel: string;
  diasMora: number;
  estadoLabel: string;
}

export interface DashboardPagosMora {
  totalPendiente: string;
  count: number;
  rows: DashboardMoraRow[];
}

export interface DashboardData {
  stats: DashboardStat[];
  ingresosMensuales: DashboardIngresoMes[];
  resumenFinanciero: {
    ingresosTotales: string;
    gastosTotales: string;
    beneficioNeto: string;
    rentabilidadMedia: string;
  };
  propiedadesRecientes: DashboardPropiedadRow[];
  pagosMora: DashboardPagosMora;
  fechaActualizacion: string;
}

export interface DashboardSnapshot {
  propiedades: Propiedad[];
  inquilinos: Inquilino[];
  contratos: Contract[];
  tickets: TicketMantenimiento[];
  movimientos: MovimientoFinanciero[];
}
