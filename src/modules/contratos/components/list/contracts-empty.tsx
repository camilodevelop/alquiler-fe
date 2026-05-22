"use client";

import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui";

export function ContractsEmpty({
  variant,
  onClearFilters,
}: {
  variant: "empty" | "filters";
  onClearFilters?: () => void;
}) {
  if (variant === "filters") {
    return (
      <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
        <p className="text-gray-600">No hay contratos con estos filtros.</p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-3 text-sm font-medium text-brand-700 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 bg-gradient-to-b from-brand-50/30 to-white">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mb-4">
        <FileText size={28} />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Aún no hay contratos</h2>
      <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
        Crea tipos de contrato con plantillas HTML y registra el primer contrato de alquiler.
      </p>
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <Link href="/dashboard/contratos/tipos">
          <Button variant="secondary" size="md">
            Tipos de contrato
          </Button>
        </Link>
        <Link href="/dashboard/contratos/nuevo">
          <Button variant="primary" size="md" className="gap-2">
            <Plus size={16} />
            Nuevo contrato
          </Button>
        </Link>
      </div>
    </div>
  );
}
