import type { PropiedadWizardStep } from "../../types";

export const WIZARD_STEP_META: Record<
  PropiedadWizardStep,
  { title: string; description: string }
> = {
  1: {
    title: "Información básica",
    description: "Nombre, descripción y tipo de inmueble para identificar la propiedad.",
  },
  2: {
    title: "Tipo de renta",
    description: "Define el modelo de alquiler y los datos que aplican a ese tipo.",
  },
  3: {
    title: "Ubicación",
    description: "Dirección completa para contratos, filtros por ciudad y comunicaciones.",
  },
  4: {
    title: "Precio y estado",
    description: "Renta mensual de referencia y situación actual del inmueble.",
  },
  5: {
    title: "Foto principal",
    description: "Imagen destacada para el listado y la ficha de la propiedad.",
  },
};
