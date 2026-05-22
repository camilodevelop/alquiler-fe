import Link from "next/link";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import type { MovimientoTipo } from "../types";

export function MovimientoFormShell({
  tipo,
  mode,
  children,
}: {
  tipo: MovimientoTipo;
  mode: "create" | "edit";
  children: React.ReactNode;
}) {
  const isIngreso = tipo === "ingreso";
  const Icon = isIngreso ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href="/dashboard/finanzas"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a contabilidad
      </Link>

      <header
        className={[
          "relative overflow-hidden rounded-2xl border px-6 py-7 sm:px-8 shadow-sm",
          isIngreso
            ? "border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-white"
            : "border-rose-200/80 bg-gradient-to-br from-rose-50/90 via-white to-white",
        ].join(" ")}
      >
        <div
          className={`pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full blur-3xl opacity-60 ${
            isIngreso ? "bg-emerald-200" : "bg-rose-200"
          }`}
          aria-hidden
        />
        <div className="relative flex gap-4">
          <span
            className={[
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md",
              isIngreso ? "bg-emerald-600 shadow-emerald-600/25" : "bg-rose-600 shadow-rose-600/25",
            ].join(" ")}
          >
            <Icon size={24} strokeWidth={2} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              {mode === "create" ? "Alta en libro contable" : "Edición de movimiento"}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {mode === "create" ? "Nuevo" : "Editar"} {isIngreso ? "ingreso" : "gasto"}
            </h1>
            <p className="text-sm text-gray-600 mt-1.5 max-w-lg">
              {isIngreso
                ? "Cobros de inquilinos, fianzas y otros ingresos vinculados a propiedad y contrato."
                : "Gastos operativos, reparaciones y costes vinculables a tickets de mantenimiento."}
            </p>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
