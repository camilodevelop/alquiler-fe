"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import {
  PropiedadFormSchema,
  type PropiedadFormValues,
} from "@/shared/schemas/propiedad";
import { STORAGE_BUCKET } from "@/modules/propiedades/constants";
import { formValuesToDbPayload } from "@/modules/propiedades/utils/defaults";
import {
  buildFotoStoragePath,
  getContentType,
  getFileExtension,
  mapStorageError,
} from "@/modules/propiedades/utils/upload-foto";
import type { Propiedad, PropiedadFilters } from "@/modules/propiedades/types";
type DbClient = SupabaseClient<Database>;

async function db(): Promise<DbClient> {
  return (await createClient()) as unknown as DbClient;
}

function revalidatePropiedades() {
  revalidatePath("/dashboard/propiedades");
}

export async function listPropiedadesAction(
  filters: PropiedadFilters = {},
): Promise<{ data: Propiedad[]; error?: string }> {
  const supabase = await db();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [], error: "No autenticado" };

  let query = supabase
    .from("propiedades")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.ciudad?.trim()) {
    query = query.ilike("ciudad", filters.ciudad.trim());
  }
  if (filters.estado) query = query.eq("estado", filters.estado);
  if (filters.tipo_renta) query = query.eq("tipo_renta", filters.tipo_renta);
  if (filters.tipo_propiedad) query = query.eq("tipo_propiedad", filters.tipo_propiedad);

  const { data, error } = await query;

  if (error) {
    return { data: [], error: "No se pudieron cargar las propiedades" };
  }

  let items = (data ?? []) as Propiedad[];

  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.titulo.toLowerCase().includes(q) ||
        p.direccion.toLowerCase().includes(q) ||
        p.ciudad.toLowerCase().includes(q),
    );
  }

  return { data: items };
}

export async function listPropiedadesCiudadesAction(): Promise<{
  data: string[];
  error?: string;
}> {
  const supabase = await db();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [], error: "No autenticado" };

  const { data, error } = await supabase
    .from("propiedades")
    .select("ciudad")
    .order("ciudad");

  if (error) {
    return { data: [], error: "No se pudieron cargar las ciudades" };
  }

  const ciudades = [
    ...new Set(
      (data ?? [])
        .map((row) => (row as { ciudad: string }).ciudad?.trim())
        .filter((c): c is string => Boolean(c)),
    ),
  ].sort((a, b) => a.localeCompare(b, "es"));

  return { data: ciudades };
}

export async function getPropiedadAction(
  id: string,
): Promise<{ data: Propiedad | null; error?: string }> {
  const supabase = await db();

  const { data, error } = await supabase
    .from("propiedades")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { data: null, error: "Propiedad no encontrada" };
  }

  return { data: data as Propiedad };
}

export async function createPropiedadAction(
  values: PropiedadFormValues,
): Promise<{ data: Propiedad | null; error?: string }> {
  const parsed = PropiedadFormSchema.safeParse(values);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await db();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("pais_codigo")
    .eq("id", user.id)
    .single<{ pais_codigo: string }>();

  const payload = formValuesToDbPayload(
    parsed.data,
    user.id,
    profile?.pais_codigo ?? "ES",
  );

  const { data, error } = await supabase
    .from("propiedades")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return { data: null, error: "No se pudo crear la propiedad" };
  }

  revalidatePropiedades();
  return { data: data as Propiedad };
}

export async function updatePropiedadAction(
  id: string,
  values: PropiedadFormValues,
): Promise<{ data: Propiedad | null; error?: string }> {
  const parsed = PropiedadFormSchema.safeParse(values);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await db();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "No autenticado" };

  const { habitaciones, banos, metros_cuadrados, duracion_minima_dias, ...rest } =
    parsed.data;

  const { data, error } = await supabase
    .from("propiedades")
    .update({
      ...rest,
      descripcion: rest.descripcion?.trim() || null,
      habitaciones: habitaciones ?? 0,
      banos: banos ?? 1,
      metros_cuadrados: metros_cuadrados ?? null,
      duracion_minima_dias: duracion_minima_dias ?? null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return { data: null, error: "No se pudo actualizar la propiedad" };
  }

  revalidatePropiedades();
  revalidatePath(`/dashboard/propiedades/${id}`);
  return { data: data as Propiedad };
}

export async function deletePropiedadAction(
  id: string,
): Promise<{ error?: string }> {
  const supabase = await db();

  const { error } = await supabase.from("propiedades").delete().eq("id", id);

  if (error) {
    return { error: "No se pudo eliminar la propiedad" };
  }

  revalidatePropiedades();
  return {};
}

async function userCanUploadFoto(
  supabase: DbClient,
  userId: string,
  ownerId: string,
): Promise<boolean> {
  if (userId === ownerId) return true;

  const { data } = await supabase
    .from("gestor_propietario")
    .select("gestor_id")
    .eq("gestor_id", userId)
    .eq("propietario_id", ownerId)
    .maybeSingle();

  return !!data;
}

/** Sube la foto en el servidor (evita timeouts del navegador → Storage). */
export async function uploadFotoPropiedadAction(
  propiedadId: string,
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen" };
  }

  const ext = getFileExtension(file);
  const contentType = getContentType(file, ext);

  if (!contentType.startsWith("image/")) {
    return { error: "El archivo debe ser una imagen (JPG, PNG o WebP)" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "La imagen no puede superar 5 MB" };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      error:
        "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local (Settings → API → service_role en Supabase).",
    };
  }

  const supabase = await db();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado. Vuelve a iniciar sesión." };
  }

  const { data: propiedad, error: propError } = await supabase
    .from("propiedades")
    .select("owner_id")
    .eq("id", propiedadId)
    .single<{ owner_id: string }>();

  if (propError || !propiedad) {
    return { error: "Propiedad no encontrada" };
  }

  const allowed = await userCanUploadFoto(supabase, user.id, propiedad.owner_id);
  if (!allowed) {
    return { error: "No tienes permiso para subir fotos a esta propiedad" };
  }

  const path = buildFotoStoragePath(propiedad.owner_id, propiedadId, ext);
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();

  const { error: uploadError } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, {
      upsert: true,
      contentType,
      cacheControl: "3600",
    });

  if (uploadError) {
    return { error: mapStorageError(uploadError.message) };
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  const publicUrlWithVersion = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("propiedades")
    .update({ foto_principal_url: publicUrlWithVersion })
    .eq("id", propiedadId);

  if (updateError) {
    const msg = updateError.message ?? "";
    if (msg.includes("foto_principal_url") || msg.includes("column")) {
      return {
        error:
          "Falta la columna foto_principal_url. Ejecuta 02_solo_modulo_propiedades.sql en Supabase.",
      };
    }
    return { error: "No se pudo guardar la URL de la foto en la propiedad" };
  }

  revalidatePropiedades();
  revalidatePath(`/dashboard/propiedades/${propiedadId}`);
  return { url: publicUrlWithVersion };
}
