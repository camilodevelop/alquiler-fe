import type {
  Simulacion,
  SimulacionFoto,
  ResultadosCompletos,
  SaludInversion,
  ResultadosEscenario,
  ValorFlexible,
  ImpuestoConfig,
} from '../types'
import { formatEuros, formatPorcentaje, formatAnios, formatPorcentajeONa } from './formatters'
import { resolverValor } from './calculos'

// ─── Validaciones pre-export ──────────────────────────────────────────────────

export interface ValidacionPDF {
  valido: boolean
  faltantes: string[]
}

export function validarCamposPDF(
  sim: Partial<Pick<Simulacion, 'nombre' | 'direccion' | 'estado_negociacion' | 'observaciones'>>,
  fotosCount: number,
): ValidacionPDF {
  const faltantes: string[] = []

  if (!sim.nombre?.trim())            faltantes.push('Nombre / título de la simulación')
  if (!sim.direccion?.trim())         faltantes.push('Dirección del inmueble')
  if (!sim.estado_negociacion)        faltantes.push('Estado de negociación')
  if (!sim.observaciones?.trim())     faltantes.push('Observaciones')
  if (fotosCount < 1)                 faltantes.push('Se requiere al menos 1 foto del inmueble')

  return { valido: faltantes.length === 0, faltantes }
}

// ─── Paleta y tipografía ──────────────────────────────────────────────────────

const BRAND       = '#09b850'
const BRAND_DARK  = '#047a35'
const BRAND_LIGHT = '#f0fdf4'
const GRAY_DARK   = '#111827'
const GRAY_MID    = '#6b7280'
const GRAY_LIGHT  = '#f9fafb'
const GRAY_BORDER = '#e5e7eb'
const WHITE       = '#ffffff'

// ─── Helpers HTML ─────────────────────────────────────────────────────────────

function esc(text: string | null | undefined): string {
  return (text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Sección con cabecera verde + borde, y page-break-inside: avoid */
function section(title: string, content: string, pageBreakBefore = false): string {
  return `
    <div style="
      margin-bottom:18px;
      break-inside:avoid;
      page-break-inside:avoid;
      ${pageBreakBefore ? 'page-break-before:always;margin-top:0;' : ''}
    ">
      <div style="
        background:${BRAND};
        color:${WHITE};
        font-size:8pt;
        font-weight:700;
        text-transform:uppercase;
        letter-spacing:0.06em;
        padding:5px 12px;
        border-radius:5px 5px 0 0;
      ">${title}</div>
      <div style="
        border:1px solid ${GRAY_BORDER};
        border-top:none;
        border-radius:0 0 5px 5px;
        padding:12px;
        background:${WHITE};
      ">${content}</div>
    </div>`
}

/** Fila de tabla con zebra striping */
let _rowIdx = 0
function resetRows() { _rowIdx = 0 }
function row(label: string, value: string, highlight = false): string {
  _rowIdx++
  const bg = highlight
    ? BRAND_LIGHT
    : _rowIdx % 2 === 0 ? GRAY_LIGHT : WHITE
  const fw    = highlight ? '700' : '400'
  const color = highlight ? BRAND_DARK : GRAY_DARK
  return `
    <tr style="background:${bg};">
      <td style="padding:4px 10px;font-size:8pt;color:${GRAY_MID};border-bottom:1px solid ${GRAY_BORDER};">${esc(label)}</td>
      <td style="padding:4px 10px;font-size:8.5pt;font-weight:${fw};color:${color};text-align:right;border-bottom:1px solid ${GRAY_BORDER};">${esc(value)}</td>
    </tr>`
}

function table(rows: string, resetIdx = true): string {
  if (resetIdx) resetRows()
  return `<table style="width:100%;border-collapse:collapse;border-radius:4px;overflow:hidden;">${rows}</table>`
}

function subHeader(label: string): string {
  return `
    <tr>
      <td colspan="2" style="
        padding:8px 10px 3px;
        font-size:7pt;
        font-weight:700;
        color:${BRAND};
        text-transform:uppercase;
        letter-spacing:0.05em;
        border-bottom:1px solid ${BRAND}20;
        background:${BRAND_LIGHT};
      ">${esc(label)}</td>
    </tr>`
}

function dividerRow(): string {
  return `<tr><td colspan="2" style="padding:0;height:1px;background:${GRAY_BORDER};"></td></tr>`
}

function grid2(left: string, right: string): string {
  return `
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="width:50%;padding-right:8px;vertical-align:top;">${left}</td>
        <td style="width:50%;vertical-align:top;">${right}</td>
      </tr>
    </table>`
}

function saludBadge(salud: SaludInversion): string {
  const cfg: Record<SaludInversion, { emoji: string; label: string; bg: string; color: string; border: string }> = {
    poco_rentable:         { emoji: '🔴', label: 'Poco rentable',         bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
    rentabilidad_ajustada: { emoji: '🟡', label: 'Rentabilidad ajustada', bg: '#fffbeb', color: '#b45309', border: '#fcd34d' },
    buena_inversion:       { emoji: '🟢', label: 'Buena inversión',       bg: BRAND_LIGHT, color: BRAND_DARK, border: '#86efac' },
  }
  const c = cfg[salud]
  return `
    <div style="
      background:${c.bg};
      border:2px solid ${c.border};
      border-radius:8px;
      padding:12px 16px;
      display:flex;
      align-items:center;
      gap:12px;
    ">
      <span style="font-size:20pt;line-height:1;">${c.emoji}</span>
      <div>
        <p style="font-size:12pt;font-weight:800;color:${c.color};margin:0;">${c.label}</p>
        <p style="font-size:7.5pt;color:${GRAY_MID};margin:2px 0 0;">
          ${salud === 'poco_rentable'
            ? 'Rentabilidad neta inferior al 3%. Revisa los costes o el precio de compra.'
            : salud === 'rentabilidad_ajustada'
              ? 'Rentabilidad neta entre 3% y 5%. Aceptable en mercados de baja rentabilidad.'
              : 'Rentabilidad neta superior al 5%. Inversión con retorno atractivo.'}
        </p>
      </div>
    </div>`
}

// ─── Logo en base64 ───────────────────────────────────────────────────────────

/** Carga el logo como data URL via canvas (browser only) */
export async function getLogoDataUrl(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width  = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(''); return }
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch { resolve('') }
    }
    img.onerror = () => resolve('')
    img.src = src
  })
}

// ─── Builder principal ────────────────────────────────────────────────────────

export function buildSimulacionPdfHtml(
  sim: Simulacion,
  fotos: (SimulacionFoto | { url_publica: string; orden: number })[],
  linkPublico: string,
  logoUrl = '',
): string {

  const res: ResultadosCompletos = sim.resultados ?? { adquisicion: null as never, rentabilidad: null, escenarios: null }

  const datosAdq  = sim.datos_adquisicion
  const datosRent = sim.datos_rentabilidad
  const rentaIn   = datosRent?.renta
  const finIn     = datosRent?.financiacion
  const precioCompra   = datosAdq?.precioCompra ?? 0
  const ingresosBrutos = (rentaIn?.rentaBrutaMensual ?? 0) * 12

  const estados: Record<string, string> = {
    en_analisis: 'En análisis', negociando: 'Negociando',
    oferta_presentada: 'Oferta presentada', descartado: 'Descartado', adquirido: 'Adquirido',
  }

  const fechaStr = new Date(sim.updated_at).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  function fvPdf(v: ValorFlexible | undefined, base: number): string {
    if (!v) return '—'
    if (v.tipo === 'porcentaje') return `${v.valor}% = ${formatEuros((base * v.valor) / 100)}`
    return formatEuros(v.valor)
  }

  function impuestoRowPdf(imp: ImpuestoConfig, pc: number): string {
    if (!imp) return ''
    if (imp.tipo === 'iva')              return row(`IVA obra nueva (${imp.porcentaje}%)`, formatEuros((pc * imp.porcentaje) / 100))
    if (imp.tipo === 'itp')             return row(`ITP ${imp.nombre} (${imp.porcentaje}%)`, formatEuros((pc * imp.porcentaje) / 100))
    if (imp.tipo === 'itp_manual_euros') return row('ITP (importe manual)', formatEuros(imp.euros))
    if (imp.tipo === 'itp_bonificado')  return row(`ITP Bonificado (${imp.porcentaje}%)`, formatEuros((pc * imp.porcentaje) / 100))
    return ''
  }

  // ── Header con logo (se repite en cada página gracias a position:fixed) ──────
  const headerHtml = logoUrl ? `
    <div style="
      position:fixed;
      top:0; left:0; right:0;
      height:14mm;
      background:${WHITE};
      border-bottom:3px solid ${BRAND};
      display:flex;
      align-items:center;
      padding:0 10mm;
      z-index:9999;
    ">
      <img src="${logoUrl}" style="height:9mm;width:auto;display:block;" alt="Rentyva" />
      <div style="margin-left:auto;text-align:right;">
        <p style="font-size:7pt;color:${GRAY_MID};margin:0;">Informe de rentabilidad</p>
        <p style="font-size:6.5pt;color:${GRAY_MID};margin:1px 0 0;">${fechaStr}</p>
      </div>
    </div>
    <div style="height:16mm;"></div>` : ''

  // ── Portada ──────────────────────────────────────────────────────────────────
  const portada = `
    <div style="
      text-align:center;
      padding:${logoUrl ? '12px' : '28px'} 0 20px;
      border-bottom:2px solid ${GRAY_BORDER};
      margin-bottom:20px;
    ">
      ${!logoUrl ? '' : ''}
      <p style="font-size:7pt;color:${BRAND};font-weight:700;text-transform:uppercase;
                letter-spacing:0.12em;margin:0 0 8px;">Análisis de rentabilidad inmobiliaria</p>
      <h1 style="font-size:18pt;font-weight:800;color:${GRAY_DARK};margin:0 0 6px;line-height:1.2;">
        ${esc(sim.nombre)}
      </h1>
      ${sim.direccion ? `<p style="font-size:9.5pt;color:${GRAY_MID};margin:4px 0;">${esc(sim.direccion)}</p>` : ''}
      ${sim.estado_negociacion ? `
        <span style="
          display:inline-block;
          background:${BRAND_LIGHT};
          border:1px solid ${BRAND}40;
          color:${BRAND_DARK};
          font-size:7.5pt;
          font-weight:600;
          border-radius:20px;
          padding:3px 14px;
          margin-top:8px;
        ">${estados[sim.estado_negociacion] ?? sim.estado_negociacion}</span>` : ''}
    </div>`

  // ── Observaciones ─────────────────────────────────────────────────────────────
  const obsSection = sim.observaciones ? section('Observaciones del inmueble', `
    <p style="font-size:8.5pt;color:${GRAY_DARK};line-height:1.65;margin:0;">${esc(sim.observaciones)}</p>
  `) : ''

  // ── Fotos ─────────────────────────────────────────────────────────────────────
  const fotasOrdenadas = [...fotos].sort((a, b) => a.orden - b.orden).slice(0, 8)
  const fotosHtml = fotasOrdenadas.map((f) =>
    `<td style="padding:3px;width:25%;">
       <img src="${f.url_publica}" alt="Foto inmueble"
            style="width:100%;height:85px;object-fit:cover;border-radius:5px;display:block;border:1px solid ${GRAY_BORDER};" />
     </td>`
  )
  const filasFotos: string[] = []
  for (let i = 0; i < fotosHtml.length; i += 4) {
    filasFotos.push(`<tr>${fotosHtml.slice(i, i + 4).join('')}</tr>`)
  }
  const fotosSection = section('Fotos del inmueble', `
    <table style="width:100%;border-collapse:collapse;">${filasFotos.join('')}</table>
  `)

  // ── Coste de adquisición ──────────────────────────────────────────────────────
  const adq = res.adquisicion
  const adqSection = adq ? section('Coste de adquisición', table(
    row('Precio de compra', formatEuros(adq.precioCompra)) +
    (adq.comisionInmobiliaria > 0 ? row('Comisión inmobiliaria', formatEuros(adq.comisionInmobiliaria)) : '') +
    (adq.comisionPsi > 0          ? row('Comisión PSI',           formatEuros(adq.comisionPsi))         : '') +
    impuestoRowPdf(datosAdq?.impuesto ?? null, precioCompra) +
    (adq.tasacion > 0     ? row('Tasación',                     formatEuros(adq.tasacion))     : '') +
    (adq.gestoria > 0     ? row('Gestoría',                     formatEuros(adq.gestoria))     : '') +
    (adq.otrosGastos > 0  ? row('Otros gastos compraventa',     formatEuros(adq.otrosGastos))  : '') +
    (adq.gastosReforma > 0? row('Gastos de adecuación/reforma', formatEuros(adq.gastosReforma)) : '') +
    dividerRow() +
    row('Precio total de entrada', formatEuros(adq.totalEntrada), true)
  )) : ''

  // ── Financiación ──────────────────────────────────────────────────────────────
  const rent = res.rentabilidad
  const financiacionSection = (finIn?.financiada && rent) ? section('Financiación hipotecaria', table(
    (finIn.entrada ? row('Entrada', fvPdf(finIn.entrada, precioCompra)) : '') +
    (rent.capitalFinanciado != null ? row('Capital financiado', formatEuros(rent.capitalFinanciado)) : '') +
    (finIn.cuota?.tipo === 'calcular' ? (
      row('Tasa de interés', `${finIn.cuota.tasaInteresAnual}% anual`) +
      row('Plazo de amortización', `${finIn.cuota.plazoAnios} años`)
    ) : '') +
    (rent.cuotaMensual != null ? row('Cuota mensual', `${formatEuros(rent.cuotaMensual)}/mes`, true) : '') +
    (rent.interesesHipotecaAnio1 != null && rent.interesesHipotecaAnio1 > 0
      ? row('Intereses hipoteca año 1', formatEuros(rent.interesesHipotecaAnio1)) : '') +
    (rent.principalHipotecaAnual != null && rent.principalHipotecaAnual > 0
      ? row('Amortización capital año 1', formatEuros(rent.principalHipotecaAnual)) : '')
  )) : ''

  // ── Ingresos y gastos ─────────────────────────────────────────────────────────
  const gastosSection = (rentaIn && rent) ? section('Ingresos y gastos de la renta', table(
    subHeader('Ingresos') +
    row('Renta bruta mensual', `${formatEuros(rentaIn.rentaBrutaMensual)}/mes`) +
    row('Renta bruta anual', formatEuros(rent.ingresosBrutosAnuales)) +
    subHeader('Gastos operativos') +
    (resolverValor(rentaIn.vacancia, ingresosBrutos) > 0
      ? row('Vacancia', fvPdf(rentaIn.vacancia, ingresosBrutos)) : '') +
    (rentaIn.ibi > 0           ? row('IBI',              formatEuros(rentaIn.ibi))           : '') +
    (rentaIn.seguroHogar > 0   ? row('Seguro de hogar',  formatEuros(rentaIn.seguroHogar))   : '') +
    (rentaIn.seguroVida > 0    ? row('Seguro de vida',   formatEuros(rentaIn.seguroVida))    : '') +
    (rentaIn.seguroImpago > 0  ? row('Seguro de impago', formatEuros(rentaIn.seguroImpago))  : '') +
    (rentaIn.gastosComunidadMensual > 0
      ? row('Comunidad', `${formatEuros(rentaIn.gastosComunidadMensual)}/mes = ${formatEuros(rentaIn.gastosComunidadMensual * 12)}/año`) : '') +
    (resolverValor(rentaIn.mantenimiento, precioCompra) > 0
      ? row('Mantenimiento', fvPdf(rentaIn.mantenimiento, precioCompra)) : '') +
    (rentaIn.gestionAlquiler && resolverValor(rentaIn.gestionAlquiler, ingresosBrutos) > 0
      ? row('Gestión alquiler', fvPdf(rentaIn.gestionAlquiler, ingresosBrutos)) : '') +
    (rentaIn.gastosRecibos > 0 ? row('Recibos', formatEuros(rentaIn.gastosRecibos)) : '') +
    (rent.interesesHipotecaAnio1 != null && rent.interesesHipotecaAnio1 > 0
      ? row('Intereses hipoteca año 1', formatEuros(rent.interesesHipotecaAnio1)) : '') +
    dividerRow() +
    row('Total gastos operativos', formatEuros(rent.gastosOperativosAnuales), true)
  )) : ''

  // ── IRPF ─────────────────────────────────────────────────────────────────────
  const irpfSection = (datosRent?.irpfTramo && rent?.impuestosEstimados != null) ? section('IRPF y amortización fiscal', table(
    row('Tramo IRPF', `Tramo ${datosRent.irpfTramo.tramo}: ${datosRent.irpfTramo.descripcion} (${datosRent.irpfTramo.tipo_porcentaje}%)`) +
    row('Alquiler larga estancia', datosRent.esLargaEstancia ? 'Sí (reducción 50%)' : 'No') +
    row('Amortización fiscal anual', formatEuros(rent.amortizacionAnual)) +
    row('Impuestos estimados', formatEuros(rent.impuestosEstimados), true)
  )) : ''

  // ── Resultados ────────────────────────────────────────────────────────────────
  const rentSection = rent ? section('Resultados de rentabilidad', grid2(
    `<p style="font-size:7pt;font-weight:700;color:${BRAND};text-transform:uppercase;
               letter-spacing:0.05em;margin:0 0 5px;">Cuenta de resultados</p>` +
    table(
      row('Ingresos brutos anuales',     formatEuros(rent.ingresosBrutosAnuales)) +
      row('Gastos operativos',           formatEuros(rent.gastosOperativosAnuales)) +
      dividerRow() +
      row('Beneficio antes impuestos',   formatEuros(rent.beneficioAntesImpuestos), true) +
      (rent.impuestosEstimados != null ? row('− IRPF estimado', formatEuros(rent.impuestosEstimados)) : '') +
      row('Beneficio después impuestos', formatEuros(rent.beneficioDespuesImpuestos), true) +
      (rent.principalHipotecaAnual != null ? row('− Amortización hipoteca', formatEuros(rent.principalHipotecaAnual)) : '') +
      dividerRow() +
      row('Cashflow neto anual',         formatEuros(rent.cashflowNetoAnual), true)
    ) +
    `<p style="font-size:7pt;font-weight:700;color:${BRAND};text-transform:uppercase;
               letter-spacing:0.05em;margin:10px 0 5px;">Capital</p>` +
    table(
      row('Capital invertido', formatEuros(rent.capitalInvertido)) +
      (rent.capitalFinanciado != null ? row('Capital financiado', formatEuros(rent.capitalFinanciado)) : '')
    ),
    `<p style="font-size:7pt;font-weight:700;color:${BRAND};text-transform:uppercase;
               letter-spacing:0.05em;margin:0 0 5px;">Rentabilidades</p>` +
    table(
      row('Rentabilidad bruta',   formatPorcentaje(rent.rentabilidadBruta)) +
      row('Rentabilidad neta',    formatPorcentaje(rent.rentabilidadNeta), true) +
      row('Rentabilidad total',   formatPorcentaje(rent.rentabilidadTotal))
    ) +
    `<p style="font-size:7pt;font-weight:700;color:${BRAND};text-transform:uppercase;
               letter-spacing:0.05em;margin:10px 0 5px;">Métricas avanzadas</p>` +
    table(
      row('Payback period',       formatAnios(rent.paybackPeriod)) +
      row('Cash-on-Cash return',  formatPorcentajeONa(rent.cashOnCash)) +
      row('TIR',                  formatPorcentajeONa(rent.tir))
    ) +
    `<p style="font-size:7pt;font-weight:700;color:${BRAND};text-transform:uppercase;
               letter-spacing:0.05em;margin:10px 0 5px;">Plusvalía estimada</p>` +
    table(
      row('A 1 año',  formatEuros(rent.plusvalia.anio1)) +
      row('A 5 años', formatEuros(rent.plusvalia.anio5)) +
      row('A 10 años',formatEuros(rent.plusvalia.anio10))
    )
  ), true) : ''  // ← page-break-before para que siempre empiece en nueva página

  // ── Indicador de salud ────────────────────────────────────────────────────────
  const saludSection = rent?.saludInversion
    ? section('Indicador de salud de la inversión', saludBadge(rent.saludInversion))
    : ''

  // ── Escenarios ────────────────────────────────────────────────────────────────
  const escenarios: ResultadosEscenario[] = res.escenarios ?? []
  let escenariosSection = ''
  if (escenarios.length > 0) {
    const thStyle = (color: string) =>
      `padding:6px 10px;font-size:7.5pt;text-align:center;font-weight:700;color:${color};
       background:${GRAY_LIGHT};border-bottom:2px solid ${GRAY_BORDER};`

    const heads = escenarios.map((e) =>
      `<th style="${thStyle(e.nombre === 'pesimista' ? '#dc2626' : e.nombre === 'realista' ? GRAY_MID : BRAND)}">
        ${e.nombre === 'pesimista' ? '🔴' : e.nombre === 'realista' ? '⚪' : '🟢'}
        ${e.nombre.charAt(0).toUpperCase() + e.nombre.slice(1)}
      </th>`
    ).join('')

    let ri = 0
    const rows2 = [
      { label: 'Cashflow anual',   fmt: (e: ResultadosEscenario) => formatEuros(e.cashflowNetoAnual) },
      { label: 'Rent. neta',       fmt: (e: ResultadosEscenario) => formatPorcentaje(e.rentabilidadNeta) },
      { label: 'Cash-on-Cash',     fmt: (e: ResultadosEscenario) => formatPorcentajeONa(e.cashOnCash) },
      { label: 'Payback',          fmt: (e: ResultadosEscenario) => formatAnios(e.paybackPeriod) },
      { label: 'TIR',              fmt: (e: ResultadosEscenario) => formatPorcentajeONa(e.tir) },
    ].map(({ label, fmt }) => {
      ri++
      const bg = ri % 2 === 0 ? GRAY_LIGHT : WHITE
      return `<tr style="background:${bg};">
        <td style="padding:5px 10px;font-size:8pt;color:${GRAY_MID};border-bottom:1px solid ${GRAY_BORDER};">${label}</td>
        ${escenarios.map((e) => `<td style="padding:5px 10px;font-size:8pt;text-align:center;color:${GRAY_DARK};border-bottom:1px solid ${GRAY_BORDER};">${fmt(e)}</td>`).join('')}
      </tr>`
    }).join('')

    escenariosSection = section('Análisis de escenarios', `
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="${thStyle(GRAY_MID)};text-align:left;">Métrica</th>
            ${heads}
          </tr>
        </thead>
        <tbody>${rows2}</tbody>
      </table>`)
  }

  // ── Disclaimer IRPF ───────────────────────────────────────────────────────────
  const disclaimer = rent?.impuestosEstimados != null ? `
    <div style="
      margin-bottom:16px;
      padding:8px 12px;
      background:#fffbeb;
      border-left:3px solid #f59e0b;
      border-radius:0 4px 4px 0;
    ">
      <p style="font-size:7pt;color:#92400e;margin:0;line-height:1.5;">
        ⚠️ Los cálculos de IRPF son estimaciones orientativas basadas en el tipo marginal del tramo
        seleccionado. No consideran reducciones, deducciones ni la situación fiscal personal.
        Consulta con un asesor fiscal antes de tomar decisiones de inversión.
      </p>
    </div>` : ''

  // ── Link público ──────────────────────────────────────────────────────────────
  const linkSection = `
    <div style="
      background:${BRAND_LIGHT};
      border:1px solid ${BRAND}40;
      border-radius:6px;
      padding:10px 14px;
      margin-bottom:20px;
      text-align:center;
    ">
      <p style="font-size:7.5pt;color:${GRAY_MID};margin:0 0 3px;">Ver simulación online (solo lectura)</p>
      <p style="font-size:8.5pt;color:${BRAND};font-weight:600;margin:0;word-break:break-all;">${esc(linkPublico)}</p>
    </div>`

  // ── Footer ────────────────────────────────────────────────────────────────────
  const footer = `
    <div style="
      border-top:2px solid ${BRAND};
      padding-top:8px;
      display:flex;
      justify-content:space-between;
      align-items:center;
    ">
      ${logoUrl
        ? `<img src="${logoUrl}" style="height:7mm;width:auto;" alt="Rentyva" />`
        : `<span style="font-size:8pt;font-weight:700;color:${BRAND};">Rentyva</span>`}
      <p style="font-size:7pt;color:${GRAY_MID};margin:0;">${fechaStr}</p>
    </div>`

  // ── Documento completo ────────────────────────────────────────────────────────
  return `
    <div style="
      font-family:Helvetica,Arial,sans-serif;
      font-size:8.5pt;
      color:${GRAY_DARK};
      line-height:1.5;
      width:180mm;
      box-sizing:border-box;
      padding:8mm;
      background:${WHITE};
    ">
      ${headerHtml}
      ${portada}
      ${obsSection}
      ${fotosSection}
      ${adqSection}
      ${financiacionSection}
      ${gastosSection}
      ${irpfSection}
      ${rentSection}
      ${saludSection}
      ${escenariosSection}
      ${disclaimer}
      ${linkSection}
      ${footer}
    </div>`
}

// ─── Descarga del PDF ─────────────────────────────────────────────────────────

function waitForPaint(ms = 200): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, ms)))
  )
}

export async function downloadSimulacionPdf(
  sim: Simulacion,
  fotos: (SimulacionFoto | { url_publica: string; orden: number })[],
  linkPublico: string,
  logoUrl = '',
): Promise<void> {
  const html2pdf = (await import('html2pdf.js')).default

  const wrapper = document.createElement('div')
  wrapper.style.cssText =
    'position:fixed;top:0;left:0;width:210mm;min-height:297mm;background:#fff;z-index:99999;opacity:0.01;pointer-events:none;overflow:visible;'
  wrapper.innerHTML = buildSimulacionPdfHtml(sim, fotos, linkPublico, logoUrl)
  document.body.appendChild(wrapper)

  try {
    await waitForPaint()

    const safeName = (sim.nombre ?? 'simulacion')
      .replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase()

    await html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename: `rentyva-${safeName}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: wrapper.scrollWidth,
          scrollX: 0,
          scrollY: 0,
          allowTaint: false,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: {
          mode: ['css', 'avoid-all', 'legacy'],
          before: '.page-break-before',
          avoid: ['tr', 'td', 'img'],
        },
      } as never)
      .from(wrapper.firstElementChild as HTMLElement)
      .save()
  } finally {
    document.body.removeChild(wrapper)
  }
}
