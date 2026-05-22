"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  CreditCard,
  FileText,
  History,
  Pencil,
  Shield,
  Star,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { Inquilino } from "../../types";
import { nombreCompleto, formatFecha, formatPrecio, getTipoDocumentoLabel, getEstadoDocumentoLabel, getDocInquilinoLabel } from "../../utils/labels";
import { InquilinoEstadoBadge } from "../inquilino-estado-badge";
import { InquilinoPagoBadge } from "../inquilino-pago-badge";
import { InquilinoScoringBadge } from "../inquilino-scoring-badge";
import { inquilinosService } from "../../services/inquilinos.service";

const TABS = [
  { id: "resumen", label: "Resumen", icon: Building2 },
  { id: "contrato", label: "Contrato", icon: FileText },
  { id: "pagos", label: "Pagos", icon: CreditCard },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "incidencias", label: "Incidencias", icon: Wrench },
  { id: "scoring", label: "Scoring", icon: Star },
  { id: "historial", label: "Historial", icon: History },
] as const;

type TabId = (typeof TABS)[number]["id"];

const MOCK_INCIDENCIAS = [
  { id: "1", titulo: "Fuga en grifo cocina", estado: "En curso", urgencia: "Media", fecha: "2026-04-10" },
  { id: "2", titulo: "Luz habitación", estado: "Resuelta", urgencia: "Baja", fecha: "2026-03-22" },
];

export function InquilinoDetail({ inquilino: initial }: { inquilino: Inquilino }) {
  const [inquilino, setInquilino] = useState(initial);
  const [tab, setTab] = useState<TabId>("resumen");

  const nombre = nombreCompleto(inquilino.nombres, inquilino.apellidos);

  const handleDocStatus = async (docId: string, estado: "aprobado" | "rechazado") => {
    await inquilinosService.updateDocumentStatus(inquilino.id, docId, estado);
    const { data } = await inquilinosService.getTenantById(inquilino.id);
    if (data) setInquilino(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex gap-4">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold ${
            inquilino.status === "moroso" ? "bg-red-100 text-red-700" : "bg-brand-50 text-brand-700"
          }`}>
            {inquilino.nombres.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{nombre}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {getTipoDocumentoLabel(inquilino.tipo_documento)} {inquilino.numero_documento}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <InquilinoEstadoBadge status={inquilino.status} />
              <InquilinoPagoBadge estado={inquilino.pago_resumen.estado} />
              <InquilinoScoringBadge nivel={inquilino.scoring?.nivel ?? "sin_evaluar"} />
            </div>
          </div>
        </div>
        <Link href={`/dashboard/inquilinos/${inquilino.id}/editar`}>
          <Button variant="secondary" size="md" className="gap-2">
            <Pencil size={16} /> Editar
          </Button>
        </Link>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 pb-px">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === id ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 sm:p-6">
        {tab === "resumen" && (
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <Section title="Datos personales">
              <Row label="Email" value={inquilino.email} />
              <Row label="Teléfono" value={inquilino.telefono} />
              <Row label="Ciudad" value={inquilino.ciudad ?? "—"} />
              <Row label="Ingresos" value={inquilino.ingresos_mensuales ? formatPrecio(inquilino.ingresos_mensuales) : "—"} />
            </Section>
            <Section title="Propiedad">
              <Row label="Inmueble" value={inquilino.asignacion?.propiedad_nombre ?? "Sin asignar"} />
              <Row label="Unidad" value={inquilino.asignacion?.unidad_nombre ?? "—"} />
              <Row label="Ingreso" value={formatFecha(inquilino.asignacion?.fecha_ingreso)} />
              <Row label="Canon" value={inquilino.asignacion?.canon_mensual ? formatPrecio(inquilino.asignacion.canon_mensual) : "—"} />
              <Row label="Depósito" value={inquilino.asignacion?.deposito ? formatPrecio(inquilino.asignacion.deposito) : "—"} />
            </Section>
          </div>
        )}

        {tab === "contrato" && (
          <div className="space-y-4 text-sm">
            <p className="text-gray-500">Contrato activo (mock)</p>
            <div className="rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Contrato de arrendamiento</p>
                <p className="text-gray-500 mt-1 flex items-center gap-1">
                  <Calendar size={14} />
                  {formatFecha(inquilino.asignacion?.fecha_ingreso)} — {formatFecha(inquilino.asignacion?.fecha_salida) || "Indefinido"}
                </p>
                <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Activo</span>
              </div>
              <Button variant="secondary" size="sm">Ver contrato</Button>
            </div>
          </div>
        )}

        {tab === "pagos" && (
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <StatBox label="Total pagado" value={formatPrecio(inquilino.pago_resumen.total_pagado)} />
            <StatBox label="Pendiente" value={formatPrecio(inquilino.pago_resumen.total_pendiente)} />
            <StatBox label="Vencidos" value={String(inquilino.pago_resumen.pagos_vencidos)} highlight={inquilino.pago_resumen.pagos_vencidos > 0} />
          </div>
        )}

        {tab === "documentos" && (
          <ul className="divide-y divide-gray-100">
            {inquilino.documentos.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">Sin documentos</p>
            ) : (
              inquilino.documentos.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{d.nombre_archivo}</p>
                    <p className="text-xs text-gray-500">{getDocInquilinoLabel(d.tipo)} · {getEstadoDocumentoLabel(d.estado)}</p>
                  </div>
                  <div className="flex gap-2">
                    {d.estado !== "aprobado" && (
                      <Button variant="secondary" size="sm" onClick={() => void handleDocStatus(d.id, "aprobado")}>Aprobar</Button>
                    )}
                    {d.estado !== "rechazado" && (
                      <Button variant="ghost" size="sm" onClick={() => void handleDocStatus(d.id, "rechazado")}>Rechazar</Button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        )}

        {tab === "incidencias" && (
          <ul className="space-y-3">
            {MOCK_INCIDENCIAS.map((inc) => (
              <li key={inc.id} className="rounded-lg border border-gray-200 px-4 py-3 flex justify-between">
                <div>
                  <p className="font-medium text-gray-900">{inc.titulo}</p>
                  <p className="text-xs text-gray-500">{inc.fecha}</p>
                </div>
                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded">{inc.urgencia}</span>
              </li>
            ))}
          </ul>
        )}

        {tab === "scoring" && inquilino.scoring && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="text-brand-600" size={24} />
              <InquilinoScoringBadge nivel={inquilino.scoring.nivel} />
            </div>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm">
              {[
                ["Documentación", inquilino.scoring.documentacion_completa],
                ["Ingresos", inquilino.scoring.ingresos_suficientes],
                ["Historial pagos", inquilino.scoring.historial_pagos],
                ["Referencias", inquilino.scoring.referencias_positivas],
                ["Estabilidad laboral", inquilino.scoring.estabilidad_laboral],
              ].map(([label, ok]) => (
                <li key={String(label)} className={`px-3 py-2 rounded-lg ${ok ? "bg-green-50 text-green-800" : "bg-gray-50 text-gray-600"}`}>
                  {label}: {ok ? "Sí" : "No"}
                </li>
              ))}
            </ul>
            {inquilino.scoring.observaciones_gestor ? (
              <p className="text-sm text-gray-600 border-t pt-4">{inquilino.scoring.observaciones_gestor}</p>
            ) : null}
          </div>
        )}

        {tab === "historial" && (
          <ul className="space-y-3">
            {inquilino.historial.map((h) => (
              <li key={h.id} className="flex gap-3 text-sm">
                <span className="text-gray-400 whitespace-nowrap">{formatFecha(h.fecha)}</span>
                <span className="text-gray-800">{h.descripcion}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase text-gray-500 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-red-200 bg-red-50" : "border-gray-200"}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
