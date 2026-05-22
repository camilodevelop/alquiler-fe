import { MANITAS_ESTADO_CONFIG } from "../../constants";
import type { ManitasEstado } from "../../types";

const TONE: Record<
  (typeof MANITAS_ESTADO_CONFIG)[ManitasEstado]["variant"],
  { wrap: string; dot: string }
> = {
  success: { wrap: "bg-emerald-50 text-emerald-700 border-emerald-200/70", dot: "bg-emerald-500" },
  warning: { wrap: "bg-amber-50 text-amber-800 border-amber-200/70", dot: "bg-amber-500" },
  danger: { wrap: "bg-red-50 text-red-700 border-red-200/70", dot: "bg-red-500" },
  info: { wrap: "bg-sky-50 text-sky-700 border-sky-200/70", dot: "bg-sky-500" },
  default: { wrap: "bg-slate-50 text-slate-600 border-slate-200/80", dot: "bg-slate-400" },
};

export function ManitasEstadoBadge({
  estado,
  className = "",
}: {
  estado: ManitasEstado;
  className?: string;
}) {
  const cfg = MANITAS_ESTADO_CONFIG[estado];
  const tone = TONE[cfg.variant];

  return (
    <span
      className={[
        "inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-0.5",
        "text-[10px] font-semibold leading-none tracking-wide shrink-0",
        tone.wrap,
        className,
      ].join(" ")}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden />
      <span className="truncate">{cfg.label}</span>
    </span>
  );
}
