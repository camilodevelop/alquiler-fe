import type { Propiedad } from "@/modules/propiedades/types";
import type { InquilinoFormValues } from "@/shared/schemas/inquilino";
import { STORAGE_KEY } from "../constants";
import type {
  EstadoDocumentoInquilino,
  Inquilino,
  InquilinoDocumento,
  InquilinoFilters,
  InquilinoScoring,
  InquilinoStatus,
  NivelScoring,
} from "../types";
import { filterInquilinos } from "../utils/filters";
import { DEFAULT_SCORING } from "../utils/defaults";
import { createSeedInquilinos } from "./seed";

let memoryStore: Inquilino[] | null = null;

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function load(): Inquilino[] {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Inquilino[];
    } catch {
      /* ignore */
    }
  }
  if (!memoryStore) memoryStore = createSeedInquilinos();
  return memoryStore;
}

function save(items: Inquilino[]): void {
  memoryStore = items;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

export function syncPropiedadNames(propiedades: Propiedad[]): void {
  const items = load();
  let changed = false;
  const byTitle = new Map(propiedades.map((p) => [p.titulo.toLowerCase(), p]));

  for (const inq of items) {
    if (!inq.asignacion?.propiedad_nombre) continue;
    const match = byTitle.get(inq.asignacion.propiedad_nombre.toLowerCase());
    if (match && inq.asignacion.propiedad_id !== match.id) {
      inq.asignacion.propiedad_id = match.id;
      inq.asignacion.tipo_renta = match.tipo_renta;
      changed = true;
    }
  }

  if (changed) save(items);
}

export function getAllInquilinos(): Inquilino[] {
  return load();
}

export function getInquilinos(filters: InquilinoFilters = {}): Inquilino[] {
  return filterInquilinos(load(), filters);
}

export function getInquilinoById(id: string): Inquilino | null {
  return load().find((i) => i.id === id) ?? null;
}

export function documentExists(numero: string, excludeId?: string): boolean {
  const n = numero.trim().toLowerCase();
  return load().some(
    (i) => i.numero_documento.toLowerCase() === n && i.id !== excludeId,
  );
}

export function emailExists(email: string, excludeId?: string): boolean {
  const e = email.trim().toLowerCase();
  return load().some((i) => i.email.toLowerCase() === e && i.id !== excludeId);
}

export function getOccupiedUnitIds(propiedadId: string, excludeInquilinoId?: string): string[] {
  return load()
    .filter(
      (i) =>
        i.id !== excludeInquilinoId &&
        i.status === "activo" &&
        i.asignacion?.propiedad_id === propiedadId &&
        i.asignacion?.unidad_id,
    )
    .map((i) => i.asignacion!.unidad_id!);
}

function formToInquilino(
  values: InquilinoFormValues,
  propiedades: Propiedad[],
  existing?: Inquilino,
): Inquilino {
  const now = new Date().toISOString();
  const prop = propiedades.find((p) => p.id === values.propiedad_id);

  const asignacion =
    values.propiedad_id && prop
      ? {
          propiedad_id: prop.id,
          propiedad_nombre: prop.titulo,
          tipo_renta: prop.tipo_renta,
          unidad_id: values.unidad_id || undefined,
          unidad_nombre: values.unidad_id
            ? `Habitación ${values.unidad_id.replace("hab-", "")}`
            : undefined,
          fecha_ingreso: values.fecha_ingreso || undefined,
          fecha_salida: values.fecha_salida || undefined,
          canon_mensual: values.canon_mensual ?? prop.precio_mes,
          deposito: values.deposito,
          responsable_servicios: values.responsable_servicios,
          ocupantes: values.ocupantes,
        }
      : existing?.asignacion;

  return {
    id: existing?.id ?? uid("inq"),
    nombres: values.nombres,
    apellidos: values.apellidos,
    tipo_documento: values.tipo_documento,
    numero_documento: values.numero_documento,
    fecha_nacimiento: values.fecha_nacimiento || undefined,
    nacionalidad: values.nacionalidad,
    telefono: values.telefono,
    email: values.email,
    direccion_actual: values.direccion_actual,
    ciudad: values.ciudad,
    pais: values.pais,
    ocupacion: values.ocupacion,
    empresa: values.empresa,
    tipo_contrato_laboral: values.tipo_contrato_laboral,
    ingresos_mensuales: values.ingresos_mensuales,
    antiguedad_laboral: values.antiguedad_laboral,
    referencia_laboral: values.referencia_laboral,
    telefono_referencia_laboral: values.telefono_referencia_laboral,
    observaciones_financieras: values.observaciones_financieras,
    status: values.status,
    asignacion,
    referencias: values.referencias,
    scoring: values.scoring
      ? { ...values.scoring, actualizado_at: now }
      : existing?.scoring ?? DEFAULT_SCORING,
    documentos: existing?.documentos ?? [],
    pago_resumen: existing?.pago_resumen ?? {
      estado: "pendiente",
      total_pagado: 0,
      total_pendiente: 0,
      pagos_vencidos: 0,
    },
    historial: existing?.historial ?? [
      {
        id: uid("h"),
        fecha: now,
        tipo: "creado",
        descripcion: "Inquilino registrado",
      },
    ],
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
}

export function createInquilino(
  values: InquilinoFormValues,
  propiedades: Propiedad[],
): { data?: Inquilino; error?: string } {
  if (documentExists(values.numero_documento)) {
    return { error: "Ya existe un inquilino con este número de documento" };
  }
  if (emailExists(values.email)) {
    return { error: "Ya existe un inquilino con este email" };
  }

  if (values.status === "activo" && !values.propiedad_id) {
    return { error: "Un inquilino activo debe tener una propiedad asociada" };
  }
  if (values.status === "activo" && !values.fecha_ingreso) {
    return { error: "Un inquilino activo debe tener fecha de ingreso" };
  }

  const prop = propiedades.find((p) => p.id === values.propiedad_id);
  if (prop && (prop.estado === "inactiva")) {
    return { error: "No se puede asociar a una propiedad inactiva" };
  }

  if (prop?.tipo_renta === "habitaciones" && values.unidad_id) {
    const occupied = getOccupiedUnitIds(prop.id);
    if (occupied.includes(values.unidad_id)) {
      return { error: "Esa habitación ya tiene un inquilino activo" };
    }
  }

  const items = load();
  const nuevo = formToInquilino(values, propiedades);
  items.unshift(nuevo);
  save(items);
  return { data: nuevo };
}

export function updateInquilino(
  id: string,
  values: InquilinoFormValues,
  propiedades: Propiedad[],
): { data?: Inquilino; error?: string } {
  const items = load();
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return { error: "Inquilino no encontrado" };

  if (documentExists(values.numero_documento, id)) {
    return { error: "Ya existe un inquilino con este número de documento" };
  }
  if (emailExists(values.email, id)) {
    return { error: "Ya existe un inquilino con este email" };
  }

  if (values.status === "activo" && !values.propiedad_id) {
    return { error: "Un inquilino activo debe tener una propiedad asociada" };
  }

  const prop = propiedades.find((p) => p.id === values.propiedad_id);
  if (prop?.tipo_renta === "habitaciones" && values.unidad_id) {
    const occupied = getOccupiedUnitIds(prop.id, id);
    if (occupied.includes(values.unidad_id)) {
      return { error: "Esa habitación ya tiene un inquilino activo" };
    }
  }

  const updated = formToInquilino(values, propiedades, items[idx]);
  updated.historial = [
    {
      id: uid("h"),
      fecha: new Date().toISOString(),
      tipo: "estado",
      descripcion: `Datos actualizados — estado: ${values.status}`,
    },
    ...items[idx].historial,
  ];
  items[idx] = updated;
  save(items);
  return { data: updated };
}

export function changeInquilinoStatus(
  id: string,
  status: InquilinoStatus,
): { data?: Inquilino; error?: string } {
  const items = load();
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return { error: "Inquilino no encontrado" };

  const inq = items[idx];
  if (status === "activo" && !inq.asignacion?.propiedad_id) {
    return { error: "No se puede activar sin propiedad asociada" };
  }

  inq.status = status;
  inq.updated_at = new Date().toISOString();
  inq.historial.unshift({
    id: uid("h"),
    fecha: inq.updated_at,
    tipo: "estado",
    descripcion: `Estado cambiado a ${status}`,
  });
  save(items);
  return { data: inq };
}

export function deactivateInquilino(id: string): { error?: string } {
  return changeInquilinoStatus(id, "inactivo");
}

export function addMockDocument(
  inquilinoId: string,
  doc: Omit<InquilinoDocumento, "id" | "inquilino_id" | "fecha_carga"> & {
    nombre_archivo: string;
  },
): { data?: InquilinoDocumento; error?: string } {
  const items = load();
  const idx = items.findIndex((i) => i.id === inquilinoId);
  if (idx < 0) return { error: "Inquilino no encontrado" };

  const nuevo: InquilinoDocumento = {
    id: uid("doc"),
    inquilino_id: inquilinoId,
    fecha_carga: new Date().toISOString().slice(0, 10),
    ...doc,
  };
  items[idx].documentos.push(nuevo);
  items[idx].historial.unshift({
    id: uid("h"),
    fecha: new Date().toISOString(),
    tipo: "documento",
    descripcion: `Documento cargado: ${doc.nombre_archivo}`,
  });
  save(items);
  return { data: nuevo };
}

export function updateDocumentStatus(
  inquilinoId: string,
  documentId: string,
  estado: EstadoDocumentoInquilino,
  observaciones?: string,
): { error?: string } {
  const items = load();
  const inq = items.find((i) => i.id === inquilinoId);
  if (!inq) return { error: "Inquilino no encontrado" };
  const doc = inq.documentos.find((d) => d.id === documentId);
  if (!doc) return { error: "Documento no encontrado" };
  doc.estado = estado;
  if (observaciones) doc.observaciones = observaciones;
  inq.updated_at = new Date().toISOString();
  save(items);
  return {};
}

export function updateScoring(
  inquilinoId: string,
  scoring: Partial<InquilinoScoring> & { nivel: NivelScoring },
): { data?: InquilinoScoring; error?: string } {
  const items = load();
  const idx = items.findIndex((i) => i.id === inquilinoId);
  if (idx < 0) return { error: "Inquilino no encontrado" };

  items[idx].scoring = {
    ...items[idx].scoring,
    ...scoring,
    actualizado_at: new Date().toISOString(),
  } as InquilinoScoring;
  save(items);
  return { data: items[idx].scoring };
}

/** Genera habitaciones mock para propiedad por habitaciones */
export function getUnidadesForPropiedad(
  propiedadId: string,
  habitaciones: number,
  occupiedIds: string[],
): { id: string; nombre: string; disponible: boolean }[] {
  const count = Math.max(habitaciones, 1);
  return Array.from({ length: count }, (_, i) => {
    const id = `hab-${i + 1}`;
    return {
      id,
      nombre: `Habitación ${i + 1}`,
      disponible: !occupiedIds.includes(id),
    };
  });
}
