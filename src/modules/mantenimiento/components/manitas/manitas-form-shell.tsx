import Link from "next/link";
import { ChevronLeft, UserPlus, Pencil } from "lucide-react";

export function ManitasFormShell({
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
      <header className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-violet-50/35 to-white px-5 py-7 sm:px-8 shadow-sm">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-violet-800 mb-4"
        >
          <ChevronLeft size={16} />
          {backLabel}
        </Link>
        <div className="flex gap-4">
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
            {mode === "create" ? <UserPlus size={22} /> : <Pencil size={20} />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-800 mb-1">
              {mode === "create" ? "Alta de técnico" : "Editar perfil"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {mode === "create" ? "Nuevo manitas" : "Editar manitas"}
            </h1>
            {subtitle && <p className="text-sm text-gray-600 mt-2">{subtitle}</p>}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
