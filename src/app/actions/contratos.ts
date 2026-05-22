"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import {
  ContractFormSchema,
  ContractTemplateSchema,
  type ContractFormValues,
  type ContractTemplateFormValues,
} from "@/shared/schemas/contrato";
import type {
  Contract,
  ContractFilters,
  ContractHistorialTipo,
  ContractTemplate,
  SignatureRole,
  TemplateFormInput,
} from "@/modules/contratos/types";
import {
  mapContractFromDb,
  mapFirmaFromDb,
  mapHistorialFromDb,
  mapTemplateFromDb,
  type ContratoJoinRow,
} from "@/modules/contratos/utils/db-mapper";
import { filterContracts } from "@/modules/contratos/utils/filters";
import {
  ensureContractContent,
  renderContractContent,
} from "@/modules/contratos/utils/template-engine";
import { DEFAULT_PLANTILLA_HTML } from "@/modules/contratos/utils/defaults";
import { createSeedTemplates } from "@/modules/contratos/data/seed-templates";

type DbClient = SupabaseClient<Database>;

const CONTRATO_LIST_SELECT = `
  *,
  contrato_tipos ( nombre ),
  propiedades ( titulo, direccion, ciudad ),
  inquilinos ( nombres, apellidos, numero_documento )
`;

async function db(): Promise<DbClient> {
  return (await createClient()) as unknown as DbClient;
}

function revalidateContratos(id?: string) {
  revalidatePath("/dashboard/contratos");
  revalidatePath("/dashboard/contratos/tipos");
  if (id) revalidatePath(`/dashboard/contratos/${id}`);
}

async function getAuthUser(supabase: DbClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function resolveEffectiveOwnerId(
  supabase: DbClient,
  userId: string,
): Promise<string> {
  const { data: link } = await supabase
    .from("gestor_propietario")
    .select("propietario_id")
    .eq("gestor_id", userId)
    .limit(1)
    .maybeSingle<{ propietario_id: string }>();

  return link?.propietario_id ?? userId;
}

async function resolveOwnerIdFromPropiedad(
  supabase: DbClient,
  propiedadId: string,
): Promise<{ ownerId?: string; error?: string }> {
  const { data: prop } = await supabase
    .from("propiedades")
    .select("owner_id, estado")
    .eq("id", propiedadId)
    .single<{ owner_id: string; estado: string }>();

  if (!prop) return { error: "Propiedad no encontrada" };
  if (prop.estado === "inactiva") {
    return { error: "No se puede usar una propiedad inactiva" };
  }
  return { ownerId: prop.owner_id };
}

async function insertHistorial(
  supabase: DbClient,
  contratoId: string,
  tipo: ContractHistorialTipo,
  descripcion: string,
) {
  await supabase.from("contrato_historial").insert({
    contrato_id: contratoId,
    tipo,
    descripcion,
  } as never);
}

async function insertDefaultFirmas(supabase: DbClient, contratoId: string) {
  await supabase.from("contrato_firmas").insert([
    { contrato_id: contratoId, rol: "administrador", estado: "pendiente", firmante_nombre: "" },
    { contrato_id: contratoId, rol: "inquilino", estado: "pendiente", firmante_nombre: "" },
  ] as never);
}

async function loadContractRelations(
  supabase: DbClient,
  contratoId: string,
): Promise<{ firmas: ReturnType<typeof mapFirmaFromDb>[]; historial: ReturnType<typeof mapHistorialFromDb>[] }> {
  const [firmasRes, histRes] = await Promise.all([
    supabase.from("contrato_firmas").select("*").eq("contrato_id", contratoId).order("rol"),
    supabase
      .from("contrato_historial")
      .select("*")
      .eq("contrato_id", contratoId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    firmas: (firmasRes.data ?? []).map((r) => mapFirmaFromDb(r as Record<string, unknown>)),
    historial: (histRes.data ?? []).map((r) => mapHistorialFromDb(r as Record<string, unknown>)),
  };
}

async function getFullContract(
  supabase: DbClient,
  contratoId: string,
): Promise<Contract | null> {
  const { data, error } = await supabase
    .from("contratos")
    .select(CONTRATO_LIST_SELECT)
    .eq("id", contratoId)
    .maybeSingle();

  if (error || !data) return null;

  const rel = await loadContractRelations(supabase, contratoId);
  const mapped = mapContractFromDb(data as unknown as ContratoJoinRow, rel.firmas, rel.historial);
  const contract = ensureContractContent(mapped);

  if (!mapped.contenido_generado?.trim() && contract.contenido_generado?.trim()) {
    await supabase
      .from("contratos")
      .update({ contenido_generado: contract.contenido_generado } as never)
      .eq("id", contratoId);
  }

  return contract;
}

async function nextCodigo(supabase: DbClient, ownerId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CTR-${year}-`;

  const { data } = await supabase
    .from("contratos")
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

async function ensureDefaultTemplates(
  supabase: DbClient,
  ownerId: string,
): Promise<void> {
  const { count } = await supabase
    .from("contrato_tipos")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId);

  if ((count ?? 0) > 0) return;

  const seeds = createSeedTemplates();
  await supabase.from("contrato_tipos").insert(
    seeds.map((t) => ({
      owner_id: ownerId,
      nombre: t.nombre,
      descripcion: t.descripcion,
      plantilla_html: t.plantilla_html,
      activo: true,
    })) as never,
  );
}

async function hasActiveContractOnProperty(
  supabase: DbClient,
  propiedadId: string,
  excludeId?: string,
): Promise<boolean> {
  let query = supabase
    .from("contratos")
    .select("id")
    .eq("propiedad_id", propiedadId)
    .eq("estado", "activo");

  if (excludeId) query = query.neq("id", excludeId);

  const { data } = await query;
  return (data?.length ?? 0) > 0;
}

async function activateContractSideEffects(
  supabase: DbClient,
  contract: Contract,
): Promise<string | undefined> {
  const { error: propErr } = await supabase
    .from("propiedades")
    .update({ estado: "alquilada" } as never)
    .eq("id", contract.propiedad_id);

  if (propErr) return `Propiedad: ${propErr.message}`;

  const { error: inqErr } = await supabase
    .from("inquilinos")
    .update({
      status: "activo",
      propiedad_id: contract.propiedad_id,
      unidad_id: contract.unidad?.trim() || null,
      unidad_nombre: contract.unidad?.trim() || null,
      fecha_ingreso: contract.fecha_inicio,
      canon_mensual: contract.valor_mensual,
      deposito: contract.deposito,
    } as never)
    .eq("id", contract.inquilino_id);

  if (inqErr) return `Inquilino: ${inqErr.message}`;

  await supabase.from("inquilino_historial").insert({
    inquilino_id: contract.inquilino_id,
    tipo: "contrato",
    descripcion: `Contrato ${contract.codigo} activado`,
  } as never);

  revalidatePath("/dashboard/propiedades");
  revalidatePath("/dashboard/inquilinos");
  revalidatePath(`/dashboard/inquilinos/${contract.inquilino_id}`);

  return undefined;
}

// ---------- Plantillas ----------

export async function listContratoTiposAction(activeOnly = false): Promise<{
  data: ContractTemplate[];
  error?: string;
}> {
  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { data: [], error: "No autenticado" };

  const effectiveOwner = await resolveEffectiveOwnerId(supabase, user.id);
  await ensureDefaultTemplates(supabase, effectiveOwner);

  let query = supabase
    .from("contrato_tipos")
    .select("*")
    .eq("owner_id", effectiveOwner)
    .order("nombre");

  if (activeOnly) query = query.eq("activo", true);

  const { data, error } = await query;
  if (error) {
    if (error.message.includes("contrato_tipos")) {
      return {
        data: [],
        error: "Ejecuta la migración de contratos (05_modulo_contratos.sql) en Supabase.",
      };
    }
    return { data: [], error: error.message };
  }

  return { data: (data ?? []).map((r) => mapTemplateFromDb(r as Record<string, unknown>)) };
}

export async function getContratoTipoAction(id: string): Promise<{
  data: ContractTemplate | null;
  error?: string;
}> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("contrato_tipos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: "Plantilla no encontrada" };

  return { data: mapTemplateFromDb(data as Record<string, unknown>) };
}

export async function createContratoTipoAction(
  input: TemplateFormInput,
): Promise<{ data: ContractTemplate | null; error?: string }> {
  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { data: null, error: "No autenticado" };

  const parsed = ContractTemplateSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const ownerId = await resolveEffectiveOwnerId(supabase, user.id);

  const { data, error } = await supabase
    .from("contrato_tipos")
    .insert({
      owner_id: ownerId,
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion,
      plantilla_html: parsed.data.plantilla_html || DEFAULT_PLANTILLA_HTML,
      activo: parsed.data.activo ?? true,
    } as never)
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };

  revalidateContratos();
  return { data: mapTemplateFromDb(data as Record<string, unknown>) };
}

export async function updateContratoTipoAction(
  id: string,
  input: Partial<ContractTemplateFormValues>,
): Promise<{ data: ContractTemplate | null; error?: string }> {
  const supabase = await db();
  const payload: Record<string, unknown> = {};
  if (input.nombre != null) payload.nombre = input.nombre;
  if (input.descripcion != null) payload.descripcion = input.descripcion;
  if (input.plantilla_html != null) payload.plantilla_html = input.plantilla_html;
  if (input.activo != null) payload.activo = input.activo;

  const { data, error } = await supabase
    .from("contrato_tipos")
    .update(payload as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };

  revalidateContratos();
  return { data: mapTemplateFromDb(data as Record<string, unknown>) };
}

export async function toggleContratoTipoActiveAction(
  id: string,
): Promise<{ data: ContractTemplate | null; error?: string }> {
  const { data: current } = await getContratoTipoAction(id);
  if (!current) return { data: null, error: "Plantilla no encontrada" };
  return updateContratoTipoAction(id, { activo: !current.activo });
}

// ---------- Contratos ----------

export async function listContratosAction(
  filters: ContractFilters = {},
): Promise<{ data: Contract[]; error?: string }> {
  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { data: [], error: "No autenticado" };

  let query = supabase
    .from("contratos")
    .select(CONTRATO_LIST_SELECT)
    .order("created_at", { ascending: false });

  if (filters.estado) query = query.eq("estado", filters.estado);
  if (filters.propiedad_id) query = query.eq("propiedad_id", filters.propiedad_id);
  if (filters.inquilino_id) query = query.eq("inquilino_id", filters.inquilino_id);
  if (filters.tipo_contrato_id) query = query.eq("tipo_contrato_id", filters.tipo_contrato_id);

  const { data, error } = await query;

  if (error) {
    if (error.message.includes("contratos") || error.code === "42P01") {
      return {
        data: [],
        error: "Ejecuta la migración de contratos (05_modulo_contratos.sql) en Supabase.",
      };
    }
    return { data: [], error: error.message };
  }

  const items: Contract[] = [];
  for (const row of data ?? []) {
    const rel = await loadContractRelations(
      supabase,
      (row as unknown as ContratoJoinRow).id,
    );
    const mapped = mapContractFromDb(row as unknown as ContratoJoinRow, rel.firmas, rel.historial);
    items.push(ensureContractContent(mapped));
  }

  return { data: filterContracts(items, filters) };
}

export async function getContratoAction(id: string): Promise<{
  data: Contract | null;
  error?: string;
}> {
  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { data: null, error: "No autenticado" };

  const contract = await getFullContract(supabase, id);
  if (!contract) return { data: null, error: "Contrato no encontrado" };
  return { data: contract };
}

export async function getOccupiedPropertyIdsAction(): Promise<{
  data: string[];
  error?: string;
}> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("contratos")
    .select("propiedad_id")
    .eq("estado", "activo");

  if (error) return { data: [], error: error.message };
  return {
    data: [...new Set((data ?? []).map((r) => (r as { propiedad_id: string }).propiedad_id))],
  };
}

async function buildContractPayload(
  supabase: DbClient,
  values: ContractFormValues,
  ownerId: string,
  codigo: string,
) {
  const { data: tipo } = await supabase
    .from("contrato_tipos")
    .select("*")
    .eq("id", values.tipo_contrato_id)
    .single();

  if (!tipo) return { error: "Tipo de contrato no encontrado" };
  const tpl = mapTemplateFromDb(tipo as Record<string, unknown>);
  if (!tpl.activo) return { error: "El tipo de contrato está desactivado" };

  const { data: prop } = await supabase
    .from("propiedades")
    .select("titulo, direccion, ciudad")
    .eq("id", values.propiedad_id)
    .single();

  const { data: inq } = await supabase
    .from("inquilinos")
    .select("nombres, apellidos, numero_documento")
    .eq("id", values.inquilino_id)
    .single();

  if (!prop || !inq) return { error: "Propiedad o inquilino no encontrado" };

  const draft = {
    codigo,
    tipo_contrato_id: values.tipo_contrato_id,
    propiedad_id: values.propiedad_id,
    inquilino_id: values.inquilino_id,
    unidad: values.unidad?.trim() || null,
    fecha_inicio: values.fecha_inicio,
    fecha_fin: values.fecha_fin,
    valor_mensual: values.valor_mensual,
    deposito: values.deposito,
    dia_pago: values.dia_pago,
    observaciones: values.observaciones?.trim() || null,
    plantilla_html: tpl.plantilla_html,
    propiedad_nombre: (prop as { titulo: string }).titulo,
    propiedad_direccion: [(prop as { direccion: string }).direccion, (prop as { ciudad: string }).ciudad]
      .filter(Boolean)
      .join(", "),
    inquilino_nombre: `${(inq as { nombres: string }).nombres} ${(inq as { apellidos: string }).apellidos}`.trim(),
    inquilino_documento: (inq as { numero_documento: string }).numero_documento,
    tipo_contrato_nombre: tpl.nombre,
  };

  const contenido_generado = renderContractContent(tpl.plantilla_html, {
    codigo,
    propiedad_nombre: draft.propiedad_nombre,
    propiedad_direccion: draft.propiedad_direccion,
    unidad: draft.unidad,
    inquilino_nombre: draft.inquilino_nombre,
    inquilino_documento: draft.inquilino_documento,
    fecha_inicio: values.fecha_inicio,
    fecha_fin: values.fecha_fin,
    valor_mensual: values.valor_mensual,
    deposito: values.deposito,
    dia_pago: values.dia_pago,
  });

  const insert = {
      owner_id: ownerId,
      codigo,
      tipo_contrato_id: values.tipo_contrato_id,
      propiedad_id: values.propiedad_id,
      inquilino_id: values.inquilino_id,
      unidad: draft.unidad,
      fecha_inicio: values.fecha_inicio,
      fecha_fin: values.fecha_fin,
      valor_mensual: values.valor_mensual,
      deposito: values.deposito,
      dia_pago: values.dia_pago,
      observaciones: draft.observaciones,
      plantilla_html: tpl.plantilla_html,
      contenido_generado,
      estado: "borrador",
    };

  return { ownerId, insert };
}

export async function createContratoAction(
  input: ContractFormValues,
): Promise<{ data: Contract | null; error?: string }> {
  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { data: null, error: "No autenticado" };

  const parsed = ContractFormSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { ownerId, error: ownerErr } = await resolveOwnerIdFromPropiedad(
    supabase,
    parsed.data.propiedad_id,
  );
  if (ownerErr || !ownerId) return { data: null, error: ownerErr ?? "Sin permisos" };

  if (await hasActiveContractOnProperty(supabase, parsed.data.propiedad_id)) {
    return { data: null, error: "Esta propiedad ya tiene un contrato activo" };
  }

  const codigo = await nextCodigo(supabase, ownerId);
  const built = await buildContractPayload(supabase, parsed.data, ownerId, codigo);
  if ("error" in built && built.error) return { data: null, error: built.error };
  if (!("insert" in built) || !built.insert) {
    return { data: null, error: "Error al preparar el contrato" };
  }

  const { data: inserted, error } = await supabase
    .from("contratos")
    .insert(built.insert as never)
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("idx_contratos_propiedad_activo")) {
      return { data: null, error: "Esta propiedad ya tiene un contrato activo" };
    }
    return { data: null, error: error.message };
  }

  const id = (inserted as { id: string }).id;
  await insertDefaultFirmas(supabase, id);
  await insertHistorial(supabase, id, "creado", `Contrato ${codigo} creado en borrador`);

  revalidateContratos(id);
  return getContratoAction(id);
}

export async function updateContratoAction(
  id: string,
  input: ContractFormValues,
): Promise<{ data: Contract | null; error?: string }> {
  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { data: null, error: "No autenticado" };

  const current = await getFullContract(supabase, id);
  if (!current) return { data: null, error: "Contrato no encontrado" };
  if (["activo", "finalizado", "cancelado"].includes(current.estado)) {
    return { data: null, error: "No se puede editar un contrato en este estado" };
  }

  const parsed = ContractFormSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  if (
    parsed.data.propiedad_id !== current.propiedad_id &&
    (await hasActiveContractOnProperty(supabase, parsed.data.propiedad_id, id))
  ) {
    return { data: null, error: "Esta propiedad ya tiene un contrato activo" };
  }

  const { data: row } = await supabase
    .from("contratos")
    .select("owner_id, codigo")
    .eq("id", id)
    .single<{ owner_id: string; codigo: string }>();

  if (!row) return { data: null, error: "Contrato no encontrado" };

  const built = await buildContractPayload(supabase, parsed.data, row.owner_id, row.codigo);
  if ("error" in built && built.error) return { data: null, error: built.error };
  if (!("insert" in built) || !built.insert) {
    return { data: null, error: "Error al preparar" };
  }

  const ins = built.insert;
  const { error } = await supabase
    .from("contratos")
    .update({
      tipo_contrato_id: ins.tipo_contrato_id,
      propiedad_id: ins.propiedad_id,
      inquilino_id: ins.inquilino_id,
      unidad: ins.unidad,
      fecha_inicio: ins.fecha_inicio,
      fecha_fin: ins.fecha_fin,
      valor_mensual: ins.valor_mensual,
      deposito: ins.deposito,
      dia_pago: ins.dia_pago,
      observaciones: ins.observaciones,
      plantilla_html: ins.plantilla_html,
      contenido_generado: ins.contenido_generado,
    } as never)
    .eq("id", id);

  if (error) return { data: null, error: error.message };

  await insertHistorial(supabase, id, "editado", "Datos del contrato actualizados");
  revalidateContratos(id);
  return getContratoAction(id);
}

export async function sendContratoToSignatureAction(
  id: string,
): Promise<{ data: Contract | null; error?: string }> {
  const supabase = await db();
  const current = await getFullContract(supabase, id);
  if (!current) return { data: null, error: "Contrato no encontrado" };
  if (current.estado !== "borrador") {
    return { data: null, error: "Solo los borradores pueden enviarse a firma" };
  }

  const { error } = await supabase
    .from("contratos")
    .update({ estado: "pendiente_firma" } as never)
    .eq("id", id);

  if (error) return { data: null, error: error.message };

  await insertHistorial(supabase, id, "editado", "Contrato enviado a firma");
  revalidateContratos(id);
  return getContratoAction(id);
}

export async function signContratoAction(
  id: string,
  rol: SignatureRole,
  firmanteNombre: string,
): Promise<{ data: Contract | null; error?: string; activated?: boolean }> {
  if (!firmanteNombre.trim()) return { data: null, error: "Indica el nombre del firmante" };

  const supabase = await db();
  const current = await getFullContract(supabase, id);
  if (!current) return { data: null, error: "Contrato no encontrado" };
  if (!["pendiente_firma", "firmado"].includes(current.estado)) {
    return { data: null, error: "El contrato debe estar pendiente de firma" };
  }

  const { error: firmaErr } = await supabase
    .from("contrato_firmas")
    .update({
      firmante_nombre: firmanteNombre.trim(),
      fecha_firma: new Date().toISOString(),
      estado: "firmado",
    } as never)
    .eq("contrato_id", id)
    .eq("rol", rol);

  if (firmaErr) return { data: null, error: firmaErr.message };

  await insertHistorial(
    supabase,
    id,
    rol === "administrador" ? "firma_admin" : "firma_inquilino",
    `Firma ${rol}: ${firmanteNombre.trim()}`,
  );

  const updated = await getFullContract(supabase, id);
  if (!updated) return { data: null, error: "Error al recargar" };

  const allSigned = updated.firmas.every((f) => f.estado === "firmado");
  if (!allSigned) {
    revalidateContratos(id);
    return { data: updated };
  }

  await supabase.from("contratos").update({ estado: "firmado" } as never).eq("id", id);
  await insertHistorial(supabase, id, "editado", "Ambas partes han firmado");

  return activateContratoAction(id);
}

export async function activateContratoAction(
  id: string,
): Promise<{ data: Contract | null; error?: string; activated?: boolean }> {
  const supabase = await db();
  const current = await getFullContract(supabase, id);
  if (!current) return { data: null, error: "Contrato no encontrado" };

  if (!current.firmas.every((f) => f.estado === "firmado")) {
    return { data: null, error: "No se puede activar sin las dos firmas" };
  }

  if (await hasActiveContractOnProperty(supabase, current.propiedad_id, id)) {
    return { data: null, error: "La propiedad ya tiene otro contrato activo" };
  }

  const { error } = await supabase
    .from("contratos")
    .update({ estado: "activo" } as never)
    .eq("id", id);

  if (error) {
    if (error.message.includes("idx_contratos_propiedad_activo")) {
      return { data: null, error: "La propiedad ya tiene otro contrato activo" };
    }
    return { data: null, error: error.message };
  }

  await insertHistorial(
    supabase,
    id,
    "activado",
    "Contrato activado — propiedad ocupada e inquilino activo",
  );

  const activated = await getFullContract(supabase, id);
  if (!activated) return { data: null, error: "Error al recargar" };

  const sideEffectWarn = await activateContractSideEffects(supabase, activated);

  revalidateContratos(id);
  return {
    data: activated,
    activated: true,
    error: sideEffectWarn,
  };
}

export async function finalizeContratoAction(
  id: string,
): Promise<{ data: Contract | null; error?: string }> {
  const supabase = await db();
  const current = await getFullContract(supabase, id);
  if (!current) return { data: null, error: "Contrato no encontrado" };
  if (current.estado !== "activo") {
    return { data: null, error: "Solo contratos activos pueden finalizarse" };
  }

  const { error } = await supabase
    .from("contratos")
    .update({ estado: "finalizado" } as never)
    .eq("id", id);

  if (error) return { data: null, error: error.message };

  await insertHistorial(supabase, id, "finalizado", "Contrato finalizado");
  revalidateContratos(id);
  return getContratoAction(id);
}

export async function cancelContratoAction(
  id: string,
): Promise<{ data: Contract | null; error?: string }> {
  const supabase = await db();
  const current = await getFullContract(supabase, id);
  if (!current) return { data: null, error: "Contrato no encontrado" };
  if (current.estado === "activo") {
    return { data: null, error: "Finaliza el contrato antes de cancelar uno activo" };
  }

  const { error } = await supabase
    .from("contratos")
    .update({ estado: "cancelado" } as never)
    .eq("id", id);

  if (error) return { data: null, error: error.message };

  await insertHistorial(supabase, id, "cancelado", "Contrato cancelado");
  revalidateContratos(id);
  return getContratoAction(id);
}
