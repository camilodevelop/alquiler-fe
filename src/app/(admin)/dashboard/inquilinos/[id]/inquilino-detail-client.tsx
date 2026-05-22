"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { InquilinoDetail } from "@/modules/inquilinos/components/detail/inquilino-detail";
import { inquilinosService } from "@/modules/inquilinos/services/inquilinos.service";
import type { Inquilino } from "@/modules/inquilinos/types";

export function InquilinosDetailClient({ id }: { id: string }) {
  const [inquilino, setInquilino] = useState<Inquilino | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void inquilinosService.getTenantById(id).then(({ data, error }) => {
      if (error || !data) {
        setInquilino(null);
      } else {
        setInquilino(data);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!inquilino) {
    return (
      <div className="text-center py-16 rounded-2xl border border-gray-200 bg-white">
        <p className="text-gray-600 mb-4">Inquilino no encontrado</p>
        <Link href="/dashboard/inquilinos">
          <Button variant="secondary">Volver al listado</Button>
        </Link>
      </div>
    );
  }

  return <InquilinoDetail inquilino={inquilino} />;
}
