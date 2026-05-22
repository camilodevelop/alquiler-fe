"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { Button } from "@/components/ui";
import { ContractTemplateSchema, type ContractTemplateFormValues } from "@/shared/schemas/contrato";
import { TEMPLATE_VARIABLES } from "../../constants";
import { DEFAULT_PLANTILLA_HTML, TEMPLATE_FORM_DEFAULTS } from "../../utils/defaults";
import type { ContractTemplate } from "../../types";

interface ContractTemplateEditorProps {
  initial?: ContractTemplate | null;
  onSubmit: (values: ContractTemplateFormValues) => Promise<{ error?: string }>;
  onCancel?: () => void;
}

export function ContractTemplateEditor({
  initial,
  onSubmit,
  onCancel,
}: ContractTemplateEditorProps) {
  const form = useForm({
    resolver: zodResolver(ContractTemplateSchema),
    defaultValues: initial
      ? {
          nombre: initial.nombre,
          descripcion: initial.descripcion,
          plantilla_html: initial.plantilla_html,
          activo: initial.activo,
        }
      : { ...TEMPLATE_FORM_DEFAULTS, plantilla_html: DEFAULT_PLANTILLA_HTML },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const html = watch("plantilla_html");

  const insertVariable = (key: string) => {
    const ta = document.getElementById("plantilla-html") as HTMLTextAreaElement | null;
    if (!ta) {
      setValue("plantilla_html", (html ?? "") + key);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = (html ?? "").slice(0, start) + key + (html ?? "").slice(end);
    setValue("plantilla_html", next);
  };

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data);
      })}
      className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6"
    >
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            {...register("nombre")}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            {...register("descripcion")}
            rows={2}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plantilla HTML *</label>
          <textarea
            id="plantilla-html"
            {...register("plantilla_html")}
            rows={18}
            className="w-full font-mono text-xs rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-brand-500"
            spellCheck={false}
          />
          {errors.plantilla_html && (
            <p className="text-xs text-red-600 mt-1">{errors.plantilla_html.message}</p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" {...register("activo")} className="rounded border-gray-300" />
          Tipo activo (disponible al crear contratos)
        </label>
        <div className="flex gap-3">
          <Button type="submit" variant="primary" loading={isSubmitting} className="gap-2">
            <Save size={16} />
            Guardar plantilla
          </Button>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-6 h-fit rounded-xl border border-gray-200 bg-gray-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Variables dinámicas
        </p>
        <p className="text-xs text-gray-600 mb-3">
          Haz clic para insertar en la plantilla. Se reemplazan al generar el contrato.
        </p>
        <ul className="space-y-1.5">
          {TEMPLATE_VARIABLES.map((v) => (
            <li key={v.key}>
              <button
                type="button"
                onClick={() => insertVariable(v.key)}
                className="w-full text-left rounded-lg px-2 py-1.5 text-xs font-mono bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors"
              >
                <span className="text-brand-700">{v.key}</span>
                <span className="block text-gray-500 font-sans mt-0.5">{v.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </form>
  );
}
