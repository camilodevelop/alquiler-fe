import type {
  DatosAdquisicion,
  ResultadosAdquisicion,
  DatosRentabilidad,
  ResultadosRentabilidad,
  SaludInversion,
  PlusvaliaPeriodos,
  ValorFlexible,
  ImpuestoConfig,
} from '../types'

// ─── Helpers internos ─────────────────────────────────────────────────────────

/** Resuelve un ValorFlexible contra su base correspondiente */
export function resolverValor(flex: ValorFlexible, base: number): number {
  if (flex.tipo === 'porcentaje') return (base * flex.valor) / 100
  return flex.valor
}

/** Calcula el importe del impuesto sobre el precio de compra */
function calcularImpuesto(impuesto: ImpuestoConfig, precioCompra: number): number {
  if (!impuesto) return 0
  if (impuesto.tipo === 'itp_manual_euros') return impuesto.euros
  return (precioCompra * impuesto.porcentaje) / 100
}

// ─── Sección 1: Coste de adquisición ──────────────────────────────────────────

export function calcularAdquisicion(datos: DatosAdquisicion): ResultadosAdquisicion {
  const { precioCompra, comisionInmobiliaria, comisionPsi, impuesto, otrosGastos, gastosReforma, tasacion, gestoria } =
    datos

  const valComisionInmobiliaria = resolverValor(comisionInmobiliaria, precioCompra)
  const valComisionPsi = resolverValor(comisionPsi, precioCompra)
  const valImpuestos = calcularImpuesto(impuesto, precioCompra)
  const valOtrosGastos = resolverValor(otrosGastos, precioCompra)
  const valGastosReforma = gastosReforma.activo
    ? resolverValor(gastosReforma, precioCompra)
    : 0
  const valTasacion = tasacion ?? 0
  const valGestoria = gestoria ?? 0

  const totalComisiones = valComisionInmobiliaria + valComisionPsi
  const totalEntrada =
    precioCompra + totalComisiones + valImpuestos + valOtrosGastos + valGastosReforma + valTasacion + valGestoria

  return {
    precioCompra,
    comisionInmobiliaria: valComisionInmobiliaria,
    comisionPsi: valComisionPsi,
    impuestos: valImpuestos,
    otrosGastos: valOtrosGastos,
    gastosReforma: valGastosReforma,
    tasacion: valTasacion,
    gestoria: valGestoria,
    totalEntrada,
    totalComisiones,
  }
}

// ─── Sección 2A: Hipoteca – Amortización francesa ─────────────────────────────

/**
 * Calcula la cuota mensual mediante la fórmula de amortización francesa.
 * cuota = C × [r(1+r)^n] / [(1+r)^n − 1]
 */
export function calcularCuotaFrancesa(
  capital: number,
  tasaAnual: number,   // porcentaje (ej. 3.5)
  plazoAnios: number,
): number {
  if (capital <= 0 || plazoAnios <= 0) return 0
  const r = tasaAnual / 100 / 12
  const n = plazoAnios * 12
  if (r === 0) return capital / n
  return (capital * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

/**
 * Calcula los intereses pagados en el primer año de una hipoteca francesa.
 */
export function calcularInteresesAnio1(
  capital: number,
  tasaAnual: number,
  plazoAnios: number,
): number {
  if (capital <= 0 || plazoAnios <= 0 || tasaAnual <= 0) return 0
  const r = tasaAnual / 100 / 12
  const n = plazoAnios * 12
  const cuota = r === 0 ? capital / n : (capital * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  let balance = capital
  let total = 0
  for (let m = 0; m < 12; m++) {
    const interest = balance * r
    total += interest
    balance -= cuota - interest
  }
  return total
}

/**
 * Calcula la amortización fiscal anual estimada (3% sobre valor construcción).
 * Usa 30% del precio de compra como construcción y 50% de los gastos como mejoras.
 */
export function calcularAmortizacionAnual(
  precioCompra: number,
  impuestos: number,
  otrosGastos: number,
  gastosReforma: number,
): number {
  return 0.03 * (0.30 * precioCompra + 0.50 * (impuestos + otrosGastos + gastosReforma))
}

// ─── TIR mediante bisección ───────────────────────────────────────────────────

function npv(rate: number, flujos: number[]): number {
  return flujos.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0)
}

/**
 * Calcula la TIR (Tasa Interna de Retorno) mediante el método de bisección.
 * flujos[0] debe ser la inversión inicial (negativa).
 * Devuelve el porcentaje anual o null si no hay solución en [-99%, 1000%].
 */
export function calcularTIR(flujos: number[], maxIter = 1000, tol = 1e-7): number | null {
  if (flujos.length < 2) return null

  let lo = -0.999
  let hi = 10.0

  const fnLo = npv(lo, flujos)
  const fnHi = npv(hi, flujos)

  // Sin cambio de signo → TIR fuera del rango o inexistente
  if (fnLo * fnHi > 0) return null

  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2
    const fnMid = npv(mid, flujos)

    if (Math.abs(fnMid) < tol || (hi - lo) / 2 < tol) {
      return mid * 100
    }

    if (fnLo * fnMid < 0) {
      hi = mid
    } else {
      lo = mid
    }
  }

  return ((lo + hi) / 2) * 100
}

// ─── Sección 2B-D: Rentabilidades ─────────────────────────────────────────────

export function calcularRentabilidades(
  adquisicion: ResultadosAdquisicion,
  datos: DatosRentabilidad,
): ResultadosRentabilidad {
  const { financiacion, renta, irpfTramo, revalorizacionAnual, horizonteTIR, esLargaEstancia } = datos
  const { precioCompra, totalEntrada } = adquisicion

  // ── Ingresos brutos ──────────────────────────────────────────────────────
  const ingresosBrutosAnuales = renta.rentaBrutaMensual * 12

  // ── Gastos operativos base ───────────────────────────────────────────────
  const gastosVacancia = resolverValor(renta.vacancia, ingresosBrutosAnuales)
  const gastosMantenimiento = resolverValor(renta.mantenimiento, precioCompra)
  const gastosComunidadAnual = renta.gastosComunidadMensual * 12
  const gastosGestion = resolverValor(
    renta.gestionAlquiler ?? { tipo: 'porcentaje', valor: 0 },
    ingresosBrutosAnuales,
  )

  // ── Ingresos netos (brutos – vacancia) para display ──────────────────────
  const ingresosNetosAnuales = ingresosBrutosAnuales - gastosVacancia

  // ── Hipoteca ─────────────────────────────────────────────────────────────
  let cuotaMensual: number | null = null
  let capitalFinanciado: number | null = null
  let interesesHipotecaAnio1: number | null = null
  let principalHipotecaAnual: number | null = null
  let entradaEuros = 0

  if (financiacion.financiada) {
    if (financiacion.entrada) {
      entradaEuros = resolverValor(financiacion.entrada, precioCompra)
    }

    if (financiacion.cuota) {
      if (financiacion.cuota.tipo === 'conocida') {
        cuotaMensual = financiacion.cuota.cuotaMensual
        capitalFinanciado = precioCompra - entradaEuros
        interesesHipotecaAnio1 = null
        principalHipotecaAnual = cuotaMensual * 12
      } else {
        capitalFinanciado = resolverValor(financiacion.cuota.capitalPrestado, precioCompra)
        cuotaMensual = calcularCuotaFrancesa(
          capitalFinanciado,
          financiacion.cuota.tasaInteresAnual,
          financiacion.cuota.plazoAnios,
        )
        interesesHipotecaAnio1 = calcularInteresesAnio1(
          capitalFinanciado,
          financiacion.cuota.tasaInteresAnual,
          financiacion.cuota.plazoAnios,
        )
        principalHipotecaAnual = cuotaMensual * 12 - interesesHipotecaAnio1
      }
    }
  }

  // ── Gastos operativos totales (incluyen intereses si procede) ────────────
  const gastosOperativosAnuales =
    gastosVacancia +
    renta.ibi +
    renta.seguroHogar +
    renta.seguroVida +
    renta.seguroImpago +
    gastosComunidadAnual +
    gastosMantenimiento +
    renta.gastosRecibos +
    gastosGestion +
    (interesesHipotecaAnio1 ?? 0)

  // ── Beneficio antes de impuestos ─────────────────────────────────────────
  const beneficioAntesImpuestos = ingresosBrutosAnuales - gastosOperativosAnuales

  // ── Amortización fiscal ──────────────────────────────────────────────────
  const amortizacionAnual = calcularAmortizacionAnual(
    precioCompra,
    adquisicion.impuestos,
    adquisicion.otrosGastos,
    adquisicion.gastosReforma,
  )

  // ── IRPF ─────────────────────────────────────────────────────────────────
  let impuestosEstimados: number | null = null

  if (irpfTramo) {
    const baseImponible = Math.max(0, beneficioAntesImpuestos - amortizacionAnual)
    const reduccion = esLargaEstancia ? 0.5 : 0
    impuestosEstimados = baseImponible * (1 - reduccion) * (irpfTramo.tipo_porcentaje / 100)
  }

  // ── Beneficio después de impuestos ───────────────────────────────────────
  const beneficioDespuesImpuestos = beneficioAntesImpuestos - (impuestosEstimados ?? 0)

  // ── Cashflow neto = beneficio DI - amortización de principal ────────────
  const cashflowNetoAnual = beneficioDespuesImpuestos - (principalHipotecaAnual ?? 0)

  // ── Capital invertido ────────────────────────────────────────────────────
  let capitalInvertido: number

  if (financiacion.financiada && entradaEuros > 0) {
    capitalInvertido =
      entradaEuros +
      adquisicion.impuestos +
      adquisicion.totalComisiones +
      adquisicion.otrosGastos +
      adquisicion.gastosReforma +
      adquisicion.tasacion +
      adquisicion.gestoria
  } else {
    capitalInvertido = totalEntrada
  }

  // ── Rentabilidades ───────────────────────────────────────────────────────
  const rentabilidadBruta =
    totalEntrada > 0 ? (ingresosBrutosAnuales / totalEntrada) * 100 : 0

  const rentabilidadNeta =
    totalEntrada > 0 ? (beneficioDespuesImpuestos / totalEntrada) * 100 : 0

  // ── Payback period ───────────────────────────────────────────────────────
  const paybackPeriod =
    cashflowNetoAnual > 0 ? capitalInvertido / cashflowNetoAnual : null

  // ── Cash-on-Cash ─────────────────────────────────────────────────────────
  const cashOnCash =
    capitalInvertido > 0 ? (cashflowNetoAnual / capitalInvertido) * 100 : null

  // ── Plusvalía ─────────────────────────────────────────────────────────────
  const r = revalorizacionAnual / 100
  const plusvalia: PlusvaliaPeriodos = {
    anio1: precioCompra * (Math.pow(1 + r, 1) - 1),
    anio5: precioCompra * (Math.pow(1 + r, 5) - 1),
    anio10: precioCompra * (Math.pow(1 + r, 10) - 1),
  }

  // ── Rentabilidad total ────────────────────────────────────────────────────
  const rentabilidadTotal = rentabilidadNeta + revalorizacionAnual

  // ── TIR ──────────────────────────────────────────────────────────────────
  let tir: number | null = null

  if (
    capitalInvertido > 0 &&
    horizonteTIR >= 5 &&
    horizonteTIR <= 30
  ) {
    const valorVentaFinal =
      precioCompra * Math.pow(1 + revalorizacionAnual / 100, horizonteTIR)

    const flujos: number[] = [-capitalInvertido]
    for (let t = 1; t <= horizonteTIR; t++) {
      flujos.push(
        t === horizonteTIR
          ? cashflowNetoAnual + valorVentaFinal
          : cashflowNetoAnual,
      )
    }

    tir = calcularTIR(flujos)
  }

  // ── Salud de la inversión ─────────────────────────────────────────────────
  // Siempre basada en rentabilidadNeta (ya incluye impuestos si los hay)
  const saludInversion: SaludInversion =
    rentabilidadNeta < 3
      ? 'poco_rentable'
      : rentabilidadNeta <= 5
        ? 'rentabilidad_ajustada'
        : 'buena_inversion'

  return {
    ingresosBrutosAnuales,
    ingresosNetosAnuales,
    gastosOperativosAnuales,
    interesesHipotecaAnio1,
    beneficioAntesImpuestos,
    amortizacionAnual,
    impuestosEstimados,
    beneficioDespuesImpuestos,
    cashflowNetoAnual,
    principalHipotecaAnual,
    rentabilidadBruta,
    rentabilidadNeta,
    capitalInvertido,
    capitalFinanciado,
    cuotaMensual,
    paybackPeriod,
    cashOnCash,
    plusvalia,
    rentabilidadTotal,
    tir,
    saludInversion,
  }
}

// ─── Validaciones de negocio ──────────────────────────────────────────────────

export interface AlertasCalculo {
  cuotaSuperaRenta: boolean
  capitalSuperaPrecio: boolean
}

export function evaluarAlertas(
  adquisicion: ResultadosAdquisicion,
  rentabilidad: ResultadosRentabilidad,
  rentaBrutaMensual: number,
): AlertasCalculo {
  return {
    cuotaSuperaRenta:
      rentabilidad.cuotaMensual !== null &&
      rentabilidad.cuotaMensual > rentaBrutaMensual,
    capitalSuperaPrecio:
      rentabilidad.capitalFinanciado !== null &&
      rentabilidad.capitalInvertido + rentabilidad.capitalFinanciado >
        adquisicion.precioCompra * 1.001, // pequeño margen por redondeo
  }
}
