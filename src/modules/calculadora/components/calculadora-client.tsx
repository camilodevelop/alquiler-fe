'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Info,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  Calculator,
  Percent,
  Euro,
  Home,
  Landmark,
  BarChart2,
} from 'lucide-react'
import {
  calcularAdquisicion,
  calcularRentabilidades,
  calcularEscenarios,
  evaluarAlertas,
  formatEuros,
  formatPorcentaje,
  formatAnios,
  formatPorcentajeONa,
  formatEurosONa,
} from '@/modules/calculadora'
import type {
  ValorFlexible,
  ImpuestoConfig,
  ItpComunidad,
  TramoIRPF,
  DatosAdquisicion,
  DatosFinanciacion,
  DatosRenta,
  DatosRentabilidad,
  ResultadosCompletos,
  SaludInversion,
  ResultadosEscenario,
} from '@/modules/calculadora/types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface InitialData {
  datosAdquisicion?: DatosAdquisicion
  datosRentabilidad?: DatosRentabilidad
  verRentabilidad?: boolean
}

interface Props {
  ivaObraNueva: number
  comunidades: ItpComunidad[]
  tramosIrpf: TramoIRPF[]
  isAuthenticated: boolean
  initialData?: InitialData
  onDataChange?: (data: {
    datosAdquisicion: DatosAdquisicion
    datosRentabilidad: DatosRentabilidad
    resultados: ResultadosCompletos
  }) => void
}

// ─── Utilidades de UI ─────────────────────────────────────────────────────────

const INPUT_CLS =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition'

const BTN_QUICK_CLS = (active: boolean) =>
  `px-2.5 py-1 rounded text-xs font-medium border transition ${
    active
      ? 'bg-brand-600 text-white border-brand-600'
      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
  }`

// ─── NumericInput ─────────────────────────────────────────────────────────────

function NumericInput({
  value,
  onChange,
  placeholder,
  suffix,
  className,
}: {
  value: number
  onChange: (v: number) => void
  placeholder?: string
  suffix?: string
  className?: string
}) {
  const [focused, setFocused] = useState(false)
  const [local, setLocal] = useState('')
  const formatted = value > 0 ? new Intl.NumberFormat('es-ES').format(value) : ''

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        className={className ?? INPUT_CLS}
        placeholder={placeholder}
        value={focused ? local : formatted}
        onFocus={() => {
          setFocused(true)
          setLocal(value > 0 ? String(value) : '')
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          setLocal(e.target.value)
          const clean = e.target.value.replace(/\./g, '').replace(',', '.')
          const n = parseFloat(clean)
          if (!isNaN(n) && n >= 0) onChange(n)
          else if (e.target.value === '') onChange(0)
        }}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          {suffix}
        </span>
      )}
    </div>
  )
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <Icon className="w-4 h-4 text-brand-600" />
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="px-5 py-5 space-y-5">{children}</div>
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  tooltip,
  children,
}: {
  label: string
  tooltip?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-gray-600">{label}</label>
        {tooltip && (
          <span title={tooltip} className="cursor-help text-gray-400 hover:text-gray-600">
            <Info className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── ResultRow ────────────────────────────────────────────────────────────────

function ResultRow({
  label,
  value,
  highlight,
  tooltip,
}: {
  label: string
  value: string
  highlight?: boolean
  tooltip?: string
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 px-3 rounded-lg ${
        highlight ? 'bg-brand-50 font-semibold' : ''
      }`}
    >
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-600">{label}</span>
        {tooltip && (
          <span title={tooltip} className="cursor-help text-gray-400">
            <Info className="w-3 h-3" />
          </span>
        )}
      </div>
      <span className={`text-sm ${highlight ? 'text-brand-700' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  )
}

// ─── Input ValorFlexible ──────────────────────────────────────────────────────

function InputFlexible({
  value,
  onChange,
  base,
  quickPct = [],
  placeholderPct = '0',
  placeholderEur = '0,00',
}: {
  value: ValorFlexible
  onChange: (v: ValorFlexible) => void
  base: number
  quickPct?: number[]
  placeholderPct?: string
  placeholderEur?: string
}) {
  const computed =
    value.tipo === 'porcentaje' && base > 0
      ? formatEuros((base * value.valor) / 100)
      : null

  return (
    <div className="space-y-2">
      {quickPct.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {quickPct.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => onChange({ tipo: 'porcentaje', valor: pct })}
              className={BTN_QUICK_CLS(value.tipo === 'porcentaje' && value.valor === pct)}
            >
              {pct}%
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() =>
              onChange({ tipo: 'porcentaje', valor: value.tipo === 'fijo' ? 0 : value.valor })
            }
            className={`px-2.5 py-1.5 flex items-center gap-1 transition ${
              value.tipo === 'porcentaje'
                ? 'bg-brand-600 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Percent className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({ tipo: 'fijo', valor: value.tipo === 'porcentaje' ? 0 : value.valor })
            }
            className={`px-2.5 py-1.5 flex items-center gap-1 transition ${
              value.tipo === 'fijo'
                ? 'bg-brand-600 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Euro className="w-3 h-3" />
          </button>
        </div>
        <input
          type="number"
          min={0}
          step={value.tipo === 'porcentaje' ? 0.1 : 100}
          value={value.valor || ''}
          onChange={(e) =>
            onChange({ tipo: value.tipo, valor: parseFloat(e.target.value) || 0 })
          }
          placeholder={value.tipo === 'porcentaje' ? placeholderPct : placeholderEur}
          className={`${INPUT_CLS} flex-1`}
        />
      </div>
      {computed && (
        <p className="text-xs text-gray-400">
          = <span className="text-gray-600 font-medium">{computed}</span>
        </p>
      )}
    </div>
  )
}

// ─── Indicador de Salud ───────────────────────────────────────────────────────

function IndicadorSalud({ salud }: { salud: SaludInversion }) {
  const config = {
    poco_rentable: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200',
      label: 'Poco rentable',
      desc: 'La rentabilidad neta es inferior al 3%. Esta inversión no cubre suficientemente el riesgo y los costes de oportunidad.',
    },
    rentabilidad_ajustada: {
      icon: MinusCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
      label: 'Rentabilidad ajustada',
      desc: 'Rentabilidad neta entre 3% y 5%. Aceptable en mercados con baja rentabilidad alternativa, pero mejorable.',
    },
    buena_inversion: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-200',
      label: 'Buena inversión',
      desc: 'Rentabilidad neta superior al 5%. Los flujos de caja cubren costes y generan retorno atractivo.',
    },
  }

  const { icon: Icon, color, bg, label, desc } = config[salud]

  return (
    <div className={`rounded-xl border p-4 flex gap-3 ${bg}`}>
      <Icon className={`w-6 h-6 mt-0.5 flex-shrink-0 ${color}`} />
      <div>
        <p className={`font-semibold text-sm ${color}`}>{label}</p>
        <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

// ─── Tabla de Escenarios ──────────────────────────────────────────────────────

function TablaEscenarios({ escenarios }: { escenarios: ResultadosEscenario[] }) {
  const saludColor: Record<SaludInversion, string> = {
    poco_rentable: 'text-red-600',
    rentabilidad_ajustada: 'text-amber-600',
    buena_inversion: 'text-green-600',
  }

  const metricas: {
    key: keyof ResultadosEscenario
    label: string
    format: (v: ResultadosEscenario) => string
  }[] = [
    {
      key: 'cashflowNetoAnual',
      label: 'Cashflow neto anual',
      format: (e) => formatEuros(e.cashflowNetoAnual),
    },
    {
      key: 'rentabilidadNeta',
      label: 'Rentabilidad neta',
      format: (e) => formatPorcentaje(e.rentabilidadNeta),
    },
    {
      key: 'cashOnCash',
      label: 'Cash-on-Cash',
      format: (e) => formatPorcentajeONa(e.cashOnCash),
    },
    {
      key: 'paybackPeriod',
      label: 'Payback',
      format: (e) => formatAnios(e.paybackPeriod),
    },
    { key: 'tir', label: 'TIR', format: (e) => formatPorcentajeONa(e.tir) },
  ]

  function isBest(_metricKey: string, escenario: ResultadosEscenario): boolean {
    return escenario.nombre === 'optimista'
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Métrica
            </th>
            {escenarios.map((e) => (
              <th
                key={e.nombre}
                className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide ${
                  e.nombre === 'pesimista'
                    ? 'text-red-600'
                    : e.nombre === 'realista'
                      ? 'text-gray-600'
                      : 'text-green-600'
                }`}
              >
                {e.nombre === 'pesimista' ? '🔴' : e.nombre === 'realista' ? '⚪' : '🟢'}{' '}
                {e.nombre.charAt(0).toUpperCase() + e.nombre.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metricas.map((m) => (
            <tr key={m.key} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3 text-gray-600 text-xs">{m.label}</td>
              {escenarios.map((e) => (
                <td
                  key={e.nombre}
                  className={`px-4 py-3 text-center font-medium text-xs ${
                    isBest(m.key, e) ? 'text-green-700 font-semibold' : 'text-gray-800'
                  }`}
                >
                  {m.format(e)}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-gray-50">
            <td className="px-4 py-3 text-gray-600 text-xs">Salud</td>
            {escenarios.map((e) => (
              <td
                key={e.nombre}
                className={`px-4 py-3 text-center text-xs font-semibold ${saludColor[e.saludInversion]}`}
              >
                {e.saludInversion === 'poco_rentable'
                  ? '🔴 Poco rentable'
                  : e.saludInversion === 'rentabilidad_ajustada'
                    ? '🟡 Ajustada'
                    : '🟢 Buena'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Banner Upsell ────────────────────────────────────────────────────────────

function BannerUpsell() {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
      <div className="flex gap-3">
        <TrendingUp className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-brand-800">
            Guarda y gestiona tus simulaciones — gratis con Rentyva
          </p>
          <ul className="mt-2 space-y-1">
            {[
              'Guarda y edita simulaciones con nombre personalizado',
              'Exporta informes en PDF con fotos del inmueble',
              'Compara hasta 3 inmuebles lado a lado',
              'Añade fotos, vídeo y notas a cada simulación',
            ].map((item) => (
              <li key={item} className="flex items-start gap-1.5 text-xs text-brand-700">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-brand-500" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-3">
            <a
              href="/registro"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition hover:opacity-90"
              style={{ backgroundColor: '#09b850' }}
            >
              Crear cuenta gratis
            </a>
            <a
              href="/login"
              className="inline-flex items-center text-xs font-medium text-brand-700 hover:text-brand-900 transition"
            >
              Ya tengo cuenta →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers para decodificar initialData ─────────────────────────────────────

function decodeImpuesto(imp: ImpuestoConfig) {
  if (!imp)
    return {
      tipo: null as null,
      comunidadId: '',
      manualEuros: null as number | null,
      bonificadoPct: 0,
    }
  if (imp.tipo === 'iva') return { tipo: 'iva' as const, comunidadId: '', manualEuros: null, bonificadoPct: 0 }
  if (imp.tipo === 'itp')
    return { tipo: 'itp' as const, comunidadId: imp.comunidadId, manualEuros: null, bonificadoPct: 0 }
  if (imp.tipo === 'itp_manual_euros')
    return { tipo: 'itp' as const, comunidadId: '', manualEuros: imp.euros, bonificadoPct: 0 }
  if (imp.tipo === 'itp_bonificado')
    return { tipo: 'itp_bonificado' as const, comunidadId: '', manualEuros: null, bonificadoPct: imp.porcentaje }
  return { tipo: null as null, comunidadId: '', manualEuros: null as number | null, bonificadoPct: 0 }
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function CalculadoraClient({
  ivaObraNueva,
  comunidades,
  tramosIrpf,
  isAuthenticated,
  initialData,
  onDataChange,
}: Props) {
  const adqInit = initialData?.datosAdquisicion
  const rentInit = initialData?.datosRentabilidad
  const rentaInit = rentInit?.renta
  const impInit = decodeImpuesto(adqInit?.impuesto ?? null)

  // ── Sección 1 ──────────────────────────────────────────────────────────────
  const [precioCompra, setPrecioCompra] = useState(() => adqInit?.precioCompra ?? 0)
  const [comInmob, setComInmob] = useState<ValorFlexible>(
    () => adqInit?.comisionInmobiliaria ?? { tipo: 'porcentaje', valor: 0 },
  )
  const [comPsi, setComPsi] = useState<ValorFlexible>(
    () => adqInit?.comisionPsi ?? { tipo: 'porcentaje', valor: 0 },
  )
  const [tipoImpuesto, setTipoImpuesto] = useState<'iva' | 'itp' | 'itp_bonificado' | null>(
    () => impInit.tipo,
  )
  const [itpComunidadId, setItpComunidadId] = useState(() => impInit.comunidadId)
  const [itpManualEuros, setItpManualEuros] = useState<number | null>(() => impInit.manualEuros)
  const [itpBonificadoPct, setItpBonificadoPct] = useState(() => impInit.bonificadoPct)
  const [otrosGastos, setOtrosGastos] = useState<ValorFlexible>(
    () => adqInit?.otrosGastos ?? { tipo: 'porcentaje', valor: 0 },
  )
  const [tasacion, setTasacion] = useState(() => adqInit?.tasacion ?? 0)
  const [gestoria, setGestoria] = useState(() => adqInit?.gestoria ?? 0)
  const [tieneReforma, setTieneReforma] = useState(() => adqInit?.gastosReforma?.activo ?? false)
  const [reforma, setReforma] = useState<ValorFlexible>(
    () => adqInit?.gastosReforma ?? { tipo: 'porcentaje', valor: 0 },
  )

  // ── Sección 2 visible ──────────────────────────────────────────────────────
  const [verRentabilidad, setVerRentabilidad] = useState(() => initialData?.verRentabilidad ?? false)

  // ── Sección 2A: Financiación ───────────────────────────────────────────────
  const finInit = rentInit?.financiacion
  const cuotaInit = finInit?.financiada ? finInit.cuota : undefined
  const [financiada, setFinanciada] = useState(() => finInit?.financiada ?? false)
  const [entrada, setEntrada] = useState<ValorFlexible>(
    () => (finInit?.financiada ? finInit.entrada : undefined) ?? { tipo: 'porcentaje', valor: 20 },
  )
  const [cuotaConocida, setCuotaConocida] = useState(() => cuotaInit?.tipo === 'conocida')
  const [cuotaManual, setCuotaManual] = useState(
    () => (cuotaInit?.tipo === 'conocida' ? cuotaInit.cuotaMensual : 0),
  )
  const [capitalPrestado, setCapitalPrestado] = useState<ValorFlexible>(
    () =>
      cuotaInit?.tipo === 'calcular'
        ? cuotaInit.capitalPrestado
        : { tipo: 'porcentaje', valor: 80 },
  )
  const [tasaInteres, setTasaInteres] = useState(
    () => (cuotaInit?.tipo === 'calcular' ? cuotaInit.tasaInteresAnual : 3.5),
  )
  const [plazoAnios, setPlazoAnios] = useState(
    () => (cuotaInit?.tipo === 'calcular' ? cuotaInit.plazoAnios : 25),
  )

  // Handlers con linking entrada <-> capitalPrestado en modo porcentaje
  const handleSetEntrada = (v: ValorFlexible) => {
    setEntrada(v)
    if (v.tipo === 'porcentaje' && capitalPrestado.tipo === 'porcentaje') {
      setCapitalPrestado({ tipo: 'porcentaje', valor: Math.max(0, 100 - v.valor) })
    }
  }

  const handleSetCapital = (v: ValorFlexible) => {
    setCapitalPrestado(v)
    if (v.tipo === 'porcentaje' && entrada.tipo === 'porcentaje') {
      setEntrada({ tipo: 'porcentaje', valor: Math.max(0, 100 - v.valor) })
    }
  }

  // ── Sección 2B: Gastos e ingresos ──────────────────────────────────────────
  const [rentaMensual, setRentaMensual] = useState(() => rentaInit?.rentaBrutaMensual ?? 0)
  const [ibi, setIbi] = useState(() => rentaInit?.ibi ?? 0)
  const [segHogar, setSegHogar] = useState(() => rentaInit?.seguroHogar ?? 0)
  const [segVida, setSegVida] = useState(() => rentaInit?.seguroVida ?? 0)
  const [segImpago, setSegImpago] = useState(() => rentaInit?.seguroImpago ?? 0)
  const [comunidadMensual, setComunidadMensual] = useState(
    () => rentaInit?.gastosComunidadMensual ?? 0,
  )
  const [vacancia, setVacancia] = useState<ValorFlexible>(
    () => rentaInit?.vacancia ?? { tipo: 'porcentaje', valor: 10 },
  )
  const [mantenimiento, setMantenimiento] = useState<ValorFlexible>(
    () => rentaInit?.mantenimiento ?? { tipo: 'porcentaje', valor: 5 },
  )
  const [recibos, setRecibos] = useState(() => rentaInit?.gastosRecibos ?? 0)
  const [gestionAlquiler, setGestionAlquiler] = useState<ValorFlexible>(
    () => rentaInit?.gestionAlquiler ?? { tipo: 'porcentaje', valor: 0 },
  )

  // ── Sección 2C: IRPF ───────────────────────────────────────────────────────
  const [tramoIrpf, setTramoIrpf] = useState<TramoIRPF | null>(() => rentInit?.irpfTramo ?? null)
  const [esLargaEstancia, setEsLargaEstancia] = useState(
    () => rentInit?.esLargaEstancia ?? false,
  )

  // ── Sección 2D: Avanzados ──────────────────────────────────────────────────
  const [revalorizacion, setRevalorizacion] = useState(() => rentInit?.revalorizacionAnual ?? 3)
  const [horizonteTIR, setHorizonteTIR] = useState(() => rentInit?.horizonteTIR ?? 10)

  // ── Derived: ImpuestoConfig ────────────────────────────────────────────────
  const impuesto = useMemo((): ImpuestoConfig => {
    if (tipoImpuesto === 'iva') return { tipo: 'iva', porcentaje: ivaObraNueva }
    if (tipoImpuesto === 'itp') {
      if (itpManualEuros !== null) return { tipo: 'itp_manual_euros', euros: itpManualEuros }
      const ccaa = comunidades.find((c) => c.id === itpComunidadId)
      if (ccaa)
        return { tipo: 'itp', comunidadId: ccaa.id, nombre: ccaa.nombre, porcentaje: ccaa.porcentaje }
      return null
    }
    if (tipoImpuesto === 'itp_bonificado')
      return { tipo: 'itp_bonificado', porcentaje: itpBonificadoPct }
    return null
  }, [tipoImpuesto, ivaObraNueva, itpComunidadId, itpManualEuros, itpBonificadoPct, comunidades])

  // ── Derived: DatosAdquisicion ──────────────────────────────────────────────
  const datosAdq = useMemo(
    (): DatosAdquisicion => ({
      precioCompra,
      comisionInmobiliaria: comInmob,
      comisionPsi: comPsi,
      impuesto,
      otrosGastos,
      gastosReforma: { ...reforma, activo: tieneReforma },
      tasacion,
      gestoria,
    }),
    [precioCompra, comInmob, comPsi, impuesto, otrosGastos, reforma, tieneReforma, tasacion, gestoria],
  )

  // ── Computed: Adquisición ──────────────────────────────────────────────────
  const resAdq = useMemo(() => calcularAdquisicion(datosAdq), [datosAdq])

  // ── Derived: DatosRentabilidad ─────────────────────────────────────────────
  const datosRent = useMemo((): DatosRentabilidad => {
    const financiacion: DatosFinanciacion = financiada
      ? {
          financiada: true,
          entrada,
          cuota: cuotaConocida
            ? { tipo: 'conocida', cuotaMensual: cuotaManual }
            : { tipo: 'calcular', capitalPrestado, tasaInteresAnual: tasaInteres, plazoAnios },
        }
      : { financiada: false }

    const renta: DatosRenta = {
      rentaBrutaMensual: rentaMensual,
      ibi,
      seguroHogar: segHogar,
      seguroVida: segVida,
      seguroImpago: segImpago,
      gastosComunidadMensual: comunidadMensual,
      vacancia,
      mantenimiento,
      gastosRecibos: recibos,
      gestionAlquiler,
    }

    return {
      financiacion,
      renta,
      irpfTramo: tramoIrpf,
      revalorizacionAnual: revalorizacion,
      horizonteTIR,
      esLargaEstancia,
    }
  }, [
    financiada,
    entrada,
    cuotaConocida,
    cuotaManual,
    capitalPrestado,
    tasaInteres,
    plazoAnios,
    rentaMensual,
    ibi,
    segHogar,
    segVida,
    segImpago,
    comunidadMensual,
    vacancia,
    mantenimiento,
    recibos,
    gestionAlquiler,
    tramoIrpf,
    revalorizacion,
    horizonteTIR,
    esLargaEstancia,
  ])

  // ── Computed: Rentabilidad ─────────────────────────────────────────────────
  const resRent = useMemo(
    () =>
      verRentabilidad && rentaMensual > 0 ? calcularRentabilidades(resAdq, datosRent) : null,
    [verRentabilidad, rentaMensual, resAdq, datosRent],
  )

  const escenarios = useMemo(
    () =>
      verRentabilidad && rentaMensual > 0 ? calcularEscenarios(datosAdq, datosRent) : null,
    [verRentabilidad, rentaMensual, datosAdq, datosRent],
  )

  const alertas = useMemo(
    () => (resRent ? evaluarAlertas(resAdq, resRent, rentaMensual) : null),
    [resRent, resAdq, rentaMensual],
  )

  // Notifica al padre (CalculadoraPrivada) cada vez que cambian los datos
  useEffect(() => {
    if (!onDataChange) return
    onDataChange({
      datosAdquisicion: datosAdq,
      datosRentabilidad: datosRent,
      resultados: {
        adquisicion: resAdq,
        rentabilidad: resRent,
        escenarios: escenarios,
      },
    })
  }, [datosAdq, datosRent, resAdq, resRent, escenarios]) // eslint-disable-line react-hooks/exhaustive-deps

  const itpCcaaSeleccionada = comunidades.find((c) => c.id === itpComunidadId)

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── SECCIÓN 1: Coste de adquisición ── */}
      <SectionCard title="Coste de adquisición" icon={Home}>

        {/* Precio de compra */}
        <Field label="Precio de compra *">
          <NumericInput
            value={precioCompra}
            onChange={setPrecioCompra}
            placeholder="150.000"
            suffix="€"
            className={INPUT_CLS}
          />
          {precioCompra > 0 && (
            <p className="text-xs text-gray-400 mt-1">{formatEuros(precioCompra)}</p>
          )}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Comisión inmobiliaria */}
          <Field label="Comisión inmobiliaria (IVA inc.)">
            <InputFlexible
              value={comInmob}
              onChange={setComInmob}
              base={precioCompra}
              quickPct={[0, 1, 2, 3, 4, 5]}
            />
          </Field>

          {/* Comisión PSI */}
          <Field label="Comisión PSI (IVA inc.)">
            <InputFlexible
              value={comPsi}
              onChange={setComPsi}
              base={precioCompra}
              quickPct={[0, 1, 2, 3, 4, 5]}
            />
          </Field>
        </div>

        {/* Tasación y Gestoría */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Tasación" tooltip="Coste del informe de tasación del inmueble">
            <NumericInput
              value={tasacion}
              onChange={setTasacion}
              placeholder="0"
              suffix="€"
              className={INPUT_CLS}
            />
          </Field>
          <Field label="Gestoría" tooltip="Honorarios de gestoría para la compraventa">
            <NumericInput
              value={gestoria}
              onChange={setGestoria}
              placeholder="0"
              suffix="€"
              className={INPUT_CLS}
            />
          </Field>
        </div>

        {/* Impuestos */}
        <Field label="Impuestos">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['iva', `IVA obra nueva (${ivaObraNueva}%)`],
                  ['itp', 'ITP por Comunidad Autónoma'],
                  ['itp_bonificado', 'ITP Bonificado'],
                ] as [typeof tipoImpuesto, string][]
              ).map(([tipo, label]) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => {
                    setTipoImpuesto(tipo === tipoImpuesto ? null : tipo)
                    setItpManualEuros(null)
                  }}
                  className={BTN_QUICK_CLS(tipoImpuesto === tipo) + ' text-xs'}
                >
                  {label}
                </button>
              ))}
            </div>

            {tipoImpuesto === 'iva' && precioCompra > 0 && (
              <p className="text-xs text-brand-700 bg-brand-50 rounded-lg px-3 py-2">
                IVA {ivaObraNueva}% ={' '}
                <strong>{formatEuros((precioCompra * ivaObraNueva) / 100)}</strong>
              </p>
            )}

            {tipoImpuesto === 'itp' && (
              <div className="space-y-2">
                <select
                  value={itpManualEuros !== null ? '__manual__' : itpComunidadId}
                  onChange={(e) => {
                    if (e.target.value === '__manual__') {
                      setItpComunidadId('')
                      setItpManualEuros(0)
                    } else {
                      setItpComunidadId(e.target.value)
                      setItpManualEuros(null)
                    }
                  }}
                  className={INPUT_CLS}
                >
                  <option value="">Selecciona Comunidad Autónoma</option>
                  {comunidades.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} — {c.porcentaje}%
                    </option>
                  ))}
                  <option value="__manual__">Introducir importe manualmente</option>
                </select>

                {itpCcaaSeleccionada && precioCompra > 0 && itpManualEuros === null && (
                  <p className="text-xs text-brand-700 bg-brand-50 rounded-lg px-3 py-2">
                    ITP {itpCcaaSeleccionada.porcentaje}% ={' '}
                    <strong>
                      {formatEuros((precioCompra * itpCcaaSeleccionada.porcentaje) / 100)}
                    </strong>
                  </p>
                )}

                {itpManualEuros !== null && (
                  <NumericInput
                    value={itpManualEuros}
                    onChange={setItpManualEuros}
                    placeholder="Importe ITP en €"
                    suffix="€"
                    className={INPUT_CLS}
                  />
                )}
              </div>
            )}

            {tipoImpuesto === 'itp_bonificado' && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={itpBonificadoPct || ''}
                  onChange={(e) => setItpBonificadoPct(parseFloat(e.target.value) || 0)}
                  placeholder="Porcentaje ITP"
                  className={`${INPUT_CLS} w-36`}
                />
                <span className="text-xs text-gray-500">%</span>
                {precioCompra > 0 && itpBonificadoPct > 0 && (
                  <span className="text-xs text-brand-700">
                    = {formatEuros((precioCompra * itpBonificadoPct) / 100)}
                  </span>
                )}
              </div>
            )}
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Otros gastos */}
          <Field label="Otros gastos de compraventa" tooltip="Notaría, registro, etc.">
            <InputFlexible
              value={otrosGastos}
              onChange={setOtrosGastos}
              base={precioCompra}
              placeholderPct="1.5"
            />
          </Field>

          {/* Gastos reforma */}
          <Field label="Gastos de adecuación / reforma">
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTieneReforma(true)
                  }}
                  className={BTN_QUICK_CLS(tieneReforma)}
                >
                  Con reforma
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTieneReforma(false)
                    setReforma({ tipo: 'porcentaje', valor: 0 })
                  }}
                  className={BTN_QUICK_CLS(!tieneReforma)}
                >
                  Sin reforma
                </button>
              </div>
              {tieneReforma && (
                <InputFlexible
                  value={reforma}
                  onChange={setReforma}
                  base={precioCompra}
                  placeholderPct="5"
                />
              )}
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* ── RESULTADOS SECCIÓN 1 ── */}
      {precioCompra > 0 && (
        <SectionCard title="Resumen coste de adquisición" icon={Calculator}>
          <div className="space-y-1">
            <ResultRow label="Precio de compra" value={formatEuros(resAdq.precioCompra)} />
            {resAdq.totalComisiones > 0 && (
              <ResultRow label="Total comisiones" value={formatEuros(resAdq.totalComisiones)} />
            )}
            {resAdq.impuestos > 0 && (
              <ResultRow label="Impuestos" value={formatEuros(resAdq.impuestos)} />
            )}
            {resAdq.otrosGastos > 0 && (
              <ResultRow
                label="Otros gastos compraventa"
                value={formatEuros(resAdq.otrosGastos)}
              />
            )}
            {resAdq.tasacion > 0 && (
              <ResultRow label="Tasación" value={formatEuros(resAdq.tasacion)} />
            )}
            {resAdq.gestoria > 0 && (
              <ResultRow label="Gestoría" value={formatEuros(resAdq.gestoria)} />
            )}
            {resAdq.gastosReforma > 0 && (
              <ResultRow
                label="Gastos de adecuación"
                value={formatEuros(resAdq.gastosReforma)}
              />
            )}
            <div className="pt-1 border-t border-gray-100" />
            <ResultRow
              label="Precio total de entrada"
              value={formatEuros(resAdq.totalEntrada)}
              highlight
            />
          </div>
        </SectionCard>
      )}

      {/* ── TOGGLE SECCIÓN 2 ── */}
      {precioCompra > 0 && (
        <button
          type="button"
          onClick={() => setVerRentabilidad((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 hover:border-brand-400 transition text-brand-700"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {verRentabilidad
                ? 'Ocultar análisis de rentabilidad'
                : 'Añadir análisis de rentabilidad'}
            </span>
            <span className="text-xs text-brand-500">(opcional)</span>
          </div>
          {verRentabilidad ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}

      {verRentabilidad && (
        <>
          {/* ── SECCIÓN 2A: Financiación ── */}
          <SectionCard title="Financiación" icon={Landmark}>
            <div className="flex gap-3">
              {['Sin hipoteca', 'Con hipoteca'].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFinanciada(i === 1)}
                  className={BTN_QUICK_CLS(financiada === (i === 1))}
                >
                  {label}
                </button>
              ))}
            </div>

            {financiada && (
              <div className="space-y-5 pt-2">
                <Field label="Entrada">
                  <InputFlexible
                    value={entrada}
                    onChange={handleSetEntrada}
                    base={precioCompra}
                    quickPct={[0, 10, 20, 30, 40]}
                  />
                </Field>

                <Field label="Cuota hipotecaria">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {['Conozco la cuota', 'Calcular la cuota'].map((label, i) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setCuotaConocida(i === 0)}
                          className={BTN_QUICK_CLS(cuotaConocida === (i === 0))}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {cuotaConocida ? (
                      <NumericInput
                        value={cuotaManual}
                        onChange={setCuotaManual}
                        placeholder="Cuota mensual"
                        suffix="€/mes"
                        className={INPUT_CLS}
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Capital prestado">
                          <InputFlexible
                            value={capitalPrestado}
                            onChange={handleSetCapital}
                            base={precioCompra}
                            quickPct={[60, 70, 80, 90, 100]}
                          />
                        </Field>
                        <Field label="Tasa de interés anual">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0.1}
                              max={10}
                              step={0.1}
                              value={tasaInteres}
                              onChange={(e) => setTasaInteres(parseFloat(e.target.value) || 0)}
                              className={`${INPUT_CLS} flex-1`}
                            />
                            <span className="text-xs text-gray-400">%</span>
                          </div>
                        </Field>
                        <Field label="Plazo">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={40}
                              step={1}
                              value={plazoAnios}
                              onChange={(e) => setPlazoAnios(parseInt(e.target.value) || 0)}
                              className={`${INPUT_CLS} flex-1`}
                            />
                            <span className="text-xs text-gray-400">años</span>
                          </div>
                        </Field>
                      </div>
                    )}
                  </div>
                </Field>

                {resRent?.cuotaMensual && resRent.cuotaMensual > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-xs text-blue-700">
                      Cuota calculada:{' '}
                      <strong>{formatEuros(resRent.cuotaMensual)}/mes</strong>
                    </span>
                  </div>
                )}

                {alertas?.cuotaSuperaRenta && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-xs text-amber-700">
                      La cuota hipotecaria supera la renta bruta mensual.
                    </span>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* ── SECCIÓN 2B: Gastos e Ingresos ── */}
          <SectionCard title="Gastos e ingresos de la renta" icon={BarChart2}>
            <Field label="Renta bruta mensual *">
              <NumericInput
                value={rentaMensual}
                onChange={setRentaMensual}
                placeholder="1.200"
                suffix="€/mes"
                className={INPUT_CLS}
              />
              {rentaMensual > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Renta bruta anual:{' '}
                  <span className="text-gray-600">{formatEuros(rentaMensual * 12)}</span>
                </p>
              )}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="IBI (anual)">
                <NumericInput
                  value={ibi}
                  onChange={setIbi}
                  placeholder="400"
                  suffix="€/año"
                  className={INPUT_CLS}
                />
              </Field>
              <Field label="Gastos comunidad (mensual)">
                <NumericInput
                  value={comunidadMensual}
                  onChange={setComunidadMensual}
                  placeholder="80"
                  suffix="€/mes"
                  className={INPUT_CLS}
                />
                {comunidadMensual > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Anual: {formatEuros(comunidadMensual * 12)}
                  </p>
                )}
              </Field>
            </div>

            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Seguros (anuales)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(
                [
                  ['Seguro de hogar', segHogar, setSegHogar],
                  ['Seguro de vida', segVida, setSegVida],
                  ['Seguro de impago', segImpago, setSegImpago],
                ] as [string, number, (v: number) => void][]
              ).map(([label, val, setter]) => (
                <Field key={label} label={label}>
                  <NumericInput
                    value={val}
                    onChange={setter}
                    placeholder="0"
                    suffix="€/año"
                    className={INPUT_CLS}
                  />
                </Field>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label="Gasto de vacancia"
                tooltip="Período sin inquilino. % calculado sobre la renta bruta anual."
              >
                <InputFlexible
                  value={vacancia}
                  onChange={setVacancia}
                  base={rentaMensual * 12}
                  quickPct={[0, 5, 10]}
                />
              </Field>

              <Field
                label="Gasto de mantenimiento"
                tooltip="% calculado sobre el precio de compra."
              >
                <InputFlexible
                  value={mantenimiento}
                  onChange={setMantenimiento}
                  base={precioCompra}
                  quickPct={[0, 5, 10]}
                />
              </Field>
            </div>

            <Field label="Gastos por recibos (internet / luz / agua / gas, anual)">
              <NumericInput
                value={recibos}
                onChange={setRecibos}
                placeholder="0"
                suffix="€/año"
                className={INPUT_CLS}
              />
            </Field>

            <Field
              label="Gasto gestión alquiler"
              tooltip="Honorarios de agencia o gestor. % sobre ingresos brutos anuales o € fijo."
            >
              <InputFlexible
                value={gestionAlquiler}
                onChange={setGestionAlquiler}
                base={rentaMensual * 12}
                quickPct={[5, 10]}
              />
            </Field>

            {financiada && !cuotaConocida && resRent && resRent.interesesHipotecaAnio1 !== null && (
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Intereses hipoteca año 1</span>
                  <span
                    title="Intereses del primer año de la hipoteca incluidos en los gastos operativos"
                    className="cursor-help text-gray-400"
                  >
                    <Info className="w-3 h-3" />
                  </span>
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  {formatEuros(resRent.interesesHipotecaAnio1)}
                </span>
              </div>
            )}

            {verRentabilidad && precioCompra > 0 && resRent && (
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Amortización anual (aprox.)</span>
                  <span
                    title="Estimación de la amortización fiscal del inmueble (3% sobre valor construcción)"
                    className="cursor-help text-gray-400"
                  >
                    <Info className="w-3 h-3" />
                  </span>
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  {formatEuros(resRent.amortizacionAnual)}
                </span>
              </div>
            )}
          </SectionCard>

          {/* ── SECCIÓN 2C: IRPF ── */}
          <SectionCard title="Tramo IRPF (opcional)" icon={Percent}>
            <Field
              label="Tramo de IRPF"
              tooltip="Estimación orientativa. No sustituye el asesoramiento fiscal profesional."
            >
              <select
                value={tramoIrpf?.id ?? ''}
                onChange={(e) => {
                  const t = tramosIrpf.find((t) => t.id === e.target.value) ?? null
                  setTramoIrpf(t)
                }}
                className={INPUT_CLS}
              >
                <option value="">Sin seleccionar (no calcular IRPF)</option>
                {tramosIrpf.map((t) => (
                  <option key={t.id} value={t.id}>
                    Tramo {t.tramo}: {t.descripcion} — {t.tipo_porcentaje}%
                  </option>
                ))}
              </select>
              {tramoIrpf && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                  Este cálculo es una estimación orientativa basada en el tipo marginal del tramo
                  seleccionado. No considera reducciones, deducciones ni situación fiscal personal.
                  Consulta con un asesor fiscal.
                </p>
              )}
            </Field>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={esLargaEstancia}
                onChange={(e) => setEsLargaEstancia(e.target.checked)}
                className="rounded"
              />
              <span className="text-xs text-gray-600">
                Alquiler de larga estancia (reducción 50%)
              </span>
            </label>
          </SectionCard>

          {/* ── SECCIÓN 2D: Resultados ── */}
          {resRent && (
            <SectionCard title="Resultados de rentabilidad" icon={TrendingUp}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* Rentabilidades */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Rentabilidades
                  </p>
                  <ResultRow
                    label="Rentabilidad bruta"
                    value={formatPorcentaje(resRent.rentabilidadBruta)}
                    tooltip="Renta bruta anual / Precio total de compra × 100"
                  />
                  <ResultRow
                    label="Rentabilidad neta"
                    value={formatPorcentaje(resRent.rentabilidadNeta)}
                    highlight
                    tooltip="Beneficio después de impuestos / Precio total de compra × 100"
                  />
                  <ResultRow
                    label="Rentabilidad total"
                    value={formatPorcentaje(resRent.rentabilidadTotal)}
                    highlight
                    tooltip="Rentabilidad neta + revalorización anual esperada"
                  />
                </div>

                {/* Flujos */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Flujos
                  </p>
                  <ResultRow
                    label="Ingresos brutos anuales"
                    value={formatEuros(resRent.ingresosBrutosAnuales)}
                  />
                  <ResultRow
                    label="Gastos operativos anuales"
                    value={formatEuros(resRent.gastosOperativosAnuales)}
                  />
                  <ResultRow
                    label="Beneficio antes de impuestos"
                    value={formatEuros(resRent.beneficioAntesImpuestos)}
                    tooltip="Ingresos brutos – gastos operativos (incluye intereses hipoteca año 1)"
                  />
                  <ResultRow
                    label="Amortización anual (aprox.)"
                    value={formatEuros(resRent.amortizacionAnual)}
                    tooltip="Deducción fiscal estimada: 3% sobre el valor de construcción"
                  />
                  {resRent.impuestosEstimados !== null && (
                    <ResultRow
                      label="Impuestos estimados (IRPF)"
                      value={formatEuros(resRent.impuestosEstimados)}
                      tooltip="Estimación orientativa basada en el tramo marginal seleccionado"
                    />
                  )}
                  <ResultRow
                    label="Beneficio después de impuestos"
                    value={formatEuros(resRent.beneficioDespuesImpuestos)}
                    highlight
                  />
                  <ResultRow
                    label="Cashflow neto anual"
                    value={formatEuros(resRent.cashflowNetoAnual)}
                    highlight
                    tooltip="Beneficio DI – principal hipoteca amortizado"
                  />
                </div>

                {/* Capital */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Capital
                  </p>
                  <ResultRow
                    label="Capital invertido"
                    value={formatEuros(resRent.capitalInvertido)}
                    tooltip="Entrada + gastos de adquisición"
                  />
                  {resRent.capitalFinanciado !== null && resRent.capitalFinanciado > 0 && (
                    <ResultRow
                      label="Capital financiado"
                      value={formatEuros(resRent.capitalFinanciado)}
                    />
                  )}
                  {resRent.cuotaMensual !== null && resRent.cuotaMensual > 0 && (
                    <ResultRow
                      label="Cuota hipotecaria"
                      value={`${formatEuros(resRent.cuotaMensual)}/mes`}
                    />
                  )}
                  {resRent.principalHipotecaAnual !== null && resRent.principalHipotecaAnual > 0 && (
                    <ResultRow
                      label="Principal amortizado año 1"
                      value={formatEuros(resRent.principalHipotecaAnual)}
                      tooltip="Parte de las cuotas que reduce el capital del préstamo"
                    />
                  )}
                </div>

                {/* Métricas avanzadas */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Métricas avanzadas
                  </p>
                  <ResultRow
                    label="Payback period"
                    value={formatAnios(resRent.paybackPeriod)}
                    tooltip="Años para recuperar el capital invertido con el cashflow neto"
                  />
                  <ResultRow
                    label="Cash-on-Cash return"
                    value={formatPorcentajeONa(resRent.cashOnCash)}
                    tooltip="Cashflow neto anual / Capital desembolsado × 100"
                  />
                  <ResultRow
                    label="TIR"
                    value={formatPorcentajeONa(resRent.tir)}
                    tooltip={`Tasa interna de retorno a ${horizonteTIR} años incluyendo plusvalía`}
                  />
                </div>
              </div>

              {/* Plusvalía */}
              <div className="pt-3 border-t border-gray-100 space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Plusvalía estimada ({revalorizacion}% anual)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      ['A 1 año', resRent.plusvalia.anio1],
                      ['A 5 años', resRent.plusvalia.anio5],
                      ['A 10 años', resRent.plusvalia.anio10],
                    ] as [string, number][]
                  ).map(([label, val]) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">
                        {formatEuros(val)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración TIR / Revalorización */}
              <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Revalorización anual esperada">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={-10}
                      max={20}
                      step={0.5}
                      value={revalorizacion}
                      onChange={(e) => setRevalorizacion(parseFloat(e.target.value) || 0)}
                      className={`${INPUT_CLS} flex-1`}
                    />
                    <span className="text-xs text-gray-400">%</span>
                  </div>
                </Field>
                <Field label="Horizonte temporal para TIR">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={5}
                      max={30}
                      step={1}
                      value={horizonteTIR}
                      onChange={(e) => setHorizonteTIR(parseInt(e.target.value) || 10)}
                      className={`${INPUT_CLS} flex-1`}
                    />
                    <span className="text-xs text-gray-400">años</span>
                  </div>
                </Field>
              </div>
            </SectionCard>
          )}

          {/* ── SECCIÓN 2E: Indicador de Salud ── */}
          {resRent && <IndicadorSalud salud={resRent.saludInversion} />}

          {/* ── SECCIÓN 2F: Análisis de Escenarios ── */}
          {escenarios && escenarios.length > 0 && (
            <SectionCard title="Análisis de escenarios" icon={BarChart2}>
              <p className="text-xs text-gray-500">
                Escenarios generados automáticamente variando vacancia, renta, revalorización y
                mantenimiento respecto al escenario base.
              </p>
              <TablaEscenarios escenarios={escenarios} />
            </SectionCard>
          )}
        </>
      )}

      {/* ── BANNER UPSELL (solo versión pública) ── */}
      {!isAuthenticated && precioCompra > 0 && <BannerUpsell />}
    </div>
  )
}
