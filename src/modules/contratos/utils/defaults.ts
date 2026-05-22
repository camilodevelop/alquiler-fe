import type { ContractFormInput, TemplateFormInput } from "../types";

export const CONTRACT_FORM_DEFAULTS: ContractFormInput = {
  tipo_contrato_id: "",
  propiedad_id: "",
  unidad: null,
  inquilino_id: "",
  fecha_inicio: "",
  fecha_fin: "",
  valor_mensual: 0,
  deposito: 0,
  dia_pago: 1,
  observaciones: "",
};

export const TEMPLATE_FORM_DEFAULTS: TemplateFormInput = {
  nombre: "",
  descripcion: "",
  plantilla_html: "",
  activo: true,
};

export const DEFAULT_PLANTILLA_HTML = `<article class="contract-doc">
  <h1>Contrato de arrendamiento</h1>
  <p><strong>Referencia:</strong> {{contract_code}}</p>
  <h2>Partes</h2>
  <p>Arrendatario: <strong>{{tenant_name}}</strong> ({{tenant_document}})</p>
  <p>Inmueble: <strong>{{property_name}}</strong> — {{property_address}}</p>
  <p>Unidad: {{unit}}</p>
  <h2>Condiciones económicas</h2>
  <ul>
    <li>Renta mensual: {{monthly_rent}}</li>
    <li>Fianza: {{deposit}}</li>
    <li>Día de pago: {{payment_day}} de cada mes</li>
    <li>Vigencia: {{start_date}} — {{end_date}}</li>
  </ul>
  <p>El presente documento se formaliza conforme a la legislación vigente.</p>
</article>`;
