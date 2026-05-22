"use client";

import { useEffect, useState } from "react";
import type { Propiedad } from "@/modules/propiedades/types";
import type { Inquilino } from "@/modules/inquilinos/types";
import type { Contract, ContractTemplate } from "@/modules/contratos/types";
import { ContractForm } from "@/modules/contratos/components/form/contract-form";
import { contractService } from "@/modules/contratos/services/contracts.service";

export function ContractFormClientWrapper({
  mode,
  contractId,
  initialContract,
  propiedades,
  inquilinos,
}: {
  mode: "create" | "edit";
  contractId?: string;
  initialContract?: Contract | null;
  propiedades: Propiedad[];
  inquilinos: Inquilino[];
}) {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    void contractService.getTemplates(true).then(({ data, error: err }) => {
      setTemplates(data);
      setError(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando plantillas...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        {error}
      </p>
    );
  }

  if (templates.length === 0) {
    return (
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        No hay tipos de contrato activos.{" "}
        <a href="/dashboard/contratos/tipos/nuevo" className="font-medium underline">
          Crea uno primero
        </a>
        .
      </p>
    );
  }

  return (
    <ContractForm
      mode={mode}
      contractId={contractId}
      initialContract={initialContract}
      propiedades={propiedades}
      inquilinos={inquilinos}
      templates={templates}
    />
  );
}
