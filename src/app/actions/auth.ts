"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/shared";

const ROLES_WEB: UserRole[] = ["propietario", "gestor", "inquilino"];

function mapAuthError(message: string): string {
  if (message === "Invalid login credentials") {
    return "Email o contraseña incorrectos";
  }
  if (
    message.includes("fetch failed") ||
    message.includes("Failed to fetch") ||
    message.includes("ENOTFOUND") ||
    message.includes("getaddrinfo")
  ) {
    return "No se puede conectar con Supabase. Comprueba que el proyecto esté activo en el dashboard y que NEXT_PUBLIC_SUPABASE_URL en .env.local sea correcto.";
  }
  return message || "Error al iniciar sesión. Inténtalo de nuevo.";
}

export async function signInAction(
  email: string,
  password: string,
): Promise<{ error: string } | void> {
  const supabase = await createClient();

  let authData: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["data"];
  let error: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["error"];

  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    authData = result.data;
    error = result.error;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al iniciar sesión";
    return { error: mapAuthError(message) };
  }

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  let destination = "/dashboard";
  const userId = authData.user?.id;

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", userId)
      .single<{ rol: UserRole }>();

    if (profile?.rol && !ROLES_WEB.includes(profile.rol)) {
      destination = "/mi-portal";
    }
  }

  redirect(destination);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signUpAdminAction(
  email: string,
  password: string,
  rol: UserRole,
  nombre?: string,
  apellidos?: string,
  telefono?: string,
  pais_codigo?: string,
): Promise<{ error?: string }> {
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { rol, nombre, apellidos, telefono, pais_codigo: pais_codigo ?? "ES" },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      return { error: "Este email ya está registrado" };
    }
    return { error: "Error al crear la cuenta. Inténtalo de nuevo." };
  }

  return {};
}
