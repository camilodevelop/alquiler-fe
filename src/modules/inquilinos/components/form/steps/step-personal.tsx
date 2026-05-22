"use client";

import { Home, IdCard, Mail } from "lucide-react";
import type { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import type { InquilinoFormValues } from "@/shared/schemas/inquilino";
import { TIPOS_DOCUMENTO_IDENTIDAD } from "../../../constants";
import type { TipoDocumentoIdentidad } from "../../../types";
import { FormField, inputClassName, selectClassName } from "@/modules/propiedades/components/form/form-field";

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof IdCard;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200/80 bg-gray-50/40 overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3 sm:px-5 border-b border-gray-100 bg-white/80">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 border border-brand-100">
          <Icon size={18} strokeWidth={2} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description ? (
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="p-4 sm:p-5 space-y-5">{children}</div>
    </section>
  );
}

const DOC_PLACEHOLDERS: Record<TipoDocumentoIdentidad, string> = {
  dni: "12345678A",
  nie: "X1234567L",
  pasaporte: "ABC123456",
  cedula: "1234567890",
  otro: "Referencia del documento",
};

export function StepPersonal({
  register,
  errors,
  watch,
}: {
  register: UseFormRegister<InquilinoFormValues>;
  errors: FieldErrors<InquilinoFormValues>;
  watch: UseFormWatch<InquilinoFormValues>;
}) {
  const tipoDocumento = watch("tipo_documento") as TipoDocumentoIdentidad;
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm text-brand-900">
        <IdCard size={18} className="shrink-0 mt-0.5 text-brand-600" />
        <p className="leading-relaxed">
          Los datos de identificación y contacto se usan en contratos y comunicaciones. El documento
          y el email deben ser únicos en tu cartera.
        </p>
      </div>

      <Section
        icon={IdCard}
        title="Identificación"
        description="Nombre legal y documento de identidad del inquilino"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Nombres" error={errors.nombres?.message} required>
            <input
              {...register("nombres")}
              className={inputClassName}
              placeholder="Ej: Ana"
              autoComplete="given-name"
              autoFocus
            />
          </FormField>
          <FormField label="Apellidos" error={errors.apellidos?.message} required>
            <input
              {...register("apellidos")}
              className={inputClassName}
              placeholder="Ej: García López"
              autoComplete="family-name"
            />
          </FormField>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-gray-800 mb-3">
            Tipo de documento <span className="text-red-500">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {TIPOS_DOCUMENTO_IDENTIDAD.map((t) => (
              <label
                key={t.value}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  tipoDocumento === t.value
                    ? "border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  value={t.value}
                  {...register("tipo_documento")}
                  className="sr-only"
                />
                {t.label}
              </label>
            ))}
          </div>
          {errors.tipo_documento ? (
            <p className="text-xs text-red-600 font-medium mt-2" role="alert">
              {errors.tipo_documento.message}
            </p>
          ) : null}
        </fieldset>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Número de documento"
            error={errors.numero_documento?.message}
            required
            hint="Sin espacios ni puntos"
          >
            <input
              {...register("numero_documento")}
              className={`${inputClassName} uppercase`}
              placeholder={DOC_PLACEHOLDERS[tipoDocumento]}
              autoComplete="off"
            />
          </FormField>
          <FormField label="Fecha de nacimiento" error={errors.fecha_nacimiento?.message}>
            <input
              type="date"
              {...register("fecha_nacimiento")}
              className={inputClassName}
              max={hoy}
            />
          </FormField>
          <FormField label="Nacionalidad" error={errors.nacionalidad?.message}>
            <input
              {...register("nacionalidad")}
              className={inputClassName}
              placeholder="España"
              autoComplete="country-name"
            />
          </FormField>
        </div>
      </Section>

      <Section
        icon={Mail}
        title="Contacto"
        description="Teléfono y correo para avisos y firma digital"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Teléfono"
            error={errors.telefono?.message}
            required
            hint="Incluye prefijo si es internacional"
          >
            <input
              type="tel"
              {...register("telefono")}
              className={inputClassName}
              placeholder="+34 612 345 678"
              autoComplete="tel"
            />
          </FormField>
          <FormField label="Email" error={errors.email?.message} required>
            <input
              type="email"
              {...register("email")}
              className={inputClassName}
              placeholder="nombre@email.com"
              autoComplete="email"
            />
          </FormField>
        </div>
      </Section>

      <Section
        icon={Home}
        title="Domicilio actual"
        description="Opcional — dirección fuera del inmueble en alquiler"
      >
        <FormField label="Dirección" error={errors.direccion_actual?.message}>
          <input
            {...register("direccion_actual")}
            className={inputClassName}
            placeholder="Calle, número, piso, puerta..."
            autoComplete="street-address"
          />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Ciudad" error={errors.ciudad?.message}>
            <input
              {...register("ciudad")}
              className={inputClassName}
              placeholder="Madrid"
              autoComplete="address-level2"
            />
          </FormField>
          <FormField label="País" error={errors.pais?.message}>
            <select {...register("pais")} className={selectClassName}>
              <option value="España">España</option>
              <option value="Colombia">Colombia</option>
              <option value="México">México</option>
              <option value="Argentina">Argentina</option>
              <option value="Chile">Chile</option>
              <option value="Perú">Perú</option>
              <option value="Portugal">Portugal</option>
              <option value="Francia">Francia</option>
              <option value="Italia">Italia</option>
              <option value="Alemania">Alemania</option>
              <option value="Reino Unido">Reino Unido</option>
              <option value="Estados Unidos">Estados Unidos</option>
              <option value="Otro">Otro</option>
            </select>
          </FormField>
        </div>
      </Section>
    </div>
  );
}
