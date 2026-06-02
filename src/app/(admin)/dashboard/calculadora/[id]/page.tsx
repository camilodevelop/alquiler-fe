import { notFound } from 'next/navigation'
import { getSimulacionAction, getParametrosFiscalesAction } from '@/app/actions/calculadora'
import { CalculadoraPrivada } from '@/modules/calculadora/components/calculadora-privada'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarSimulacionPage({ params }: Props) {
  const { id } = await params
  const [{ data: simulacion, error }, fiscales] = await Promise.all([
    getSimulacionAction(id),
    getParametrosFiscalesAction(),
  ])

  if (error || !simulacion) notFound()

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 truncate">{simulacion.nombre}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Edita la simulación y guarda los cambios.
        </p>
      </div>
      <CalculadoraPrivada
        ivaObraNueva={fiscales.ivaObraNueva}
        comunidades={fiscales.comunidades}
        tramosIrpf={fiscales.tramosIrpf}
        simulacion={simulacion}
      />
    </div>
  )
}
