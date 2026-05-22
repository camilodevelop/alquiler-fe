"use client";

import type { Contract } from "../types";
import { ensureContractContent } from "../utils/template-engine";
import { ContractDownloadPdfButton } from "./contract-download-pdf-button";

interface ContractPreviewProps {
  html: string;
  className?: string;
  contract?: Contract;
}

/** Vista previa del HTML generado del contrato */
export function ContractPreview({ html, className = "", contract }: ContractPreviewProps) {
  const displayHtml = contract
    ? ensureContractContent({ ...contract, contenido_generado: html || contract.contenido_generado })
        .contenido_generado
    : html;

  const isEmpty = !displayHtml?.trim();

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white overflow-hidden ${className}`}
    >
      <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/80 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Vista previa del contrato
        </p>
        {contract ? (
          <ContractDownloadPdfButton
            contract={ensureContractContent({ ...contract, contenido_generado: displayHtml })}
          />
        ) : null}
      </div>

      {isEmpty ? (
        <div className="p-8 text-center text-sm text-gray-500">
          <p className="font-medium text-gray-700">El contrato no tiene contenido generado</p>
          <p className="mt-2 text-xs">
            Edita el contrato y guarda de nuevo, o revisa que el tipo de contrato tenga una plantilla HTML.
          </p>
        </div>
      ) : (
        <div
          className="contract-preview min-h-[200px] p-6 sm:p-8 text-gray-800 text-sm leading-relaxed [&_article]:max-w-none [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_li]:mb-1"
          dangerouslySetInnerHTML={{ __html: displayHtml }}
        />
      )}
    </div>
  );
}
