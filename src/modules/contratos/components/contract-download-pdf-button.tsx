"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import type { Contract } from "../types";
import { downloadContractPdf } from "../utils/contract-pdf";

interface ContractDownloadPdfButtonProps {
  contract: Contract;
  size?: "sm" | "md";
  variant?: "primary" | "secondary";
  className?: string;
}

export function ContractDownloadPdfButton({
  contract,
  size = "sm",
  variant = "secondary",
  className = "",
}: ContractDownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setError(null);
    setLoading(true);
    try {
      await downloadContractPdf(contract);
    } catch {
      setError("No se pudo generar el PDF. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={loading || !contract.contenido_generado?.trim()}
        onClick={() => void handleDownload()}
        className="gap-1.5"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {loading ? "Generando…" : "Descargar PDF"}
      </Button>
      {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
    </div>
  );
}
