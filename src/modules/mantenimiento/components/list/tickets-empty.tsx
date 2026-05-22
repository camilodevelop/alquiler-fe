import Link from "next/link";
import { ClipboardList, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui";

export function TicketsEmpty({
  variant,
  onClearFilters,
}: {
  variant: "empty" | "filters" | "tab";
  onClearFilters?: () => void;
}) {
  if (variant === "empty") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
          <ClipboardList className="text-amber-600" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Sin tickets todavía</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">
          Registra la primera incidencia de mantenimiento para asignarla a un manitas y hacer seguimiento.
        </p>
        <Link href="/dashboard/mantenimiento/nuevo" className="mt-6">
          <Button variant="primary" className="gap-2">
            <Plus size={16} />
            Registrar ticket
          </Button>
        </Link>
      </div>
    );
  }

  if (variant === "tab") {
    return (
      <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
        <p className="text-sm text-gray-500">No hay tickets en este estado con los filtros actuales.</p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Ver todos los tickets
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <Search className="text-gray-300 mb-3" size={40} />
      <p className="text-sm text-gray-500">Ningún ticket coincide con los filtros.</p>
      {onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
