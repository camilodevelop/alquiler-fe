import { notFound } from "next/navigation";
import { getTicketAction } from "@/app/actions/mantenimiento";
import { listPropiedadesAction } from "@/app/actions/propiedades";
import { listInquilinosAction } from "@/app/actions/inquilinos";
import { TicketForm } from "@/modules/mantenimiento/components/form/ticket-form";
import { TicketFormShell } from "@/modules/mantenimiento/components/form/ticket-form-shell";

export default async function EditarTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: ticket }, { data: propiedades }, { data: inquilinos }] = await Promise.all([
    getTicketAction(id),
    listPropiedadesAction(),
    listInquilinosAction(),
  ]);

  if (!ticket) notFound();

  return (
    <TicketFormShell
      mode="edit"
      backHref={`/dashboard/mantenimiento/${id}`}
      backLabel="Volver al detalle"
      subtitle={`Ticket ${ticket.codigo} · ${ticket.titulo}`}
    >
      <TicketForm
        mode="edit"
        ticketId={id}
        initialTicket={ticket}
        propiedades={propiedades ?? []}
        inquilinos={inquilinos ?? []}
      />
    </TicketFormShell>
  );
}
