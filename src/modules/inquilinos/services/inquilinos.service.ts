import type { InquilinoFormValues } from "@/shared/schemas/inquilino";
import {
  changeInquilinoStatusAction,
  createInquilinoAction,
  deactivateInquilinoAction,
  getInquilinoAction,
  getUnidadesOcupadasAction,
  listInquilinosAction,
  updateInquilinoAction,
  updateInquilinoDocumentoStatusAction,
  uploadInquilinoDocumentoAction,
} from "@/app/actions/inquilinos";
import type {
  EstadoDocumentoInquilino,
  Inquilino,
  InquilinoFilters,
  InquilinoScoring,
  InquilinoStatus,
  TipoDocumentoInquilino,
} from "../types";

/** Servicio de inquilinos — delega en server actions (Supabase) */
export const inquilinosService = {
  getTenants: (filters?: InquilinoFilters) => listInquilinosAction(filters),

  getTenantById: (id: string) => getInquilinoAction(id),

  createTenant: (payload: InquilinoFormValues) => createInquilinoAction(payload),

  updateTenant: (id: string, payload: InquilinoFormValues) =>
    updateInquilinoAction(id, payload),

  deleteTenant: (id: string) => deactivateInquilinoAction(id),

  changeTenantStatus: (id: string, status: InquilinoStatus) =>
    changeInquilinoStatusAction(id, status),

  uploadTenantDocument: (
    tenantId: string,
    tipo: TipoDocumentoInquilino,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo", tipo);
    return uploadInquilinoDocumentoAction(tenantId, formData);
  },

  updateDocumentStatus: (
    tenantId: string,
    documentId: string,
    status: EstadoDocumentoInquilino,
    observaciones?: string,
  ) => updateInquilinoDocumentoStatusAction(tenantId, documentId, status, observaciones),

  getTenantScoring: async (tenantId: string) => {
    const { data } = await getInquilinoAction(tenantId);
    return data?.scoring ? { data: data.scoring } : { error: "Sin scoring" };
  },

  updateTenantScoring: async (
    tenantId: string,
    payload: Partial<InquilinoScoring> & { nivel: InquilinoScoring["nivel"] },
  ) => {
    const { inquilinoToFormValues } = await import("../utils/defaults");
    const { data } = await getInquilinoAction(tenantId);
    if (!data) return { error: "Inquilino no encontrado" };
    const base = inquilinoToFormValues(data);
    const merged = {
      ...base.scoring!,
      ...payload,
      nivel: payload.nivel,
    };
    const result = await updateInquilinoAction(tenantId, {
      ...base,
      scoring: merged,
    });
    return result.data?.scoring
      ? { data: result.data.scoring }
      : { error: result.error };
  },

  getUnidades: async (
    propiedadId: string,
    habitaciones: number,
    excludeInquilinoId?: string,
  ) => {
    const { data: occupied } = await getUnidadesOcupadasAction(propiedadId, excludeInquilinoId);
    const count = Math.max(habitaciones, 1);
    return Array.from({ length: count }, (_, i) => {
      const id = `hab-${i + 1}`;
      return {
        id,
        nombre: `Habitación ${i + 1}`,
        disponible: !(occupied ?? []).includes(id),
      };
    });
  },
};

export type { Inquilino as Tenant };
