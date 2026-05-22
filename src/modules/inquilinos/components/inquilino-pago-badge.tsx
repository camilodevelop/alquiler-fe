import { Badge } from "@/components/ui";
import { PAGO_BADGE_VARIANT } from "../constants";
import { getPagoLabel } from "../utils/labels";
import type { EstadoPagoInquilino } from "../types";

export function InquilinoPagoBadge({ estado }: { estado: EstadoPagoInquilino }) {
  return <Badge variant={PAGO_BADGE_VARIANT[estado]}>{getPagoLabel(estado)}</Badge>;
}
