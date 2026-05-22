import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { InquilinosDetailClient } from "./inquilino-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InquilinoDetallePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/inquilinos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700"
      >
        <ChevronLeft size={16} />
        Volver al listado
      </Link>
      <InquilinosDetailClient id={id} />
    </div>
  );
}
