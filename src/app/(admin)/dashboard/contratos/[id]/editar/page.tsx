import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listPropiedadesAction } from "@/app/actions/propiedades";
import { listInquilinosAction } from "@/app/actions/inquilinos";
import { ContractEditarClient } from "./contract-editar-client";

export default async function EditarContratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: propiedades }, { data: inquilinos }] = await Promise.all([
    listPropiedadesAction(),
    listInquilinosAction(),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/contratos/${id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700"
      >
        <ArrowLeft size={14} />
        Volver al contrato
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar contrato</h1>
      </div>
      <ContractEditarClient id={id} propiedades={propiedades} inquilinos={inquilinos} />
    </div>
  );
}
