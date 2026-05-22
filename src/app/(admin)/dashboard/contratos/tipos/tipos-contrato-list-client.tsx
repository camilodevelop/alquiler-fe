"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Power } from "lucide-react";
import { Badge } from "@/components/ui";
import type { ContractTemplate } from "@/modules/contratos/types";
import { contractService } from "@/modules/contratos/services/contracts.service";

export function TiposContratoListClient({
  initialTemplates,
}: {
  initialTemplates: ContractTemplate[];
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);

  const toggle = async (id: string) => {
    await contractService.toggleTemplateActive(id);
    const { data } = await contractService.getTemplates();
    setTemplates(data);
    router.refresh();
  };

  if (templates.length === 0) {
    return (
      <p className="text-sm text-gray-500 rounded-xl border border-dashed border-gray-200 p-8 text-center">
        No hay tipos de contrato. Crea el primero para empezar.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {templates.map((t) => (
        <article
          key={t.id}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-brand-200/60 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold text-gray-900">{t.nombre}</h2>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{t.descripcion}</p>
            </div>
            <Badge variant={t.activo ? "success" : "default"}>
              {t.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <Link
              href={`/dashboard/contratos/tipos/${t.id}/editar`}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
            >
              <Pencil size={14} />
              Editar
            </Link>
            <button
              type="button"
              onClick={() => void toggle(t.id)}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 ml-auto"
            >
              <Power size={14} />
              {t.activo ? "Desactivar" : "Activar"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
