// Ejecuta `pnpm db:types` tras aplicar migraciones para regenerar automáticamente.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          nombre: string | null;
          apellidos: string | null;
          rol: "propietario" | "gestor" | "inquilino" | "manitas" | "agente";
          avatar_url: string | null;
          telefono: string | null;
          pais_codigo: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nombre?: string | null;
          apellidos?: string | null;
          rol?: "propietario" | "gestor" | "inquilino" | "manitas" | "agente";
          avatar_url?: string | null;
          telefono?: string | null;
          pais_codigo?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nombre?: string | null;
          apellidos?: string | null;
          rol?: "propietario" | "gestor" | "inquilino" | "manitas" | "agente";
          avatar_url?: string | null;
          telefono?: string | null;
          pais_codigo?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      propiedades: {
        Row: {
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
          tipo_renta: "tradicional" | "habitaciones" | "temporal" | "comercial";
          tipo_propiedad:
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
          estado: "disponible" | "alquilada" | "mantenimiento" | "inactiva";
          foto_principal_url: string | null;
          lat: number | null;
          lng: number | null;
          pais_codigo: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          titulo: string;
          descripcion?: string | null;
          direccion: string;
          ciudad: string;
          codigo_postal: string;
          precio_mes: number;
          habitaciones?: number;
          banos?: number;
          metros_cuadrados?: number | null;
          duracion_minima_dias?: number | null;
          tipo_renta?: "tradicional" | "habitaciones" | "temporal" | "comercial";
          tipo_propiedad?:
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
          estado?: "disponible" | "alquilada" | "mantenimiento" | "inactiva";
          foto_principal_url?: string | null;
          lat?: number | null;
          lng?: number | null;
          pais_codigo?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          titulo?: string;
          descripcion?: string | null;
          direccion?: string;
          ciudad?: string;
          codigo_postal?: string;
          precio_mes?: number;
          habitaciones?: number;
          banos?: number;
          metros_cuadrados?: number | null;
          duracion_minima_dias?: number | null;
          tipo_renta?: "tradicional" | "habitaciones" | "temporal" | "comercial";
          tipo_propiedad?:
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
          estado?: "disponible" | "alquilada" | "mantenimiento" | "inactiva";
          foto_principal_url?: string | null;
          lat?: number | null;
          lng?: number | null;
          pais_codigo?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "propiedades_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<
      string,
      {
        Row: Record<string, unknown>;
        Relationships: [];
      }
    >;
    Functions: Record<
      string,
      {
        Args: Record<string, unknown>;
        Returns: unknown;
      }
    >;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
