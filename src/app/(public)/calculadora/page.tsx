import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CalculadoraClient } from '@/modules/calculadora/components/calculadora-client'
import { StickyHeader } from '@/components/ui/sticky-header'
import type { ItpComunidad, TramoIRPF } from '@/modules/calculadora/types'

export const metadata: Metadata = {
  title: 'Calculadora de Rentabilidad Inmobiliaria | Rentyva',
  description:
    'Calcula la rentabilidad bruta, neta y after-tax de cualquier inmueble. Analiza cashflow, TIR, payback y escenarios pesimista/optimista en segundos.',
}

export default async function CalculadoraPage() {
  const supabase = await createClient()

  const [{ data: rawParams }, { data: rawComunidades }, { data: rawTramos }] = await Promise.all([
    supabase.from('parametros_generales').select('*'),
    supabase.from('itp_comunidades_autonomas').select('*').order('nombre'),
    supabase.from('irpf_tramos').select('*').order('tramo'),
  ])

  const params = rawParams as { clave: string; valor: string }[] | null
  const ivaObraNueva = parseFloat(
    params?.find((p) => p.clave === 'iva_obra_nueva')?.valor ?? '21',
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <StickyHeader />
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Calculadora de Rentabilidad Inmobiliaria
          </h1>
          <p className="mt-2 text-gray-500 text-base">
            Introduce los datos del inmueble y obtén el análisis completo de rentabilidad en
            tiempo real.
          </p>
        </div>

        <CalculadoraClient
          ivaObraNueva={ivaObraNueva}
          comunidades={(rawComunidades as unknown as ItpComunidad[]) ?? []}
          tramosIrpf={(rawTramos as unknown as TramoIRPF[]) ?? []}
          isAuthenticated={false}
        />
      </div>
    </main>
  )
}
