import { notFound } from "next/navigation";
import { getMovimientoAction } from "@/app/actions/finanzas";
import { listManitasAction } from "@/app/actions/mantenimiento";
import { listPropiedadesAction } from "@/app/actions/propiedades";
import { MovimientoForm } from "@/modules/finanzas/components/movimiento-form";
import { MovimientoFormShell } from "@/modules/finanzas/components/movimiento-form-shell";

export default async function EditarMovimientoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: movimiento, error }, { data: propiedades }, { data: manitasList }] =
    await Promise.all([
      getMovimientoAction(id),
      listPropiedadesAction(),
      listManitasAction(),
    ]);

  if (!movimiento) notFound();

  return (
    <MovimientoFormShell tipo={movimiento.tipo} mode="edit">
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          {error}
        </p>
      )}
      <MovimientoForm
        mode="edit"
        tipo={movimiento.tipo}
        movimientoId={id}
        initial={movimiento}
        propiedades={propiedades}
        manitasList={manitasList}
      />
    </MovimientoFormShell>
  );
}
