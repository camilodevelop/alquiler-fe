const LOCALE = 'es-ES'

/** 150000 → "150.000,00 €" */
export function formatEuros(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/** 150000 → "150.000 €" (sin decimales para cantidades grandes) */
export function formatEurosSinDecimales(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/** 7.5 → "7,50%" */
export function formatPorcentaje(value: number, decimales = 2): string {
  return `${new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(value)}%`
}

/** null | 12.3 → "12,3 años" | "N/A" */
export function formatAnios(value: number | null | undefined): string {
  if (value == null || !isFinite(value) || value < 0) return 'N/A'
  return `${new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)} años`
}

/** Formatea un porcentaje o devuelve "N/A" si es null/NaN */
export function formatPorcentajeONa(
  value: number | null | undefined,
  decimales = 2,
): string {
  if (value == null || !isFinite(value)) return 'N/A'
  return formatPorcentaje(value, decimales)
}

/** Formatea euros o devuelve "N/A" si es null/NaN */
export function formatEurosONa(value: number | null | undefined): string {
  if (value == null || !isFinite(value)) return 'N/A'
  return formatEuros(value)
}

/** 1500000 → "1.500.000" (solo número, sin símbolo de moneda) */
export function formatNumero(value: number, decimales = 0): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(value)
}
