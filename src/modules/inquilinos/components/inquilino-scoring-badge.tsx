import { NIVELES_SCORING } from "../constants";
import type { NivelScoring } from "../types";

export function InquilinoScoringBadge({ nivel }: { nivel: NivelScoring }) {
  const cfg = NIVELES_SCORING.find((n) => n.value === nivel) ?? NIVELES_SCORING[0];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}
