export type UserRole = "propietario" | "gestor" | "inquilino" | "manitas" | "agente";

export type TipoAlquiler = "tradicional" | "habitaciones" | "corta_estancia" | "flipping";

export type EstadoPropiedad = "disponible" | "alquilada" | "mantenimiento" | "inactiva";

export type EstadoContrato = "borrador" | "pendiente_firma" | "activo" | "vencido" | "cancelado";

export type EstadoPago = "pendiente" | "cobrado" | "parcial" | "impagado";

export type EstadoTicket = "pendiente" | "en_curso" | "finalizado" | "cancelado";

export type Urgencia = "baja" | "media" | "alta" | "emergencia";

export type CodigoPais = "ES" | "CO";

export interface DocumentoTipo {
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface MetodoPago {
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface TipoContrato {
  codigo: string;
  nombre: string;
  ley: string;
}

export interface IndiceActualizacion {
  codigo: string;
  nombre: string;
  url: string;
}

export interface ModuloFiscal {
  codigo: string;
  nombre: string;
}

export interface Pais {
  codigo: CodigoPais;
  nombre: string;
  moneda_codigo: string;
  moneda_simbolo: string;
  locale: string;
  telefono_regex: string;
  telefono_placeholder: string;
  documento_tipos: DocumentoTipo[];
  metodos_pago: MetodoPago[];
  tipos_contrato: TipoContrato[];
  indices_actualizacion: IndiceActualizacion[];
  fiscal_modulos: ModuloFiscal[];
  iva_residencial: number;
  iva_comercial: number;
  fianza_meses_min: number;
  fianza_meses_max: number;
  activo: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  nombre: string | null;
  apellidos: string | null;
  rol: UserRole;
  avatar_url: string | null;
  telefono: string | null;
  pais_codigo: CodigoPais;
  created_at: string;
  updated_at: string;
}

export interface Propiedad {
  id: string;
  owner_id: string;
  titulo: string;
  descripcion: string | null;
  direccion: string;
  ciudad: string;
  codigo_postal: string;
  precio_mes: number;
  habitaciones: number;
  banos: number;
  metros_cuadrados: number | null;
  tipo_alquiler: TipoAlquiler;
  estado: EstadoPropiedad;
  lat: number | null;
  lng: number | null;
  pais_codigo: CodigoPais;
  created_at: string;
  updated_at: string;
}
