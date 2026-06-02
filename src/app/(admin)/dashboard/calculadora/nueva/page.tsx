import { getParametrosFiscalesAction } from '@/app/actions/calculadora'
import { CalculadoraPrivada } from '@/modules/calculadora/components/calculadora-privada'

export default async function NuevaSimulacionPage() {
  const { ivaObraNueva, comunidades, tramosIrpf } = await getParametrosFiscalesAction()

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Nueva simulación</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Calcula la rentabilidad y guarda la simulación con nombre personalizado.
        </p>
      </div>
      <CalculadoraPrivada
        ivaObraNueva={ivaObraNueva}
        comunidades={comunidades}
        tramosIrpf={tramosIrpf}
      />
    </div>
  )
}
