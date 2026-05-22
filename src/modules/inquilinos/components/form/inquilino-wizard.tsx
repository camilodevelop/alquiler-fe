"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { ZodIssue } from "zod";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui";
import {
  InquilinoFormSchema,
  InquilinoStep1Schema,
  InquilinoStep2Schema,
  InquilinoStep3Schema,
  type InquilinoFormValues,
} from "@/shared/schemas/inquilino";
import type { Propiedad } from "@/modules/propiedades/types";
import { inquilinosService } from "../../services/inquilinos.service";
import { INQUILINO_FORM_DEFAULTS } from "../../utils/defaults";
import type { InquilinoDocumento, InquilinoWizardStep, TipoDocumentoInquilino } from "../../types";
import { StepIndicator } from "./step-indicator";
import { WizardStepHeader } from "./wizard-step-header";
import { StepPersonal } from "./steps/step-personal";
import { StepLaboral } from "./steps/step-laboral";
import { StepPropiedad } from "./steps/step-propiedad";
import { StepDocumentos } from "./steps/step-documentos";
import { StepReferencias } from "./steps/step-referencias";
import { StepScoring } from "./steps/step-scoring";

interface InquilinoWizardProps {
  mode: "create" | "edit";
  inquilinoId?: string;
  initialValues?: InquilinoFormValues;
  initialDocumentos?: InquilinoDocumento[];
  propiedades: Propiedad[];
}

export function InquilinoWizard({
  mode,
  inquilinoId,
  initialValues,
  initialDocumentos = [],
  propiedades,
}: InquilinoWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<InquilinoWizardStep>(1);
  const [pendingDocs, setPendingDocs] = useState<
    { tipo: TipoDocumentoInquilino; file: File }[]
  >([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InquilinoFormValues>({
    defaultValues: initialValues ?? INQUILINO_FORM_DEFAULTS,
    mode: "onTouched",
  });

  const { register, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors } } = form;

  const applyZodIssues = useCallback(
    (issues: ZodIssue[]) => {
      issues.forEach((issue) => {
        const path = issue.path.join(".") as keyof InquilinoFormValues | `referencias.${string}` | `scoring.${string}`;
        if (issue.path[0]) {
          setError(path as Parameters<typeof setError>[0], { type: "manual", message: issue.message });
        }
      });
    },
    [setError],
  );

  const validateStep = async (): Promise<boolean> => {
    const values = watch();
    setStepError(null);

    if (step === 1) {
      const r = InquilinoStep1Schema.safeParse(values);
      if (!r.success) { applyZodIssues(r.error.issues); return false; }
      return true;
    }
    if (step === 2) {
      const r = InquilinoStep2Schema.safeParse(values);
      if (!r.success) { applyZodIssues(r.error.issues); return false; }
      return true;
    }
    if (step === 3) {
      const r = InquilinoStep3Schema.safeParse(values);
      if (!r.success) { applyZodIssues(r.error.issues); return false; }
      return true;
    }
    return true;
  };

  const goNext = async () => {
    const ok = await validateStep();
    if (!ok) {
      setStepError("Revisa los campos antes de continuar.");
      return;
    }
    if (step < 6) setStep((s) => (s + 1) as InquilinoWizardStep);
  };

  const goBack = () => {
    setStepError(null);
    if (step > 1) setStep((s) => (s - 1) as InquilinoWizardStep);
  };

  const goToStep = (target: InquilinoWizardStep) => {
    if (target === step) return;
    setStepError(null);
    setStep(target);
  };

  const handleAddDoc = (tipo: TipoDocumentoInquilino, file: File) => {
    setPendingDocs((prev) => [...prev, { tipo, file }]);
  };

  const displayDocs: InquilinoDocumento[] = [
    ...initialDocumentos,
    ...pendingDocs.map((d, i) => ({
      id: `pending-${i}`,
      inquilino_id: inquilinoId ?? "",
      tipo: d.tipo,
      nombre_archivo: d.file.name,
      fecha_carga: new Date().toISOString().slice(0, 10),
      estado: "pendiente" as const,
    })),
  ];

  const save = async (values: InquilinoFormValues) => {
    setSubmitError(null);
    const parsed = InquilinoFormSchema.safeParse(values);
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues);
      setStepError("Revisa el formulario.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result =
        mode === "create"
          ? await inquilinosService.createTenant(parsed.data)
          : await inquilinosService.updateTenant(inquilinoId!, parsed.data);

      if (result.error || !result.data) {
        setSubmitError(result.error ?? "Error al guardar");
        return;
      }

      const id = result.data.id;
      for (const doc of pendingDocs) {
        await inquilinosService.uploadTenantDocument(id, doc.tipo, doc.file);
      }

      router.replace(`/dashboard/inquilinos/${id}`);
    } catch {
      setSubmitError("Error inesperado al guardar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(220px,260px)_1fr] gap-6 lg:gap-8">
      <aside className="lg:pt-2">
        <StepIndicator currentStep={step} onStepClick={goToStep} />
      </aside>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 6) void goNext();
          else void handleSubmit(save)();
        }}
        noValidate
        className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <WizardStepHeader step={step} />
          <div key={step}>
            {step === 1 && <StepPersonal register={register} errors={errors} watch={watch} />}
            {step === 2 && <StepLaboral register={register} errors={errors} />}
            {step === 3 && (
              <StepPropiedad
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                propiedades={propiedades}
                inquilinoId={inquilinoId}
              />
            )}
            {step === 4 && <StepDocumentos documentos={displayDocs} onAdd={handleAddDoc} />}
            {step === 5 && <StepReferencias register={register} errors={errors} />}
            {step === 6 && <StepScoring register={register} watch={watch} />}
          </div>
          {stepError && (
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">{stepError}</div>
          )}
          {submitError && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">{submitError}</div>
          )}
        </div>
        <div className="flex justify-between gap-3 px-5 py-4 sm:px-8 border-t bg-gray-50/90">
          <Button type="button" variant="secondary" onClick={goBack} disabled={step === 1 || isSubmitting} className="gap-1.5">
            <ArrowLeft size={16} /> Anterior
          </Button>
          {step < 6 ? (
            <Button type="button" variant="primary" onClick={() => void goNext()} className="gap-1.5">
              Siguiente <ArrowRight size={16} />
            </Button>
          ) : (
            <Button type="button" variant="primary" loading={isSubmitting} onClick={() => void handleSubmit(save)()} className="gap-1.5">
              <Save size={16} />
              {mode === "create" ? "Crear inquilino" : "Guardar cambios"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
