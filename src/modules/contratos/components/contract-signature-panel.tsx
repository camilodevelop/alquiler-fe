"use client";

import { useState } from "react";
import { PenLine, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui";
import type { Contract, SignatureRole } from "../types";
import { formatFecha } from "../utils/labels";

interface ContractSignaturePanelProps {
  contract: Contract;
  onSign: (rol: SignatureRole, nombre: string) => Promise<{ error?: string }>;
  disabled?: boolean;
}

const ROLE_LABELS: Record<SignatureRole, string> = {
  administrador: "Administrador / Propietario",
  inquilino: "Inquilino",
};

export function ContractSignaturePanel({
  contract,
  onSign,
  disabled,
}: ContractSignaturePanelProps) {
  const canSign =
    !disabled &&
    (contract.estado === "pendiente_firma" || contract.estado === "firmado");

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Firma simulada (MVP). El contrato se activará automáticamente cuando ambas partes firmen.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {contract.firmas.map((firma) => (
          <SignatureCard
            key={firma.rol}
            rol={firma.rol}
            label={ROLE_LABELS[firma.rol]}
            firmante={firma.firmante_nombre}
            fecha={firma.fecha_firma}
            firmado={firma.estado === "firmado"}
            canSign={canSign && firma.estado === "pendiente"}
            onSign={(nombre) => onSign(firma.rol, nombre)}
          />
        ))}
      </div>
    </div>
  );
}

function SignatureCard({
  rol,
  label,
  firmante,
  fecha,
  firmado,
  canSign,
  onSign,
}: {
  rol: SignatureRole;
  label: string;
  firmante: string;
  fecha: string | null;
  firmado: boolean;
  canSign: boolean;
  onSign: (nombre: string) => Promise<{ error?: string }>;
}) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    setError(null);
    setLoading(true);
    const res = await onSign(nombre);
    setLoading(false);
    if (res.error) setError(res.error);
    else setNombre("");
  };

  return (
    <div
      className={`rounded-xl border p-4 ${
        firmado ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200 bg-gray-50/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5 capitalize">{rol}</p>
        </div>
        {firmado ? (
          <CheckCircle2 className="text-emerald-600 shrink-0" size={22} />
        ) : (
          <PenLine className="text-gray-400 shrink-0" size={20} />
        )}
      </div>

      {firmado ? (
        <div className="text-sm space-y-1">
          <p>
            <span className="text-gray-500">Firmante:</span>{" "}
            <span className="font-medium text-gray-900">{firmante}</span>
          </p>
          <p>
            <span className="text-gray-500">Fecha:</span> {formatFecha(fecha ?? "")}
          </p>
        </div>
      ) : canSign ? (
        <div className="space-y-2">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del firmante"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={loading}
            disabled={!nombre.trim()}
            onClick={() => void handleSign()}
            className="w-full gap-1.5"
          >
            <PenLine size={14} />
            Firmar
          </Button>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Pendiente de firma</p>
      )}
    </div>
  );
}
