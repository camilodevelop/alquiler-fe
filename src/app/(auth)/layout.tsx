"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import logoVerde from "@/assets/logo-verde.png";
import logoBlanco from "@/assets/logo-blanco.png";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logoSize = pathname === "/login" ? "w-64" : "w-44";
  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — imagen + branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden sticky top-0 h-screen">
        {/* Foto de fondo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80"
          alt="Apartamento moderno"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay degradado verde-oscuro */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-green-800/60 to-green-950/90" />

        {/* Contenido encima */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full">

          {/* Copy central */}
          <div>
            <Image
              src={logoBlanco}
              alt="Rentyva"
              width={0}
              height={0}
              sizes="280px"
              className="w-72 h-auto mb-24 mt-8 block"
            />
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Gestiona tus propiedades<br />con total confianza
            </h2>
            <p className="text-green-100 text-lg mb-10 leading-relaxed max-w-md">
              Contratos digitales, cobros automáticos, mantenimiento e IA para predecir impagos — todo en una sola plataforma.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "500+", label: "Propietarios activos" },
                { value: "3.200+", label: "Propiedades gestionadas" },
                { value: "€2.1M", label: "Rentas gestionadas" },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-green-100 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer legal */}
          <p className="text-xs text-green-200/60">
            © 2025 Rentyva · Hecho en España 🇪🇸
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 bg-white overflow-y-auto">
        {/* Logo visible solo en móvil */}
        <div className="lg:hidden mb-8">
          <Image suppressHydrationWarning src={logoVerde} alt="Rentyva" width={0} height={0} sizes="260px" className={`h-auto mx-auto ${logoSize}`} />
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center">
          Al usar Rentyva aceptas nuestros{" "}
          <a href="/terminos" className="underline hover:text-gray-600">Términos</a> y{" "}
          <a href="/privacidad" className="underline hover:text-gray-600">Política de privacidad</a>.
        </p>
      </div>
    </div>
  );
}
