import {
  activateContratoAction,
  cancelContratoAction,
  createContratoAction,
  createContratoTipoAction,
  finalizeContratoAction,
  getContratoAction,
  getContratoTipoAction,
  getOccupiedPropertyIdsAction,
  listContratoTiposAction,
  listContratosAction,
  sendContratoToSignatureAction,
  signContratoAction,
  toggleContratoTipoActiveAction,
  updateContratoAction,
  updateContratoTipoAction,
} from "@/app/actions/contratos";
import type {
  Contract,
  ContractFilters,
  ContractFormInput,
  ContractListItem,
  ContractTemplate,
  SignatureRole,
  TemplateFormInput,
} from "../types";
import { filterContracts, toListItem } from "../utils/filters";
import type { ContractFormValues } from "@/shared/schemas/contrato";

/**
 * Servicio de contratos — delega en server actions (Supabase).
 */
export const contractService = {
  async getContracts(filters: ContractFilters = {}): Promise<{
    data: ContractListItem[];
    error?: string;
  }> {
    const { data, error } = await listContratosAction(filters);
    return {
      data: (data ?? []).map(toListItem),
      error,
    };
  },

  async getContractById(id: string): Promise<{ data: Contract | null; error?: string }> {
    return getContratoAction(id);
  },

  async createContract(input: ContractFormInput) {
    return createContratoAction(input as ContractFormValues);
  },

  async updateContract(id: string, input: ContractFormInput) {
    return updateContratoAction(id, input as ContractFormValues);
  },

  sendToSignature(id: string) {
    return sendContratoToSignatureAction(id);
  },

  signContract(id: string, rol: SignatureRole, firmanteNombre: string) {
    return signContratoAction(id, rol, firmanteNombre);
  },

  activateContract(id: string) {
    return activateContratoAction(id);
  },

  finalizeContract(id: string) {
    return finalizeContratoAction(id);
  },

  cancelContract(id: string) {
    return cancelContratoAction(id);
  },

  async getOccupiedPropertyIds(): Promise<string[]> {
    const { data } = await getOccupiedPropertyIdsAction();
    return data ?? [];
  },

  async getTemplates(activeOnly = false): Promise<{
    data: ContractTemplate[];
    error?: string;
  }> {
    return listContratoTiposAction(activeOnly);
  },

  getTemplateById(id: string) {
    return getContratoTipoAction(id);
  },

  createTemplate(input: TemplateFormInput) {
    return createContratoTipoAction(input);
  },

  updateTemplate(id: string, input: Partial<TemplateFormInput>) {
    return updateContratoTipoAction(id, input);
  },

  toggleTemplateActive(id: string) {
    return toggleContratoTipoActiveAction(id);
  },
};

export { contractService as ContractService };
