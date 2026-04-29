import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rentyva — Gestión integral de propiedades en España",
  description:
    "La plataforma SaaS para propietarios y gestores que simplifica contratos, cobros automáticos, mantenimiento e IA para predecir impagos. Prueba gratis.",
  openGraph: {
    title: "Rentyva — Gestión integral de propiedades en España",
    description:
      "Contratos, cobros, mantenimiento y scoring de inquilinos con IA. Todo en un solo lugar.",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rentyva — Gestión integral de propiedades",
    description:
      "Contratos, cobros, mantenimiento y scoring de inquilinos con IA.",
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
