import type { ContratoCobroResumen, MesCobroEstado } from "../types";

export const MES_COBRO_CONFIG: Record<
  MesCobroEstado,
  { label: string; short: string; cell: string; dot: string }
> = {
  pagado: {
    label: "Pagado",
    short: "OK",
    cell: "bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/30",
    dot: "bg-emerald-500",
  },
  pendiente: {
    label: "Pendiente",
    short: "Pend.",
    cell: "bg-amber-100 text-amber-900 border-amber-300",
    dot: "bg-amber-500",
  },
  parcial: {
    label: "Parcial",
    short: "Parc.",
    cell: "bg-sky-100 text-sky-900 border-sky-300",
    dot: "bg-sky-500",
  },
  vencido: {
    label: "Vencido",
    short: "Venc.",
    cell: "bg-red-500 text-white border-red-600 shadow-sm shadow-red-500/25",
    dot: "bg-red-500",
  },
  sin_registro: {
    label: "Sin cobro",
    short: "Mora",
    cell: "bg-red-600 text-white border-red-700 ring-2 ring-red-300/50",
    dot: "bg-red-600",
  },
  futuro: {
    label: "Próximo",
    short: "—",
    cell: "bg-gray-100 text-gray-400 border-gray-200 border-dashed",
    dot: "bg-gray-300",
  },
  cancelado: {
    label: "Cancelado",
    short: "Can.",
    cell: "bg-gray-200 text-gray-500 border-gray-300 line-through",
    dot: "bg-gray-400",
  },
};

export const CONTRATO_RESUMEN_CONFIG: Record<
  ContratoCobroResumen,
  { label: string; badge: string; description: string }
> = {
  al_dia: {
    label: "Al día",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description: "Sin meses vencidos en la vigencia",
  },
  mora: {
    label: "En mora",
    badge: "bg-red-50 text-red-800 border-red-200",
    description: "Hay meses vencidos o sin cobro registrado",
  },
  parcial: {
    label: "Pago parcial",
    badge: "bg-sky-50 text-sky-800 border-sky-200",
    description: "Algún mes con cobro incompleto",
  },
  pendiente_futuro: {
    label: "Al día",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description: "Sin meses vencidos en la vigencia",
  },
};
