import type { PropiedadWizardStep } from "../../types";
import { WIZARD_STEP_META } from "./wizard-meta";

interface WizardStepHeaderProps {
  step: PropiedadWizardStep;
}

export function WizardStepHeader({ step }: WizardStepHeaderProps) {
  const meta = WIZARD_STEP_META[step];

  return (
    <div className="mb-6 sm:mb-8 pb-6 border-b border-gray-100">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-1">
        Paso {step} de 5
      </p>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{meta.title}</h2>
      <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-xl">{meta.description}</p>
    </div>
  );
}
