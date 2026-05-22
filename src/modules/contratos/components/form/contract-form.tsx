"use client";

import { useEffect, useMemo, useState } from "react";
import { contractService } from "../../services/contracts.service";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Eye } from "lucide-react";
import { Button } from "@/components/ui";
import { ContractFormSchema, type ContractFormValues } from "@/shared/schemas/contrato";
import type { Propiedad } from "@/modules/propiedades/types";
import { sortPropiedadesByTitulo } from "@/modules/propiedades/utils/sort";
import type { Inquilino } from "@/modules/inquilinos/types";
import type { Contract, ContractTemplate } from "../../types";
import { CONTRACT_FORM_DEFAULTS } from "../../utils/defaults";
import { buildTemplateVariables, renderContractTemplate } from "../../utils/template-engine";
import { ContractPreview } from "../contract-preview";

interface ContractFormProps {
  mode: "create" | "edit";
  contractId?: string;
  initialContract?: Contract | null;
  propiedades: Propiedad[];
  inquilinos: Inquilino[];
  templates: ContractTemplate[];
}

export function ContractForm({
  mode,
  contractId,
  initialContract,
  propiedades,
  inquilinos,
  templates,
}: ContractFormProps) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [occupiedIds, setOccupiedIds] = useState<string[]>([]);

  useEffect(() => {
    void contractService.getOccupiedPropertyIds().then(setOccupiedIds);
  }, []);

  const defaultValues: ContractFormValues = initialContract
    ? {
        tipo_contrato_id: initialContract.tipo_contrato_id,
        propiedad_id: initialContract.propiedad_id,
        unidad: initialContract.unidad,
        inquilino_id: initialContract.inquilino_id,
        fecha_inicio: initialContract.fecha_inicio.slice(0, 10),
        fecha_fin: initialContract.fecha_fin.slice(0, 10),
        valor_mensual: initialContract.valor_mensual,
        deposito: initialContract.deposito,
        dia_pago: initialContract.dia_pago,
        observaciones: initialContract.observaciones ?? "",
      }
    : {
        ...CONTRACT_FORM_DEFAULTS,
        dia_pago: 1,
        valor_mensual: 0,
        deposito: 0,
      };

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(ContractFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const values = watch();

  const selectedTemplate = templates.find((t) => t.id === values.tipo_contrato_id);
  const selectedProp = propiedades.find((p) => p.id === values.propiedad_id);
  const selectedInq = inquilinos.find((i) => i.id === values.inquilino_id);
  const isHabitaciones = selectedProp?.tipo_renta === "habitaciones";

  const availablePropiedades = sortPropiedadesByTitulo(
    propiedades.filter((p) => {
      if (mode === "edit" && initialContract?.propiedad_id === p.id) return true;
      if (occupiedIds.includes(p.id)) return false;
      return p.estado === "disponible" || p.estado === "alquilada";
    }),
  );

  useEffect(() => {
    if (selectedProp && values.valor_mensual === 0) {
      setValue("valor_mensual", selectedProp.precio_mes);
    }
  }, [selectedProp, setValue, values.valor_mensual]);

  const previewHtml = useMemo(() => {
    if (!selectedTemplate) return "";
    const vars = buildTemplateVariables({
      contractCode: initialContract?.codigo ?? "BORRADOR",
      form: values,
      propiedad: selectedProp,
      inquilino: selectedInq,
    });
    return renderContractTemplate(selectedTemplate.plantilla_html, vars);
  }, [selectedTemplate, values, selectedProp, selectedInq, initialContract?.codigo]);

  const onSubmit = async (data: ContractFormValues) => {
    setSubmitError(null);
    setLoading(true);

    const input = {
      ...data,
      unidad: data.unidad || null,
      observaciones: data.observaciones || null,
    };

    const result =
      mode === "create"
        ? await contractService.createContract(input)
        : await contractService.updateContract(contractId!, input);

    setLoading(false);

    if (result.error || !result.data) {
      setSubmitError(result.error ?? "Error al guardar");
      return;
    }

    router.push(`/dashboard/contratos/${result.data.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Datos del contrato</h2>

          <Field label="Tipo de contrato *" error={errors.tipo_contrato_id?.message}>
            <select
              {...register("tipo_contrato_id")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Seleccionar plantilla...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Propiedad *" error={errors.propiedad_id?.message}>
            <select
              {...register("propiedad_id")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Seleccionar...</option>
              {availablePropiedades.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo} — {p.ciudad} ({p.estado})
                </option>
              ))}
            </select>
          </Field>

          {isHabitaciones ? (
            <Field label="Habitación / unidad" error={errors.unidad?.message}>
              <input
                {...register("unidad")}
                placeholder="Ej. Habitación 2"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </Field>
          ) : null}

          <Field label="Inquilino *" error={errors.inquilino_id?.message}>
            <select
              {...register("inquilino_id")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Seleccionar...</option>
              {inquilinos.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombres} {i.apellidos} — {i.numero_documento}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha inicio *" error={errors.fecha_inicio?.message}>
              <input type="date" {...register("fecha_inicio")} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </Field>
            <Field label="Fecha fin *" error={errors.fecha_fin?.message}>
              <input type="date" {...register("fecha_fin")} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Valor mensual (€) *" error={errors.valor_mensual?.message}>
              <input type="number" step="1" {...register("valor_mensual")} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </Field>
            <Field label="Depósito / fianza (€) *" error={errors.deposito?.message}>
              <input type="number" step="1" {...register("deposito")} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </Field>
          </div>

          <Field label="Día de pago (1-28) *" error={errors.dia_pago?.message}>
            <input type="number" min={1} max={28} {...register("dia_pago")} className="w-full max-w-[120px] rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </Field>

          <Field label="Observaciones" error={errors.observaciones?.message}>
            <textarea
              {...register("observaciones")}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-y"
            />
          </Field>

          {submitError && (
            <p className="text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 px-3 py-2">{submitError}</p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" variant="primary" loading={loading} className="gap-2">
              <Save size={16} />
              {mode === "create" ? "Crear contrato" : "Guardar cambios"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPreview((v) => !v)}
              className="gap-2 xl:hidden"
            >
              <Eye size={16} />
              {showPreview ? "Ocultar vista previa" : "Ver vista previa"}
            </Button>
          </div>
        </div>

        <div className={`${showPreview ? "block" : "hidden"} xl:block`}>
          {selectedTemplate ? (
            <ContractPreview html={previewHtml} />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              Selecciona un tipo de contrato para ver la vista previa con variables reemplazadas.
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
