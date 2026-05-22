import { MOVIMIENTO_TIPO_CONFIG } from "../constants";
import type { MovimientoTipo } from "../types";

export function MovimientoTipoBadge({ tipo }: { tipo: MovimientoTipo }) {
  const cfg = MOVIMIENTO_TIPO_CONFIG[tipo];
  const cls =
    tipo === "ingreso"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200/90 ring-emerald-100"
      : "bg-rose-50 text-rose-800 border-rose-200/90 ring-rose-100";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${cls}`}
    >
      {cfg.label}
    </span>
  );
}
