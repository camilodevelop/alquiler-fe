import { notFound } from "next/navigation";
import { getManitasAction } from "@/app/actions/mantenimiento";
import { ManitasForm } from "@/modules/mantenimiento/components/manitas/manitas-form";
import { ManitasFormShell } from "@/modules/mantenimiento/components/manitas/manitas-form-shell";
import { manitasNombreCompleto } from "@/modules/mantenimiento/utils/labels";

export default async function EditarManitasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: manitas } = await getManitasAction(id);

  if (!manitas) notFound();

  return (
    <ManitasFormShell
      mode="edit"
      backHref={`/dashboard/mantenimiento/maestros/${id}`}
      backLabel="Volver al perfil"
      subtitle={manitasNombreCompleto(manitas)}
    >
      <ManitasForm mode="edit" manitasId={id} initial={manitas} />
    </ManitasFormShell>
  );
}
