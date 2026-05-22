"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import { InquilinoFormSchema, type InquilinoFormValues } from "@/shared/schemas/inquilino";
import { INQUILINOS_STORAGE_BUCKET } from "@/modules/inquilinos/constants";
import type {
  EstadoDocumentoInquilino,
  Inquilino,
  InquilinoDocumento,
  InquilinoFilters,
  InquilinoHistorialEntry,
  InquilinoReferencia,
  InquilinoScoring,
  InquilinoStatus,
  TipoDocumentoInquilino,
} from "@/modules/inquilinos/types";
import {
  formToInquilinoPayload,
  formToReferenciasPayload,
  formToScoringPayload,
  mapInquilinoFromDb,
} from "@/modules/inquilinos/utils/db-mapper";
import { filterInquilinos } from "@/modules/inquilinos/utils/filters";

type DbClient = SupabaseClient<Database>;

async function db(): Promise<DbClient> {
  return (await createClient()) as unknown as DbClient;
}

function revalidateInquilinos() {
  revalidatePath("/dashboard/inquilinos");
}

function rejectManualActivo(status: string): string | undefined {
  if (status === "activo") {
    return "El estado «Activo» solo se asigna al activar un contrato de arrendamiento.";
  }
  return undefined;
}

type InquilinoAssignmentDb = {
  propiedad_id: string | null;
  unidad_id: string | null;
  unidad_nombre: string | null;
  fecha_ingreso: string | null;
  fecha_salida: string | null;
  canon_mensual: number | null;
  deposito: number | null;
  responsable_servicios: string | null;
  ocupantes: number | null;
  status: string;
};

async function loadInquilinoAssignment(
  supabase: DbClient,
  id: string,
): Promise<InquilinoAssignmentDb | null> {
  const { data } = await supabase
    .from("inquilinos")
    .select(
      "status, propiedad_id, unidad_id, unidad_nombre, fecha_ingreso, fecha_salida, canon_mensual, deposito, responsable_servicios, ocupantes",
    )
    .eq("id", id)
    .single<InquilinoAssignmentDb>();

  return data ?? null;
}

async function loadInquilinoRelations(
  supabase: DbClient,
  id: string,
): Promise<{
  refs: InquilinoReferencia | null;
  scoring: InquilinoScoring | null;
  documentos: InquilinoDocumento[];
  historial: InquilinoHistorialEntry[];
}> {
  const [refsRes, scoringRes, docsRes, histRes] = await Promise.all([
    supabase.from("inquilino_referencias").select("*").eq("inquilino_id", id).maybeSingle(),
    supabase.from("inquilino_scoring").select("*").eq("inquilino_id", id).maybeSingle(),
    supabase.from("inquilino_documentos").select("*").eq("inquilino_id", id).order("created_at", { ascending: false }),
    supabase.from("inquilino_historial").select("*").eq("inquilino_id", id).order("created_at", { ascending: false }),
  ]);

  const mapDoc = (d: Record<string, unknown>): InquilinoDocumento => ({
    id: d.id as string,
    inquilino_id: d.inquilino_id as string,
    tipo: d.tipo as TipoDocumentoInquilino,
    nombre_archivo: d.nombre_archivo as string,
    fecha_carga: d.fecha_carga as string,
    estado: d.estado as EstadoDocumentoInquilino,
    observaciones: (d.observaciones as string) ?? undefined,
    url: (d.url as string) ?? undefined,
  });

  const mapHist = (h: Record<string, unknown>): InquilinoHistorialEntry => ({
    id: h.id as string,
    fecha: h.created_at as string,
    tipo: h.tipo as InquilinoHistorialEntry["tipo"],
    descripcion: h.descripcion as string,
  });

  const refsRow = refsRes.data as Record<string, unknown> | null;
  const scoringRow = scoringRes.data as Record<string, unknown> | null;

  return {
    refs: refsRow
      ? {
          nombre_personal: (refsRow.nombre_personal as string) ?? undefined,
          telefono_personal: (refsRow.telefono_personal as string) ?? undefined,
          relacion: (refsRow.relacion as string) ?? undefined,
          nombre_arrendador: (refsRow.nombre_arrendador as string) ?? undefined,
          telefono_arrendador: (refsRow.telefono_arrendador as string) ?? undefined,
          comentario: (refsRow.comentario as string) ?? undefined,
        }
      : null,
    scoring: scoringRow
      ? {
          nivel: scoringRow.nivel as InquilinoScoring["nivel"],
          documentacion_completa: Boolean(scoringRow.documentacion_completa),
          ingresos_suficientes: Boolean(scoringRow.ingresos_suficientes),
          historial_pagos: Boolean(scoringRow.historial_pagos),
          referencias_positivas: Boolean(scoringRow.referencias_positivas),
          estabilidad_laboral: Boolean(scoringRow.estabilidad_laboral),
          comportamiento_reportado: Boolean(scoringRow.comportamiento_reportado),
          danos_previos: Boolean(scoringRow.danos_previos),
          observaciones_gestor: (scoringRow.observaciones_gestor as string) ?? undefined,
          actualizado_at: scoringRow.actualizado_at as string,
        }
      : null,
    documentos: (docsRes.data ?? []).map((d) => mapDoc(d as Record<string, unknown>)),
    historial: (histRes.data ?? []).map((h) => mapHist(h as Record<string, unknown>)),
  };
}

const LIST_SELECT = `*, propiedades (id, titulo, tipo_renta)`;

export async function listInquilinosAction(
  filters: InquilinoFilters = {},
): Promise<{ data: Inquilino[]; error?: string }> {
  const supabase = await db();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "No autenticado" };

  let query = supabase.from("inquilinos").select(LIST_SELECT).order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.propiedad_id) query = query.eq("propiedad_id", filters.propiedad_id);
  if (filters.estado_pago) query = query.eq("estado_pago", filters.estado_pago);
  if (filters.fecha_ingreso_desde) query = query.gte("fecha_ingreso", filters.fecha_ingreso_desde);
  if (filters.fecha_ingreso_hasta) query = query.lte("fecha_ingreso", filters.fecha_ingreso_hasta);
  if (filters.scoring) {
    const { data: scoringRows } = await supabase
      .from("inquilino_scoring")
      .select("inquilino_id")
      .eq("nivel", filters.scoring);
    const ids = (scoringRows ?? []).map((r) => (r as { inquilino_id: string }).inquilino_id);
    if (ids.length === 0) return { data: [] };
    query = query.in("id", ids);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: "No se pudieron cargar los inquilinos. ¿Ejecutaste 04_modulo_inquilinos.sql?" };
  }

  let items = (data ?? []).map((row) =>
    mapInquilinoFromDb(row as unknown as Parameters<typeof mapInquilinoFromDb>[0]),
  );

  if (filters.tipo_renta) {
    items = items.filter((i) => i.asignacion?.tipo_renta === filters.tipo_renta);
  }

  items = filterInquilinos(items, filters);

  return { data: items };
}

export async function getInquilinoAction(
  id: string,
): Promise<{ data: Inquilino | null; error?: string }> {
  const supabase = await db();

  const { data, error } = await supabase
    .from("inquilinos")
    .select(LIST_SELECT)
    .eq("id", id)
    .single();

  if (error || !data) {
    return { data: null, error: "Inquilino no encontrado" };
  }

  const rel = await loadInquilinoRelations(supabase, id);
  const inquilino = mapInquilinoFromDb(
    data as unknown as Parameters<typeof mapInquilinoFromDb>[0],
    rel.refs,
    rel.scoring,
    rel.documentos,
    rel.historial,
  );

  return { data: inquilino };
}

export async function createInquilinoAction(
  values: InquilinoFormValues,
): Promise<{ data: Inquilino | null; error?: string }> {
  const parsed = InquilinoFormSchema.safeParse(values);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await db();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "No autenticado" };

  const activoError = rejectManualActivo(parsed.data.status);
  if (activoError) return { data: null, error: activoError };

  const payload = formToInquilinoPayload(parsed.data, user.id, null);

  const { data: created, error } = await supabase
    .from("inquilinos")
    .insert(payload as never)
    .select("id")
    .single<{ id: string }>();

  if (error) {
    if (error.message.includes("inquilinos_numero_documento_unique")) {
      return { data: null, error: "Ya existe un inquilino con este documento" };
    }
    if (error.message.includes("inquilinos_email_unique")) {
      return { data: null, error: "Ya existe un inquilino con este email" };
    }
    if (error.message.includes("idx_inquilinos_unidad_activa")) {
      return { data: null, error: "Esa habitación ya tiene un inquilino activo" };
    }
    return { data: null, error: error.message };
  }

  const id = created!.id;

  const refsPayload = formToReferenciasPayload(parsed.data);
  if (refsPayload) {
    await supabase.from("inquilino_referencias").upsert({ inquilino_id: id, ...refsPayload } as never);
  }

  const scoringPayload = formToScoringPayload(parsed.data);
  if (scoringPayload) {
    await supabase.from("inquilino_scoring").upsert({ inquilino_id: id, ...scoringPayload } as never);
  }

  await supabase.from("inquilino_historial").insert({
    inquilino_id: id,
    tipo: "creado",
    descripcion: "Inquilino registrado en el sistema",
  } as never);

  revalidateInquilinos();
  return getInquilinoAction(id);
}

export async function updateInquilinoAction(
  id: string,
  values: InquilinoFormValues,
): Promise<{ data: Inquilino | null; error?: string }> {
  const parsed = InquilinoFormSchema.safeParse(values);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await db();
  const { data: existing } = await supabase
    .from("inquilinos")
    .select("owner_id")
    .eq("id", id)
    .single<{ owner_id: string }>();
  if (!existing) return { data: null, error: "Inquilino no encontrado" };

  const assignmentRow = await loadInquilinoAssignment(supabase, id);
  if (!assignmentRow) return { data: null, error: "Inquilino no encontrado" };

  if (parsed.data.status === "activo" && assignmentRow.status !== "activo") {
    return { data: null, error: rejectManualActivo("activo") };
  }

  const payload = formToInquilinoPayload(parsed.data, existing.owner_id, {
    propiedad_id: assignmentRow.propiedad_id,
    unidad_id: assignmentRow.unidad_id,
    unidad_nombre: assignmentRow.unidad_nombre,
    fecha_ingreso: assignmentRow.fecha_ingreso,
    fecha_salida: assignmentRow.fecha_salida,
    canon_mensual: assignmentRow.canon_mensual,
    deposito: assignmentRow.deposito,
    responsable_servicios: assignmentRow.responsable_servicios,
    ocupantes: assignmentRow.ocupantes,
  });
  const { owner_id: _o, ...updatePayload } = payload;

  const { error } = await supabase.from("inquilinos").update(updatePayload as never).eq("id", id);

  if (error) {
    if (error.message.includes("unique")) {
      return { data: null, error: "Documento o email ya registrado" };
    }
    if (error.message.includes("idx_inquilinos_unidad_activa")) {
      return { data: null, error: "Esa habitación ya tiene un inquilino activo" };
    }
    return { data: null, error: error.message };
  }

  const refsPayload = formToReferenciasPayload(parsed.data);
  if (refsPayload) {
    await supabase.from("inquilino_referencias").upsert({ inquilino_id: id, ...refsPayload } as never);
  }

  const scoringPayload = formToScoringPayload(parsed.data);
  if (scoringPayload) {
    await supabase.from("inquilino_scoring").upsert({ inquilino_id: id, ...scoringPayload } as never);
  }

  await supabase.from("inquilino_historial").insert({
    inquilino_id: id,
    tipo: "estado",
    descripcion: `Datos actualizados — estado: ${parsed.data.status}`,
  } as never);

  revalidateInquilinos();
  revalidatePath(`/dashboard/inquilinos/${id}`);
  return getInquilinoAction(id);
}

export async function changeInquilinoStatusAction(
  id: string,
  status: InquilinoStatus,
): Promise<{ error?: string }> {
  const activoError = rejectManualActivo(status);
  if (activoError) return { error: activoError };

  const supabase = await db();
  const { error } = await supabase.from("inquilinos").update({ status } as never).eq("id", id);
  if (error) return { error: error.message };

  await supabase.from("inquilino_historial").insert({
    inquilino_id: id,
    tipo: "estado",
    descripcion: `Estado cambiado a ${status}`,
  } as never);

  revalidateInquilinos();
  return {};
}

export async function deactivateInquilinoAction(id: string): Promise<{ error?: string }> {
  return changeInquilinoStatusAction(id, "inactivo");
}

export async function updateInquilinoDocumentoStatusAction(
  inquilinoId: string,
  documentId: string,
  estado: EstadoDocumentoInquilino,
  observaciones?: string,
): Promise<{ error?: string }> {
  const supabase = await db();
  const { error } = await supabase
    .from("inquilino_documentos")
    .update({ estado, observaciones: observaciones ?? null } as never)
    .eq("id", documentId)
    .eq("inquilino_id", inquilinoId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/inquilinos/${inquilinoId}`);
  return {};
}

export async function uploadInquilinoDocumentoAction(
  inquilinoId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const file = formData.get("file");
  const tipo = formData.get("tipo") as TipoDocumentoInquilino | null;
  if (!(file instanceof File) || !tipo) {
    return { error: "Archivo o tipo inválido" };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local" };
  }

  const supabase = await db();
  const { data: inq } = await supabase
    .from("inquilinos")
    .select("owner_id")
    .eq("id", inquilinoId)
    .single<{ owner_id: string }>();

  if (!inq) return { error: "Inquilino no encontrado" };

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${inq.owner_id}/${inquilinoId}/${tipo}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from(INQUILINOS_STORAGE_BUCKET)
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = admin.storage.from(INQUILINOS_STORAGE_BUCKET).getPublicUrl(path);

  await supabase.from("inquilino_documentos").insert({
    inquilino_id: inquilinoId,
    tipo,
    nombre_archivo: file.name,
    storage_path: path,
    url: urlData.publicUrl,
    estado: "pendiente",
  } as never);

  await supabase.from("inquilino_historial").insert({
    inquilino_id: inquilinoId,
    tipo: "documento",
    descripcion: `Documento cargado: ${file.name}`,
  } as never);

  revalidatePath(`/dashboard/inquilinos/${inquilinoId}`);
  return {};
}

export async function getUnidadesOcupadasAction(
  propiedadId: string,
  excludeInquilinoId?: string,
): Promise<{ data: string[]; error?: string }> {
  const supabase = await db();
  let query = supabase
    .from("inquilinos")
    .select("unidad_id")
    .eq("propiedad_id", propiedadId)
    .eq("status", "activo")
    .not("unidad_id", "is", null);

  if (excludeInquilinoId) {
    query = query.neq("id", excludeInquilinoId);
  }

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };

  return {
    data: (data ?? [])
      .map((r) => (r as { unidad_id: string }).unidad_id)
      .filter(Boolean),
  };
}
