import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";
import { listContratoTiposAction } from "@/app/actions/contratos";
import { TiposContratoListClient } from "./tipos-contrato-list-client";

export default async function TiposContratoPage() {
  const { data: templates, error } = await listContratoTiposAction();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/contratos"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700"
      >
        <ArrowLeft size={14} />
        Volver a contratos
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de contrato</h1>
          <p className="text-sm text-gray-600 mt-1">
            Plantillas HTML con variables dinámicas para generar contratos.
          </p>
        </div>
        <Link href="/dashboard/contratos/tipos/nuevo">
          <Button variant="primary" size="md" className="gap-2">
            <Plus size={16} />
            Nuevo tipo
          </Button>
        </Link>
      </div>

      {error && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <TiposContratoListClient initialTemplates={templates} />
    </div>
  );
}
