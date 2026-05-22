"use client";

import { Check } from "lucide-react";
import { WIZARD_STEPS } from "../../constants";
import type { PropiedadWizardStep } from "../../types";

interface StepIndicatorProps {
  currentStep: PropiedadWizardStep;
  onStepClick?: (step: PropiedadWizardStep) => void;
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const progress = (currentStep / WIZARD_STEPS.length) * 100;

  return (
    <nav aria-label="Progreso del formulario" className="lg:sticky lg:top-6">
      <div className="mb-5 lg:mb-6">
        <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
          <span>Progreso</span>
          <span className="text-brand-700">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={WIZARD_STEPS.length}
          />
        </div>
      </div>

      <ol className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0 snap-x">
        {WIZARD_STEPS.map((step) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;

          const stepId = step.id as PropiedadWizardStep;

          return (
            <li key={step.id} className="shrink-0 lg:shrink snap-start min-w-[140px] lg:min-w-0">
              <button
                type="button"
                onClick={() => onStepClick?.(stepId)}
                disabled={!onStepClick}
                aria-current={active ? "step" : undefined}
                aria-label={`Ir al paso ${step.id}: ${step.label}`}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 lg:px-3.5 lg:py-3 text-left transition-colors ${
                  onStepClick ? "cursor-pointer hover:bg-brand-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2" : "cursor-default"
                } ${
                  active
                    ? "bg-brand-50 border border-brand-200/80 shadow-sm"
                    : done
                      ? "bg-white border border-gray-200/80 hover:border-brand-200/60"
                      : "bg-gray-50/80 border border-transparent hover:border-gray-200"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    done
                      ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                      : active
                        ? "bg-brand-600 text-white ring-4 ring-brand-100"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {done ? <Check size={14} strokeWidth={2.5} /> : step.id}
                </span>
                <span className="min-w-0 hidden sm:block lg:block">
                  <span
                    className={`block text-sm truncate ${
                      active ? "font-semibold text-gray-900" : done ? "font-medium text-gray-700" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                  {active ? (
                    <span className="block text-[10px] text-brand-700 font-medium mt-0.5">En curso</span>
                  ) : done ? (
                    <span className="block text-[10px] text-gray-400 mt-0.5">Completado</span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
