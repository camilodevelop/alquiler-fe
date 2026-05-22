import type { InquilinoWizardStep } from "../../types";

export const WIZARD_STEP_META: Record<InquilinoWizardStep, { title: string; description: string }> = {
  1: { title: "Información personal", description: "Datos de identificación y contacto del inquilino." },
  2: { title: "Laboral y financiera", description: "Ocupación, ingresos y referencias laborales." },
  3: { title: "Estado del inquilino", description: "Ciclo de vida del candidato. La vinculación al inmueble se hace con un contrato." },
  4: { title: "Documentos", description: "Carga documentación para revisión (mock en MVP)." },
  5: { title: "Referencias", description: "Referencias personales y de arrendadores anteriores." },
  6: { title: "Scoring inicial", description: "Evaluación manual — estructura preparada para IA futura." },
};
