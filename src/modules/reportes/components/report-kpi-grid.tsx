import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  FileText,
  Home,
  Key,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { ReportKpi } from "../types";

const ICONS: Record<string, typeof Building2> = {
  prop: Building2,
  ocup: Home,
  disp: Key,
  ing: TrendingUp,
  gas: TrendingDown,
  saldo: Wallet,
  tickets: Wrench,
  contratos: FileText,
  act: CheckCircle2,
  pend: CalendarClock,
  prox: CalendarClock,
  venc: AlertTriangle,
  fin: FileText,
  cob: TrendingUp,
  pag: TrendingDown,
  inq: Users,
  mor: AlertTriangle,
  tot: Users,
  total: Users,
  activos: CheckCircle2,
  morosos: AlertTriangle,
  cand: Users,
  asig: Wrench,
  cerr: CheckCircle2,
  mant: Wrench,
  best: TrendingUp,
  "max-gasto": TrendingDown,
  nuevo: FileText,
  proc: Wrench,
  res: CheckCircle2,
  crit: AlertTriangle,
  abiertos: Wrench,
};

const TONE = {
  default: {
    card: "bg-white border-slate-200/90",
    icon: "bg-slate-100 text-slate-600",
    value: "text-slate-900",
  },
  success: {
    card: "bg-gradient-to-br from-emerald-50/90 to-white border-emerald-200/70",
    icon: "bg-emerald-100 text-emerald-700",
    value: "text-emerald-800",
  },
  warning: {
    card: "bg-gradient-to-br from-amber-50/90 to-white border-amber-200/70",
    icon: "bg-amber-100 text-amber-700",
    value: "text-amber-800",
  },
  danger: {
    card: "bg-gradient-to-br from-red-50/90 to-white border-red-200/70",
    icon: "bg-red-100 text-red-700",
    value: "text-red-800",
  },
  info: {
    card: "bg-gradient-to-br from-sky-50/90 to-white border-sky-200/70",
    icon: "bg-sky-100 text-sky-700",
    value: "text-sky-800",
  },
} as const;

function KpiIcon({ id, tone }: { id: string; tone: keyof typeof TONE }) {
  const Icon =
    ICONS[id] ??
    (tone === "danger" || tone === "warning" ? AlertTriangle : Building2);
  const t = TONE[tone];
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.icon}`}>
      <Icon size={18} strokeWidth={2} />
    </span>
  );
}

export function ReportKpiGrid({ kpis }: { kpis: ReportKpi[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {kpis.map((kpi) => {
        const tone = kpi.tone ?? "default";
        const t = TONE[tone];
        return (
          <div
            key={kpi.id}
            className={`rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md ${t.card}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-tight">
                  {kpi.label}
                </p>
                <p className={`mt-2 text-xl sm:text-2xl font-bold tabular-nums tracking-tight truncate ${t.value}`}>
                  {kpi.value}
                </p>
                {kpi.sub && (
                  <p className="text-xs text-slate-500 mt-1 truncate">{kpi.sub}</p>
                )}
              </div>
              <KpiIcon id={kpi.id} tone={tone} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
