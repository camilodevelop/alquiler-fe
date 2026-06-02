import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import logoRentyva from '@/assets/logo-rentyva.png'
import { getSimulacionPublicaAction } from '@/app/actions/calculadora'
import {
  formatEuros,
  formatPorcentaje,
  formatAnios,
  formatPorcentajeONa,
} from '@/modules/calculadora'
import { resolverValor } from '@/modules/calculadora/utils/calculos'
import type {
  SaludInversion,
  SimulacionFoto,
  ResultadosEscenario,
  ValorFlexible,
  ImpuestoConfig,
} from '@/modules/calculadora/types'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

interface Props {
  params: Promise<{ token: string }>
}

// ─── Helpers de display ───────────────────────────────────────────────────────

const saludConfig: Record<SaludInversion, { emoji: string; label: string; cls: string }> = {
  poco_rentable:         { emoji: '🔴', label: 'Poco rentable',         cls: 'bg-red-50 border-red-200 text-red-700' },
  rentabilidad_ajustada: { emoji: '🟡', label: 'Rentabilidad ajustada', cls: 'bg-amber-50 border-amber-200 text-amber-700' },
  buena_inversion:       { emoji: '🟢', label: 'Buena inversión',       cls: 'bg-green-50 border-green-200 text-green-700' },
}

const estadosLabel: Record<string, string> = {
  en_analisis: 'En análisis', negociando: 'Negociando',
  oferta_presentada: 'Oferta presentada', descartado: 'Descartado', adquirido: 'Adquirido',
}

function fv(v: ValorFlexible | undefined, base: number): string {
  if (!v) return '—'
  if (v.tipo === 'porcentaje') return `${v.valor}% = ${formatEuros((base * v.valor) / 100)}`
  return formatEuros(v.valor)
}

function impuestoLabel(imp: ImpuestoConfig, precioCompra: number): { label: string; valor: string } | null {
  if (!imp) return null
  if (imp.tipo === 'iva')               return { label: `IVA obra nueva (${imp.porcentaje}%)`, valor: formatEuros((precioCompra * imp.porcentaje) / 100) }
  if (imp.tipo === 'itp')               return { label: `ITP ${imp.nombre} (${imp.porcentaje}%)`, valor: formatEuros((precioCompra * imp.porcentaje) / 100) }
  if (imp.tipo === 'itp_manual_euros')  return { label: 'ITP (importe manual)', valor: formatEuros(imp.euros) }
  if (imp.tipo === 'itp_bonificado')    return { label: `ITP Bonificado (${imp.porcentaje}%)`, valor: formatEuros((precioCompra * imp.porcentaje) / 100) }
  return null
}

// ─── Componentes de UI ────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="px-5 py-4 space-y-0.5">{children}</div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between py-1.5 px-2 rounded ${highlight ? 'bg-brand-50' : ''}`}>
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-medium ${highlight ? 'text-brand-700' : 'text-gray-800'}`}>{value}</span>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-gray-100 my-1" />
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2 pb-1 px-2">{children}</p>
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function SimulacionPublicaPage({ params }: Props) {
  const { token } = await params
  const { data: sim, error } = await getSimulacionPublicaAction(token)
  if (error || !sim) notFound()

  const res  = sim.resultados
  const adq  = sim.datos_adquisicion
  const rent = sim.datos_rentabilidad
  const renta = rent?.renta
  const fin   = rent?.financiacion
  const fotos = (sim as unknown as { simulacion_fotos?: SimulacionFoto[] })?.simulacion_fotos ?? []
  const escenarios = (res?.escenarios ?? []) as ResultadosEscenario[]
  const salud = res?.rentabilidad?.saludInversion

  const precioCompra    = adq?.precioCompra ?? 0
  const ingresosBrutos  = (renta?.rentaBrutaMensual ?? 0) * 12
  const fechaStr = new Date(sim.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header con logo */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <a href="/">
            <Image
              src={logoRentyva}
              alt="Rentyva"
              width={0}
              height={0}
              sizes="160px"
              className="h-9 w-auto"
            />
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">

        {/* ── Cabecera ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Simulación de rentabilidad</p>
              <h1 className="text-2xl font-bold text-gray-900">{sim.nombre}</h1>
              {sim.direccion && <p className="text-sm text-gray-500 mt-1">{sim.direccion}</p>}
            </div>
            {sim.estado_negociacion && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                {estadosLabel[sim.estado_negociacion] ?? sim.estado_negociacion}
              </span>
            )}
          </div>
          {sim.observaciones && (
            <p className="mt-4 text-sm text-gray-600 border-t border-gray-100 pt-4 leading-relaxed">
              {sim.observaciones}
            </p>
          )}
          <p className="mt-3 text-xs text-gray-400">Actualizado el {fechaStr}</p>
        </div>

        {/* ── Fotos ── */}
        {fotos.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Fotos del inmueble</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {fotos.sort((a, b) => a.orden - b.orden).map((f) => (
                <div key={f.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img src={f.url_publica} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Vídeo ── */}
        {sim.video_url && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Vídeo del inmueble</h2>
            <a href={sim.video_url} target="_blank" rel="noopener noreferrer"
               className="text-sm text-brand-600 hover:text-brand-800 underline break-all">
              {sim.video_url}
            </a>
          </div>
        )}

        {/* ── Coste de adquisición ── */}
        {res?.adquisicion && (
          <SectionCard title="Coste de adquisición">
            <Row label="Precio de compra" value={formatEuros(res.adquisicion.precioCompra)} />
            {res.adquisicion.comisionInmobiliaria > 0 && (
              <Row label="Comisión inmobiliaria" value={formatEuros(res.adquisicion.comisionInmobiliaria)} />
            )}
            {res.adquisicion.comisionPsi > 0 && (
              <Row label="Comisión PSI" value={formatEuros(res.adquisicion.comisionPsi)} />
            )}
            {adq?.impuesto && (() => {
              const imp = impuestoLabel(adq.impuesto, precioCompra)
              return imp ? <Row label={imp.label} value={imp.valor} /> : null
            })()}
            {res.adquisicion.tasacion > 0 && (
              <Row label="Tasación" value={formatEuros(res.adquisicion.tasacion)} />
            )}
            {res.adquisicion.gestoria > 0 && (
              <Row label="Gestoría" value={formatEuros(res.adquisicion.gestoria)} />
            )}
            {res.adquisicion.otrosGastos > 0 && (
              <Row label="Otros gastos compraventa" value={formatEuros(res.adquisicion.otrosGastos)} />
            )}
            {res.adquisicion.gastosReforma > 0 && (
              <Row label="Gastos de adecuación / reforma" value={formatEuros(res.adquisicion.gastosReforma)} />
            )}
            <Divider />
            <Row label="Precio total de entrada" value={formatEuros(res.adquisicion.totalEntrada)} highlight />
          </SectionCard>
        )}

        {/* ── Financiación ── */}
        {fin?.financiada && res?.rentabilidad && (
          <SectionCard title="Financiación">
            {fin.entrada && (
              <Row label="Entrada" value={fv(fin.entrada, precioCompra)} />
            )}
            {res.rentabilidad.capitalFinanciado != null && (
              <Row label="Capital financiado" value={formatEuros(res.rentabilidad.capitalFinanciado)} />
            )}
            {fin.cuota?.tipo === 'calcular' && (
              <>
                <Row label="Tasa de interés" value={`${fin.cuota.tasaInteresAnual}% anual`} />
                <Row label="Plazo de amortización" value={`${fin.cuota.plazoAnios} años`} />
              </>
            )}
            {res.rentabilidad.cuotaMensual != null && (
              <Row label="Cuota mensual" value={`${formatEuros(res.rentabilidad.cuotaMensual)}/mes`} highlight />
            )}
            {res.rentabilidad.interesesHipotecaAnio1 != null && (
              <Row label="Intereses hipoteca año 1" value={formatEuros(res.rentabilidad.interesesHipotecaAnio1)} />
            )}
            {res.rentabilidad.principalHipotecaAnual != null && (
              <Row label="Amortización capital año 1" value={formatEuros(res.rentabilidad.principalHipotecaAnual)} />
            )}
          </SectionCard>
        )}

        {/* ── Ingresos y gastos ── */}
        {renta && res?.rentabilidad && (
          <SectionCard title="Ingresos y gastos de la renta">
            <SubTitle>Ingresos</SubTitle>
            <Row label="Renta bruta mensual" value={`${formatEuros(renta.rentaBrutaMensual)}/mes`} />
            <Row label="Renta bruta anual" value={formatEuros(res.rentabilidad.ingresosBrutosAnuales)} />

            <SubTitle>Gastos operativos anuales</SubTitle>
            {(() => {
              const vacanciaEur = resolverValor(renta.vacancia, ingresosBrutos)
              return vacanciaEur > 0 ? <Row label="Vacancia" value={`${fv(renta.vacancia, ingresosBrutos)}`} /> : null
            })()}
            {renta.ibi > 0 && <Row label="IBI" value={formatEuros(renta.ibi)} />}
            {renta.seguroHogar > 0  && <Row label="Seguro de hogar"  value={formatEuros(renta.seguroHogar)} />}
            {renta.seguroVida > 0   && <Row label="Seguro de vida"   value={formatEuros(renta.seguroVida)} />}
            {renta.seguroImpago > 0 && <Row label="Seguro de impago" value={formatEuros(renta.seguroImpago)} />}
            {renta.gastosComunidadMensual > 0 && (
              <Row label="Comunidad" value={`${formatEuros(renta.gastosComunidadMensual)}/mes = ${formatEuros(renta.gastosComunidadMensual * 12)}/año`} />
            )}
            {(() => {
              const manEur = resolverValor(renta.mantenimiento, precioCompra)
              return manEur > 0 ? <Row label="Mantenimiento" value={fv(renta.mantenimiento, precioCompra)} /> : null
            })()}
            {renta.gestionAlquiler && (() => {
              const gestEur = resolverValor(renta.gestionAlquiler, ingresosBrutos)
              return gestEur > 0 ? <Row label="Gestión alquiler" value={fv(renta.gestionAlquiler, ingresosBrutos)} /> : null
            })()}
            {renta.gastosRecibos > 0 && <Row label="Recibos (internet/suministros)" value={formatEuros(renta.gastosRecibos)} />}
            {res.rentabilidad.interesesHipotecaAnio1 != null && res.rentabilidad.interesesHipotecaAnio1 > 0 && (
              <Row label="Intereses hipoteca año 1" value={formatEuros(res.rentabilidad.interesesHipotecaAnio1)} />
            )}
            <Divider />
            <Row label="Total gastos operativos" value={formatEuros(res.rentabilidad.gastosOperativosAnuales)} />
          </SectionCard>
        )}

        {/* ── IRPF y amortización fiscal ── */}
        {rent?.irpfTramo && res?.rentabilidad && (
          <SectionCard title="IRPF y amortización fiscal">
            <Row label="Tramo IRPF" value={`Tramo ${rent.irpfTramo.tramo}: ${rent.irpfTramo.descripcion} (${rent.irpfTramo.tipo_porcentaje}%)`} />
            <Row label="Alquiler larga estancia" value={rent.esLargaEstancia ? 'Sí (reducción 50%)' : 'No'} />
            <Row label="Amortización fiscal anual (aprox.)" value={formatEuros(res.rentabilidad.amortizacionAnual)} />
            {res.rentabilidad.impuestosEstimados != null && (
              <Row label="Impuestos estimados" value={formatEuros(res.rentabilidad.impuestosEstimados)} />
            )}
          </SectionCard>
        )}

        {/* ── Resultados de rentabilidad ── */}
        {res?.rentabilidad && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Resultados de rentabilidad</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {/* Columna izquierda */}
              <div className="px-5 py-4 space-y-0.5">
                <SubTitle>Cuenta de resultados</SubTitle>
                <Row label="Ingresos brutos anuales" value={formatEuros(res.rentabilidad.ingresosBrutosAnuales)} />
                <Row label="Gastos operativos" value={formatEuros(res.rentabilidad.gastosOperativosAnuales)} />
                <Divider />
                <Row label="Beneficio antes de impuestos" value={formatEuros(res.rentabilidad.beneficioAntesImpuestos)} highlight />
                {res.rentabilidad.impuestosEstimados != null && (
                  <Row label="Impuestos estimados (IRPF)" value={`− ${formatEuros(res.rentabilidad.impuestosEstimados)}`} />
                )}
                <Row label="Beneficio después de impuestos" value={formatEuros(res.rentabilidad.beneficioDespuesImpuestos)} highlight />
                {res.rentabilidad.principalHipotecaAnual != null && (
                  <Row label="Amortización hipoteca" value={`− ${formatEuros(res.rentabilidad.principalHipotecaAnual)}`} />
                )}
                <Divider />
                <Row label="Cashflow neto anual" value={formatEuros(res.rentabilidad.cashflowNetoAnual)} highlight />

                <SubTitle>Capital</SubTitle>
                <Row label="Capital invertido" value={formatEuros(res.rentabilidad.capitalInvertido)} />
                {res.rentabilidad.capitalFinanciado != null && (
                  <Row label="Capital financiado" value={formatEuros(res.rentabilidad.capitalFinanciado)} />
                )}
              </div>

              {/* Columna derecha */}
              <div className="px-5 py-4 space-y-0.5">
                <SubTitle>Rentabilidades</SubTitle>
                <Row label="Rentabilidad bruta" value={formatPorcentaje(res.rentabilidad.rentabilidadBruta)} />
                <Row label="Rentabilidad neta" value={formatPorcentaje(res.rentabilidad.rentabilidadNeta)} highlight />
                <Row label="Rentabilidad total (con plusvalía)" value={formatPorcentaje(res.rentabilidad.rentabilidadTotal)} />

                <SubTitle>Métricas avanzadas</SubTitle>
                <Row label="Payback period" value={formatAnios(res.rentabilidad.paybackPeriod)} />
                <Row label="Cash-on-Cash return" value={formatPorcentajeONa(res.rentabilidad.cashOnCash)} />
                <Row label="TIR" value={formatPorcentajeONa(res.rentabilidad.tir)} />

                <SubTitle>Plusvalía estimada ({rent?.revalorizacionAnual ?? 0}% anual)</SubTitle>
                <Row label="A 1 año"  value={formatEuros(res.rentabilidad.plusvalia.anio1)} />
                <Row label="A 5 años" value={formatEuros(res.rentabilidad.plusvalia.anio5)} />
                <Row label="A 10 años" value={formatEuros(res.rentabilidad.plusvalia.anio10)} />
              </div>
            </div>
          </div>
        )}

        {/* ── Indicador de salud ── */}
        {salud && (
          <div className={`rounded-xl border p-4 flex items-center gap-3 ${saludConfig[salud].cls}`}>
            <span className="text-2xl">{saludConfig[salud].emoji}</span>
            <div>
              <p className="font-semibold text-sm">{saludConfig[salud].label}</p>
              <p className="text-xs opacity-80 mt-0.5">
                {salud === 'poco_rentable'
                  ? 'Rentabilidad neta inferior al 3%.'
                  : salud === 'rentabilidad_ajustada'
                    ? 'Rentabilidad neta entre 3% y 5%.'
                    : 'Rentabilidad neta superior al 5%.'}
              </p>
            </div>
          </div>
        )}

        {/* ── Escenarios ── */}
        {escenarios.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Análisis de escenarios</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-2.5 text-gray-500 font-semibold">Métrica</th>
                    {escenarios.map((e) => (
                      <th key={e.nombre} className={`px-4 py-2.5 text-center font-semibold ${
                        e.nombre === 'pesimista' ? 'text-red-600' : e.nombre === 'realista' ? 'text-gray-600' : 'text-green-600'
                      }`}>
                        {e.nombre === 'pesimista' ? '🔴' : e.nombre === 'realista' ? '⚪' : '🟢'}{' '}
                        {e.nombre.charAt(0).toUpperCase() + e.nombre.slice(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Cashflow neto anual', fmt: (e: ResultadosEscenario) => formatEuros(e.cashflowNetoAnual) },
                    { label: 'Rentabilidad neta',   fmt: (e: ResultadosEscenario) => formatPorcentaje(e.rentabilidadNeta) },
                    { label: 'Cash-on-Cash',        fmt: (e: ResultadosEscenario) => formatPorcentajeONa(e.cashOnCash) },
                    { label: 'Payback period',      fmt: (e: ResultadosEscenario) => formatAnios(e.paybackPeriod) },
                    { label: 'TIR',                 fmt: (e: ResultadosEscenario) => formatPorcentajeONa(e.tir) },
                  ].map((m) => (
                    <tr key={m.label} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-2 text-gray-500">{m.label}</td>
                      {escenarios.map((e) => (
                        <td key={e.nombre} className="px-4 py-2 text-center text-gray-700">{m.fmt(e)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 text-gray-500">Salud</td>
                    {escenarios.map((e) => {
                      const s = saludConfig[e.saludInversion]
                      return (
                        <td key={e.nombre} className={`px-4 py-2 text-center font-semibold ${s.cls.split(' ').find(c => c.startsWith('text-'))}`}>
                          {s.emoji} {s.label}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="text-center pb-4 space-y-1">
          <p className="text-xs text-gray-400">Simulación de solo lectura generada con Rentyva.</p>
          <a href="/" className="text-xs text-brand-600 hover:text-brand-800">
            Crea tu propia simulación gratis →
          </a>
        </div>
      </div>
    </main>
  )
}
