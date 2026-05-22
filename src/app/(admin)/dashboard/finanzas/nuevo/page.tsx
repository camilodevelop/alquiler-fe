import { listManitasAction } from "@/app/actions/mantenimiento";
import { listPropiedadesAction } from "@/app/actions/propiedades";
import { MovimientoForm } from "@/modules/finanzas/components/movimiento-form";
import { MovimientoFormShell } from "@/modules/finanzas/components/movimiento-form-shell";
import type { MovimientoTipo } from "@/modules/finanzas/types";

export default async function NuevoMovimientoPage({
  searchParams,
}: {
  searchParams: Promise<{
    tipo?: string;
    propiedad_id?: string;
    ticket_id?: string;
    contrato_id?: string;
    mes?: string;
  }>;
}) {
  const { tipo: tipoParam, propiedad_id, ticket_id, contrato_id, mes } = await searchParams;
  const tipo: MovimientoTipo = tipoParam === "gasto" ? "gasto" : "ingreso";

  const [{ data: propiedades }, { data: manitasList }] = await Promise.all([
    listPropiedadesAction(),
    listManitasAction(),
  ]);

  return (
    <MovimientoFormShell tipo={tipo} mode="create">
      <MovimientoForm
        mode="create"
        tipo={tipo}
        propiedades={propiedades}
        manitasList={manitasList}
        defaultPropiedadId={propiedad_id}
        defaultTicketId={ticket_id}
        defaultContratoId={contrato_id}
        defaultMes={mes}
      />
    </MovimientoFormShell>
  );
}
