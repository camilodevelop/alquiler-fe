/** Estado del contrato de alquiler */
export type ContractStatus =
  | "borrador"
  | "pendiente_firma"
  | "firmado"
  | "activo"
  | "finalizado"
  | "cancelado";

/** Estado de una firma individual */
export type SignatureStatus = "pendiente" | "firmado";

export type SignatureRole = "administrador" | "inquilino";

/** Resumen agregado de firmas en listados */
export type ContractSignatureSummary = "pendiente" | "parcial" | "completa";

export type ContractHistorialTipo =
  | "creado"
  | "editado"
  | "firma_admin"
  | "firma_inquilino"
  | "activado"
  | "finalizado"
  | "cancelado";

export interface ContractTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  plantilla_html: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContractSignature {
  rol: SignatureRole;
  firmante_nombre: string;
  fecha_firma: string | null;
  estado: SignatureStatus;
}

export interface ContractHistorialEntry {
  id: string;
  tipo: ContractHistorialTipo;
  descripcion: string;
  fecha: string;
}

export interface Contract {
  id: string;
  owner_id?: string;
  codigo: string;
  tipo_contrato_id: string;
  tipo_contrato_nombre: string;
  propiedad_id: string;
  propiedad_nombre: string;
  propiedad_direccion: string;
  unidad?: string | null;
  inquilino_id: string;
  inquilino_nombre: string;
  inquilino_documento: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_mensual: number;
  deposito: number;
  dia_pago: number;
  observaciones?: string | null;
  plantilla_html: string;
  contenido_generado: string;
  estado: ContractStatus;
  firmas: ContractSignature[];
  historial: ContractHistorialEntry[];
  created_at: string;
  updated_at: string;
}

export interface ContractFilters {
  search?: string;
  estado?: ContractStatus | "";
  propiedad_id?: string;
  inquilino_id?: string;
  tipo_contrato_id?: string;
}

export interface ContractListItem extends Contract {
  estado_firma: ContractSignatureSummary;
}

export interface ContractFormInput {
  tipo_contrato_id: string;
  propiedad_id: string;
  unidad?: string | null;
  inquilino_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_mensual: number;
  deposito: number;
  dia_pago: number;
  observaciones?: string | null;
}

export interface TemplateFormInput {
  nombre: string;
  descripcion: string;
  plantilla_html: string;
  activo?: boolean;
}

/** Alias en inglés (API escalable) */
export type Contrato = Contract;
export type PlantillaContrato = ContractTemplate;
export type FirmaContrato = ContractSignature;
