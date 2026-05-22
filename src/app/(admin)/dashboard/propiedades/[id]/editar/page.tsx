import { notFound } from "next/navigation";
import { getPropiedadAction } from "@/app/actions/propiedades";
import { PropiedadWizard } from "@/modules/propiedades/components/form/propiedad-wizard";
import { PropiedadFormShell } from "@/modules/propiedades/components/form/propiedad-form-shell";
import { propiedadToFormValues } from "@/modules/propiedades/utils/defaults";

interface EditarPropiedadPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarPropiedadPage({ params }: EditarPropiedadPageProps) {
  const { id } = await params;
  const { data: propiedad, error } = await getPropiedadAction(id);

  if (error || !propiedad) {
    notFound();
  }

  return (
    <PropiedadFormShell
      mode="edit"
      backHref={`/dashboard/propiedades/${id}`}
      backLabel="Volver al detalle"
      subtitle={propiedad.titulo}
    >
      <PropiedadWizard
        mode="edit"
        propiedadId={id}
        initialValues={propiedadToFormValues(propiedad)}
        existingFotoUrl={propiedad.foto_principal_url}
      />
    </PropiedadFormShell>
  );
}
