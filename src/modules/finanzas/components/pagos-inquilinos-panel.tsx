"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Plus,
  User,
} from "lucide-react";
import { Button, TablePagination } from "@/components/ui";
import { usePagination } from "@/hooks/use-pagination";
import { CONTRATO_RESUMEN_CONFIG, MES_COBRO_CONFIG } from "../constants/pagos-inquilinos";
import type { ContratoPagosInquilino, MesCobroEstado, PagosInquilinosResumen } from "../types";
import { formatFecha, formatPrecio } from "../utils/labels";

function ResumenPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "red" | "sky" | "slate";
}) {
  const tones = {
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-800",
    red: "bg-red-50 border-red-100 text-red-800",
    sky: "bg-sky-50 border-sky-100 text-sky-800",
    slate: "bg-slate-50 border-slate-100 text-slate-800",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs font-medium opacity-80 mt-0.5">{label}</p>
    </div>
  );
}

function MesCell({
  mes,
  contrato,
}: {
  mes: ContratoPagosInquilino["meses"][number];
  contrato: ContratoPagosInquilino;
}) {
  const cfg = MES_COBRO_CONFIG[mes.estado];
  const href = mes.movimiento_id
    ? `/dashboard/finanzas/${mes.movimiento_id}/editar`
    : `/dashboard/finanzas/nuevo?tipo=ingreso&propiedad_id=${contrato.propiedad_id}&contrato_id=${contrato.contrato_id}&mes=${mes.mes}`;

  const title = [
    `${mes.etiqueta} — ${cfg.label}`,
    `Canon: ${formatPrecio(mes.valor_esperado)}`,
    mes.valor_pagado != null ? `Pagado: ${formatPrecio(mes.valor_pagado)}` : null,
    `Vence: ${formatFecha(mes.fecha_vencimiento)}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <Link
      href={href}
      title={title}
      className={[
        "group relative flex flex-col items-center justify-center min-w-[52px] w-[52px] h-[58px] rounded-lg border text-center transition-all hover:scale-105 hover:z-10",
        cfg.cell,
        mes.es_mes_actual ? "ring-2 ring-brand-400 ring-offset-1" : "",
      ].join(" ")}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">
        {mes.etiqueta.split(" ")[0]}
      </span>
      <span className="text-[9px] font-semibold mt-0.5 opacity-80">
        {mes.etiqueta.split(" ")[1]}
      </span>
      <span className="text-[8px] font-bold mt-1 opacity-90">{cfg.short}</span>
      {mes.es_mes_actual && (
        <span className="absolute -top-1.5 -right-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
      )}
    </Link>
  );
}

function ContratoPagosCard({ contrato }: { contrato: ContratoPagosInquilino }) {
  const resCfg = CONTRATO_RESUMEN_CONFIG[contrato.resumen];
  const IconResumen =
    contrato.resumen === "mora" ? AlertTriangle : CheckCircle2;

  return (
    <article className="rounded-2xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-slate-50/80 to-white">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {contrato.codigo}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${resCfg.badge}`}
              >
                <IconResumen size={12} />
                {resCfg.label}
              </span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {contrato.propiedad_nombre}
            </h3>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
              <User size={14} className="text-gray-400 shrink-0" />
              {contrato.inquilino_nombre}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm shrink-0">
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Canon</p>
              <p className="font-bold text-gray-900 tabular-nums">
                {formatPrecio(contrato.valor_mensual)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Día cobro</p>
              <p className="font-bold text-gray-900 tabular-nums">Día {contrato.dia_pago}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Vigencia</p>
              <p className="font-medium text-gray-800 text-xs tabular-nums">
                {formatFecha(contrato.fecha_inicio)} – {formatFecha(contrato.fecha_fin)}
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {contrato.meses_pagados} de {contrato.meses_total} meses pagados
          {contrato.meses_vencidos > 0 && (
            <span className="text-red-600 font-semibold">
              {" "}
              · {contrato.meses_vencidos} en mora
            </span>
          )}
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Calendar size={13} />
            Calendario de cobros
          </p>
          <Link
            href={`/dashboard/finanzas/nuevo?tipo=ingreso&propiedad_id=${contrato.propiedad_id}&contrato_id=${contrato.contrato_id}`}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            <Plus size={13} />
            Registrar pago
          </Link>
        </div>
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="inline-flex gap-1.5 min-w-min">
            {contrato.meses.map((mes) => (
              <MesCell key={mes.mes} mes={mes} contrato={contrato} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export function PagosInquilinosPanel({
  resumen,
  isLoading,
}: {
  resumen: PagosInquilinosResumen;
  isLoading?: boolean;
}) {
  const {
    paginatedItems: contratosPagina,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    total,
    rangeStart,
    rangeEnd,
  } = usePagination(resumen.contratos, 6);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-gray-500">
        Cargando estado de cobros…
      </div>
    );
  }

  if (resumen.total_contratos === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
          <FileText size={26} />
        </div>
        <h3 className="font-semibold text-gray-900">Sin contratos activos</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          No hay contratos en estado activo
          {resumen.contratos.length === 0 ? " para esta selección" : ""}. Activa un contrato para
          ver el calendario de pagos mensuales.
        </p>
        <Link href="/dashboard/contratos" className="mt-4">
          <Button variant="secondary" size="sm" className="gap-1">
            Ir a contratos
            <ChevronRight size={14} />
          </Button>
        </Link>
      </div>
    );
  }

  const legend: MesCobroEstado[] = [
    "pagado",
    "pendiente",
    "parcial",
    "vencido",
    "sin_registro",
    "futuro",
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResumenPill label="Contratos activos" value={resumen.total_contratos} tone="slate" />
        <ResumenPill label="Al día" value={resumen.al_dia} tone="emerald" />
        <ResumenPill label="En mora" value={resumen.en_mora} tone="red" />
        <ResumenPill label="Pago parcial" value={resumen.parcial} tone="sky" />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-slate-50 border border-gray-100 px-4 py-3">
        <span className="text-[11px] font-semibold text-gray-500 uppercase">Leyenda</span>
        {legend.map((estado) => (
          <span key={estado} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`h-2.5 w-2.5 rounded-sm ${MES_COBRO_CONFIG[estado].dot}`} />
            {MES_COBRO_CONFIG[estado].label}
          </span>
        ))}
        <span className="text-xs text-gray-400 ml-auto hidden sm:inline">
          Clic en un mes para ver o registrar el cobro
        </span>
      </div>

      <div className="space-y-4">
        {contratosPagina.map((c) => (
          <ContratoPagosCard key={c.contrato_id} contrato={c} />
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          total={total}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[4, 6, 10, 15]}
        />
      </div>
    </div>
  );
}
