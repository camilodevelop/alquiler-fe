import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui";
import { listPropiedadesAction } from "@/app/actions/propiedades";
import { listInquilinosAction } from "@/app/actions/inquilinos";
import { InquilinosPageClient } from "./inquilinos-page-client";

export default async function InquilinosPage() {
  const [{ data: inquilinos, error }, { data: propiedades }] = await Promise.all([
    listInquilinosAction(),
    listPropiedadesAction(),
  ]);

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-brand-50/25 to-white px-6 py-8 sm:px-8 shadow-sm">
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex gap-4">
            <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
              <Users size={28} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-1">
                Gestión de inquilinos
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inquilinos</h1>
              <p className="text-sm text-gray-600 mt-2 max-w-xl">
                Candidatos, activos y morosos. Asócialos a propiedades, revisa documentación y scoring.
              </p>
            </div>
          </div>
          <Link href="/dashboard/inquilinos/nueva" className="self-start lg:self-center shrink-0">
            <Button variant="primary" size="md" className="gap-2 shadow-md shadow-brand-600/20">
              <Plus size={16} />
              Nuevo inquilino
            </Button>
          </Link>
        </div>
      </header>

      {error && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          {error}. Ejecuta <code className="font-mono text-xs">04_modulo_inquilinos.sql</code> en Supabase SQL Editor.
        </div>
      )}

      <InquilinosPageClient initialData={inquilinos} propiedades={propiedades} dbError={error} />
    </div>
  );
}
