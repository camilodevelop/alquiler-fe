export type TipoRenta = "tradicional" | "habitaciones" | "temporal" | "comercial";

export type TipoPropiedad =
  | "apartamento"
  | "casa"
  | "apartaestudio"
  | "habitacion"
  | "local"
  | "oficina"
  | "bodega"
  | "finca"
  | "garaje"
  | "deposito";

export type EstadoPropiedad = "disponible" | "alquilada" | "mantenimiento" | "inactiva";

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
  duracion_minima_dias: number | null;
  tipo_renta: TipoRenta;
  tipo_propiedad: TipoPropiedad;
  estado: EstadoPropiedad;
  foto_principal_url: string | null;
  lat: number | null;
  lng: number | null;
  pais_codigo: string;
  created_at: string;
  updated_at: string;
}

export interface PropiedadListItem extends Propiedad {}

export interface PropiedadFilters {
  search?: string;
  ciudad?: string;
  estado?: EstadoPropiedad | "";
  tipo_renta?: TipoRenta | "";
  tipo_propiedad?: TipoPropiedad | "";
}

export interface PropiedadFormInput {
  titulo: string;
  descripcion?: string;
  tipo_propiedad: TipoPropiedad;
  tipo_renta: TipoRenta;
  direccion: string;
  ciudad: string;
  codigo_postal: string;
  precio_mes: number;
  estado: EstadoPropiedad;
  habitaciones?: number;
  banos?: number;
  metros_cuadrados?: number;
  duracion_minima_dias?: number;
}

export type PropiedadWizardStep = 1 | 2 | 3 | 4 | 5;
