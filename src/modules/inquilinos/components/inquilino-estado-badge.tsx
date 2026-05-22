import { Badge } from "@/components/ui";
import { STATUS_BADGE_VARIANT } from "../constants";
import { getStatusLabel } from "../utils/labels";
import type { InquilinoStatus } from "../types";

export function InquilinoEstadoBadge({ status }: { status: InquilinoStatus }) {
  const highlight = status === "moroso";
  return (
    <span className={highlight ? "inline-flex ring-2 ring-red-300 ring-offset-1 rounded-full" : "inline-flex"}>
      <Badge variant={STATUS_BADGE_VARIANT[status]}>{getStatusLabel(status)}</Badge>
    </span>
  );
}
