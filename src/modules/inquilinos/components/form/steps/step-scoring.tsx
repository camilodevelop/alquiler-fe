"use client";

import type { UseFormRegister, UseFormWatch } from "react-hook-form";
import type { InquilinoFormValues } from "@/shared/schemas/inquilino";
import { NIVELES_SCORING } from "../../../constants";
import type { NivelScoring } from "../../../types";
import { FormField, textareaClassName } from "@/modules/propiedades/components/form/form-field";

const CRITERIOS: { key: keyof NonNullable<InquilinoFormValues["scoring"]>; label: string }[] = [
  { key: "documentacion_completa", label: "Documentación completa" },
  { key: "ingresos_suficientes", label: "Ingresos suficientes" },
  { key: "historial_pagos", label: "Historial de pagos" },
  { key: "referencias_positivas", label: "Referencias positivas" },
  { key: "estabilidad_laboral", label: "Estabilidad laboral" },
  { key: "comportamiento_reportado", label: "Comportamiento reportado" },
  { key: "danos_previos", label: "Daños o incidencias previas" },
];

export function StepScoring({
  register,
  watch,
}: {
  register: UseFormRegister<InquilinoFormValues>;
  watch: UseFormWatch<InquilinoFormValues>;
}) {
  const nivel = watch("scoring.nivel") as NivelScoring;
  const cfg = NIVELES_SCORING.find((n) => n.value === nivel) ?? NIVELES_SCORING[0];

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-6 text-center ${cfg.color} border-current/20`}>
        <p className="text-xs uppercase tracking-wide font-semibold opacity-80">Nivel de scoring</p>
        <p className="text-3xl font-bold mt-1">{cfg.label}</p>
        <p className="text-xs mt-2 opacity-70">Evaluación manual — IA en fases futuras</p>
      </div>

      <FormField label="Nivel general">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {NIVELES_SCORING.map((n) => (
            <label
              key={n.value}
              className={`cursor-pointer rounded-xl border px-2 py-3 text-center text-xs font-medium transition-all ${
                nivel === n.value ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input type="radio" value={n.value} {...register("scoring.nivel")} className="sr-only" />
              {n.label}
            </label>
          ))}
        </div>
      </FormField>

      <div className="grid sm:grid-cols-2 gap-3">
        {CRITERIOS.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 cursor-pointer hover:bg-gray-50">
            <input type="checkbox" {...register(`scoring.${key}`)} className="rounded border-gray-300 text-brand-600" />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>

      <FormField label="Observaciones del gestor">
        <textarea {...register("scoring.observaciones_gestor")} rows={3} className={textareaClassName} placeholder="Notas internas..." />
      </FormField>
    </div>
  );
}
