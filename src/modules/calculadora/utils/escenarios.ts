import type {
  DatosAdquisicion,
  DatosRentabilidad,
  ResultadosEscenario,
  ValorFlexible,
} from '../types'
import { calcularAdquisicion, calcularRentabilidades } from './calculos'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Ajusta un ValorFlexible según un delta porcentual.
 * Si es tipo 'porcentaje': suma el delta directamente (10% + 5% = 15%).
 * Si es tipo 'fijo' en €: aplica el delta como variación porcentual sobre el valor.
 */
function ajustarValorFlexible(base: ValorFlexible, deltaPct: number): ValorFlexible {
  if (deltaPct === 0) return base

  if (base.tipo === 'porcentaje') {
    return { tipo: 'porcentaje', valor: Math.max(0, base.valor + deltaPct) }
  }

  // Si es fijo en €, el ajuste se aplica como % sobre el valor base
  const factor = 1 + deltaPct / 100
  return { tipo: 'fijo', valor: Math.max(0, base.valor * factor) }
}

// ─── Definición de variaciones por escenario ─────────────────────────────────

const VARIACIONES = [
  {
    nombre: 'pesimista' as const,
    vacanciaDeltaPct:       +5,
    rentaDeltaPct:          -10,
    revalorizacionDelta:    -1,
    mantenimientoDeltaPct:  +3,
  },
  {
    nombre: 'realista' as const,
    vacanciaDeltaPct:       0,
    rentaDeltaPct:          0,
    revalorizacionDelta:    0,
    mantenimientoDeltaPct:  0,
  },
  {
    nombre: 'optimista' as const,
    vacanciaDeltaPct:       -3,
    rentaDeltaPct:          +10,
    revalorizacionDelta:    +2,
    mantenimientoDeltaPct:  0,
  },
]

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Genera los tres escenarios (pesimista / realista / optimista) a partir
 * de los datos base e ingresados por el usuario.
 */
export function calcularEscenarios(
  datosAdquisicion: DatosAdquisicion,
  datosRentabilidad: DatosRentabilidad,
): ResultadosEscenario[] {
  const adquisicion = calcularAdquisicion(datosAdquisicion)

  return VARIACIONES.map(
    ({ nombre, vacanciaDeltaPct, rentaDeltaPct, revalorizacionDelta, mantenimientoDeltaPct }) => {
      const rentaBase = datosRentabilidad.renta.rentaBrutaMensual
      const rentaMensualAjustada = rentaBase * (1 + rentaDeltaPct / 100)

      const datosEscenario: DatosRentabilidad = {
        ...datosRentabilidad,
        revalorizacionAnual:
          datosRentabilidad.revalorizacionAnual + revalorizacionDelta,
        renta: {
          ...datosRentabilidad.renta,
          rentaBrutaMensual: Math.max(0, rentaMensualAjustada),
          vacancia: ajustarValorFlexible(
            datosRentabilidad.renta.vacancia,
            vacanciaDeltaPct,
          ),
          mantenimiento: ajustarValorFlexible(
            datosRentabilidad.renta.mantenimiento,
            mantenimientoDeltaPct,
          ),
          gestionAlquiler: datosRentabilidad.renta.gestionAlquiler ?? { tipo: 'porcentaje', valor: 0 },
        },
      }

      const res = calcularRentabilidades(adquisicion, datosEscenario)

      return {
        nombre,
        cashflowNetoAnual: res.cashflowNetoAnual,
        rentabilidadNeta: res.rentabilidadNeta,
        cashOnCash: res.cashOnCash,
        paybackPeriod: res.paybackPeriod,
        tir: res.tir,
        saludInversion: res.saludInversion,
      }
    },
  )
}
