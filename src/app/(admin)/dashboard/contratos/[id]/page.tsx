import Link from "next/link";
import { getContratoAction } from "@/app/actions/contratos";
import { ContractDetail } from "@/modules/contratos/components/detail/contract-detail";

export default async function ContratoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: contract, error } = await getContratoAction(id);

  if (!contract) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">{error ?? "Contrato no encontrado."}</p>
        <Link
          href="/dashboard/contratos"
          className="text-sm text-brand-700 mt-2 inline-block hover:underline"
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  return <ContractDetail initialContract={contract} />;
}
