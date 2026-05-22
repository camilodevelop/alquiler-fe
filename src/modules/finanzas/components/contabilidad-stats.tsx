import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Scale,
  Wallet,
} from "lucide-react";
import type { ContabilidadTotales } from "../types";
import { formatPrecio } from "../utils/labels";

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: "emerald" | "rose" | "amber" | "orange" | "brand";
}) {
  const styles = {
    emerald: {
      wrap: "from-emerald-50/80 via-white to-white border-emerald-100/80",
      icon: "bg-emerald-100 text-emerald-700",
      value: "text-emerald-800",
    },
    rose: {
      wrap: "from-rose-50/80 via-white to-white border-rose-100/80",
      icon: "bg-rose-100 text-rose-700",
      value: "text-rose-800",
    },
    amber: {
      wrap: "from-amber-50/80 via-white to-white border-amber-100/80",
      icon: "bg-amber-100 text-amber-800",
      value: "text-amber-900",
    },
    orange: {
      wrap: "from-orange-50/80 via-white to-white border-orange-100/80",
      icon: "bg-orange-100 text-orange-800",
      value: "text-orange-900",
    },
    brand: {
      wrap: "from-brand-50/90 via-white to-white border-brand-200/80",
      icon: "bg-brand-100 text-brand-800",
      value: "text-brand-900",
    },
  }[accent];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 sm:p-5 shadow-sm ${styles.wrap}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            {label}
          </p>
          <p className={`text-xl sm:text-2xl font-bold tabular-nums mt-1.5 tracking-tight ${styles.value}`}>
            {value}
          </p>
          {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

export function ContabilidadStats({ totales }: { totales: ContabilidadTotales }) {
  const saldoPositivo = totales.saldoNeto >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4">
      <KpiCard
        label="Ingresos pagados"
        value={formatPrecio(totales.ingresosPagados)}
        hint="Cobrado y registrado"
        icon={ArrowDownLeft}
        accent="emerald"
      />
      <KpiCard
        label="Gastos pagados"
        value={formatPrecio(totales.gastosPagados)}
        hint="Pagado a proveedores"
        icon={ArrowUpRight}
        accent="rose"
      />
      <KpiCard
        label="Pendiente cobro"
        value={formatPrecio(totales.pendienteCobrar)}
        hint="Por recibir de inquilinos"
        icon={Clock}
        accent="amber"
      />
      <KpiCard
        label="Pendiente pago"
        value={formatPrecio(totales.pendientePagar)}
        hint="Obligaciones abiertas"
        icon={Wallet}
        accent="orange"
      />
      <div className="sm:col-span-2 xl:col-span-1">
        <KpiCard
          label="Saldo neto"
          value={formatPrecio(totales.saldoNeto)}
          hint={saldoPositivo ? "Ingresos − gastos (pagados)" : "Déficit en periodo filtrado"}
          icon={Scale}
          accent="brand"
        />
      </div>
    </div>
  );
}
