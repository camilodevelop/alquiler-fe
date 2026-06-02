'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import logoRentyva from '@/assets/logo-rentyva.png'
import {
  Save, FileText, Image as ImageIcon, Video, Trash2,
  AlertTriangle, CheckCircle2, Upload, X, FileDown,
} from 'lucide-react'
import {
  createSimulacionAction,
  updateSimulacionAction,
  deleteFotoAction,
} from '@/app/actions/calculadora'
import { validarCamposPDF, downloadSimulacionPdf, getLogoDataUrl } from '@/modules/calculadora/utils/pdf'
import { CalculadoraClient } from './calculadora-client'
import type {
  Simulacion,
  DatosAdquisicion,
  DatosRentabilidad,
  ResultadosCompletos,
  EstadoNegociacion,
  ItpComunidad,
  TramoIRPF,
} from '@/modules/calculadora/types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  ivaObraNueva: number
  comunidades: ItpComunidad[]
  tramosIrpf: TramoIRPF[]
  simulacion?: Simulacion    // undefined = nueva, populated = editar
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface FotoNueva {
  tipo: 'nueva'
  file: File
  previewUrl: string
  orden: number
}
interface FotoGuardada {
  tipo: 'guardada'
  id: string
  url_publica: string
  storage_path: string
  orden: number
}
type FotoItem = FotoNueva | FotoGuardada

interface CalcData {
  datosAdquisicion: DatosAdquisicion
  datosRentabilidad: DatosRentabilidad
  resultados: ResultadosCompletos
}

const ESTADOS_NEGOCIACION: { value: EstadoNegociacion; label: string }[] = [
  { value: 'en_analisis',        label: 'En análisis' },
  { value: 'negociando',         label: 'Negociando' },
  { value: 'oferta_presentada',  label: 'Oferta presentada' },
  { value: 'descartado',         label: 'Descartado' },
  { value: 'adquirido',          label: 'Adquirido' },
]

const INPUT_CLS =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition'

// ─── Componente principal ─────────────────────────────────────────────────────

export function CalculadoraPrivada({
  ivaObraNueva,
  comunidades,
  tramosIrpf,
  simulacion,
}: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const calcDataRef = useRef<CalcData | null>(null)

  // ── Sección 3: Notas ────────────────────────────────────────────────────────
  const [nombre, setNombre] = useState(simulacion?.nombre ?? '')
  const [direccion, setDireccion] = useState(simulacion?.direccion ?? '')
  const [estado, setEstado] = useState<EstadoNegociacion | ''>(simulacion?.estado_negociacion ?? '')
  const [observaciones, setObservaciones] = useState(simulacion?.observaciones ?? '')
  const [videoUrl, setVideoUrl] = useState(simulacion?.video_url ?? '')

  // Fotos
  const [fotos, setFotos] = useState<FotoItem[]>(() => {
    if (!simulacion) return []
    type FotoDb = Omit<FotoGuardada, 'tipo'>
    const fotosSim = (simulacion as unknown as { simulacion_fotos?: FotoDb[] })?.simulacion_fotos ?? []
    return fotosSim
      .sort((a, b) => a.orden - b.orden)
      .map((f): FotoGuardada => ({ tipo: 'guardada', ...f }))
  })
  const [fotosAEliminar, setFotosAEliminar] = useState<string[]>([])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMsg, setSuccessMsg] = useState('')
  const [exportando, setExportando] = useState(false)
  const [pdfErrors, setPdfErrors] = useState<string[]>([])

  // ── Guardar ─────────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!nombre.trim())        errs.nombre        = 'El nombre de la simulación es obligatorio'
    if (!direccion.trim())     errs.direccion     = 'La dirección del inmueble es obligatoria'
    if (!estado)               errs.estado        = 'El estado de negociación es obligatorio'
    if (!observaciones.trim()) errs.observaciones = 'Las observaciones son obligatorias'
    const fotasActivas = fotos.filter(
      (f) => f.tipo !== 'guardada' || !fotosAEliminar.includes((f as FotoGuardada).id)
    )
    if (fotasActivas.length < 1) errs.fotos = 'Se requiere al menos 1 foto del inmueble'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    setSuccessMsg('')
    setErrors({})

    try {
      const calcData = calcDataRef.current
      if (!calcData) {
        setErrors({ general: 'Introduce al menos el precio de compra antes de guardar.' })
        return
      }

      let simId = simulacion?.id

      // 1. Eliminar fotos marcadas para borrar
      for (const fotoId of fotosAEliminar) {
        await deleteFotoAction(fotoId)
      }

      // 2. Guardar/actualizar datos de la simulación
      const payload = {
        nombre: nombre.trim(),
        datosAdquisicion: calcData.datosAdquisicion,
        datosRentabilidad: calcData.datosRentabilidad,
        resultados: calcData.resultados,
        direccion: direccion.trim() || undefined,
        estadoNegociacion: (estado as EstadoNegociacion) || undefined,
        observaciones: observaciones.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
      }

      if (simId) {
        const { error } = await updateSimulacionAction(simId, payload)
        if (error) { setErrors({ general: error }); return }
      } else {
        const { data, error } = await createSimulacionAction(payload)
        if (error) { setErrors({ general: error }); return }
        if (!data?.id) { setErrors({ general: 'No se pudo obtener el ID de la simulación.' }); return }
        simId = data.id
      }

      // 3. Subir fotos nuevas al Storage vía route handler (evita problemas CORS/auth del browser client)
      const fotasNuevas = fotos.filter((f): f is FotoNueva => f.tipo === 'nueva')
      if (fotasNuevas.length > 0) {
        const subidas: FotoGuardada[] = []
        const fallidas: string[] = []

        for (const foto of fotasNuevas) {
          try {
            const fd = new FormData()
            fd.append('file', foto.file)
            fd.append('simulacion_id', simId)
            fd.append('orden', String(foto.orden))

            const res = await fetch('/api/calculadora/fotos', {
              method: 'POST',
              body: fd,
            })

            if (!res.ok) {
              const body = await res.json().catch(() => ({}))
              console.error('[Foto upload error]', foto.file.name, body?.error)
              fallidas.push(foto.file.name)
            } else {
              const result = await res.json()
              subidas.push({
                tipo: 'guardada',
                id: `subida-${Date.now()}`,
                url_publica:  result.url_publica,
                storage_path: result.storage_path,
                orden: foto.orden,
              })
            }
          } catch (err) {
            console.error('[Foto upload exception]', foto.file.name, err)
            fallidas.push(foto.file.name)
          }
        }

        // Actualizar estado local: reemplazar fotos "nueva" por "guardada"
        if (subidas.length > 0) {
          setFotos((prev) => {
            let idx = 0
            return prev.map((f) => {
              if (f.tipo !== 'nueva') return f
              const s = subidas[idx]
              if (!s) return f
              idx++
              return s
            })
          })
        }

        if (fallidas.length > 0) {
          setErrors({ general: `${fallidas.length} foto(s) no se pudieron subir: ${fallidas.join(', ')}` })
          return
        }
      }

      setFotosAEliminar([])
      setSuccessMsg('Simulación guardada correctamente')

      // Redirigir a la página de edición si era nueva
      if (!simulacion?.id && simId) {
        router.push(`/dashboard/calculadora/${simId}`)
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Exportar PDF ────────────────────────────────────────────────────────────
  const handleExportPdf = async () => {
    setPdfErrors([])
    const fotasActivas = fotos.filter(
      (f) => f.tipo !== 'guardada' || !fotosAEliminar.includes((f as FotoGuardada).id)
    )
    const validacion = validarCamposPDF(
      { nombre, direccion, estado_negociacion: (estado as Simulacion['estado_negociacion']) || undefined, observaciones },
      fotasActivas.length,
    )

    if (!validacion.valido) {
      setPdfErrors(validacion.faltantes)
      return
    }

    setExportando(true)
    try {
      const simParaPdf: Simulacion = {
        ...(simulacion ?? {} as Simulacion),
        nombre,
        direccion: direccion || null,
        estado_negociacion: (estado as Simulacion['estado_negociacion']) || null,
        observaciones: observaciones || null,
        resultados: calcDataRef.current?.resultados ?? simulacion?.resultados ?? ({} as ResultadosCompletos),
        token: simulacion?.token ?? '',
        updated_at: new Date().toISOString(),
      } as Simulacion

      const fotasParaPdf = fotasActivas.map((f, i) => ({
        url_publica: f.tipo === 'nueva' ? f.previewUrl : (f as FotoGuardada).url_publica,
        orden: i,
      }))

      const linkPublico = simulacion?.token
        ? `${window.location.origin}/simulacion/publica/${simulacion.token}`
        : `${window.location.origin}/calculadora`

      const logoDataUrl = await getLogoDataUrl(logoRentyva.src)
      await downloadSimulacionPdf(simParaPdf, fotasParaPdf, linkPublico, logoDataUrl)
    } finally {
      setExportando(false)
    }
  }

  // ── Gestión de fotos ────────────────────────────────────────────────────────
  const handleAddFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const nuevas: FotoNueva[] = files.map((file, i) => ({
      tipo: 'nueva',
      file,
      previewUrl: URL.createObjectURL(file),
      orden: fotos.length + i,
    }))
    setFotos((prev) => [...prev, ...nuevas])
    e.target.value = ''
  }

  const handleRemoveFoto = (idx: number) => {
    const foto = fotos[idx]
    if (foto.tipo === 'guardada') {
      setFotosAEliminar((prev) => [...prev, foto.id])
    } else {
      URL.revokeObjectURL(foto.previewUrl)
    }
    setFotos((prev) => prev.filter((_, i) => i !== idx).map((f, i) => ({ ...f, orden: i })))
  }

  const fotosCount = fotos.filter((f) => f.tipo !== 'guardada' || !fotosAEliminar.includes((f as FotoGuardada).id)).length

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
    {/* ── Overlay de generación PDF ── */}
    {exportando && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-5 max-w-xs w-full mx-4">
          {/* Spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
              style={{ borderTopColor: '#09b850' }}
            />
            <FileDown className="absolute inset-0 m-auto w-6 h-6 text-brand-600" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-gray-900 text-sm">Generando informe PDF</p>
            <p className="text-xs text-gray-500">
              Preparando páginas y fotos… puede tardar unos segundos.
            </p>
          </div>
          {/* Barra de progreso animada */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full animate-pulse"
              style={{ backgroundColor: '#09b850', width: '75%' }}
            />
          </div>
        </div>
      </div>
    )}
    <div>
    <div className="space-y-6">
      {/* ── Barra de nombre y guardar ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1 w-full">
            <input
              type="text"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setErrors((p) => ({ ...p, nombre: '' })) }}
              placeholder="Nombre de la simulación *"
              className={`${INPUT_CLS} ${errors.nombre ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {simulacion && (
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={exportando}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
              >
                <FileDown className="w-4 h-4" />
                {exportando ? 'Generando…' : 'Exportar PDF'}
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#09b850' }}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando…' : simulacion ? 'Guardar cambios' : 'Guardar simulación'}
            </button>
          </div>
        </div>

        {/* Errores PDF */}
        {pdfErrors.length > 0 && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-xs font-semibold text-amber-700 mb-1">
              Completa estos campos antes de exportar el PDF:
            </p>
            <ul className="space-y-0.5">
              {pdfErrors.map((e) => (
                <li key={e} className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {errors.general && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {errors.general}
          </div>
        )}
        {successMsg && (
          <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {successMsg}
          </div>
        )}
      </div>

      {/* ── Sección 3: Notas ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
          <FileText className="w-4 h-4 text-brand-600" />
          <h2 className="text-sm font-semibold text-gray-800">Notas de la simulación</h2>
          <span className="text-xs text-gray-400">(obligatorio para guardar — excepto vídeo)</span>
        </div>
        <div className="px-5 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Dirección */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">
                Dirección del inmueble <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => { setDireccion(e.target.value); setErrors((p) => ({ ...p, direccion: '' })) }}
                placeholder="Calle, número, ciudad"
                className={`${INPUT_CLS} ${errors.direccion ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {errors.direccion && <p className="text-xs text-red-500">{errors.direccion}</p>}
            </div>

            {/* Estado de negociación */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">
                Estado de negociación <span className="text-red-400">*</span>
              </label>
              <select
                value={estado}
                onChange={(e) => { setEstado(e.target.value as EstadoNegociacion); setErrors((p) => ({ ...p, estado: '' })) }}
                className={`${INPUT_CLS} ${errors.estado ? 'border-red-400 focus:ring-red-400' : ''}`}
              >
                <option value="">Sin especificar</option>
                {ESTADOS_NEGOCIACION.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
              {errors.estado && <p className="text-xs text-red-500">{errors.estado}</p>}
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">
              Observaciones <span className="text-red-400">*</span>
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => { setObservaciones(e.target.value); setErrors((p) => ({ ...p, observaciones: '' })) }}
              rows={4}
              placeholder="Describe el inmueble, oportunidad, estado de la propiedad..."
              className={`${INPUT_CLS} resize-none ${errors.observaciones ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {errors.observaciones && <p className="text-xs text-red-500">{errors.observaciones}</p>}
          </div>

          {/* Fotos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">
                Fotos del inmueble <span className="text-red-400">*</span>{' '}
                <span className="text-gray-400">({fotosCount} cargada{fotosCount !== 1 ? 's' : ''})</span>
              </label>
              <label className="cursor-pointer flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-800 transition">
                <Upload className="w-3.5 h-3.5" />
                Añadir fotos
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleAddFotos}
                  className="sr-only"
                />
              </label>
            </div>

            {fotosCount === 0 ? (
              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-brand-300 transition text-gray-400">
                <ImageIcon className="w-8 h-8" />
                <span className="text-sm">Arrastra o haz clic para añadir fotos</span>
                <span className="text-xs">JPEG, PNG, WebP · máx 10 MB por foto</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleAddFotos}
                  className="sr-only"
                />
              </label>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {fotos
                  .filter((f) => f.tipo !== 'guardada' || !fotosAEliminar.includes((f as FotoGuardada).id))
                  .map((foto, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                      <img
                        src={foto.tipo === 'nueva' ? foto.previewUrl : (foto as FotoGuardada).url_publica}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFoto(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1 rounded">
                        {idx + 1}
                      </span>
                    </div>
                  ))}

                {/* Botón añadir más */}
                <label className="cursor-pointer flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-xl aspect-square hover:border-brand-300 transition text-gray-400">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Añadir</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleAddFotos}
                    className="sr-only"
                  />
                </label>
              </div>
            )}

            {errors.fotos && (
              <p className="text-xs text-red-500">{errors.fotos}</p>
            )}
            {}
          </div>

          {/* Video */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-gray-400" />
              <label className="text-xs font-medium text-gray-600">
                Vídeo del inmueble <span className="text-gray-400">(opcional)</span>
              </label>
            </div>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
              className={INPUT_CLS}
            />
          </div>
        </div>
      </div>

      {/* ── Calculadora (reutiliza versión pública) ── */}
      <CalculadoraClient
        key={simulacion?.id ?? 'nueva'}
        ivaObraNueva={ivaObraNueva}
        comunidades={comunidades}
        tramosIrpf={tramosIrpf}
        isAuthenticated={true}
        initialData={
          simulacion
            ? {
                datosAdquisicion: simulacion.datos_adquisicion,
                datosRentabilidad: simulacion.datos_rentabilidad ?? undefined,
                verRentabilidad: !!simulacion.datos_rentabilidad,
              }
            : undefined
        }
        onDataChange={(data) => { calcDataRef.current = data }}
      />

      {/* ── Botones finales ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {simulacion && (
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportando}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
          >
            <FileDown className="w-4 h-4" />
            {exportando ? 'Generando PDF…' : 'Exportar informe PDF'}
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#09b850' }}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando…' : simulacion ? 'Guardar cambios' : 'Guardar simulación'}
        </button>
      </div>
    </div>
    </div>
    </>
  )
}
