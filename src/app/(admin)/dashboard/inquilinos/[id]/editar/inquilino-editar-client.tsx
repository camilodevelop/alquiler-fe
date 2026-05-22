"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import type { Propiedad } from "@/modules/propiedades/types";
import { InquilinoWizard } from "@/modules/inquilinos/components/form/inquilino-wizard";
import { inquilinosService } from "@/modules/inquilinos/services/inquilinos.service";
import { inquilinoToFormValues } from "@/modules/inquilinos/utils/defaults";
import type { Inquilino } from "@/modules/inquilinos/types";

export function InquilinosEditarClient({
  id,
  propiedades,
}: {
  id: string;
  propiedades: Propiedad[];
}) {
  const [inquilino, setInquilino] = useState<Inquilino | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void inquilinosService.getTenantById(id).then(({ data }) => {
      setInquilino(data ?? null);
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
      <div className="text-center py-16">
        <p className="text-gray-600 mb-4">Inquilino no encontrado</p>
        <Link href="/dashboard/inquilinos">
          <Button variant="secondary">Volver</Button>
        </Link>
      </div>
    );
  }

  return (
    <InquilinoWizard
      mode="edit"
      inquilinoId={id}
      initialValues={inquilinoToFormValues(inquilino)}
      initialDocumentos={inquilino.documentos}
      propiedades={propiedades}
    />
  );
}
