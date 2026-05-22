"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import {
  GastoFormSchema,
  IngresoFormSchema,
  type GastoFormValues,
  type IngresoFormValues,
} from "@/shared/schemas/finanzas";
import { FINANZAS_STORAGE_BUCKET } from "@/modules/finanzas/constants";
import {
  mapMovimientoFromDb,
  type MovimientoJoinRow,
} from "@/modules/finanzas/utils/db-mapper";
import { filterMovimientos } from "@/modules/finanzas/utils/filters";
import { computeContabilidadTotales } from "@/modules/finanzas/utils/stats";
import {
  buildPagosInquilinosResumen,
  type ContratoPagosRow,
} from "@/modules/finanzas/utils/pagos-inquilinos";
import type {
  ContabilidadTotales,
  ContratoOption,
  MovimientoFilters,
  MovimientoFinanciero,
  PagosInquilinosResumen,
  TicketOption,
} from "@/modules/finanzas/types";

type DbClient = SupabaseClient<Database>;

/** ticket_id (no gasto_id inverso) evita ambigüedad con tickets_mantenimiento.gasto_id */
const MOVIMIENTO_SELECT = `
  *,
  propiedades ( titulo ),
  contratos ( codigo ),
  inquilinos ( nombres, apellidos ),
  tickets_mantenimiento!ticket_id ( codigo ),
  manitas ( nombres, apellidos )
`;

async function db(): Promise<DbClient> {
  return (await createClient()) as unknown as DbClient;
}

function revalidateFinanzas(propiedadId?: string) {
  revalidatePath("/dashboard/finanzas");
  if (propiedadId) {
    revalidatePath(`/dashboard/propiedades/${propiedadId}`);
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

function formToDbPayload(
  ownerId: string,
  values: IngresoFormValues | GastoFormValues,
): Record<string, unknown> {
  return {
    owner_id: ownerId,
    propiedad_id: values.propiedad_id,
    contrato_id: values.contrato_id || null,
    inquilino_id: values.inquilino_id || null,
    ticket_id: values.ticket_id || null,
    manitas_id: values.manitas_id || null,
    tipo: values.tipo,
    categoria: values.categoria,
    concepto: values.concepto.trim(),
    valor: values.valor,
    valor_esperado: values.valor_esperado ?? null,
    estado: values.estado,
    metodo_pago: values.metodo_pago || null,
    fecha_movimiento: values.fecha_movimiento,
    fecha_vencimiento: values.fecha_vencimiento || null,
    fecha_pago: values.estado === "pagado" || values.estado === "parcial" ? values.fecha_pago || null : null,
    mes_correspondiente: values.mes_correspondiente || null,
    observaciones: values.observaciones?.trim() || null,
  };
}

export async function listMovimientosAction(
  filters: MovimientoFilters = {},
): Promise<{ data: MovimientoFinanciero[]; totales: ContabilidadTotales; error?: string }> {
  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { data: [], totales: computeContabilidadTotales([]), error: "No autenticado" };

  let query = supabase
    .from("movimientos_financieros")
    .select(MOVIMIENTO_SELECT)
    .order("fecha_movimiento", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.propiedad_id) query = query.eq("propiedad_id", filters.propiedad_id);
  if (filters.tipo) query = query.eq("tipo", filters.tipo);
  if (filters.categoria) query = query.eq("categoria", filters.categoria);
  if (filters.estado) query = query.eq("estado", filters.estado);
  if (filters.inquilino_id) query = query.eq("inquilino_id", filters.inquilino_id);
  if (filters.metodo_pago) query = query.eq("metodo_pago", filters.metodo_pago);
  if (filters.fecha_desde) query = query.gte("fecha_movimiento", filters.fecha_desde);
  if (filters.fecha_hasta) query = query.lte("fecha_movimiento", filters.fecha_hasta);

  const { data, error } = await query;

  if (error) {
    if (error.message.includes("movimientos_financieros") || error.code === "42P01") {
      return {
        data: [],
        totales: computeContabilidadTotales([]),
        error: "Ejecuta supabase/scripts/10_modulo_finanzas.sql en Supabase.",
      };
    }
    return { data: [], totales: computeContabilidadTotales([]), error: error.message };
  }

  const mapped = (data ?? []).map((row) =>
    mapMovimientoFromDb(row as unknown as MovimientoJoinRow),
  );
  const filtered = filterMovimientos(mapped, {
    search: filters.search,
    solo_pagos_inquilinos: filters.solo_pagos_inquilinos,
  });

  return {
    data: filtered,
    totales: computeContabilidadTotales(filtered),
  };
}

export async function getMovimientoAction(
  id: string,
): Promise<{ data: MovimientoFinanciero | null; error?: string }> {
  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { data: null, error: "No autenticado" };

  const { data, error } = await supabase
    .from("movimientos_financieros")
    .select(MOVIMIENTO_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return { data: null, error: error?.message ?? "Movimiento no encontrado" };
  return { data: mapMovimientoFromDb(data as unknown as MovimientoJoinRow) };
}

export async function createIngresoAction(
  input: IngresoFormValues,
): Promise<{ data?: MovimientoFinanciero; error?: string }> {
  const parsed = IngresoFormSchema.safeParse(input);
  if (!parsed.success) {
    const msg = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: msg ?? "Datos inválidos" };
  }

  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { error: "No autenticado" };

  const ownerId = await resolveEffectiveOwnerId(supabase, user.id);
  const payload = formToDbPayload(ownerId, parsed.data);

  const { data, error } = await supabase
    .from("movimientos_financieros")
    .insert(payload as never)
    .select(MOVIMIENTO_SELECT)
    .single();

  if (error) return { error: error.message };

  revalidateFinanzas(parsed.data.propiedad_id);
  return { data: mapMovimientoFromDb(data as unknown as MovimientoJoinRow) };
}

export async function createGastoAction(
  input: GastoFormValues,
): Promise<{ data?: MovimientoFinanciero; error?: string }> {
  const parsed = GastoFormSchema.safeParse(input);
  if (!parsed.success) {
    const msg = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: msg ?? "Datos inválidos" };
  }

  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { error: "No autenticado" };

  const ownerId = await resolveEffectiveOwnerId(supabase, user.id);
  const payload = formToDbPayload(ownerId, parsed.data);

  const { data, error } = await supabase
    .from("movimientos_financieros")
    .insert(payload as never)
    .select(MOVIMIENTO_SELECT)
    .single();

  if (error) return { error: error.message };

  if (parsed.data.ticket_id) {
    await supabase
      .from("tickets_mantenimiento")
      .update({ gasto_id: (data as unknown as { id: string }).id } as never)
      .eq("id", parsed.data.ticket_id);
    revalidatePath("/dashboard/mantenimiento");
  }

  revalidateFinanzas(parsed.data.propiedad_id);
  return { data: mapMovimientoFromDb(data as unknown as MovimientoJoinRow) };
}

export async function updateIngresoAction(
  id: string,
  input: IngresoFormValues,
): Promise<{ error?: string }> {
  const parsed = IngresoFormSchema.safeParse(input);
  if (!parsed.success) {
    const msg = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: msg ?? "Datos inválidos" };
  }

  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { error: "No autenticado" };

  const ownerId = await resolveEffectiveOwnerId(supabase, user.id);
  const { error } = await supabase
    .from("movimientos_financieros")
    .update(formToDbPayload(ownerId, parsed.data) as never)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidateFinanzas(parsed.data.propiedad_id);
  return {};
}

export async function updateGastoAction(
  id: string,
  input: GastoFormValues,
): Promise<{ error?: string }> {
  const parsed = GastoFormSchema.safeParse(input);
  if (!parsed.success) {
    const msg = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: msg ?? "Datos inválidos" };
  }

  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { error: "No autenticado" };

  const ownerId = await resolveEffectiveOwnerId(supabase, user.id);
  const { error } = await supabase
    .from("movimientos_financieros")
    .update(formToDbPayload(ownerId, parsed.data) as never)
    .eq("id", id);

  if (error) return { error: error.message };

  if (parsed.data.ticket_id) {
    await supabase
      .from("tickets_mantenimiento")
      .update({ gasto_id: id } as never)
      .eq("id", parsed.data.ticket_id);
    revalidatePath("/dashboard/mantenimiento");
  }

  revalidateFinanzas(parsed.data.propiedad_id);
  return {};
}

export async function deleteMovimientoAction(id: string): Promise<{ error?: string }> {
  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { error: "No autenticado" };

  const { data: row } = await supabase
    .from("movimientos_financieros")
    .select("propiedad_id, comprobante_storage_path, ticket_id")
    .eq("id", id)
    .maybeSingle<{
      propiedad_id: string;
      comprobante_storage_path: string | null;
      ticket_id: string | null;
    }>();

  const { error } = await supabase.from("movimientos_financieros").delete().eq("id", id);
  if (error) return { error: error.message };

  if (row?.comprobante_storage_path) {
    await supabase.storage.from(FINANZAS_STORAGE_BUCKET).remove([row.comprobante_storage_path]);
  }
  if (row?.ticket_id) {
    await supabase
      .from("tickets_mantenimiento")
      .update({ gasto_id: null } as never)
      .eq("id", row.ticket_id);
  }

  revalidateFinanzas(row?.propiedad_id);
  return {};
}

export async function uploadMovimientoComprobanteAction(
  movimientoId: string,
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { error: "No autenticado" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Archivo no válido" };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const path = `${user.id}/movimientos/${movimientoId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(FINANZAS_STORAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { data: signed } = await supabase.storage
    .from(FINANZAS_STORAGE_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  const url = signed?.signedUrl ?? null;

  await supabase
    .from("movimientos_financieros")
    .update({
      comprobante_storage_path: path,
      comprobante_url: url,
    } as never)
    .eq("id", movimientoId);

  revalidateFinanzas();
  return { url: url ?? undefined };
}

export async function listContratosForFinanzasAction(
  propiedadId?: string,
): Promise<{ data: ContratoOption[]; error?: string }> {
  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { data: [], error: "No autenticado" };

  let query = supabase
    .from("contratos")
    .select("id, codigo, propiedad_id, inquilino_id, valor_mensual, inquilinos ( nombres, apellidos )")
    .in("estado", ["activo", "firmado"])
    .order("codigo");

  if (propiedadId) query = query.eq("propiedad_id", propiedadId);

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };

  type Row = {
    id: string;
    codigo: string;
    propiedad_id: string;
    inquilino_id: string;
    valor_mensual: number;
    inquilinos: { nombres: string; apellidos: string } | null;
  };

  return {
    data: ((data ?? []) as unknown as Row[]).map((r) => ({
      id: r.id,
      codigo: r.codigo,
      propiedad_id: r.propiedad_id,
      inquilino_id: r.inquilino_id,
      inquilino_nombre: r.inquilinos
        ? `${r.inquilinos.nombres} ${r.inquilinos.apellidos}`.trim()
        : "—",
      valor_mensual: Number(r.valor_mensual),
    })),
  };
}

export async function listTicketsForFinanzasAction(
  propiedadId?: string,
): Promise<{ data: TicketOption[]; error?: string }> {
  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { data: [], error: "No autenticado" };

  let query = supabase
    .from("tickets_mantenimiento")
    .select("id, codigo, propiedad_id, titulo, costo, manitas_id, gasto_id")
    .in("estado", ["resuelto", "cerrado", "en_proceso"])
    .is("gasto_id", null)
    .order("fecha_reporte", { ascending: false });

  if (propiedadId) query = query.eq("propiedad_id", propiedadId);

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };

  return {
    data: (data ?? []) as TicketOption[],
  };
}

export async function listPagosInquilinosAction(
  propiedadId?: string,
): Promise<{ data: PagosInquilinosResumen; error?: string }> {
  const empty: PagosInquilinosResumen = {
    contratos: [],
    total_contratos: 0,
    al_dia: 0,
    en_mora: 0,
    parcial: 0,
  };

  const supabase = await db();
  const user = await getAuthUser(supabase);
  if (!user) return { data: empty, error: "No autenticado" };

  let contratosQuery = supabase
    .from("contratos")
    .select(
      `
      id, codigo, propiedad_id, inquilino_id, fecha_inicio, fecha_fin, valor_mensual, dia_pago,
      propiedades ( titulo ),
      inquilinos ( nombres, apellidos )
    `,
    )
    .eq("estado", "activo")
    .order("codigo");

  if (propiedadId) contratosQuery = contratosQuery.eq("propiedad_id", propiedadId);

  const { data: contratosRaw, error: cErr } = await contratosQuery;
  if (cErr) {
    return { data: empty, error: cErr.message };
  }

  type ContratoDbRow = {
    id: string;
    codigo: string;
    propiedad_id: string;
    inquilino_id: string;
    fecha_inicio: string;
    fecha_fin: string;
    valor_mensual: number;
    dia_pago: number;
    propiedades: { titulo: string } | null;
    inquilinos: { nombres: string; apellidos: string } | null;
  };

  const contratos: ContratoPagosRow[] = ((contratosRaw ?? []) as unknown as ContratoDbRow[]).map(
    (r) => ({
      id: r.id,
      codigo: r.codigo,
      propiedad_id: r.propiedad_id,
      propiedad_nombre: r.propiedades?.titulo ?? "—",
      inquilino_id: r.inquilino_id,
      inquilino_nombre: r.inquilinos
        ? `${r.inquilinos.nombres} ${r.inquilinos.apellidos}`.trim()
        : "—",
      fecha_inicio: r.fecha_inicio,
      fecha_fin: r.fecha_fin,
      valor_mensual: Number(r.valor_mensual),
      dia_pago: r.dia_pago,
    }),
  );

  if (contratos.length === 0) {
    return { data: empty };
  }

  const contratoIds = new Set(contratos.map((c) => c.id));
  const propiedadIds = [...new Set(contratos.map((c) => c.propiedad_id))];

  let movQuery = supabase
    .from("movimientos_financieros")
    .select(MOVIMIENTO_SELECT)
    .eq("tipo", "ingreso")
    .in("categoria", ["pago_arriendo", "penalizacion_mora"])
    .in("propiedad_id", propiedadId ? [propiedadId] : propiedadIds);

  const { data: movRaw, error: mErr } = await movQuery;
  if (mErr) return { data: empty, error: mErr.message };

  const movimientos = (movRaw ?? [])
    .map((row) => mapMovimientoFromDb(row as unknown as MovimientoJoinRow))
    .filter((mov) => {
      if (mov.contrato_id && contratoIds.has(mov.contrato_id)) return true;
      return contratos.some(
        (c) => c.propiedad_id === mov.propiedad_id && c.inquilino_id === mov.inquilino_id,
      );
    });

  return { data: buildPagosInquilinosResumen(contratos, movimientos) };
}
