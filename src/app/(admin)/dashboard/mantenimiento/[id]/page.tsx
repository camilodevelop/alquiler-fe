import { notFound } from "next/navigation";
import {
  getTicketAction,
  listAssignableManitasAction,
} from "@/app/actions/mantenimiento";
import { TicketDetail } from "@/modules/mantenimiento/components/detail/ticket-detail";

export default async function TicketDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: ticket, error }, { data: assignable }] = await Promise.all([
    getTicketAction(id),
    listAssignableManitasAction(),
  ]);

  if (!ticket) notFound();

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      <TicketDetail ticket={ticket} assignableManitas={assignable ?? []} />
    </div>
  );
}
