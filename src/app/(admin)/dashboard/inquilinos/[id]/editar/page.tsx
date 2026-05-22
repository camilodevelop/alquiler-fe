import { InquilinoFormShell } from "@/modules/inquilinos/components/form/inquilino-form-shell";
import { InquilinosEditarClient } from "./inquilino-editar-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarInquilinoPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <InquilinoFormShell
      mode="edit"
      backHref={`/dashboard/inquilinos/${id}`}
      backLabel="Volver al detalle"
    >
      <InquilinosEditarClient id={id} />
    </InquilinoFormShell>
  );
}
