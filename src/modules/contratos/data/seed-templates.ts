import type { ContractTemplate } from "../types";
import { DEFAULT_PLANTILLA_HTML } from "../utils/defaults";

const now = new Date().toISOString();

function tpl(
  partial: Pick<ContractTemplate, "id" | "nombre" | "descripcion"> & { plantilla_html?: string },
): ContractTemplate {
  return {
    plantilla_html: DEFAULT_PLANTILLA_HTML,
    activo: true,
    created_at: now,
    updated_at: now,
    ...partial,
  };
}

export function createSeedTemplates(): ContractTemplate[] {
  const habitacionHtml = DEFAULT_PLANTILLA_HTML.replace(
    "<h1>Contrato de arrendamiento</h1>",
    "<h1>Contrato de alquiler de habitación</h1>",
  );

  return [
    tpl({
      id: "tpl-vivienda",
      nombre: "Contrato vivienda tradicional",
      descripcion: "Arrendamiento de vivienda completa (Ley de Arrendamientos Urbanos).",
    }),
    tpl({
      id: "tpl-habitacion",
      nombre: "Contrato habitación",
      descripcion: "Alquiler de habitación en vivienda compartida.",
      plantilla_html: habitacionHtml,
    }),
    tpl({
      id: "tpl-temporal",
      nombre: "Contrato temporal",
      descripcion: "Estancia de corta o media duración con condiciones específicas.",
      plantilla_html: DEFAULT_PLANTILLA_HTML.replace(
        "arrendamiento",
        "arrendamiento temporal",
      ),
    }),
    tpl({
      id: "tpl-comercial",
      nombre: "Contrato comercial",
      descripcion: "Local u oficina con cláusulas adaptadas a uso comercial.",
      plantilla_html: DEFAULT_PLANTILLA_HTML.replace(
        "arrendamiento",
        "arrendamiento de local comercial",
      ),
    }),
  ];
}
