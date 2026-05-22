import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui";
import { listPropiedadesAction } from "@/app/actions/propiedades";
import { listInquilinosAction } from "@/app/actions/inquilinos";
import { listContratosAction, listContratoTiposAction } from "@/app/actions/contratos";
import { toListItem } from "@/modules/contratos/utils/filters";
import { ContratosPageClient } from "./contratos-page-client";

export default async function ContratosPage() {
  const [
    { data: propiedades },
    { data: inquilinos },
    { data: contratos, error: contratosError },
    { data: templates, error: templatesError },
  ] = await Promise.all([
    listPropiedadesAction(),
    listInquilinosAction(),
    listContratosAction(),
    listContratoTiposAction(),
  ]);

  const dbError = contratosError ?? templatesError;
  const initialData = (contratos ?? []).map(toListItem);

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-brand-50/30 to-white px-6 py-8 sm:px-8 sm:py-10 shadow-sm">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand-200/30 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/25">
              <FileText size={28} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-1">
                Legal y arrendamientos
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Contratos
              </h1>
              <p className="text-sm text-gray-600 mt-2 max-w-xl leading-relaxed">
                Registra contratos con plantillas HTML, vista previa y firma simulada. Al activarse,
                la propiedad pasa a ocupada y el inquilino a activo.
              </p>
            </div>
          </div>
          <Link href="/dashboard/contratos/nuevo" className="self-start lg:self-center shrink-0">
            <Button variant="primary" size="md" className="gap-2 shadow-md shadow-brand-600/20">
              <Plus size={16} />
              Nuevo contrato
            </Button>
          </Link>
        </div>
      </header>

      {dbError && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          {dbError}. Ejecuta <code className="text-xs bg-amber-100 px-1 rounded">supabase/scripts/05_modulo_contratos.sql</code> en el SQL Editor.
        </div>
      )}

      <ContratosPageClient
        initialData={initialData}
        propiedades={propiedades}
        inquilinos={inquilinos}
        templates={templates}
        dbError={dbError}
      />
    </div>
  );
}
