import type { ContractSignatureSummary, ContractStatus } from "../types";
import { CONTRACT_STATUS_CONFIG, SIGNATURE_SUMMARY_CONFIG } from "../constants";

export function formatPrecio(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatFecha(iso: string): string {
  if (!iso) return "—";
  const d = iso.includes("T") ? iso.slice(0, 10) : iso;
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return iso;
  return `${day}/${m}/${y}`;
}

export function getContractStatusLabel(estado: ContractStatus): string {
  return CONTRACT_STATUS_CONFIG[estado]?.label ?? estado;
}

export function getSignatureSummaryLabel(summary: ContractSignatureSummary): string {
  return SIGNATURE_SUMMARY_CONFIG[summary]?.label ?? summary;
}

export function getSignatureSummary(
  firmas: { estado: string }[],
): ContractSignatureSummary {
  const firmadas = firmas.filter((f) => f.estado === "firmado").length;
  if (firmadas === 0) return "pendiente";
  if (firmadas < firmas.length) return "parcial";
  return "completa";
}
