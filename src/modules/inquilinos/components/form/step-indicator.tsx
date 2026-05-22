"use client";

import { Check } from "lucide-react";
import { WIZARD_STEPS } from "../../constants";
import type { InquilinoWizardStep } from "../../types";

interface StepIndicatorProps {
  currentStep: InquilinoWizardStep;
  onStepClick?: (step: InquilinoWizardStep) => void;
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const progress = (currentStep / WIZARD_STEPS.length) * 100;
  return (
    <nav aria-label="Progreso del formulario" className="lg:sticky lg:top-6">
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progreso</span>
          <span className="text-brand-700 font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-brand-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={WIZARD_STEPS.length}
          />
        </div>
      </div>
      <ol className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 pb-1 lg:pb-0 snap-x">
        {WIZARD_STEPS.map((s) => {
          const done = s.id < currentStep;
          const active = s.id === currentStep;
          const stepId = s.id as InquilinoWizardStep;

          return (
            <li key={s.id} className="shrink-0 lg:shrink snap-start min-w-[120px] lg:min-w-0">
              <button
                type="button"
                onClick={() => onStepClick?.(stepId)}
                disabled={!onStepClick}
                aria-current={active ? "step" : undefined}
                aria-label={`Ir al paso ${s.id}: ${s.label}`}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-left transition-colors ${
                  onStepClick
                    ? "cursor-pointer hover:bg-brand-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    : "cursor-default"
                } ${
                  active
                    ? "bg-brand-50 border border-brand-200"
                    : done
                      ? "bg-white border border-gray-200 hover:border-brand-200/60"
                      : "text-gray-500 border border-transparent hover:border-gray-200"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    done
                      ? "bg-brand-600 text-white"
                      : active
                        ? "bg-brand-600 text-white ring-4 ring-brand-100"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {done ? <Check size={12} /> : s.id}
                </span>
                <span className={`truncate ${active ? "font-semibold text-gray-900" : done ? "font-medium text-gray-700" : ""}`}>
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
