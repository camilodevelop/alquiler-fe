import Link from "next/link";
import { FilterX, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui";

export function InquilinosEmpty({
  variant,
  onClearFilters,
}: {
  variant: "empty" | "filters";
  onClearFilters?: () => void;
}) {
  if (variant === "empty") {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gradient-to-b from-white to-gray-50 px-6 py-16 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Sin inquilinos registrados</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          Crea el primer inquilino y asígnalo a una propiedad de tu cartera.
        </p>
        <Link href="/dashboard/inquilinos/nueva" className="inline-block mt-8">
          <Button variant="primary" size="lg" className="gap-2">
            <Plus size={18} /> Nuevo inquilino
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white py-14 text-center">
      <p className="text-gray-500 text-sm mb-4">Ningún inquilino coincide con los filtros.</p>
      {onClearFilters ? (
        <button type="button" onClick={onClearFilters} className="inline-flex items-center gap-2 text-sm font-medium text-brand-700">
          <FilterX size={16} /> Limpiar filtros
        </button>
      ) : null}
    </div>
  );
}
