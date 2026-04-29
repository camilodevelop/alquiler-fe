"use client";

import { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu, ChevronRight, ChevronDown, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/shared";
import { signOutAction } from "@/app/actions/auth";

const BREADCRUMB_MAP: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/propiedades": "Propiedades",
  "/dashboard/contratos": "Contratos",
  "/dashboard/inquilinos": "Inquilinos",
  "/dashboard/mantenimiento": "Mantenimiento",
  "/dashboard/finanzas": "Finanzas",
  "/dashboard/invitaciones": "Invitaciones",
  "/dashboard/mi-contrato": "Mi Contrato",
  "/dashboard/mis-pagos": "Mis Pagos",
  "/dashboard/mensajes": "Mensajes",
};

interface AdminTopbarProps {
  profile: Profile;
  onMenuToggle: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminTopbar({ profile, onMenuToggle, collapsed, onToggleCollapse }: AdminTopbarProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const avatarInitial = (profile.nombre ?? profile.email).charAt(0).toUpperCase();
  const displayName = profile.nombre
    ? [profile.nombre, profile.apellidos].filter(Boolean).join(" ")
    : profile.email;

  const currentLabel = BREADCRUMB_MAP[pathname] ?? "Panel";

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm h-16 flex items-center px-6 gap-4">

      {/* Izquierda: hamburguesa + breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 -ml-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <Menu size={20} />
          </button>
        )}

        <nav className="flex items-center gap-1.5 text-sm min-w-0">
          <span className="text-gray-400 font-medium hidden sm:inline">Admin</span>
          <ChevronRight size={14} className="text-gray-300 hidden sm:inline flex-shrink-0" />
          <span className="text-gray-700 font-semibold truncate">{currentLabel}</span>
        </nav>
      </div>

      {/* Derecha: notificaciones + usuario */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="w-px h-8 bg-gray-200" />

        {/* Usuario con desplegable */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-brand-700">{avatarInitial}</span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[140px] truncate">
              {displayName}
            </span>
            <ChevronDown
              size={15}
              className={`text-gray-400 hidden sm:block transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
              <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{profile.email}</p>
              </div>

              <Link
                href="/dashboard/cuenta"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User size={16} className="text-gray-400" />
                Mi cuenta
              </Link>

              <Link
                href="/dashboard/configuracion"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings size={16} className="text-gray-400" />
                Configuración
              </Link>

              <div className="border-t border-gray-100 mt-1 pt-1">
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} className="text-red-400" />
                    Cerrar sesión
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
