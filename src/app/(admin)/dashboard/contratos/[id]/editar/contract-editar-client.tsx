"use client";

import Link from "next/link";
import { contractService } from "@/modules/contratos/services/contracts.service";
import { ContractFormClientWrapper } from "../../nuevo/contract-form-client";
import type { Propiedad } from "@/modules/propiedades/types";
import type { Inquilino } from "@/modules/inquilinos/types";
import type { Contract } from "@/modules/contratos/types";
import { useEffect, useState } from "react";

export function ContractEditarClient({
  id,
  propiedades,
  inquilinos,
}: {
  id: string;
  propiedades: Propiedad[];
  inquilinos: Inquilino[];
}) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void contractService.getContractById(id).then(({ data }) => {
      setContract(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p className="text-gray-500 text-sm">Cargando...</p>;

  if (!contract) {
    return (
      <p className="text-gray-600">
        Contrato no encontrado.{" "}
        <Link href="/dashboard/contratos" className="text-brand-700 hover:underline">
          Volver
        </Link>
      </p>
    );
  }

  if (contract.estado !== "borrador" && contract.estado !== "pendiente_firma") {
    return (
      <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
        Este contrato no se puede editar en estado «{contract.estado}».
      </p>
    );
  }

  return (
    <ContractFormClientWrapper
      mode="edit"
      contractId={id}
      initialContract={contract}
      propiedades={propiedades}
      inquilinos={inquilinos}
    />
  );
}
