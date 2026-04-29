"use client";

import {
  Building2,
  User,
  Calendar,
  Euro,
  FileDown,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui";

// Mock del contrato del inquilino autenticado
const CONTRATO = {
  id: "CT-2024-001",
  estado: "activo" as const,
  propiedad: {
    direccion: "Calle Mayor 12, 3ºA",
    ciudad: "Madrid",
    codigo_postal: "28001",
    habitaciones: 3,
    banos: 2,
    metros: 85,
  },
  propietario: {
    nombre: "Roberto Fernández",
    email: "roberto.fernandez@rentyva.com",
    telefono: "+34 600 111 222",
  },
  fecha_inicio: "01/06/2024",
  fecha_fin: "31/05/2026",
  renta_mensual: "€950",
  fianza: "€1.900",
  tipo: "Arrendamiento de vivienda habitual (LAU)",
  actualizacion: "IPC anual",
};

const DOCUMENTOS = [
  { nombre: "Contrato de arrendamiento firmado", fecha: "01/06/2024", tipo: "PDF" },
  { nombre: "Inventario de la vivienda", fecha: "01/06/2024", tipo: "PDF" },
  { nombre: "Certificado de eficiencia energética", fecha: "15/05/2024", tipo: "PDF" },
  { nombre: "Recibo de fianza depositada", fecha: "01/06/2024", tipo: "PDF" },
];

export default function MiContratoPage() {
  const diasRestantes = Math.ceil(
    (new Date("2026-05-31").getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Contrato</h1>
          <p className="text-sm text-gray-500 mt-1">
            Detalles de tu contrato de arrendamiento
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">Activo</Badge>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {diasRestantes} días restantes
          </span>
        </div>
      </div>

      {/* Card principal del contrato */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Banner estado */}
        <div className="bg-green-50 border-b border-green-100 px-6 py-4 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              Contrato activo — {CONTRATO.tipo}
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Referencia: {CONTRATO.id}
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Propiedad */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Building2 size={16} className="text-brand-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Propiedad</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">
                  {CONTRATO.propiedad.direccion}
                </p>
                <p className="text-gray-600">
                  {CONTRATO.propiedad.ciudad}, {CONTRATO.propiedad.codigo_postal}
                </p>
                <div className="flex gap-4 mt-3 text-gray-600">
                  <span>{CONTRATO.propiedad.habitaciones} habitaciones</span>
                  <span>{CONTRATO.propiedad.banos} baños</span>
                  <span>{CONTRATO.propiedad.metros} m²</span>
                </div>
              </div>
            </div>

            {/* Propietario */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <User size={16} className="text-blue-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Propietario</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">
                  {CONTRATO.propietario.nombre}
                </p>
                <p className="text-gray-600">{CONTRATO.propietario.email}</p>
                <p className="text-gray-600">{CONTRATO.propietario.telefono}</p>
              </div>
            </div>

            {/* Fechas */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Calendar size={16} className="text-violet-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Vigencia del contrato
                </h2>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Inicio</span>
                  <span className="font-medium text-gray-900">
                    {CONTRATO.fecha_inicio}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fin</span>
                  <span className="font-medium text-gray-900">
                    {CONTRATO.fecha_fin}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Actualización</span>
                  <span className="font-medium text-gray-900">
                    {CONTRATO.actualizacion}
                  </span>
                </div>
              </div>
            </div>

            {/* Condiciones económicas */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <Euro size={16} className="text-yellow-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Condiciones económicas
                </h2>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Renta mensual</span>
                  <span className="font-bold text-gray-900">
                    {CONTRATO.renta_mensual}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fianza</span>
                  <span className="font-medium text-gray-900">
                    {CONTRATO.fianza}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Próximo pago</span>
                  <span className="font-medium text-gray-900">01/05/2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Documentos</h2>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {DOCUMENTOS.map((doc, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={15} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.nombre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{doc.fecha}</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors border border-brand-200">
                <FileDown size={13} />
                Descargar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
