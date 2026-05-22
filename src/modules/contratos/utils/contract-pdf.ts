import type { Contract } from "../types";
import { ensureContractContent } from "./template-engine";
import { formatFecha, formatPrecio } from "./labels";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildFirmasSection(contract: Contract): string {
  return contract.firmas
    .map((f) => {
      const rolLabel = f.rol === "administrador" ? "Administrador / Propietario" : "Inquilino";
      const detalle =
        f.estado === "firmado" && f.firmante_nombre
          ? `${escapeHtml(f.firmante_nombre)} — ${formatFecha(f.fecha_firma ?? "")}`
          : "Pendiente de firma";
      return `
        <div style="display:inline-block;width:48%;vertical-align:top;margin-bottom:16px;padding-right:12px;">
          <div style="font-size:9pt;font-weight:600;color:#444;text-transform:uppercase;">${rolLabel}</div>
          <div style="font-size:10pt;margin-top:6px;color:#222;">${detalle}</div>
        </div>
      `;
    })
    .join("");
}

/** HTML con estilos inline para que html2canvas renderice bien el PDF */
export function buildContractPdfHtml(contract: Contract): string {
  const c = ensureContractContent(contract);
  const unidad = c.unidad?.trim()
    ? `<tr><td style="padding:4px 12px 4px 0;color:#555;font-weight:600;">Unidad</td><td style="padding:4px 0;">${escapeHtml(c.unidad)}</td></tr>`
    : "";

  const bodyContent = c.contenido_generado?.trim()
    ? c.contenido_generado
    : `<p style="color:#666;font-style:italic;">Sin contenido del contrato. Edita el contrato o revisa la plantilla del tipo.</p>`;

  return `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:11pt;color:#1a1a1a;line-height:1.55;width:180mm;box-sizing:border-box;padding:8mm;background:#fff;">
      <table style="width:100%;border-collapse:collapse;font-size:9pt;color:#444;border-bottom:1px solid #ddd;margin-bottom:20px;padding-bottom:12px;">
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Referencia</td><td style="padding:4px 0;">${escapeHtml(c.codigo)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Tipo</td><td style="padding:4px 0;">${escapeHtml(c.tipo_contrato_nombre)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Propiedad</td><td style="padding:4px 0;">${escapeHtml(c.propiedad_nombre)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Inquilino</td><td style="padding:4px 0;">${escapeHtml(c.inquilino_nombre)} (${escapeHtml(c.inquilino_documento)})</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Vigencia</td><td style="padding:4px 0;">${formatFecha(c.fecha_inicio)} — ${formatFecha(c.fecha_fin)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Renta</td><td style="padding:4px 0;">${formatPrecio(c.valor_mensual)}/mes · Fianza ${formatPrecio(c.deposito)}</td></tr>
        ${unidad}
      </table>
      <div style="color:#111;">
        ${bodyContent}
      </div>
      <div style="margin-top:28px;padding-top:14px;border-top:1px solid #ccc;">
        <div style="font-size:10pt;font-weight:600;color:#666;text-transform:uppercase;margin-bottom:12px;">Firmas</div>
        ${buildFirmasSection(c)}
      </div>
    </div>
  `;
}

export function getContractPdfFilename(contract: Contract): string {
  const safe = contract.codigo.replace(/[^\w-]+/g, "_");
  return `contrato-${safe}.pdf`;
}

function waitForPaint(ms = 120): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTimeout(resolve, ms));
    });
  });
}

/** Genera y descarga el PDF en el navegador */
export async function downloadContractPdf(contract: Contract): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;
  const hydrated = ensureContractContent(contract);

  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-contract-pdf", "true");
  wrapper.style.cssText =
    "position:fixed;top:0;left:0;width:210mm;min-height:297mm;background:#fff;z-index:99999;opacity:0.01;pointer-events:none;overflow:visible;";
  wrapper.innerHTML = buildContractPdfHtml(hydrated);
  document.body.appendChild(wrapper);

  try {
    await waitForPaint(200);

    const pdfOptions = {
      margin: 10,
      filename: getContractPdfFilename(hydrated),
      image: { type: "jpeg", quality: 0.92 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: wrapper.scrollWidth,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    };

    const target = (wrapper.firstElementChild ?? wrapper) as HTMLElement;
    await html2pdf().set(pdfOptions as never).from(target).save();
  } finally {
    document.body.removeChild(wrapper);
  }
}
