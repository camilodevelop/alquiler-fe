"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import {
  AssignTicketSchema,
  ManitasFormSchema,
  ManitasTrabajoFormSchema,
  TicketCommentSchema,
  TicketFormSchema,
  TicketPresupuestoSchema,
  TicketStatusSchema,
  type AssignTicketFormValues,
  type ManitasFormValues,
  type ManitasTrabajoFormValues,
  type TicketFormValues,
} from "@/shared/schemas/mantenimiento";
import type {
  Manitas,
  ManitasFilters,
  ManitasTrabajo,
  TicketEstado,
  TicketFilters,
  TicketHistorialTipo,
  TicketMantenimiento,
} from "@/modules/mantenimiento/types";
import { ASSIGNABLE_MANITAS_ESTADOS, MANTENIMIENTO_STORAGE_BUCKET } from "@/modules/mantenimiento/constants";
import {
  mapComentarioFromDb,
  mapEvidenciaFromDb,
  mapHistorialFromDb,
  mapManitasFromDb,
  mapTicketFromDb,
  type ManitasRow,
  type TicketJoinRow,
} from "@/modules/mantenimiento/utils/db-mapper";
import { filterManitas, filterTickets } from "@/modules/mantenimiento/utils/filters";
import { getTicketEstadoLabel, manitasNombreCompleto } from "@/modules/mantenimiento/utils/labels";

type DbClient = SupabaseClient<Database>;

const TICKET_SELECT = `
  *,
  propiedades ( titulo, direccion ),
  inquilinos ( nombres, apellidos ),
  manitas ( nombres, apellidos )
`;

async function db(): Promise<DbClient> {
  return (await createClient()) as unknown as DbClient;
}

function revalidateMantenimiento(ticketId?: string) {
  revalidatePath("/dashboard/mantenimiento");
  revalidatePath("/dashboard/mantenimiento/maestros");
  if (ticketId) {
    revalidatePath(`/dashboard/mantenimiento/${ticketId}`);
    revalidatePath(`/dashboard/mantenimiento/${ticketId}/editar`);
  }
}

function revalidateManitas(manitasId?: string) {
  revalidatePath("/dashboard/mantenimiento/maestros");
  if (manitasId) {
    revalidatePath(`/dashboard/mantenimiento/maestros/${manitasId}`);
    revalidatePath(`/dashboard/mantenimiento/maestros/${manitasId}/editar`);
  }
}

async function getAuthUser(supabase: DbClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function resolveEffectiveOwnerId(supabase: DbClient, userId: string): Promise<string> {
  const { data: link } = await supabase
    .from("gestor_propietario")
    .select("propietario_id")
    .eq("gestor_id", userId)
    .limit(1)
    .maybeSingle<{ propietario_id: string }>();

  return link?.propietario_id ?? userId;
}

async function nextTicketCodigo(supabase: DbClient, ownerId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TKT-${year}-`;

  const { data } = await supabase
    .from("tickets_mantenimiento")
    .select("codigo")
    .eq("owner_id", ownerId)
    .like("codigo", `${prefix}%`);

  const nums = (data ?? [])
    .map((r) => (r as { codigo: string }).codigo)
    .filter((c) => c.startsWith(prefix))
    .map((c) => parseInt(c.replace(prefix, ""), 10))
    .filter((n) => !Number.isNaN(n));

  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

async function insertTicketHistorial(
  supabase: DbClient,
  ticketId: string,
  tipo: TicketHistorialTipo,
  descripcion: string,
) {
  await supabase.from("ticket_historial").insert({
    ticket_id: ticketId,
    tipo,
    descripcion,
  } as never);
}

async function loadTicketExtras(supabase: DbClient, ticketId: string) {
  const [ev, com, hist] = await Promise.all([
    supabase.from("ticket_evidencias").select("*").eq("ticket_id", ticketId).order("created_at"),
    supabase.from("ticket_comentarios").select("*").eq("ticket_id", ticketId).order("created_at"),
    supabase.from("ticket_historial").select("*").eq("ticket_id", ticketId).order("created_at"),
  ]);

  return {
    evidencias: mapEvidenciaFromDb((ev.data ?? []) as never),
    comentarios: mapComentarioFromDb((com.data ?? []) as never),
    historial: mapHistorialFromDb((hist.data ?? []) as never),
  };
}

async function fetchTicketById(
  supabase: DbClient,
  ticketId: string,
): Promise<TicketMantenimiento | null> {
  const { data, error } = await supabase
    .from("tickets_mantenimiento")
    .select(TICKET_SELECT)
    .eq("id", ticketId)
    .maybeSingle();

  if (error || !data) return null;

  const extras = await loadTicketExtras(supabase, ticketId);
  return mapTicketFromDb(data as unknown as TicketJoinRow, extras);
}

async function countManitasTickets(supabase: DbClient, manitasId: string) {
  const { data } = await supabase
    .from("tickets_mantenimiento")
    .select("estado")
    .eq("manitas_id", manitasId);

  const rows = (data ?? []) as { estado: string }[];
  const asignados = rows.filter((r) =>
    ["asignado", "en_proceso"].includes(r.estado),
  ).length;
  const completados = rows.filter((r) => ["resuelto", "cerrado"].includes(r.estado)).length;
  return { asignados, completados };
}

async function loadManitasHistorial(
  supabase: DbClient,
  manitasId: string,
): Promise<ManitasTrabajo[]> {
  const [ticketsRes, manualRes] = await Promise.all([
    supabase
      .from("tickets_mantenimiento")
      .select("id, codigo, titulo, descripcion, fecha_reporte, propiedades ( titulo )")
      .eq("manitas_id", manitasId)
      .in("estado", ["resuelto", "cerrado"])
      .order("fecha_reporte", { ascending: false }),
    supabase
      .from("manitas_trabajos")
      .select("*")
      .eq("manitas_id", manitasId)
      .order("fecha", { ascending: false }),
  ]);

  type TicketHistRow = {
    id: string;
    codigo: string;
    titulo: string;
    descripcion: string;
    fecha_reporte: string;
    propiedades: { titulo: string } | null;
  };

  const fromTickets: ManitasTrabajo[] = ((ticketsRes.data ?? []) as unknown as TicketHistRow[]).map(
    (t) => ({
    id: `ticket-${t.id}`,
    manitas_id: manitasId,
    titulo: t.titulo,
    descripcion: t.descripcion,
    propiedad_nombre: t.propiedades?.titulo ?? null,
    fecha: t.fecha_reporte,
    ticket_id: t.id,
    ticket_codigo: t.codigo,
    origen: "ticket" as const,
  }),
  );

  const fromManual: ManitasTrabajo[] = ((manualRes.data ?? []) as {
    id: string;
    manitas_id: string;
    titulo: string;
    descripcion: string | null;
    propiedad_nombre: string | null;
    fecha: string;
    ticket_id: string | null;
  }[])
    .filter((m) => !m.ticket_id)
    .map((m) => ({
      id: m.id,
      manitas_id: m.manitas_id,
      titulo: m.titulo,
      descripcion: m.descripcion,
      propiedad_nombre: m.propiedad_nombre,
      fecha: m.fecha,
      ticket_id: m.ticket_id,
      origen: "manual" as const,
    }));

  return [...fromTickets, ...fromManual].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

function manitasPayload(v: ManitasFormValues) {
  return {
    nombres: v.nombres.trim(),
    apellidos: v.apellidos.trim(),
    telefono: v.telefono.trim(),
    email: v.email.trim().toLowerCase(),
    especialidad: v.especialidad,
    zona_cobertura: v.zona_cobertura?.trim() || null,
    estado: v.estado,
    rating: v.rating,
    hoja_vida: v.hoja_vida?.trim() || null,
    disponibilidad_notas: v.disponibilidad_notas?.trim() || null,
  };
}

// ---------- Tickets ----------

export async function listTicketsAction(
  filters: TicketFilters = {},
): Promise<{ data: TicketMantenimiento[]; error?: string }> {
  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { data: [], error: "No autenticado" };

  const ownerId = await resolveEffectiveOwnerId(supabase, user.id);

  const { data, error } = await supabase
    .from("tickets_mantenimiento")
    .select(TICKET_SELECT)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message.includes("does not exist")) {
      return {
        data: [],
        error: "Tablas de mantenimiento no encontradas. Ejecuta supabase/scripts/06_modulo_mantenimiento.sql",
      };
    }
    return { data: [], error: error.message };
  }

  const mapped = (data ?? []).map((r) =>
    mapTicketFromDb(r as unknown as TicketJoinRow),
  );
  return { data: filterTickets(mapped, filters) };
}

export async function getTicketAction(
  ticketId: string,
): Promise<{ data: TicketMantenimiento | null; error?: string }> {
  const supabase = await db();
  const ticket = await fetchTicketById(supabase, ticketId);
  if (!ticket) return { data: null, error: "Ticket no encontrado" };
  return { data: ticket };
}

export async function createTicketAction(
  input: TicketFormValues,
): Promise<{ data?: TicketMantenimiento; error?: string }> {
  const parsed = TicketFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { error: "No autenticado" };

  const ownerId = await resolveEffectiveOwnerId(supabase, user.id);
  const v = parsed.data;
  const codigo = await nextTicketCodigo(supabase, ownerId);

  const { data: inserted, error } = await supabase
    .from("tickets_mantenimiento")
    .insert({
      owner_id: ownerId,
      codigo,
      propiedad_id: v.propiedad_id,
      inquilino_id: v.inquilino_id || null,
      unidad: v.unidad?.trim() || null,
      tipo: v.tipo,
      urgencia: v.urgencia,
      estado: "nuevo",
      titulo: v.titulo.trim(),
      descripcion: v.descripcion.trim(),
      fecha_reporte: v.fecha_reporte,
      fecha_estimada_solucion: v.fecha_estimada_solucion || null,
      observaciones_internas: v.observaciones_internas?.trim() || null,
    } as never)
    .select("id")
    .single<{ id: string }>();

  if (error || !inserted) return { error: error?.message ?? "No se pudo crear el ticket" };

  await insertTicketHistorial(
    supabase,
    inserted.id,
    "creado",
    `Ticket ${codigo} creado`,
  );

  revalidateMantenimiento(inserted.id);
  const ticket = await fetchTicketById(supabase, inserted.id);
  return { data: ticket ?? undefined };
}

export async function updateTicketAction(
  ticketId: string,
  input: TicketFormValues,
): Promise<{ error?: string }> {
  const parsed = TicketFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await db();
  const v = parsed.data;

  const { error } = await supabase
    .from("tickets_mantenimiento")
    .update({
      propiedad_id: v.propiedad_id,
      inquilino_id: v.inquilino_id || null,
      unidad: v.unidad?.trim() || null,
      tipo: v.tipo,
      urgencia: v.urgencia,
      titulo: v.titulo.trim(),
      descripcion: v.descripcion.trim(),
      fecha_reporte: v.fecha_reporte,
      fecha_estimada_solucion: v.fecha_estimada_solucion || null,
      observaciones_internas: v.observaciones_internas?.trim() || null,
    } as never)
    .eq("id", ticketId);

  if (error) return { error: error.message };
  revalidateMantenimiento(ticketId);
  return {};
}

export async function changeTicketStatusAction(
  ticketId: string,
  estado: TicketEstado,
  observacion?: string | null,
  costo?: number | null,
): Promise<{ error?: string }> {
  const parsed = TicketStatusSchema.safeParse({ estado, observacion, costo });
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.costo?.[0] ?? "Datos de estado inválidos";
    return { error: msg };
  }

  const supabase = await db();
  const { data: current } = await supabase
    .from("tickets_mantenimiento")
    .select("estado, codigo, costo")
    .eq("id", ticketId)
    .single<{ estado: string; codigo: string; costo: number | null }>();

  if (!current) return { error: "Ticket no encontrado" };

  const v = parsed.data;
  const resolvedCosto = v.estado === "resuelto" ? (v.costo ?? current.costo) : undefined;

  if (v.estado === "resuelto" && (resolvedCosto == null || resolvedCosto <= 0)) {
    return { error: "Indica el costo de la reparación para marcar como resuelto" };
  }

  if (current.estado === v.estado && v.estado !== "resuelto") return {};

  const updatePayload: Record<string, unknown> = { estado: v.estado };
  if (v.estado === "resuelto" && resolvedCosto != null) {
    updatePayload.costo = resolvedCosto;
  }

  const { error } = await supabase
    .from("tickets_mantenimiento")
    .update(updatePayload as never)
    .eq("id", ticketId);

  if (error) return { error: error.message };

  const histTipo: TicketHistorialTipo =
    v.estado === "cerrado"
      ? "cerrado"
      : v.estado === "cancelado"
        ? "cancelado"
        : v.estado === "resuelto"
          ? "resuelto"
          : v.estado === "en_proceso"
            ? "trabajo_iniciado"
            : "estado";

  const prev = current.estado as TicketEstado;
  let desc =
    v.observacion?.trim() ||
    `Estado: ${getTicketEstadoLabel(prev)} → ${getTicketEstadoLabel(v.estado)}`;

  if (v.estado === "resuelto" && resolvedCosto != null) {
    const costoLabel = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(resolvedCosto);
    desc = v.observacion?.trim()
      ? `${desc} · Costo: ${costoLabel}`
      : `Resuelto · Costo: ${costoLabel}`;
  }

  await insertTicketHistorial(supabase, ticketId, histTipo, desc);
  revalidateMantenimiento(ticketId);
  return {};
}

export async function assignTicketAction(
  ticketId: string,
  input: AssignTicketFormValues,
): Promise<{ error?: string }> {
  const parsed = AssignTicketSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await db();
  const { manitas_id, fecha_atencion_estimada, observacion } = parsed.data;

  const { data: manitas } = await supabase
    .from("manitas")
    .select("nombres, apellidos, estado")
    .eq("id", manitas_id)
    .single<{ nombres: string; apellidos: string; estado: string }>();

  if (!manitas) return { error: "Manitas no encontrado" };
  if (!ASSIGNABLE_MANITAS_ESTADOS.includes(manitas.estado as never)) {
    return { error: "Solo se pueden asignar manitas disponibles u ocupados" };
  }

  const { error } = await supabase
    .from("tickets_mantenimiento")
    .update({
      manitas_id,
      estado: "asignado",
      fecha_atencion_estimada: fecha_atencion_estimada || null,
    } as never)
    .eq("id", ticketId);

  if (error) return { error: error.message };

  const nombre = manitasNombreCompleto(manitas);
  const desc = observacion?.trim()
    ? `Asignado a ${nombre}. ${observacion.trim()}`
    : `Asignado a ${nombre}`;

  await insertTicketHistorial(supabase, ticketId, "manitas_asignado", desc);

  if (manitas.estado === "disponible") {
    await supabase.from("manitas").update({ estado: "ocupado" } as never).eq("id", manitas_id);
  }

  revalidateMantenimiento(ticketId);
  return {};
}

export async function addTicketCommentAction(
  ticketId: string,
  contenido: string,
): Promise<{ error?: string }> {
  const parsed = TicketCommentSchema.safeParse({ contenido });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await db();
  const user = await getAuthUser(supabase);

  const { error } = await supabase.from("ticket_comentarios").insert({
    ticket_id: ticketId,
    autor_id: user?.id ?? null,
    contenido: parsed.data.contenido.trim(),
  } as never);

  if (error) return { error: error.message };

  await insertTicketHistorial(
    supabase,
    ticketId,
    "comentario",
    `Comentario: ${parsed.data.contenido.trim().slice(0, 120)}`,
  );

  revalidateMantenimiento(ticketId);
  return {};
}

export async function updateTicketPresupuestoAction(
  ticketId: string,
  input: { presupuesto?: number | null; factura?: number | null; presupuesto_notas?: string | null },
): Promise<{ error?: string }> {
  const parsed = TicketPresupuestoSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos" };

  const supabase = await db();
  const v = parsed.data;

  const payload: Record<string, unknown> = {
    presupuesto: v.presupuesto ?? null,
    factura: v.factura ?? null,
    presupuesto_notas: v.presupuesto_notas?.trim() || null,
  };

  const { error } = await supabase
    .from("tickets_mantenimiento")
    .update(payload as never)
    .eq("id", ticketId);

  if (error) return { error: error.message };

  if (v.presupuesto != null) {
    await insertTicketHistorial(
      supabase,
      ticketId,
      "presupuesto",
      `Presupuesto cargado: ${v.presupuesto} €`,
    );
  }

  revalidateMantenimiento(ticketId);
  return {};
}

export async function uploadTicketEvidenciaAction(
  ticketId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Archivo inválido" };

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local" };
  }

  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { error: "No autenticado" };

  const { data: ticket } = await supabase
    .from("tickets_mantenimiento")
    .select("owner_id")
    .eq("id", ticketId)
    .single<{ owner_id: string }>();

  if (!ticket) return { error: "Ticket no encontrado" };

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${user.id}/${ticketId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from(MANTENIMIENTO_STORAGE_BUCKET)
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { data: signed } = await admin.storage
    .from(MANTENIMIENTO_STORAGE_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  await supabase.from("ticket_evidencias").insert({
    ticket_id: ticketId,
    nombre_archivo: file.name,
    storage_path: path,
    url: signed?.signedUrl ?? null,
  } as never);

  revalidateMantenimiento(ticketId);
  return {};
}

// ---------- Manitas ----------

export async function listManitasAction(
  filters: ManitasFilters = {},
): Promise<{ data: Manitas[]; error?: string }> {
  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { data: [], error: "No autenticado" };

  const ownerId = await resolveEffectiveOwnerId(supabase, user.id);

  const { data, error } = await supabase
    .from("manitas")
    .select("*")
    .eq("owner_id", ownerId)
    .order("nombres");

  if (error) {
    if (error.message.includes("does not exist")) {
      return {
        data: [],
        error: "Tabla manitas no encontrada. Ejecuta supabase/scripts/06_modulo_mantenimiento.sql",
      };
    }
    return { data: [], error: error.message };
  }

  const rows = (data ?? []) as ManitasRow[];
  const withCounts = await Promise.all(
    rows.map(async (r) => {
      const counts = await countManitasTickets(supabase, r.id);
      return mapManitasFromDb(r, {
        asignados: counts.asignados,
        completados: counts.completados,
      });
    }),
  );

  return { data: filterManitas(withCounts, filters) };
}

export async function getManitasAction(
  manitasId: string,
): Promise<{ data: Manitas | null; error?: string }> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("manitas")
    .select("*")
    .eq("id", manitasId)
    .maybeSingle();

  if (error || !data) return { data: null, error: error?.message ?? "No encontrado" };

  const counts = await countManitasTickets(supabase, manitasId);
  const historial = await loadManitasHistorial(supabase, manitasId);
  return {
    data: mapManitasFromDb(data as ManitasRow, {
      asignados: counts.asignados,
      completados: counts.completados,
      historial,
    }),
  };
}

export async function createManitasAction(
  input: ManitasFormValues,
): Promise<{ data?: Manitas; error?: string }> {
  const parsed = ManitasFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { error: "No autenticado" };

  const ownerId = await resolveEffectiveOwnerId(supabase, user.id);
  const v = parsed.data;

  const { data, error } = await supabase
    .from("manitas")
    .insert({
      owner_id: ownerId,
      ...manitasPayload(v),
    } as never)
    .select("*")
    .single();

  if (error || !data) return { error: error?.message ?? "Error al crear" };

  revalidateManitas((data as { id: string }).id);
  return {
    data: mapManitasFromDb(data as ManitasRow, { asignados: 0, completados: 0, historial: [] }),
  };
}

export async function updateManitasAction(
  manitasId: string,
  input: ManitasFormValues,
): Promise<{ error?: string }> {
  const parsed = ManitasFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await db();
  const v = parsed.data;

  const { error } = await supabase
    .from("manitas")
    .update(manitasPayload(v) as never)
    .eq("id", manitasId);

  if (error) return { error: error.message };
  revalidateManitas(manitasId);
  return {};
}

export async function deleteManitasAction(manitasId: string): Promise<{ error?: string }> {
  const supabase = await db();

  const { count } = await supabase
    .from("tickets_mantenimiento")
    .select("id", { count: "exact", head: true })
    .eq("manitas_id", manitasId)
    .in("estado", ["asignado", "en_proceso"]);

  if ((count ?? 0) > 0) {
    return { error: "No se puede eliminar: tiene tickets activos asignados" };
  }

  const { error } = await supabase.from("manitas").delete().eq("id", manitasId);
  if (error) return { error: error.message };

  revalidateManitas(manitasId);
  return {};
}

export async function uploadManitasFotoAction(
  manitasId: string,
  formData: FormData,
): Promise<{ error?: string; foto_url?: string }> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Archivo inválido" };
  if (!file.type.startsWith("image/")) return { error: "Solo imágenes permitidas" };

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local" };
  }

  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { error: "No autenticado" };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/manitas/${manitasId}/avatar.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const admin = createAdminClient();

  const { error: uploadError } = await admin.storage
    .from(MANTENIMIENTO_STORAGE_BUCKET)
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { data: signed } = await admin.storage
    .from(MANTENIMIENTO_STORAGE_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  const foto_url = signed?.signedUrl ?? null;

  const { error } = await supabase
    .from("manitas")
    .update({ foto_url, foto_storage_path: path } as never)
    .eq("id", manitasId);

  if (error) return { error: error.message };
  revalidateManitas(manitasId);
  return { foto_url: foto_url ?? undefined };
}

export async function addManitasTrabajoAction(
  manitasId: string,
  input: ManitasTrabajoFormValues,
): Promise<{ error?: string }> {
  const parsed = ManitasTrabajoFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await db();
  const v = parsed.data;

  const { error } = await supabase.from("manitas_trabajos").insert({
    manitas_id: manitasId,
    titulo: v.titulo.trim(),
    descripcion: v.descripcion?.trim() || null,
    propiedad_nombre: v.propiedad_nombre?.trim() || null,
    fecha: v.fecha,
  } as never);

  if (error) return { error: error.message };
  revalidateManitas(manitasId);
  return {};
}

export async function deleteManitasTrabajoAction(
  manitasId: string,
  trabajoId: string,
): Promise<{ error?: string }> {
  const supabase = await db();
  const { error } = await supabase
    .from("manitas_trabajos")
    .delete()
    .eq("id", trabajoId)
    .eq("manitas_id", manitasId);

  if (error) return { error: error.message };
  revalidateManitas(manitasId);
  return {};
}

export async function listAssignableManitasAction(): Promise<{
  data: Manitas[];
  error?: string;
}> {
  const { data, error } = await listManitasAction();
  if (error) return { data: [], error };
  return {
    data: data.filter((m) => ASSIGNABLE_MANITAS_ESTADOS.includes(m.estado)),
  };
}
