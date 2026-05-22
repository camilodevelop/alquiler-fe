export function formatEuro(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNum(n: number): string {
  return new Intl.NumberFormat("es-ES").format(n);
}

export function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}
