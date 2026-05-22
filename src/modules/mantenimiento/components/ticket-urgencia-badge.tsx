import { Badge } from "@/components/ui";
import { TICKET_URGENCIA_CONFIG } from "../constants";
import type { TicketUrgencia } from "../types";

export function TicketUrgenciaBadge({ urgencia }: { urgencia: TicketUrgencia }) {
  const cfg = TICKET_URGENCIA_CONFIG[urgencia];
  return <Badge variant={cfg?.variant ?? "default"}>{cfg?.label ?? urgencia}</Badge>;
}
