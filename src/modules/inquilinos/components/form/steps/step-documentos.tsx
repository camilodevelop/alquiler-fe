"use client";

import { useState } from "react";
import { FileUp, FileText } from "lucide-react";
import { TIPOS_DOCUMENTO_INQUILINO, ESTADOS_DOCUMENTO } from "../../../constants";
import type { InquilinoDocumento, TipoDocumentoInquilino } from "../../../types";
import { getDocInquilinoLabel, getEstadoDocumentoLabel } from "../../../utils/labels";

export function StepDocumentos({
  documentos,
  onAdd,
}: {
  documentos: InquilinoDocumento[];
  onAdd: (tipo: TipoDocumentoInquilino, file: File) => void;
}) {
  const [tipo, setTipo] = useState<TipoDocumentoInquilino>("identidad");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAdd(tipo, file);
    e.target.value = "";
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6">
        <label className="flex flex-col items-center gap-3 cursor-pointer">
          <FileUp className="text-brand-600" size={32} />
          <span className="text-sm font-medium text-gray-800">Añadir documento (mock)</span>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoDocumentoInquilino)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            {TIPOS_DOCUMENTO_INQUILINO.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input type="file" className="hidden" onChange={handleFile} accept=".pdf,.jpg,.jpeg,.png" />
        </label>
        <p className="text-xs text-center text-gray-500 mt-3">
          Los archivos se guardan localmente hasta conectar Storage.
        </p>
      </div>

      {documentos.length > 0 ? (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
          {documentos.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3 bg-white">
              <FileText size={18} className="text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{d.nombre_archivo}</p>
                <p className="text-xs text-gray-500">
                  {getDocInquilinoLabel(d.tipo)} · {d.fecha_carga} · {getEstadoDocumentoLabel(d.estado)}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                d.estado === "aprobado" ? "bg-green-100 text-green-700" :
                d.estado === "rechazado" ? "bg-red-100 text-red-700" :
                d.estado === "en_revision" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
              }`}>
                {getEstadoDocumentoLabel(d.estado)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">Aún no hay documentos. Puedes añadirlos después.</p>
      )}
    </div>
  );
}
