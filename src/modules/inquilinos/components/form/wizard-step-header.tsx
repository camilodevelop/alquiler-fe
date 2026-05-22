import type { InquilinoWizardStep } from "../../types";
import { WIZARD_STEP_META } from "./wizard-meta";

export function WizardStepHeader({ step }: { step: InquilinoWizardStep }) {
  const m = WIZARD_STEP_META[step];
  return (
    <div className="mb-6 pb-6 border-b border-gray-100">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-1">Paso {step} de 6</p>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{m.title}</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-xl">{m.description}</p>
    </div>
  );
}
