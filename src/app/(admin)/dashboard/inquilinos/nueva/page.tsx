import { listPropiedadesAction } from "@/app/actions/propiedades";
import { InquilinoFormShell } from "@/modules/inquilinos/components/form/inquilino-form-shell";
import { InquilinoWizard } from "@/modules/inquilinos/components/form/inquilino-wizard";

export default async function NuevaInquilinoPage() {
  const { data: propiedades } = await listPropiedadesAction();

  return (
    <InquilinoFormShell mode="create" backHref="/dashboard/inquilinos" backLabel="Volver al listado">
      <InquilinoWizard mode="create" propiedades={propiedades} />
    </InquilinoFormShell>
  );
}
