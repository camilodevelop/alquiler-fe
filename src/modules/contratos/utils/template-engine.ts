import type { Contract, ContractFormInput } from "../types";
import type { Propiedad } from "@/modules/propiedades/types";
import type { Inquilino } from "@/modules/inquilinos/types";
import { formatPrecio, formatFecha } from "./labels";

export interface TemplateRenderContext {
  contractCode?: string;
  form: Partial<ContractFormInput>;
  propiedad?: Pick<Propiedad, "titulo" | "direccion" | "ciudad" | "codigo_postal">;
  inquilino?: Pick<Inquilino, "nombres" | "apellidos" | "numero_documento">;
}

function nombreInquilino(inq?: Pick<Inquilino, "nombres" | "apellidos">) {
  if (!inq) return "";
  return `${inq.nombres} ${inq.apellidos}`.trim();
}

function direccionCompleta(p?: Pick<Propiedad, "direccion" | "ciudad" | "codigo_postal">) {
  if (!p) return "";
  return [p.direccion, p.ciudad, p.codigo_postal].filter(Boolean).join(", ");
}

export function buildTemplateVariables(ctx: TemplateRenderContext): Record<string, string> {
  const { form, propiedad, inquilino, contractCode } = ctx;
  return {
    "{{tenant_name}}": nombreInquilino(inquilino),
    "{{tenant_document}}": inquilino?.numero_documento ?? "",
    "{{property_name}}": propiedad?.titulo ?? "",
    "{{property_address}}": direccionCompleta(propiedad),
    "{{unit}}": form.unidad?.trim() ?? "—",
    "{{monthly_rent}}": form.valor_mensual != null ? formatPrecio(form.valor_mensual) : "",
    "{{deposit}}": form.deposito != null ? formatPrecio(form.deposito) : "",
    "{{start_date}}": form.fecha_inicio ? formatFecha(form.fecha_inicio) : "",
    "{{end_date}}": form.fecha_fin ? formatFecha(form.fecha_fin) : "",
    "{{payment_day}}": form.dia_pago != null ? String(form.dia_pago) : "",
    "{{contract_code}}": contractCode ?? "—",
  };
}

export function renderContractTemplate(html: string, vars: Record<string, string>): string {
  let out = html;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(key).join(value || "—");
  }
  return out;
}

export function renderContractContent(
  plantillaHtml: string,
  contract: Pick<
    Contract,
    | "codigo"
    | "propiedad_nombre"
    | "propiedad_direccion"
    | "inquilino_nombre"
    | "inquilino_documento"
    | "unidad"
    | "fecha_inicio"
    | "fecha_fin"
    | "valor_mensual"
    | "deposito"
    | "dia_pago"
  >,
): string {
  const vars: Record<string, string> = {
    "{{tenant_name}}": contract.inquilino_nombre,
    "{{tenant_document}}": contract.inquilino_documento,
    "{{property_name}}": contract.propiedad_nombre,
    "{{property_address}}": contract.propiedad_direccion,
    "{{unit}}": contract.unidad?.trim() || "—",
    "{{monthly_rent}}": formatPrecio(contract.valor_mensual),
    "{{deposit}}": formatPrecio(contract.deposito),
    "{{start_date}}": formatFecha(contract.fecha_inicio),
    "{{end_date}}": formatFecha(contract.fecha_fin),
    "{{payment_day}}": String(contract.dia_pago),
    "{{contract_code}}": contract.codigo,
  };
  return renderContractTemplate(plantillaHtml, vars);
}

/** Regenera el HTML si falta en BD (contratos antiguos o plantilla vacía al crear). */
export function ensureContractContent(contract: Contract): Contract {
  const html = contract.contenido_generado?.trim();
  if (html) return contract;

  const plantilla = contract.plantilla_html?.trim();
  if (!plantilla) return contract;

  return {
    ...contract,
    contenido_generado: renderContractContent(plantilla, contract),
  };
}
