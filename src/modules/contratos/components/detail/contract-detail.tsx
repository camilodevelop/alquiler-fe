"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  User,
  Send,
  Ban,
  CheckCircle,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { Contract } from "../../types";
import { ensureContractContent } from "../../utils/template-engine";
import { contractService } from "../../services/contracts.service";
import { ContractStatusBadge } from "../contract-status-badge";
import { ContractPreview } from "../contract-preview";
import { ContractSignaturePanel } from "../contract-signature-panel";
import { formatFecha, formatPrecio } from "../../utils/labels";
import { HISTORIAL_LABELS } from "../../constants";
import type { SignatureRole } from "../../types";

interface ContractDetailProps {
  initialContract: Contract;
}

export function ContractDetail({ initialContract }: ContractDetailProps) {
  const [contract, setContract] = useState(() => ensureContractContent(initialContract));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const { data: c } = await contractService.getContractById(contract.id);
    if (c) setContract(ensureContractContent(c));
  };

  const handleSendToSignature = async () => {
    const res = await contractService.sendToSignature(contract.id);
    if (res.error) setError(res.error);
    else {
      setError(null);
      setMessage("Contrato enviado a firma.");
      await refresh();
    }
  };

  const handleSign = async (rol: SignatureRole, nombre: string) => {
    const res = await contractService.signContract(contract.id, rol, nombre);
    if (res.error) return { error: res.error };

    if (res.activated && res.data) {
      setMessage(
        res.error
          ? `Contrato activado con avisos: ${res.error}`
          : "Contrato firmado y activado. Propiedad e inquilino actualizados.",
      );
    } else {
      setMessage(res.error ? res.error : "Firma registrada correctamente.");
    }
    await refresh();
    return {};
  };

  const handleFinalize = async () => {
    const res = await contractService.finalizeContract(contract.id);
    if (res.error) setError(res.error);
    else {
      setMessage("Contrato finalizado.");
      await refresh();
    }
  };

  const handleCancel = async () => {
    const res = await contractService.cancelContract(contract.id);
    if (res.error) setError(res.error);
    else {
      setMessage("Contrato cancelado.");
      await refresh();
    }
  };

  const canEdit = contract.estado === "borrador" || contract.estado === "pendiente_firma";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/contratos"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700 mb-2"
          >
            <ArrowLeft size={14} />
            Volver al listado
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{contract.codigo}</h1>
          <p className="text-sm text-gray-600 mt-1">{contract.tipo_contrato_nombre}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ContractStatusBadge status={contract.estado} />
          {canEdit && (
            <Link href={`/dashboard/contratos/${contract.id}/editar`}>
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Pencil size={14} />
                Editar
              </Button>
            </Link>
          )}
          {contract.estado === "borrador" && (
            <Button variant="primary" size="sm" className="gap-1.5" onClick={handleSendToSignature}>
              <Send size={14} />
              Enviar a firma
            </Button>
          )}
          {contract.estado === "activo" && (
            <Button variant="secondary" size="sm" className="gap-1.5" onClick={handleFinalize}>
              <CheckCircle size={14} />
              Finalizar
            </Button>
          )}
          {contract.estado !== "activo" && contract.estado !== "cancelado" && contract.estado !== "finalizado" && (
            <Button variant="secondary" size="sm" className="gap-1.5 text-red-700" onClick={handleCancel}>
              <Ban size={14} />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {message && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <InfoCard title="Propiedad" icon={Building2}>
            <p className="font-medium text-gray-900">{contract.propiedad_nombre}</p>
            <p className="text-sm text-gray-600">{contract.propiedad_direccion}</p>
            {contract.unidad && (
              <p className="text-sm text-gray-500 mt-1">Unidad: {contract.unidad}</p>
            )}
          </InfoCard>
          <InfoCard title="Inquilino" icon={User}>
            <p className="font-medium text-gray-900">{contract.inquilino_nombre}</p>
            <p className="text-sm text-gray-600">{contract.inquilino_documento}</p>
          </InfoCard>
          <InfoCard title="Valores económicos">
            <dl className="text-sm space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-500">Renta mensual</dt>
                <dd className="font-semibold">{formatPrecio(contract.valor_mensual)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Fianza</dt>
                <dd className="font-semibold">{formatPrecio(contract.deposito)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Día de pago</dt>
                <dd>{contract.dia_pago}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Vigencia</dt>
                <dd>
                  {formatFecha(contract.fecha_inicio)} — {formatFecha(contract.fecha_fin)}
                </dd>
              </div>
            </dl>
          </InfoCard>
          {contract.observaciones && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Observaciones</p>
              <p className="text-sm text-gray-700">{contract.observaciones}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {(contract.estado === "pendiente_firma" || contract.estado === "firmado") && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Firmas</h2>
              <ContractSignaturePanel contract={contract} onSign={handleSign} />
            </section>
          )}

          <section>
            <ContractPreview html={contract.contenido_generado} contract={contract} />
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial</h2>
            <ul className="space-y-3">
              {contract.historial.map((h) => (
                <li key={h.id} className="flex gap-3 text-sm border-l-2 border-brand-200 pl-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {HISTORIAL_LABELS[h.tipo] ?? h.tipo}
                    </p>
                    <p className="text-gray-600">{h.descripcion}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(h.fecha).toLocaleString("es-ES")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: typeof Building2;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={16} className="text-brand-600" />}
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
      </div>
      {children}
    </div>
  );
}
