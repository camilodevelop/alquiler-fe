import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getPropiedadAction } from "@/app/actions/propiedades";
import { PropiedadDetail } from "@/modules/propiedades/components/detail/propiedad-detail";

interface PropiedadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropiedadDetailPage({ params }: PropiedadDetailPageProps) {
  const { id } = await params;
  const { data: propiedad, error } = await getPropiedadAction(id);

  if (error || !propiedad) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/propiedades"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ChevronLeft size={16} />
        Volver al listado
      </Link>

      <PropiedadDetail propiedad={propiedad} />
    </div>
  );
}
