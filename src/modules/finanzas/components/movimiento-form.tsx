"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { Button } from "@/components/ui";
import {
  GastoFormSchema,
  IngresoFormSchema,
  type GastoFormValues,
  type IngresoFormValues,
} from "@/shared/schemas/finanzas";
import {
  CATEGORIAS_GASTO,
  CATEGORIAS_INGRESO,
  METODOS_PAGO,
  MOVIMIENTO_ESTADOS,
} from "../constants";
import type { ContratoOption, MovimientoFinanciero, MovimientoTipo, TicketOption } from "../types";
import { finanzasService } from "../services/finanzas.service";
import type { Propiedad } from "@/modules/propiedades/types";
import { sortPropiedadesByTitulo } from "@/modules/propiedades/utils/sort";
import type { Manitas } from "@/modules/mantenimiento/types";

const fieldClass =
  "w-full border border-gray-200/90 rounded-xl px-3.5 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400";
const labelClass = "text-sm font-medium text-gray-700 mb-1.5 block";

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-slate-50/50">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="p-5 sm:p-6 space-y-4">{children}</div>
    </section>
  );
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonthIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function MovimientoForm({
  mode,
  tipo,
  movimientoId,
  initial,
  propiedades,
  manitasList,
  defaultPropiedadId,
  defaultTicketId,
  defaultContratoId,
  defaultMes,
}: {
  mode: "create" | "edit";
  tipo: MovimientoTipo;
  movimientoId?: string;
  initial?: MovimientoFinanciero;
  propiedades: Propiedad[];
  manitasList: Manitas[];
  defaultPropiedadId?: string;
  defaultTicketId?: string;
  defaultContratoId?: string;
  /** Primer día del mes (YYYY-MM-01) desde calendario de cobros */
  defaultMes?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [contratos, setContratos] = useState<ContratoOption[]>([]);
  const [tickets, setTickets] = useState<TicketOption[]>([]);

  const isIngreso = tipo === "ingreso";

  const defaultValues = isIngreso
    ? ({
        tipo: "ingreso" as const,
        propiedad_id: initial?.propiedad_id ?? defaultPropiedadId ?? "",
        contrato_id: initial?.contrato_id ?? defaultContratoId ?? "",
        inquilino_id: initial?.inquilino_id ?? "",
        categoria: (initial?.categoria as IngresoFormValues["categoria"]) ?? "pago_arriendo",
        concepto: initial?.concepto ?? "",
        valor: initial?.valor ?? undefined,
        valor_esperado: initial?.valor_esperado ?? undefined,
        estado: initial?.estado ?? "pendiente",
        metodo_pago: initial?.metodo_pago ?? undefined,
        fecha_movimiento: initial?.fecha_movimiento ?? todayIso(),
        fecha_vencimiento: initial?.fecha_vencimiento ?? "",
        fecha_pago: initial?.fecha_pago ?? "",
        mes_correspondiente: initial?.mes_correspondiente ?? defaultMes ?? firstDayOfMonthIso(),
        observaciones: initial?.observaciones ?? "",
      } satisfies Partial<IngresoFormValues>)
    : ({
        tipo: "gasto" as const,
        propiedad_id: initial?.propiedad_id ?? defaultPropiedadId ?? "",
        ticket_id: initial?.ticket_id ?? defaultTicketId ?? "",
        manitas_id: initial?.manitas_id ?? "",
        categoria: (initial?.categoria as GastoFormValues["categoria"]) ?? "reparacion",
        concepto: initial?.concepto ?? "",
        valor: initial?.valor ?? undefined,
        estado: initial?.estado ?? "pendiente",
        metodo_pago: initial?.metodo_pago ?? undefined,
        fecha_movimiento: initial?.fecha_movimiento ?? todayIso(),
        fecha_vencimiento: initial?.fecha_vencimiento ?? "",
        fecha_pago: initial?.fecha_pago ?? "",
        observaciones: initial?.observaciones ?? "",
      } satisfies Partial<GastoFormValues>);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IngresoFormValues | GastoFormValues>({
    resolver: zodResolver(
      (isIngreso ? IngresoFormSchema : GastoFormSchema) as never,
    ) as Resolver<IngresoFormValues | GastoFormValues>,
    defaultValues: defaultValues as IngresoFormValues | GastoFormValues,
  });

  const propiedadId = watch("propiedad_id");
  const estado = watch("estado");
  const contratoId = watch("contrato_id");

  useEffect(() => {
    if (!propiedadId) {
      setContratos([]);
      setTickets([]);
      return;
    }
    finanzasService.listContratos(propiedadId).then(({ data }) => setContratos(data));
    if (!isIngreso) {
      finanzasService.listTickets(propiedadId).then(({ data }) => setTickets(data));
    }
  }, [propiedadId, isIngreso]);

  useEffect(() => {
    if (!isIngreso || !contratoId) return;
    const c = contratos.find((x) => x.id === contratoId);
    if (c) {
      setValue("inquilino_id", c.inquilino_id);
      if (!watch("valor_esperado")) setValue("valor_esperado", c.valor_mensual);
      if (!watch("valor")) setValue("valor", c.valor_mensual);
    }
  }, [contratoId, contratos, isIngreso, setValue, watch]);

  useEffect(() => {
    if (!isIngreso || mode !== "create" || !defaultContratoId || contratos.length === 0) return;
    const c = contratos.find((x) => x.id === defaultContratoId);
    if (!c) return;
    setValue("contrato_id", defaultContratoId);
    setValue("inquilino_id", c.inquilino_id);
    if (defaultMes) {
      setValue("mes_correspondiente", defaultMes);
      const [y, m] = defaultMes.slice(0, 7).split("-");
      const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
      ];
      const nombreMes = meses[Number(m) - 1];
      if (!watch("concepto")) {
        setValue("concepto", `Arriendo ${nombreMes} ${y}`);
      }
      setValue("categoria", "pago_arriendo");
    }
    if (!watch("valor_esperado")) setValue("valor_esperado", c.valor_mensual);
    if (!watch("valor")) setValue("valor", c.valor_mensual);
  }, [
    isIngreso,
    mode,
    defaultContratoId,
    defaultMes,
    contratos,
    setValue,
    watch,
  ]);

  useEffect(() => {
    if (isIngreso || !defaultTicketId) return;
    const t = tickets.find((x) => x.id === defaultTicketId);
    if (t?.costo) setValue("valor", t.costo);
  }, [tickets, defaultTicketId, isIngreso, setValue]);

  const onSubmit = async (values: IngresoFormValues | GastoFormValues) => {
    setLoading(true);
    setError(null);
    const payload = {
      ...values,
      contrato_id: values.contrato_id || null,
      inquilino_id: "inquilino_id" in values ? values.inquilino_id || null : null,
      ticket_id: "ticket_id" in values ? values.ticket_id || null : null,
      manitas_id: "manitas_id" in values ? values.manitas_id || null : null,
      fecha_vencimiento: values.fecha_vencimiento || null,
      fecha_pago: values.fecha_pago || null,
      mes_correspondiente:
        "mes_correspondiente" in values ? values.mes_correspondiente || null : null,
    };

    if (mode === "create") {
      const res = isIngreso
        ? await finanzasService.createIngreso(payload as IngresoFormValues)
        : await finanzasService.createGasto(payload as GastoFormValues);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      router.push("/dashboard/finanzas");
      router.refresh();
      return;
    }

    const res = isIngreso
      ? await finanzasService.updateIngreso(movimientoId!, payload as IngresoFormValues)
      : await finanzasService.updateGasto(movimientoId!, payload as GastoFormValues);
    if (res.error) setError(res.error);
    else {
      router.push("/dashboard/finanzas");
      router.refresh();
    }
    setLoading(false);
  };

  const categorias = isIngreso ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  const showFechaPago = estado === "pagado" || estado === "parcial";
  const showValorEsperado = isIngreso && (estado === "parcial" || watch("categoria") === "pago_arriendo");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection
        title="Ubicación y vínculos"
        description={
          isIngreso
            ? "Propiedad, contrato e inquilino del cobro"
            : "Propiedad, ticket de mantenimiento o proveedor"
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Propiedad *</label>
            <select {...register("propiedad_id")} className={fieldClass}>
              <option value="">Seleccionar...</option>
              {sortPropiedadesByTitulo(propiedades).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo}
                </option>
              ))}
            </select>
            {errors.propiedad_id && (
              <p className="text-xs text-red-600 mt-1">{errors.propiedad_id.message}</p>
            )}
          </div>

          {isIngreso && (
            <>
              <div>
                <label className={labelClass}>Contrato</label>
                <select {...register("contrato_id")} className={fieldClass}>
                  <option value="">Sin contrato</option>
                  {contratos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} — {c.inquilino_nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Inquilino</label>
                <input type="hidden" {...register("inquilino_id")} />
                <p className="text-sm text-gray-600 py-2.5">
                  {contratos.find((c) => c.id === contratoId)?.inquilino_nombre ?? "—"}
                </p>
              </div>
            </>
          )}

          {!isIngreso && (
            <>
              <div>
                <label className={labelClass}>Ticket asociado</label>
                <select {...register("ticket_id")} className={fieldClass}>
                  <option value="">Sin ticket</option>
                  {tickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.codigo} — {t.titulo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Manitas / proveedor</label>
                <select {...register("manitas_id")} className={fieldClass}>
                  <option value="">Sin asignar</option>
                  {manitasList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombres} {m.apellidos}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </FormSection>

      <FormSection title="Importe y clasificación">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Categoría *</label>
            <select {...register("categoria")} className={fieldClass}>
              {categorias.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Estado *</label>
            <select {...register("estado")} className={fieldClass}>
              {MOVIMIENTO_ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Concepto *</label>
            <input {...register("concepto")} className={fieldClass} />
            {errors.concepto && (
              <p className="text-xs text-red-600 mt-1">{errors.concepto.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Valor (€) *</label>
            <input type="number" step="0.01" min="0" {...register("valor")} className={fieldClass} />
            {errors.valor && (
              <p className="text-xs text-red-600 mt-1">{errors.valor.message}</p>
            )}
          </div>

          {showValorEsperado && (
            <div>
              <label className={labelClass}>Valor esperado (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register("valor_esperado")}
                className={fieldClass}
              />
            </div>
          )}
        </div>
      </FormSection>

      <FormSection title="Fechas y observaciones">
        <div className="grid sm:grid-cols-2 gap-4">
          {isIngreso ? (
            <>
              <div>
                <label className={labelClass}>Fecha vencimiento</label>
                <input type="date" {...register("fecha_vencimiento")} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Fecha movimiento *</label>
                <input type="date" {...register("fecha_movimiento")} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Mes correspondiente</label>
                <input type="date" {...register("mes_correspondiente")} className={fieldClass} />
              </div>
            </>
          ) : (
            <div>
              <label className={labelClass}>Fecha del gasto *</label>
              <input type="date" {...register("fecha_movimiento")} className={fieldClass} />
            </div>
          )}

          {showFechaPago && (
            <div>
              <label className={labelClass}>Fecha de pago *</label>
              <input type="date" {...register("fecha_pago")} className={fieldClass} />
              {errors.fecha_pago && (
                <p className="text-xs text-red-600 mt-1">{errors.fecha_pago.message}</p>
              )}
            </div>
          )}

          <div>
            <label className={labelClass}>Método de pago</label>
            <select {...register("metodo_pago")} className={fieldClass}>
              <option value="">—</option>
              {METODOS_PAGO.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Observaciones</label>
            <textarea {...register("observaciones")} rows={3} className={fieldClass} />
          </div>
        </div>
      </FormSection>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" className="gap-2 sm:min-w-[140px]" disabled={loading}>
          <Save size={16} />
          {loading ? "Guardando..." : "Guardar movimiento"}
        </Button>
      </div>
    </form>
  );
}
