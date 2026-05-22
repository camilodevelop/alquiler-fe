import Link from "next/link";
import { Building2, FilterX, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui";

interface PropiedadesEmptyProps {
  variant: "portfolio" | "filters";
  onClearFilters?: () => void;
}

export function PropiedadesEmpty({ variant, onClearFilters }: PropiedadesEmptyProps) {
  if (variant === "portfolio") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gradient-to-b from-white to-gray-50/80 px-6 py-16 sm:py-20 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #d1d5db 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
            <Building2 size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Empieza tu cartera de alquileres</h2>
          <p className="mt-2 max-w-md mx-auto text-sm text-gray-500 leading-relaxed">
            Aún no tienes propiedades registradas. Crea la primera con el asistente paso a paso:
            ubicación, precio, foto y tipo de renta.
          </p>
          <Link href="/dashboard/propiedades/nueva" className="inline-block mt-8">
            <Button variant="primary" size="lg" className="gap-2 shadow-md shadow-brand-600/20">
              <Plus size={18} />
              Crear primera propiedad
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Search size={24} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Sin resultados</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
        Ninguna propiedad coincide con los filtros actuales. Prueba otra ciudad o amplía los
        criterios de búsqueda.
      </p>
      {onClearFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800 transition-colors"
        >
          <FilterX size={16} />
          Limpiar filtros
        </button>
      ) : null}
    </div>
  );
}
