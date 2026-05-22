import { Badge } from "@/components/ui";
import { ESTADO_BADGE_VARIANT } from "../constants";
import { getEstadoLabel } from "../utils/labels";
import type { EstadoPropiedad } from "../types";

interface PropiedadEstadoBadgeProps {
  estado: EstadoPropiedad;
}

export function PropiedadEstadoBadge({ estado }: PropiedadEstadoBadgeProps) {
  return (
    <Badge variant={ESTADO_BADGE_VARIANT[estado]}>{getEstadoLabel(estado)}</Badge>
  );
}
