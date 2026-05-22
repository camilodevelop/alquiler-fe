"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ContractTemplateEditor } from "@/modules/contratos/components/templates/contract-template-editor";
import { contractService } from "@/modules/contratos/services/contracts.service";
import type { ContractTemplateFormValues } from "@/shared/schemas/contrato";

export default function NuevoTipoContratoPage() {
  const router = useRouter();

  const handleSubmit = async (values: ContractTemplateFormValues) => {
    const res = await contractService.createTemplate(values);
    if (res.error) return { error: res.error };
    router.push("/dashboard/contratos/tipos");
    return {};
  };

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/contratos/tipos"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700"
      >
        <ArrowLeft size={14} />
        Volver a tipos
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo tipo de contrato</h1>
        <p className="text-sm text-gray-600 mt-1">Define la plantilla HTML y las variables.</p>
      </div>
      <ContractTemplateEditor onSubmit={handleSubmit} onCancel={() => router.back()} />
    </div>
  );
}
