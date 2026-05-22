import type { Inquilino } from "../types";

export interface InquilinosStats {
  total: number;
  activos: number;
  morosos: number;
  candidatos: number;
  en_revision: number;
}

export function computeInquilinosStats(items: Inquilino[]): InquilinosStats {
  return {
    total: items.length,
    activos: items.filter((i) => i.status === "activo").length,
    morosos: items.filter((i) => i.status === "moroso").length,
    candidatos: items.filter((i) => i.status === "candidato").length,
    en_revision: items.filter((i) => i.status === "en_revision").length,
  };
}
