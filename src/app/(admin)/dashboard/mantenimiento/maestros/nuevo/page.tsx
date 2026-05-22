import { ManitasForm } from "@/modules/mantenimiento/components/manitas/manitas-form";
import { ManitasFormShell } from "@/modules/mantenimiento/components/manitas/manitas-form-shell";

export default function NuevoManitasPage() {
  return (
    <ManitasFormShell
      mode="create"
      backHref="/dashboard/mantenimiento/maestros"
      backLabel="Volver al equipo"
      subtitle="Completa el perfil profesional: foto, hoja de vida y puntuación."
    >
      <ManitasForm mode="create" />
    </ManitasFormShell>
  );
}
