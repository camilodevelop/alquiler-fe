"use client";

import { Badge } from "@/components/ui";
import type { ContractSignatureSummary } from "../types";
import { SIGNATURE_SUMMARY_CONFIG } from "../constants";

export function SignatureStatusBadge({ summary }: { summary: ContractSignatureSummary }) {
  const cfg = SIGNATURE_SUMMARY_CONFIG[summary];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
