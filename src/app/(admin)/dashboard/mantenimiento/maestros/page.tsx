import Link from "next/link";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui";
import { listManitasAction } from "@/app/actions/mantenimiento";
import { MaestrosPageClient } from "./maestros-page-client";

export default async function ManitasPage() {
  const { data: list, error } = await listManitasAction();

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-violet-50/30 to-white px-6 py-8 sm:px-8 shadow-sm">
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col gap-4">
            <Link
              href="/dashboard/mantenimiento"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-violet-700 w-fit"
            >
              <ArrowLeft size={16} />
              Tickets de mantenimiento
            </Link>
            <div className="flex gap-4 items-start">
              <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
                <Users size={28} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-800 mb-1">
                  Equipo técnico
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manitas y técnicos</h1>
                <p className="text-sm text-gray-600 mt-2 max-w-xl">
                  Perfiles con foto, hoja de vida, puntuación e historial de trabajos. Vista en tarjetas o tabla.
                </p>
              </div>
            </div>
          </div>
          <Link href="/dashboard/mantenimiento/maestros/nuevo" className="self-start lg:self-center shrink-0">
            <Button variant="primary" size="md" className="gap-2 shadow-md shadow-violet-600/20">
              <Plus size={16} />
              Nuevo manitas
            </Button>
          </Link>
        </div>
      </header>

      <MaestrosPageClient initialList={list ?? []} dbError={error} />
    </div>
  );
}
