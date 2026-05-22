import { Suspense } from "react";
import { listInquilinosAction } from "@/app/actions/inquilinos";
import { listMovimientosAction } from "@/app/actions/finanzas";
import { listPropiedadesAction } from "@/app/actions/propiedades";
import { ContabilidadPageClient } from "./contabilidad-page-client";

async function ContabilidadContent({
  propiedadId,
}: {
  propiedadId?: string;
}) {
  const [{ data: movimientos, totales, error }, { data: propiedades }, { data: inquilinos }] =
    await Promise.all([
      listMovimientosAction({ propiedad_id: propiedadId }),
      listPropiedadesAction(),
      listInquilinosAction(),
    ]);

  return (
    <ContabilidadPageClient
      initialData={movimientos}
      initialTotales={totales}
      propiedades={propiedades}
      inquilinos={inquilinos}
      initialPropiedadId={propiedadId}
      dbError={error}
    />
  );
}

export default async function FinanzasPage({
  searchParams,
}: {
  searchParams: Promise<{ propiedad_id?: string }>;
}) {
  const { propiedad_id: propiedadId } = await searchParams;

  return (
    <Suspense fallback={<p className="text-sm text-gray-500 p-6">Cargando contabilidad…</p>}>
      <ContabilidadContent propiedadId={propiedadId} />
    </Suspense>
  );
}
