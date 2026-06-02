'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus, Calculator, Trash2, ExternalLink, GitCompare,
  CheckCircle2, MinusCircle, XCircle, ChevronRight,
} from 'lucide-react'
import { deleteSimulacionAction } from '@/app/actions/calculadora'
import { formatEuros, formatPorcentaje } from '@/modules/calculadora'
import type { Simulacion, SaludInversion } from '@/modules/calculadora/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const saludConfig: Record<SaludInversion, { icon: React.ElementType; color: string; label: string }> = {
  poco_rentable:         { icon: XCircle,      color: 'text-red-500',   label: '🔴 Poco rentable' },
  rentabilidad_ajustada: { icon: MinusCircle,  color: 'text-amber-500', label: '🟡 Ajustada' },
  buena_inversion:       { icon: CheckCircle2, color: 'text-green-500', label: '🟢 Buena' },
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Tarjeta de simulación ────────────────────────────────────────────────────

function SimulacionCard({
  sim,
  selected,
  onToggleSelect,
  onDelete,
}: {
  sim: Simulacion
  selected: boolean
  onToggleSelect: () => void
  onDelete: () => void
}) {
  const [deleting, startDelete] = useTransition()
  const res = sim.resultados

  const salud = res?.rentabilidad?.saludInversion
  const saludInfo = salud ? saludConfig[salud] : null

  const handleDelete = () => {
    if (!confirm(`¿Eliminar la simulación "${sim.nombre}"? Esta acción no se puede deshacer.`)) return
    startDelete(async () => {
      await deleteSimulacionAction(sim.id)
      onDelete()
    })
  }

  return (
    <div
      className={`bg-white rounded-xl border transition-all ${
        selected ? 'border-brand-400 ring-1 ring-brand-300' : 'border-gray-200 hover:border-gray-300'
      } ${deleting ? 'opacity-50' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Checkbox comparador */}
            <button
              type="button"
              onClick={onToggleSelect}
              title="Seleccionar para comparar"
              className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${
                selected
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'border-gray-300 hover:border-brand-400'
              }`}
            >
              {selected && <span className="text-xs font-bold">✓</span>}
            </button>

            <div className="min-w-0">
              <Link
                href={`/dashboard/calculadora/${sim.id}`}
                className="font-semibold text-gray-900 hover:text-brand-700 transition text-sm truncate block"
              >
                {sim.nombre}
              </Link>
              {sim.direccion && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{sim.direccion}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Actualizado {formatFecha(sim.updated_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Link
              href={`/dashboard/calculadora/${sim.id}`}
              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition"
              title="Abrir"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {res?.adquisicion && (
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400">Precio entrada</p>
              <p className="text-xs font-semibold text-gray-800 mt-0.5">
                {formatEuros(res.adquisicion.totalEntrada)}
              </p>
            </div>
          )}
          {res?.rentabilidad && (
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400">Rent. neta</p>
              <p className="text-xs font-semibold text-gray-800 mt-0.5">
                {formatPorcentaje(res.rentabilidad.rentabilidadNeta)}
              </p>
            </div>
          )}
          {saludInfo && (
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400">Salud</p>
              <p className={`text-xs font-semibold mt-0.5 ${saludInfo.color}`}>
                {saludInfo.label}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Link público */}
      {sim.token && (
        <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">Link de solo lectura</span>
          <a
            href={`/simulacion/publica/${sim.token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 transition"
          >
            Ver <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  )
}

// ─── Comparador ───────────────────────────────────────────────────────────────

function ComparadorView({ simulaciones }: { simulaciones: Simulacion[] }) {
  const saludEmoji: Record<SaludInversion, string> = {
    poco_rentable: '🔴',
    rentabilidad_ajustada: '🟡',
    buena_inversion: '🟢',
  }

  const metricas: { label: string; getValue: (s: Simulacion) => string; higherIsBetter: boolean }[] = [
    { label: 'Precio total entrada', getValue: (s) => formatEuros(s.resultados?.adquisicion?.totalEntrada ?? 0), higherIsBetter: false },
    { label: 'Rent. bruta', getValue: (s) => formatPorcentaje(s.resultados?.rentabilidad?.rentabilidadBruta ?? 0), higherIsBetter: true },
    { label: 'Rent. neta', getValue: (s) => formatPorcentaje(s.resultados?.rentabilidad?.rentabilidadNeta ?? 0), higherIsBetter: true },
    { label: 'Cashflow anual', getValue: (s) => formatEuros(s.resultados?.rentabilidad?.cashflowNetoAnual ?? 0), higherIsBetter: true },
    { label: 'Cash-on-Cash', getValue: (s) => s.resultados?.rentabilidad?.cashOnCash != null ? formatPorcentaje(s.resultados.rentabilidad.cashOnCash) : 'N/A', higherIsBetter: true },
    { label: 'Payback', getValue: (s) => s.resultados?.rentabilidad?.paybackPeriod != null ? `${s.resultados.rentabilidad.paybackPeriod.toFixed(1)} años` : 'N/A', higherIsBetter: false },
    { label: 'TIR', getValue: (s) => s.resultados?.rentabilidad?.tir != null ? formatPorcentaje(s.resultados.rentabilidad.tir) : 'N/A', higherIsBetter: true },
    { label: 'Salud', getValue: (s) => s.resultados?.rentabilidad?.saludInversion ? saludEmoji[s.resultados.rentabilidad.saludInversion] + ' ' + s.resultados.rentabilidad.saludInversion.replace('_', ' ') : 'N/A', higherIsBetter: true },
  ]

  function getBestIdx(metrica: typeof metricas[0], sims: Simulacion[]): number {
    const values = sims.map((s) => {
      const r = s.resultados?.rentabilidad
      if (!r) return metrica.higherIsBetter ? -Infinity : Infinity
      switch (metrica.label) {
        case 'Precio total entrada': return s.resultados?.adquisicion?.totalEntrada ?? 0
        case 'Rent. bruta': return r.rentabilidadBruta ?? 0
        case 'Rent. neta': return r.rentabilidadNeta ?? 0
        case 'Cashflow anual': return r.cashflowNetoAnual ?? 0
        case 'Cash-on-Cash': return r.cashOnCash ?? -Infinity
        case 'Payback': return r.paybackPeriod ?? Infinity
        case 'TIR': return r.tir ?? -Infinity
        default: return 0
      }
    })
    return metrica.higherIsBetter
      ? values.indexOf(Math.max(...values))
      : values.indexOf(Math.min(...values))
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Métrica</th>
            {simulaciones.map((s) => (
              <th key={s.id} className="px-4 py-3 text-center text-xs font-semibold text-gray-800">
                <p className="truncate max-w-[120px]">{s.nombre}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metricas.map((m) => {
            const bestIdx = getBestIdx(m, simulaciones)
            return (
              <tr key={m.label} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2.5 text-xs text-gray-500">{m.label}</td>
                {simulaciones.map((s, i) => (
                  <td
                    key={s.id}
                    className={`px-4 py-2.5 text-center text-xs font-medium ${
                      i === bestIdx ? 'text-green-700 bg-green-50 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {m.getValue(s)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function SimulacionesListClient({ simulaciones }: { simulaciones: Simulacion[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [verComparador, setVerComparador] = useState(false)
  const [lista, setLista] = useState(simulaciones)

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 3) {
        next.add(id)
      }
      return next
    })
  }

  const simulacionesSeleccionadas = lista.filter((s) => selected.has(s.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Calculadora de Rentabilidad</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lista.length > 0
              ? `${lista.length} simulación${lista.length !== 1 ? 'es' : ''} guardada${lista.length !== 1 ? 's' : ''}`
              : 'Aún no tienes simulaciones guardadas'}
          </p>
        </div>
        <div className="flex gap-2">
          {selected.size >= 2 && (
            <button
              type="button"
              onClick={() => setVerComparador((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-300 bg-brand-50 text-brand-700 text-sm font-medium hover:bg-brand-100 transition"
            >
              <GitCompare className="w-4 h-4" />
              Comparar ({selected.size})
            </button>
          )}
          <Link
            href="/dashboard/calculadora/nueva"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: '#09b850' }}
          >
            <Plus className="w-4 h-4" />
            Nueva simulación
          </Link>
        </div>
      </div>

      {/* Comparador */}
      {verComparador && simulacionesSeleccionadas.length >= 2 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Comparativa</h2>
          <ComparadorView simulaciones={simulacionesSeleccionadas} />
        </div>
      )}

      {/* Lista vacía */}
      {lista.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <Calculator className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">Crea tu primera simulación de rentabilidad</p>
          <Link
            href="/dashboard/calculadora/nueva"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: '#09b850' }}
          >
            <Plus className="w-4 h-4" />
            Nueva simulación
          </Link>
        </div>
      )}

      {/* Hint comparador */}
      {lista.length >= 2 && selected.size === 0 && (
        <p className="text-xs text-gray-400">
          Selecciona hasta 3 simulaciones para compararlas lado a lado.
        </p>
      )}

      {/* Grid de simulaciones */}
      {lista.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map((sim) => (
            <SimulacionCard
              key={sim.id}
              sim={sim}
              selected={selected.has(sim.id)}
              onToggleSelect={() => toggleSelect(sim.id)}
              onDelete={() => {
                setLista((prev) => prev.filter((s) => s.id !== sim.id))
                setSelected((prev) => { const n = new Set(prev); n.delete(sim.id); return n })
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
