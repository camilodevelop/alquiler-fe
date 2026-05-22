import { notFound } from "next/navigation";
import { getManitasAction } from "@/app/actions/mantenimiento";
import { ManitasProfile } from "@/modules/mantenimiento/components/manitas/manitas-profile";

export default async function ManitasDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: manitas, error } = await getManitasAction(id);

  if (!manitas) notFound();

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      <ManitasProfile initial={manitas} />
    </div>
  );
}
