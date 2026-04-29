"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/shared";

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
