import {
  createGastoAction,
  createIngresoAction,
  deleteMovimientoAction,
  getMovimientoAction,
  listContratosForFinanzasAction,
  listMovimientosAction,
  listPagosInquilinosAction,
  listTicketsForFinanzasAction,
  updateGastoAction,
  updateIngresoAction,
  uploadMovimientoComprobanteAction,
} from "@/app/actions/finanzas";
import type { GastoFormValues, IngresoFormValues } from "@/shared/schemas/finanzas";
import type { MovimientoFilters } from "../types";

export const finanzasService = {
  listMovimientos: (filters?: MovimientoFilters) => listMovimientosAction(filters),
  listPagosInquilinos: (propiedadId?: string) => listPagosInquilinosAction(propiedadId),
  getMovimiento: (id: string) => getMovimientoAction(id),
  createIngreso: (input: IngresoFormValues) => createIngresoAction(input),
  createGasto: (input: GastoFormValues) => createGastoAction(input),
  updateIngreso: (id: string, input: IngresoFormValues) => updateIngresoAction(id, input),
  updateGasto: (id: string, input: GastoFormValues) => updateGastoAction(id, input),
  deleteMovimiento: (id: string) => deleteMovimientoAction(id),
  uploadComprobante: (id: string, formData: FormData) =>
    uploadMovimientoComprobanteAction(id, formData),
  listContratos: (propiedadId?: string) => listContratosForFinanzasAction(propiedadId),
  listTickets: (propiedadId?: string) => listTicketsForFinanzasAction(propiedadId),
};
