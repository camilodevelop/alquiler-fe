import { PropiedadWizard } from "@/modules/propiedades/components/form/propiedad-wizard";
import { PropiedadFormShell } from "@/modules/propiedades/components/form/propiedad-form-shell";

export default function NuevaPropiedadPage() {
  return (
    <PropiedadFormShell
      mode="create"
      backHref="/dashboard/propiedades"
      backLabel="Volver al listado"
    >
      <PropiedadWizard mode="create" />
    </PropiedadFormShell>
  );
}
