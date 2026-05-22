export type TicketEstado =
  | "nuevo"
  | "asignado"
  | "en_proceso"
  | "resuelto"
  | "cerrado"
  | "cancelado";

export type TicketTabId = "todos" | TicketEstado;

export type TicketTipo =
  | "plomeria"
  | "electricidad"
  | "cerrajeria"
  | "pintura"
  | "electrodomesticos"
  | "muebles"
  | "internet_tecnologia"
  | "limpieza"
  | "humedad_filtraciones"
  | "danos_estructurales"
  | "otro";

export type TicketUrgencia = "baja" | "media" | "alta" | "critica";

export type ManitasEstado = "disponible" | "ocupado" | "inactivo" | "suspendido";

export type ManitasEspecialidad =
  | "plomeria"
  | "electricidad"
  | "cerrajeria"
  | "pintura"
  | "limpieza"
  | "general"
  | "otro";

export type TicketHistorialTipo =
  | "creado"
  | "estado"
  | "manitas_asignado"
  | "comentario"
  | "presupuesto"
  | "trabajo_iniciado"
  | "resuelto"
  | "cerrado"
  | "cancelado";

export interface TicketEvidencia {
  id: string;
  ticket_id: string;
  nombre_archivo: string;
  url?: string;
  created_at: string;
}

export interface TicketComentario {
  id: string;
  ticket_id: string;
  contenido: string;
  autor_id?: string | null;
  created_at: string;
}

export interface TicketHistorialEntry {
  id: string;
  tipo: TicketHistorialTipo;
  descripcion: string;
  fecha: string;
}

export interface TicketMantenimiento {
  id: string;
  owner_id?: string;
  codigo: string;
  propiedad_id: string;
  propiedad_nombre: string;
  propiedad_direccion?: string;
  inquilino_id?: string | null;
  inquilino_nombre?: string | null;
  manitas_id?: string | null;
  manitas_nombre?: string | null;
  unidad?: string | null;
  tipo: TicketTipo;
  urgencia: TicketUrgencia;
  estado: TicketEstado;
  titulo: string;
  descripcion: string;
  fecha_reporte: string;
  fecha_estimada_solucion?: string | null;
  fecha_atencion_estimada?: string | null;
  observaciones_internas?: string | null;
  presupuesto?: number | null;
  factura?: number | null;
  presupuesto_notas?: string | null;
  /** Coste real al resolver; previsto para vincular a un gasto */
  costo?: number | null;
  gasto_id?: string | null;
  evidencias: TicketEvidencia[];
  comentarios: TicketComentario[];
  historial: TicketHistorialEntry[];
  created_at: string;
  updated_at: string;
}

export interface ManitasTrabajo {
  id: string;
  manitas_id: string;
  titulo: string;
  descripcion?: string | null;
  propiedad_nombre?: string | null;
  fecha: string;
  ticket_id?: string | null;
  ticket_codigo?: string | null;
  origen: "ticket" | "manual";
}

export interface Manitas {
  id: string;
  owner_id?: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  especialidad: ManitasEspecialidad;
  zona_cobertura?: string | null;
  estado: ManitasEstado;
  rating: number;
  disponibilidad_notas?: string | null;
  foto_url?: string | null;
  hoja_vida?: string | null;
  tickets_asignados: number;
  tickets_completados: number;
  historial_trabajos?: ManitasTrabajo[];
  created_at: string;
  updated_at: string;
}

export interface TicketFilters {
  search?: string;
  estado?: TicketEstado | "";
  tipo?: TicketTipo | "";
  urgencia?: TicketUrgencia | "";
  propiedad_id?: string;
  manitas_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface ManitasFilters {
  search?: string;
  estado?: ManitasEstado | "";
  especialidad?: ManitasEspecialidad | "";
}

export interface AssignTicketInput {
  manitas_id: string;
  fecha_atencion_estimada?: string | null;
  observacion?: string | null;
}
