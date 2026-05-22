import Link from "next/link";
import { ChevronLeft, ClipboardPlus, Pencil } from "lucide-react";

export function TicketFormShell({
  mode,
  backHref,
  backLabel,
  subtitle,
  children,
}: {
  mode: "create" | "edit";
  backHref: string;
  backLabel: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-amber-50/35 to-white px-5 py-7 sm:px-8 shadow-sm">
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-amber-200/25 blur-2xl"
          aria-hidden
        />
        <Link
          href={backHref}
          className="relative inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-amber-800 mb-4"
        >
          <ChevronLeft size={16} />
          {backLabel}
        </Link>
        <div className="relative flex gap-4">
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md shadow-amber-600/20">
            {mode === "create" ? <ClipboardPlus size={22} /> : <Pencil size={20} />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
              {mode === "create" ? "Nueva incidencia" : "Edición de ticket"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {mode === "create" ? "Registrar ticket" : "Editar ticket"}
            </h1>
            {subtitle ? (
              <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">{subtitle}</p>
            ) : (
              <p className="text-sm text-gray-600 mt-2 max-w-2xl">
                Completa los datos de la incidencia. Los campos marcados con * son obligatorios.
              </p>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
