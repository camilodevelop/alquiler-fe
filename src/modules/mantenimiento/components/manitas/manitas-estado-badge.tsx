import { Badge } from "@/components/ui";
import { MANITAS_ESTADO_CONFIG } from "../../constants";
import type { ManitasEstado } from "../../types";

export function ManitasEstadoBadge({ estado }: { estado: ManitasEstado }) {
  const cfg = MANITAS_ESTADO_CONFIG[estado];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
