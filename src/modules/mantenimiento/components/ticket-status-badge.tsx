import { Badge } from "@/components/ui";
import { TICKET_ESTADO_CONFIG } from "../constants";
import type { TicketEstado } from "../types";

export function TicketStatusBadge({ status }: { status: TicketEstado }) {
  const cfg = TICKET_ESTADO_CONFIG[status];
  return (
    <span title={cfg?.description} className="inline-flex">
      <Badge variant={cfg?.variant ?? "default"}>{cfg?.label ?? status}</Badge>
    </span>
  );
}
