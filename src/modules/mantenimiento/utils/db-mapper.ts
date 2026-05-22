import type {
  Manitas,
  ManitasEspecialidad,
  ManitasEstado,
  ManitasTrabajo,
  TicketComentario,
  TicketEvidencia,
  TicketHistorialEntry,
  TicketHistorialTipo,
  TicketMantenimiento,
  TicketEstado,
  TicketTipo,
  TicketUrgencia,
} from "../types";
import { manitasNombreCompleto } from "./labels";

export type TicketJoinRow = {
  id: string;
  owner_id: string;
  codigo: string;
  propiedad_id: string;
  inquilino_id: string | null;
  manitas_id: string | null;
  unidad: string | null;
  tipo: string;
  urgencia: string;
  estado: string;
  titulo: string;
  descripcion: string;
  fecha_reporte: string;
  fecha_estimada_solucion: string | null;
  fecha_atencion_estimada: string | null;
  observaciones_internas: string | null;
  presupuesto: number | null;
  factura: number | null;
  presupuesto_notas: string | null;
  costo: number | null;
  gasto_id: string | null;
  created_at: string;
  updated_at: string;
  propiedades?: { titulo: string; direccion?: string | null } | null;
  inquilinos?: { nombres: string; apellidos: string } | null;
  manitas?: { nombres: string; apellidos: string } | null;
};

export type ManitasRow = {
  id: string;
  owner_id: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  especialidad: string;
  zona_cobertura: string | null;
  estado: string;
  rating: number;
  disponibilidad_notas: string | null;
  foto_url?: string | null;
  foto_storage_path?: string | null;
  hoja_vida?: string | null;
  created_at: string;
  updated_at: string;
};

function inquilinoLabel(i?: { nombres: string; apellidos: string } | null): string | null {
  if (!i) return null;
  return `${i.nombres} ${i.apellidos}`.trim();
}

export function mapTicketFromDb(
  row: TicketJoinRow,
  extras?: {
    evidencias?: TicketEvidencia[];
    comentarios?: TicketComentario[];
    historial?: TicketHistorialEntry[];
  },
): TicketMantenimiento {
  return {
    id: row.id,
    owner_id: row.owner_id,
    codigo: row.codigo,
    propiedad_id: row.propiedad_id,
    propiedad_nombre: row.propiedades?.titulo ?? "—",
    propiedad_direccion: row.propiedades?.direccion ?? undefined,
    inquilino_id: row.inquilino_id,
    inquilino_nombre: inquilinoLabel(row.inquilinos),
    manitas_id: row.manitas_id,
    manitas_nombre: row.manitas ? manitasNombreCompleto(row.manitas) : null,
    unidad: row.unidad,
    tipo: row.tipo as TicketTipo,
    urgencia: row.urgencia as TicketUrgencia,
    estado: row.estado as TicketEstado,
    titulo: row.titulo,
    descripcion: row.descripcion,
    fecha_reporte: row.fecha_reporte,
    fecha_estimada_solucion: row.fecha_estimada_solucion,
    fecha_atencion_estimada: row.fecha_atencion_estimada,
    observaciones_internas: row.observaciones_internas,
    presupuesto: row.presupuesto,
    factura: row.factura,
    presupuesto_notas: row.presupuesto_notas,
    costo: row.costo,
    gasto_id: row.gasto_id,
    evidencias: extras?.evidencias ?? [],
    comentarios: extras?.comentarios ?? [],
    historial: extras?.historial ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function mapManitasFromDb(
  row: ManitasRow,
  extras?: {
    asignados?: number;
    completados?: number;
    historial?: ManitasTrabajo[];
  },
): Manitas {
  return {
    id: row.id,
    owner_id: row.owner_id,
    nombres: row.nombres,
    apellidos: row.apellidos,
    telefono: row.telefono,
    email: row.email,
    especialidad: row.especialidad as ManitasEspecialidad,
    zona_cobertura: row.zona_cobertura,
    estado: row.estado as ManitasEstado,
    rating: Number(row.rating) || 0,
    disponibilidad_notas: row.disponibilidad_notas,
    foto_url: row.foto_url ?? null,
    hoja_vida: row.hoja_vida ?? null,
    tickets_asignados: extras?.asignados ?? 0,
    tickets_completados: extras?.completados ?? 0,
    historial_trabajos: extras?.historial,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function mapHistorialFromDb(rows: {
  id: string;
  tipo: string;
  descripcion: string;
  created_at: string;
}[]): TicketHistorialEntry[] {
  return rows.map((r) => ({
    id: r.id,
    tipo: r.tipo as TicketHistorialTipo,
    descripcion: r.descripcion,
    fecha: r.created_at,
  }));
}

export function mapEvidenciaFromDb(rows: {
  id: string;
  ticket_id: string;
  nombre_archivo: string;
  url: string | null;
  created_at: string;
}[]): TicketEvidencia[] {
  return rows.map((r) => ({
    id: r.id,
    ticket_id: r.ticket_id,
    nombre_archivo: r.nombre_archivo,
    url: r.url ?? undefined,
    created_at: r.created_at,
  }));
}

export function mapComentarioFromDb(rows: {
  id: string;
  ticket_id: string;
  contenido: string;
  autor_id: string | null;
  created_at: string;
}[]): TicketComentario[] {
  return rows.map((r) => ({
    id: r.id,
    ticket_id: r.ticket_id,
    contenido: r.contenido,
    autor_id: r.autor_id,
    created_at: r.created_at,
  }));
}
