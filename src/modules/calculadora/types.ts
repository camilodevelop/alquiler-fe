// ─── Primitivos ───────────────────────────────────────────────────────────────

/** Valor que puede ser % sobre una base o € fijo */
export type ValorFlexible =
  | { tipo: 'porcentaje'; valor: number }
  | { tipo: 'fijo'; valor: number }

/** Configuración del impuesto de adquisición (solo una activa a la vez) */
export type ImpuestoConfig =
  | { tipo: 'iva'; porcentaje: number }
  | { tipo: 'itp'; comunidadId: string; nombre: string; porcentaje: number }
  | { tipo: 'itp_manual_euros'; euros: number }   // ITP con importe manual en €
  | { tipo: 'itp_bonificado'; porcentaje: number }
  | null

// ─── Sección 1: Coste de adquisición ──────────────────────────────────────────

export interface DatosAdquisicion {
  precioCompra: number
  comisionInmobiliaria: ValorFlexible
  comisionPsi: ValorFlexible
  impuesto: ImpuestoConfig
  otrosGastos: ValorFlexible
  gastosReforma: ValorFlexible & { activo: boolean }
  tasacion: number      // valor fijo en €
  gestoria: number      // valor fijo en €
}

export interface ResultadosAdquisicion {
  precioCompra: number
  comisionInmobiliaria: number
  comisionPsi: number
  impuestos: number
  otrosGastos: number
  gastosReforma: number
  tasacion: number
  gestoria: number
  totalEntrada: number
  totalComisiones: number
}

// ─── Sección 2A: Financiación ─────────────────────────────────────────────────

export type EntradaHipoteca = ValorFlexible

export type CuotaHipotecaria =
  | { tipo: 'conocida'; cuotaMensual: number }
  | {
      tipo: 'calcular'
      capitalPrestado: ValorFlexible
      tasaInteresAnual: number   // 0.1 – 10
      plazoAnios: number         // 1 – 40
    }

export interface DatosFinanciacion {
  financiada: boolean
  entrada?: EntradaHipoteca
  cuota?: CuotaHipotecaria
}

// ─── Sección 2B: Gastos e ingresos ────────────────────────────────────────────

export interface DatosRenta {
  rentaBrutaMensual: number       // 100 – 6.000
  ibi: number                     // anual €
  seguroHogar: number             // anual €
  seguroVida: number              // anual €
  seguroImpago: number            // anual €
  gastosComunidadMensual: number  // mensual € → ×12 en cálculo
  vacancia: ValorFlexible         // % de renta bruta anual o € directo
  mantenimiento: ValorFlexible    // % de precio compra o € directo
  gastosRecibos: number           // anual €
  gestionAlquiler: ValorFlexible  // % de ingresos brutos anuales o € fijo
}

// ─── Sección 2C: IRPF ─────────────────────────────────────────────────────────

export interface TramoIRPF {
  id: string
  tramo: number
  descripcion: string
  base_desde: number | null
  base_hasta: number | null
  tipo_porcentaje: number
}

// ─── Inputs completos sección 2 ───────────────────────────────────────────────

export interface DatosRentabilidad {
  financiacion: DatosFinanciacion
  renta: DatosRenta
  irpfTramo: TramoIRPF | null
  revalorizacionAnual: number   // -10 a 20
  horizonteTIR: number          // 5 – 30 años
  esLargaEstancia: boolean
}

// ─── Sección 2D: Resultados ───────────────────────────────────────────────────

export type SaludInversion = 'poco_rentable' | 'rentabilidad_ajustada' | 'buena_inversion'

export interface PlusvaliaPeriodos {
  anio1: number
  anio5: number
  anio10: number
}

export interface ResultadosRentabilidad {
  // Ingresos
  ingresosBrutosAnuales: number
  ingresosNetosAnuales: number         // brutos - vacancia (para display)

  // Gastos
  gastosOperativosAnuales: number      // suma total incluyendo vacancia e intereses
  interesesHipotecaAnio1: number | null

  // Beneficio
  beneficioAntesImpuestos: number
  amortizacionAnual: number
  impuestosEstimados: number | null    // null si no hay tramo IRPF
  beneficioDespuesImpuestos: number

  // Cashflow
  cashflowNetoAnual: number
  principalHipotecaAnual: number | null

  // Rentabilidades
  rentabilidadBruta: number
  rentabilidadNeta: number             // basada en beneficioDespuesImpuestos

  // Capital
  capitalInvertido: number
  capitalFinanciado: number | null
  cuotaMensual: number | null

  // Avanzados
  paybackPeriod: number | null
  cashOnCash: number | null
  plusvalia: PlusvaliaPeriodos
  rentabilidadTotal: number
  tir: number | null

  // Salud
  saludInversion: SaludInversion
}

// ─── Sección 2F: Escenarios ───────────────────────────────────────────────────

export type NombreEscenario = 'pesimista' | 'realista' | 'optimista'

export interface ResultadosEscenario {
  nombre: NombreEscenario
  cashflowNetoAnual: number
  rentabilidadNeta: number
  cashOnCash: number | null
  paybackPeriod: number | null
  tir: number | null
  saludInversion: SaludInversion
}

// ─── Resultado global ─────────────────────────────────────────────────────────

export interface ResultadosCompletos {
  adquisicion: ResultadosAdquisicion
  rentabilidad: ResultadosRentabilidad | null
  escenarios: ResultadosEscenario[] | null
}

// ─── BD: tipos devueltos por Supabase ─────────────────────────────────────────

export interface ParametroGeneral {
  id: string
  clave: string
  valor: string
  descripcion: string
}

export interface ItpComunidad {
  id: string
  nombre: string
  porcentaje: number
}

export interface Simulacion {
  id: string
  owner_id: string
  nombre: string
  token: string
  datos_adquisicion: DatosAdquisicion
  datos_rentabilidad: DatosRentabilidad | null
  direccion: string | null
  estado_negociacion: EstadoNegociacion | null
  observaciones: string | null
  video_url: string | null
  video_storage_path: string | null
  resultados: ResultadosCompletos
  created_at: string
  updated_at: string
}

export interface SimulacionFoto {
  id: string
  simulacion_id: string
  owner_id: string
  storage_path: string
  url_publica: string
  orden: number
  created_at: string
}

export type EstadoNegociacion =
  | 'en_analisis'
  | 'negociando'
  | 'oferta_presentada'
  | 'descartado'
  | 'adquirido'
