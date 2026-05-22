import Link from "next/link";
import { FileSpreadsheet, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui";

export function MovimientosEmpty({
  variant = "empty",
  onClearFilters,
}: {
  variant?: "empty" | "filters";
  onClearFilters?: () => void;
}) {
  if (variant === "filters") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
          <FileSpreadsheet size={26} />
        </div>
        <p className="text-sm font-medium text-gray-800">Sin resultados</p>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          No hay movimientos que coincidan con los filtros. Prueba ampliando el rango de fechas.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-100 to-emerald-50 flex items-center justify-center text-brand-700 mb-5 shadow-sm">
        <FileSpreadsheet size={30} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-gray-900">Libro de movimientos vacío</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-md leading-relaxed">
        Registra el primer ingreso (renta, fianza) o gasto (reparación, comunidad) para llevar la
        contabilidad de tu cartera al día.
      </p>
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        <Link href="/dashboard/finanzas/nuevo?tipo=ingreso">
          <Button variant="primary" size="sm" className="gap-1.5">
            <TrendingUp size={15} />
            Registrar ingreso
          </Button>
        </Link>
        <Link href="/dashboard/finanzas/nuevo?tipo=gasto">
          <Button variant="secondary" size="sm" className="gap-1.5">
            <TrendingDown size={15} />
            Registrar gasto
          </Button>
        </Link>
      </div>
    </div>
  );
}
