import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WEB_NAV_ITEMS } from "@/shared";
import type { Profile } from "@/shared";
import { AdminShell } from "./components/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  if (!profile) redirect("/login");

  const ROLES_PERMITIDOS: string[] = ["propietario", "gestor", "inquilino"];
  if (!ROLES_PERMITIDOS.includes(profile.rol)) redirect("/login");

  // Filtrar items de navegación según el rol del usuario
  const navItems = WEB_NAV_ITEMS.filter((item) =>
    item.roles.includes(profile.rol)
  );

  return (
    <AdminShell navItems={navItems} profile={profile}>
      {children}
    </AdminShell>
  );
}
