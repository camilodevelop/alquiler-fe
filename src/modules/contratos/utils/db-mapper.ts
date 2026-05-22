import type {
  Contract,
  ContractHistorialEntry,
  ContractSignature,
  ContractStatus,
  ContractTemplate,
  SignatureRole,
  SignatureStatus,
} from "../types";

export type ContratoRow = Record<string, unknown> & {
  id: string;
  owner_id: string;
  codigo: string;
  tipo_contrato_id: string;
  propiedad_id: string;
  inquilino_id: string;
  unidad: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  valor_mensual: number;
  deposito: number;
  dia_pago: number;
  observaciones: string | null;
  plantilla_html: string;
  contenido_generado: string;
  estado: ContractStatus;
  created_at: string;
  updated_at: string;
};

export type ContratoJoinRow = ContratoRow & {
  contrato_tipos?: { nombre: string } | { nombre: string }[] | null;
  propiedades?: { titulo: string; direccion: string; ciudad: string } | { titulo: string; direccion: string; ciudad: string }[] | null;
  inquilinos?: { nombres: string; apellidos: string; numero_documento: string } | { nombres: string; apellidos: string; numero_documento: string }[] | null;
};

function first<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export function mapTemplateFromDb(row: Record<string, unknown>): ContractTemplate {
  return {
    id: row.id as string,
    nombre: row.nombre as string,
    descripcion: (row.descripcion as string) ?? "",
    plantilla_html: row.plantilla_html as string,
    activo: Boolean(row.activo),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export function mapFirmaFromDb(row: Record<string, unknown>): ContractSignature {
  return {
    rol: row.rol as SignatureRole,
    firmante_nombre: (row.firmante_nombre as string) ?? "",
    fecha_firma: (row.fecha_firma as string) ?? null,
    estado: row.estado as SignatureStatus,
  };
}

export function mapHistorialFromDb(row: Record<string, unknown>): ContractHistorialEntry {
  return {
    id: row.id as string,
    tipo: row.tipo as ContractHistorialEntry["tipo"],
    descripcion: row.descripcion as string,
    fecha: row.created_at as string,
  };
}

export function mapContractFromDb(
  row: ContratoJoinRow,
  firmas: ContractSignature[],
  historial: ContractHistorialEntry[],
  overrides?: Partial<Pick<Contract, "tipo_contrato_nombre" | "propiedad_nombre" | "propiedad_direccion" | "inquilino_nombre" | "inquilino_documento">>,
): Contract {
  const tipo = first(row.contrato_tipos);
  const prop = first(row.propiedades);
  const inq = first(row.inquilinos);

  const propiedadDireccion = prop
    ? [prop.direccion, prop.ciudad].filter(Boolean).join(", ")
    : "";

  return {
    id: row.id,
    owner_id: row.owner_id,
    codigo: row.codigo,
    tipo_contrato_id: row.tipo_contrato_id,
    tipo_contrato_nombre: overrides?.tipo_contrato_nombre ?? tipo?.nombre ?? "",
    propiedad_id: row.propiedad_id,
    propiedad_nombre: overrides?.propiedad_nombre ?? prop?.titulo ?? "",
    propiedad_direccion: overrides?.propiedad_direccion ?? propiedadDireccion,
    unidad: row.unidad,
    inquilino_id: row.inquilino_id,
    inquilino_nombre:
      overrides?.inquilino_nombre ??
      (inq ? `${inq.nombres} ${inq.apellidos}`.trim() : ""),
    inquilino_documento: overrides?.inquilino_documento ?? inq?.numero_documento ?? "",
    fecha_inicio: row.fecha_inicio,
    fecha_fin: row.fecha_fin,
    valor_mensual: Number(row.valor_mensual),
    deposito: Number(row.deposito),
    dia_pago: row.dia_pago,
    observaciones: row.observaciones,
    plantilla_html: row.plantilla_html,
    contenido_generado: row.contenido_generado,
    estado: row.estado,
    firmas,
    historial,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
