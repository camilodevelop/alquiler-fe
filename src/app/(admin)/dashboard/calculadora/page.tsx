import { getSimulacionesAction } from '@/app/actions/calculadora'
import { SimulacionesListClient } from '@/modules/calculadora/components/simulaciones-list-client'
import type { Simulacion } from '@/modules/calculadora/types'

export default async function CalculadoraDashboardPage() {
  const { data: simulaciones } = await getSimulacionesAction()

  return (
    <SimulacionesListClient
      simulaciones={(simulaciones as Simulacion[]) ?? []}
    />
  )
}
