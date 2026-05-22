import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Rentyva — Gestión integral de propiedades",
    template: "%s | Rentyva",
  },
  description:
    "Plataforma SaaS para gestionar propiedades en alquiler: contratos, pagos, mantenimiento y más.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://alquiler.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      {/* suppressHydrationWarning: extensiones del navegador (p. ej. cz-shortcut-listen) modifican <body> */}
      <body className={geist.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
