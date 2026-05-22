"use client";

import { Badge } from "@/components/ui";
import type { ContractStatus } from "../types";
import { CONTRACT_STATUS_CONFIG } from "../constants";

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const cfg = CONTRACT_STATUS_CONFIG[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
