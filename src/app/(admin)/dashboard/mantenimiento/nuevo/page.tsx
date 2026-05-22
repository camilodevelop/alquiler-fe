import { listPropiedadesAction } from "@/app/actions/propiedades";
import { listInquilinosAction } from "@/app/actions/inquilinos";
import { TicketForm } from "@/modules/mantenimiento/components/form/ticket-form";
import { TicketFormShell } from "@/modules/mantenimiento/components/form/ticket-form-shell";

export default async function NuevoTicketPage() {
  const [{ data: propiedades }, { data: inquilinos }] = await Promise.all([
    listPropiedadesAction(),
    listInquilinosAction(),
  ]);

  return (
    <TicketFormShell mode="create" backHref="/dashboard/mantenimiento" backLabel="Volver al listado">
      <TicketForm mode="create" propiedades={propiedades ?? []} inquilinos={inquilinos ?? []} />
    </TicketFormShell>
  );
}
