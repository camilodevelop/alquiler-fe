import Link from "next/link";
import { ChevronLeft, Pencil, Plus } from "lucide-react";

interface PropiedadFormShellProps {
  mode: "create" | "edit";
  backHref: string;
  backLabel: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function PropiedadFormShell({
  mode,
  backHref,
  backLabel,
  subtitle,
  children,
}: PropiedadFormShellProps) {
  const isCreate = mode === "create";

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-brand-50/25 to-white px-5 py-7 sm:px-8 sm:py-9 shadow-sm">
        <div
          className="pointer-events-none absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-brand-200/25 blur-2xl"
          aria-hidden
        />
        <div className="relative space-y-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 transition-colors"
          >
            <ChevronLeft size={16} />
            {backLabel}
          </Link>
          <div className="flex gap-4 items-start">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
              {isCreate ? <Plus size={22} strokeWidth={2} /> : <Pencil size={20} strokeWidth={2} />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-1">
                {isCreate ? "Alta de inmueble" : "Modificación"}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {isCreate ? "Nueva propiedad" : "Editar propiedad"}
              </h1>
              <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
                {subtitle ??
                  (isCreate
                    ? "Completa los 5 pasos del asistente. Los datos obligatorios se validan antes de avanzar."
                    : "Actualiza la información del inmueble. Los cambios se guardan al finalizar el último paso.")}
              </p>
            </div>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
