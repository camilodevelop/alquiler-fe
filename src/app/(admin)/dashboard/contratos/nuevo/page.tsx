import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listPropiedadesAction } from "@/app/actions/propiedades";
import { listInquilinosAction } from "@/app/actions/inquilinos";
import { ContractFormClientWrapper } from "./contract-form-client";

export default async function NuevoContratoPage() {
  const [{ data: propiedades }, { data: inquilinos }] = await Promise.all([
    listPropiedadesAction(),
    listInquilinosAction(),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/contratos"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700"
      >
        <ArrowLeft size={14} />
        Volver a contratos
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo contrato</h1>
        <p className="text-sm text-gray-600 mt-1">
          Completa los datos y revisa la vista previa con la plantilla seleccionada.
        </p>
      </div>
      <ContractFormClientWrapper mode="create" propiedades={propiedades} inquilinos={inquilinos} />
    </div>
  );
}
