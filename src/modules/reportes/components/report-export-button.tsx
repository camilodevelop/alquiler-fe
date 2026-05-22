"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui";

export function ReportExportButton() {
  return (
    <Button
      type="button"
      variant="secondary"
      size="md"
      className="gap-2"
      onClick={() => {
        window.alert(
          "La exportación a PDF y Excel estará disponible próximamente. Los datos mostrados reflejan los filtros actuales.",
        );
      }}
    >
      <Download size={16} />
      Exportar
    </Button>
  );
}
