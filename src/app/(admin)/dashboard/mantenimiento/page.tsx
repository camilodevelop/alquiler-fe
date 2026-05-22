import Link from "next/link";
import { Plus, Wrench } from "lucide-react";
import { Button } from "@/components/ui";
import { listPropiedadesAction } from "@/app/actions/propiedades";
import {
  listAssignableManitasAction,
  listManitasAction,
  listTicketsAction,
} from "@/app/actions/mantenimiento";
import { MantenimientoPageClient } from "./mantenimiento-page-client";

export default async function MantenimientoPage() {
  const [
    { data: propiedades },
    { data: tickets, error: ticketsError },
    { data: manitasList, error: manitasError },
    { data: assignable },
  ] = await Promise.all([
    listPropiedadesAction(),
    listTicketsAction(),
    listManitasAction(),
    listAssignableManitasAction(),
  ]);

  const dbError = ticketsError ?? manitasError;

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-amber-50/40 to-white px-6 py-8 sm:px-8 sm:py-10 shadow-sm">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-200/30 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-600/25">
              <Wrench size={28} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
                Operaciones
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Tickets de mantenimiento
              </h1>
              <p className="text-sm text-gray-600 mt-2 max-w-xl leading-relaxed">
                Centro de incidentes: filtra por estado, asigna técnicos y avanza cada caso hasta el cierre.
              </p>
            </div>
          </div>
          <Link href="/dashboard/mantenimiento/nuevo" className="self-start lg:self-center shrink-0">
            <Button variant="primary" size="md" className="gap-2 shadow-md shadow-brand-600/20">
              <Plus size={16} />
              Nuevo ticket
            </Button>
          </Link>
        </div>
      </header>

      {dbError && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          {dbError}. Ejecuta{" "}
          <code className="text-xs bg-amber-100 px-1 rounded">
            supabase/scripts/06_modulo_mantenimiento.sql
          </code>{" "}
          en el SQL Editor.
        </div>
      )}

      <MantenimientoPageClient
        initialData={tickets ?? []}
        propiedades={propiedades ?? []}
        manitasList={manitasList ?? []}
        assignableManitas={assignable ?? []}
        dbError={dbError}
      />
    </div>
  );
}
