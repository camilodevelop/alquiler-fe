import { MESES_CORTOS } from "../constants";

export function defaultReportDateRange(): { fecha_desde: string; fecha_hasta: string } {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - 5, 1);
  return {
    fecha_desde: toIsoDate(start),
    fecha_hasta: toIsoDate(end),
  };
}

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseIso(iso: string): Date {
  const [y, m, day] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function inDateRange(
  iso: string | null | undefined,
  desde?: string,
  hasta?: string,
): boolean {
  if (!iso) return true;
  const d = iso.slice(0, 10);
  if (desde && d < desde) return false;
  if (hasta && d > hasta) return false;
  return true;
}

export function monthBuckets(desde: string, hasta: string): string[] {
  const start = parseIso(desde);
  const end = parseIso(hasta);
  const keys: string[] = [];
  let y = start.getFullYear();
  let m = start.getMonth();
  const endY = end.getFullYear();
  const endM = end.getMonth();

  while (y < endY || (y === endY && m <= endM)) {
    keys.push(`${y}-${String(m + 1).padStart(2, "0")}`);
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return keys;
}

export function monthLabel(key: string): string {
  const [, mm] = key.split("-");
  const m = parseInt(mm, 10);
  return MESES_CORTOS[m - 1] ?? key;
}

export function daysBetween(startIso: string, endIso?: string): number {
  const start = parseIso(startIso);
  const end = endIso ? parseIso(endIso) : new Date();
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
}
