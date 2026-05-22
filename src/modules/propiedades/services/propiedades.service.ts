import {
  createPropiedadAction,
  deletePropiedadAction,
  getPropiedadAction,
  listPropiedadesAction,
  listPropiedadesCiudadesAction,
  updatePropiedadAction,
  uploadFotoPropiedadAction,
} from "@/app/actions/propiedades";
import type { PropiedadFilters, Propiedad } from "../types";
import type { PropiedadFormValues } from "@/shared/schemas/propiedad";

/** Capa de servicio del módulo — delega en server actions */
export const propiedadesService = {
  list: (filters?: PropiedadFilters) => listPropiedadesAction(filters),
  listCiudades: () => listPropiedadesCiudadesAction(),
  getById: (id: string) => getPropiedadAction(id),
  create: (values: PropiedadFormValues) => createPropiedadAction(values),
  update: (id: string, values: PropiedadFormValues) =>
    updatePropiedadAction(id, values),
  remove: (id: string) => deletePropiedadAction(id),
  uploadFoto: (propiedadId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return uploadFotoPropiedadAction(propiedadId, formData);
  },
};

export type { Propiedad, PropiedadFilters };
