"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import logoRentyva from "@/assets/logo-rentyva.png";

const NAV_LINKS = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Para quién", href: "#perfiles" },
  { label: "Tipos de alquiler", href: "#tipos-alquiler" },
  { label: "Precios", href: "#precios" },
];

export function StickyHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm transition-shadow duration-200 ${
        scrolled || menuOpen
          ? "border-b border-gray-200 shadow-sm"
          : "border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <Image src={logoRentyva} alt="Rentyva" width={0} height={0} sizes="200px" className="h-12 w-auto" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-gray-600 transition-colors hover:[color:#09b850]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Iniciar sesión
          </a>
          <a
            href="/registro"
            className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90 hover:shadow-md"
            style={{ backgroundColor: "#09b850" }}
          >
            Empezar gratis
          </a>
        </div>

        {/* Mobile: CTA + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <a
            href="/registro"
            className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ backgroundColor: "#09b850" }}
          >
            Empezar gratis
          </a>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menú"
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-sm px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={closeMenu}
              className="py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border-b border-gray-50 last:border-0 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/login"
            onClick={closeMenu}
            className="mt-2 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Iniciar sesión
          </a>
        </div>
      )}
    </header>
  );
}
