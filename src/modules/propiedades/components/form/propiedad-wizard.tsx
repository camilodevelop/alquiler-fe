"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { ZodIssue } from "zod";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui";
import {
  PropiedadFormSchema,
  PropiedadStep1Schema,
  PropiedadStep2Schema,
  PropiedadStep3Schema,
  PropiedadStep4Schema,
  type PropiedadFormValues,
} from "@/shared/schemas/propiedad";
import { propiedadesService } from "../../services/propiedades.service";
import { PROPIEDAD_FORM_DEFAULTS } from "../../utils/defaults";
import type { PropiedadWizardStep } from "../../types";
import { StepIndicator } from "./step-indicator";
import { WizardStepHeader } from "./wizard-step-header";
import { StepBasica } from "./steps/step-basica";
import { StepTipoRenta } from "./steps/step-tipo-renta";
import { StepUbicacion } from "./steps/step-ubicacion";
import { StepPrecioEstado } from "./steps/step-precio-estado";
import { StepFoto } from "./steps/step-foto";

interface PropiedadWizardProps {
  mode: "create" | "edit";
  propiedadId?: string;
  initialValues?: PropiedadFormValues;
  existingFotoUrl?: string | null;
}

const STEP_FIELDS: Record<PropiedadWizardStep, (keyof PropiedadFormValues)[]> = {
  1: ["titulo", "descripcion", "tipo_propiedad"],
  2: ["tipo_renta", "habitaciones", "banos", "metros_cuadrados", "duracion_minima_dias"],
  3: ["direccion", "ciudad", "codigo_postal"],
  4: ["precio_mes", "estado"],
  5: [],
};

export function PropiedadWizard({
  mode,
  propiedadId,
  initialValues,
  existingFotoUrl,
}: PropiedadWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<PropiedadWizardStep>(1);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PropiedadFormValues>({
    defaultValues: initialValues ?? PROPIEDAD_FORM_DEFAULTS,
    mode: "onTouched",
  });

  const { register, handleSubmit, watch, setError, clearErrors, formState: { errors } } = form;

  const applyZodIssues = useCallback(
    (issues: ZodIssue[]) => {
      issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string") {
          setError(field as keyof PropiedadFormValues, {
            type: "manual",
            message: issue.message,
          });
        }
      });
    },
    [setError],
  );

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const values = watch();
    STEP_FIELDS[step].forEach((field) => clearErrors(field));

    if (step === 1) {
      const result = PropiedadStep1Schema.safeParse(values);
      if (!result.success) {
        applyZodIssues(result.error.issues);
        return false;
      }
      return true;
    }

    if (step === 2) {
      const result = PropiedadStep2Schema.safeParse(values);
      if (!result.success) {
        applyZodIssues(result.error.issues);
        return false;
      }
      return true;
    }

    if (step === 3) {
      const result = PropiedadStep3Schema.safeParse(values);
      if (!result.success) {
        applyZodIssues(result.error.issues);
        return false;
      }
      return true;
    }

    if (step === 4) {
      const result = PropiedadStep4Schema.safeParse(values);
      if (!result.success) {
        applyZodIssues(result.error.issues);
        return false;
      }
      return true;
    }

    return true;
  }, [step, watch, clearErrors, applyZodIssues]);

  const goNext = async () => {
    setStepError(null);
    const valid = await validateCurrentStep();
    if (!valid) {
      setStepError("Revisa los campos marcados antes de continuar.");
      return;
    }
    if (step < 5) setStep((s) => (s + 1) as PropiedadWizardStep);
  };

  const goBack = () => {
    setStepError(null);
    if (step > 1) setStep((s) => (s - 1) as PropiedadWizardStep);
  };

  const goToStep = (target: PropiedadWizardStep) => {
    if (target === step) return;
    setStepError(null);
    setStep(target);
  };

  const handleFotoSelect = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFotoFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < 5) {
      void goNext();
      return;
    }
    handleSaveClick();
  };

  const savePropiedad = async (rawValues: PropiedadFormValues) => {
    setSubmitError(null);
    setStepError(null);

    const parsed = PropiedadFormSchema.safeParse(rawValues);
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues);
      setStepError("Revisa los datos del formulario antes de guardar.");
      return;
    }

    const values = parsed.data;
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const { data, error } = await propiedadesService.create(values);
        if (error || !data) {
          setSubmitError(error ?? "Error al crear la propiedad");
          return;
        }

        const targetId = data.id;

        if (fotoFile) {
          const foto = await propiedadesService.uploadFoto(targetId, fotoFile);
          if (foto.error) {
            setSubmitError(
              `Propiedad creada, pero la foto no se guardó: ${foto.error}. Puedes subirla desde editar.`,
            );
            router.replace(`/dashboard/propiedades/${targetId}/editar`);
            return;
          }
        }

        router.replace(`/dashboard/propiedades/${targetId}`);
        return;
      }

      if (!propiedadId) {
        setSubmitError("No se encontró la propiedad a editar.");
        return;
      }

      const { data, error } = await propiedadesService.update(propiedadId, values);
      if (error || !data) {
        setSubmitError(error ?? "Error al actualizar la propiedad");
        return;
      }

      if (fotoFile) {
        const foto = await propiedadesService.uploadFoto(propiedadId, fotoFile);
        if (foto.error) {
          setSubmitError(`Los datos se guardaron, pero la foto falló: ${foto.error}`);
          return;
        }
      }

      router.replace(`/dashboard/propiedades/${propiedadId}`);
    } catch {
      setSubmitError("Error inesperado al guardar. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveClick = () => {
    void handleSubmit(savePropiedad)();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(220px,260px)_1fr] gap-6 lg:gap-8 items-start">
      <aside className="lg:pt-2">
        <StepIndicator currentStep={step} onStepClick={goToStep} />
      </aside>

      <div className="min-w-0">
        <form
          onSubmit={handleFormSubmit}
          noValidate
          className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <WizardStepHeader step={step} />

            <div className="animate-fade-in-up" key={step}>
              {step === 1 && <StepBasica register={register} errors={errors} watch={watch} />}
              {step === 2 && (
                <StepTipoRenta register={register} errors={errors} watch={watch} />
              )}
              {step === 3 && <StepUbicacion register={register} errors={errors} />}
              {step === 4 && <StepPrecioEstado register={register} errors={errors} watch={watch} />}
              {step === 5 && (
                <StepFoto
                  previewUrl={previewUrl}
                  existingUrl={existingFotoUrl}
                  onFileSelect={handleFotoSelect}
                />
              )}
            </div>

            {stepError ? (
              <div
                className="mt-6 rounded-xl bg-amber-50 border border-amber-200/80 px-4 py-3 text-sm text-amber-900"
                role="alert"
              >
                {stepError}
              </div>
            ) : null}

            {submitError ? (
              <div
                className="mt-4 rounded-xl bg-red-50 border border-red-200/80 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {submitError}
              </div>
            ) : null}
          </div>

          <div className="sticky bottom-0 flex items-center justify-between gap-3 px-5 py-4 sm:px-8 border-t border-gray-100 bg-gray-50/90 backdrop-blur-sm">
            <Button
              type="button"
              variant="secondary"
              onClick={goBack}
              disabled={step === 1 || isSubmitting}
              className="gap-1.5 min-w-[110px]"
            >
              <ArrowLeft size={16} />
              Anterior
            </Button>

            {step < 5 ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => void goNext()}
                className="gap-1.5 shadow-md shadow-brand-600/15 min-w-[120px]"
              >
                Siguiente
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
                onClick={handleSaveClick}
                className="gap-1.5 shadow-md shadow-brand-600/15 min-w-[160px]"
              >
                <Save size={16} />
                {mode === "create" ? "Crear propiedad" : "Guardar cambios"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
