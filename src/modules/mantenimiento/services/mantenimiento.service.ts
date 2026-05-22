import {
  addManitasTrabajoAction,
  addTicketCommentAction,
  assignTicketAction,
  changeTicketStatusAction,
  createManitasAction,
  createTicketAction,
  deleteManitasAction,
  deleteManitasTrabajoAction,
  getManitasAction,
  getTicketAction,
  listAssignableManitasAction,
  listManitasAction,
  listTicketsAction,
  updateManitasAction,
  updateTicketAction,
  updateTicketPresupuestoAction,
  uploadManitasFotoAction,
  uploadTicketEvidenciaAction,
} from "@/app/actions/mantenimiento";
import type {
  AssignTicketFormValues,
  ManitasFormValues,
  ManitasTrabajoFormValues,
  TicketFormValues,
} from "@/shared/schemas/mantenimiento";
import type { ManitasFilters, TicketEstado, TicketFilters } from "../types";

export const mantenimientoService = {
  getTickets: (filters?: TicketFilters) => listTicketsAction(filters),
  getTicket: (id: string) => getTicketAction(id),
  createTicket: (input: TicketFormValues) => createTicketAction(input),
  updateTicket: (id: string, input: TicketFormValues) => updateTicketAction(id, input),
  changeStatus: (
    id: string,
    estado: TicketEstado,
    observacion?: string | null,
    costo?: number | null,
  ) => changeTicketStatusAction(id, estado, observacion, costo),
  assignTicket: (id: string, input: AssignTicketFormValues) => assignTicketAction(id, input),
  addComment: (id: string, contenido: string) => addTicketCommentAction(id, contenido),
  updatePresupuesto: (
    id: string,
    input: { presupuesto?: number | null; factura?: number | null; presupuesto_notas?: string | null },
  ) => updateTicketPresupuestoAction(id, input),
  uploadEvidencia: (id: string, formData: FormData) => uploadTicketEvidenciaAction(id, formData),

  getManitasList: (filters?: ManitasFilters) => listManitasAction(filters),
  getManitas: (id: string) => getManitasAction(id),
  getAssignableManitas: () => listAssignableManitasAction(),
  createManitas: (input: ManitasFormValues) => createManitasAction(input),
  updateManitas: (id: string, input: ManitasFormValues) => updateManitasAction(id, input),
  deleteManitas: (id: string) => deleteManitasAction(id),
  uploadFoto: (id: string, formData: FormData) => uploadManitasFotoAction(id, formData),
  addTrabajo: (id: string, input: ManitasTrabajoFormValues) => addManitasTrabajoAction(id, input),
  deleteTrabajo: (manitasId: string, trabajoId: string) =>
    deleteManitasTrabajoAction(manitasId, trabajoId),
};
