import { MOVIMIENTO_ESTADO_STYLES } from "../constants";
import { getEstadoLabel } from "../utils/labels";
import type { MovimientoEstado } from "../types";

export function MovimientoEstadoBadge({ estado }: { estado: MovimientoEstado }) {
  const s = MOVIMIENTO_ESTADO_STYLES[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.dot}`} aria-hidden />
      {getEstadoLabel(estado)}
    </span>
  );
}
