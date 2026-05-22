"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ContractTemplateEditor } from "@/modules/contratos/components/templates/contract-template-editor";
import { contractService } from "@/modules/contratos/services/contracts.service";
import type { ContractTemplateFormValues } from "@/shared/schemas/contrato";
import { useEffect, useState } from "react";
import type { ContractTemplate } from "@/modules/contratos/types";

export default function EditarTipoContratoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [template, setTemplate] = useState<ContractTemplate | null>(null);

  useEffect(() => {
    void contractService.getTemplateById(id).then(({ data }) => setTemplate(data));
  }, [id]);

  const handleSubmit = async (values: ContractTemplateFormValues) => {
    const res = await contractService.updateTemplate(id, values);
    if (res.error || !res.data) return { error: res.error ?? "No se pudo guardar" };
    router.push("/dashboard/contratos/tipos");
    return {};
  };

  if (!template) {
    return <p className="text-gray-500">Cargando...</p>;
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Editar tipo de contrato</h1>
      </div>
      <ContractTemplateEditor
        initial={template}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
