"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logoRentyva from "@/assets/logo-rentyva.png";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, FileText, Users, Wrench,
  TrendingUp, BarChart3, CreditCard, MessageCircle,
  X, ChevronDown,
} from "lucide-react";
import type { NavItem, Profile } from "@/shared";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Building2, FileText, Users, Wrench,
  TrendingUp, BarChart3, CreditCard, MessageCircle,
};

function getHref(href: string) {
  return href === "/dashboard" ? "/dashboard" : `/dashboard${href}`;
}

// ── Componente extraído a nivel de módulo para evitar remounts ──
interface SidebarInnerProps {
  navItems: NavItem[];
  profile: Profile;
  isCollapsed: boolean;
  showCloseButton: boolean;
  openItems: Set<string>;
  pathname: string;
  onToggleSubmenu: (href: string) => void;
  onClose?: () => void;
}

function SidebarInner({
  navItems, profile, isCollapsed, showCloseButton,
  openItems, pathname, onToggleSubmenu, onClose,
}: SidebarInnerProps) {
  /** Ítem raíz sin hijos: activo en su ruta y subrutas */
  const isLeafItemActive = (item: NavItem): boolean => {
    const href = getHref(item.href);
    if (pathname === href) return true;
    if (href === "/dashboard") return false;
    return pathname.startsWith(href + "/");
  };

  /**
   * Hijo activo: solo el submenú que mejor coincide con la ruta actual.
   * Evita marcar el padre y otro hermano a la vez (ej. Tickets vs Manitas).
   */
  const isChildActive = (childHref: string, siblings: { href: string }[]) => {
    const href = getHref(childHref);
    const matches = (ch: string) => pathname === ch || pathname.startsWith(ch + "/");
    if (!matches(href)) return false;

    const bestMatch = siblings
      .map((c) => getHref(c.href))
      .filter((ch) => matches(ch))
      .sort((a, b) => b.length - a.length)[0];

    return bestMatch === href;
  };

  const hasActiveChild = (item: NavItem) =>
    item.children?.some((c) => isChildActive(c.href, item.children!)) ?? false;

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className={`flex items-center border-b border-gray-100 flex-shrink-0 h-16 ${
        isCollapsed ? "justify-center px-2" : "justify-between px-4"
      }`}>
        {isCollapsed ? (
          <Image src={logoRentyva} alt="Rentyva" width={0} height={0} sizes="160px" className="h-8 w-auto" />
        ) : (
          <Link href="/dashboard" className="flex items-center min-w-0">
            <Image src={logoRentyva} alt="Rentyva" width={0} height={0} sizes="160px" className="h-8 w-auto" />
          </Link>
        )}
        {showCloseButton && onClose && (
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className={`flex-1 py-4 overflow-y-auto overflow-x-hidden ${
        isCollapsed ? "px-2 space-y-1" : "px-3 space-y-0.5"
      }`}>
        {navItems.map((item) => {
          const href = getHref(item.href);
          const active = isLeafItemActive(item);
          const IconComponent = ICON_MAP[item.icon] ?? LayoutDashboard;
          const hasChildren = !!item.children?.length;
          const isOpen = openItems.has(item.href);
          const childActive = hasActiveChild(item);

          // Colapsado + con hijos → icono + popout hover (padre sin highlight)
          if (isCollapsed && hasChildren) {
            return (
              <div key={item.href} className="relative group/nav">
                <Link href={href} prefetch={true} className="flex items-center justify-center w-10 h-10 rounded-lg mx-auto transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                  <IconComponent size={18} strokeWidth={2} />
                </Link>
                <div className="absolute left-full top-0 ml-2 hidden group-hover/nav:block z-50 min-w-[200px]">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 ml-1">
                    <p className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                      {item.label}
                    </p>
                    {item.children!.map((child) => (
                      <Link key={child.href} href={getHref(child.href)} prefetch={true} onClick={onClose}
                        className={`flex items-center px-3 py-2 text-sm transition-colors ${
                          isChildActive(child.href, item.children!) ? "text-green-700 bg-green-50 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          // Colapsado + sin hijos → icono + tooltip hover
          if (isCollapsed) {
            return (
              <div key={item.href} className="relative group/nav">
                <Link href={href} prefetch={true} className={`flex items-center justify-center w-10 h-10 rounded-lg mx-auto transition-colors ${
                  active ? "bg-green-50 text-green-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}>
                  <IconComponent size={18} strokeWidth={active ? 2.5 : 2} />
                </Link>
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover/nav:block z-50 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                    {item.label}
                  </div>
                </div>
              </div>
            );
          }

          // Expandido + con hijos → accordion (padre neutro; solo el hijo activo se resalta)
          if (hasChildren) {
            return (
              <div key={item.href}>
                <button
                  type="button"
                  onClick={() => onToggleSubmenu(item.href)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  <IconComponent
                    size={18}
                    strokeWidth={2}
                    className={`flex-shrink-0 ${childActive ? "text-green-500" : "text-gray-400 group-hover:text-gray-600"}`}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={14}
                    className={`flex-shrink-0 transition-transform duration-200 text-gray-400 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="mt-0.5 ml-7 pl-3 border-l-2 border-gray-100 space-y-0.5 pb-1">
                    {item.children!.map((child) => {
                      const childIsActive = isChildActive(child.href, item.children!);
                      return (
                        <Link
                          key={child.href}
                          href={getHref(child.href)}
                          prefetch={true}
                          onClick={onClose}
                          aria-current={childIsActive ? "page" : undefined}
                          className={`flex items-center py-2 px-2 rounded-lg text-sm transition-colors ${
                            childIsActive
                              ? "text-green-700 font-semibold bg-green-50"
                              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Expandido + sin hijos → link simple
          return (
            <Link key={item.href} href={href} prefetch={true} onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group ${
                active ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}>
              <IconComponent size={18} strokeWidth={active ? 2.5 : 2}
                className={`flex-shrink-0 ${active ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Versión */}
      <div className={`flex-shrink-0 pb-4 ${isCollapsed ? "flex justify-center" : "px-5"}`}>
        {isCollapsed ? (
          <span className="text-[10px] text-gray-300 font-mono">v0.1</span>
        ) : (
          <span className="text-[11px] text-gray-300 font-mono">v0.1.0</span>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──
interface AdminSidebarProps {
  navItems: NavItem[];
  profile: Profile;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({
  navItems, profile, collapsed, onToggleCollapse, mobileOpen = false, onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleSubmenu = (href: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      next.has(href) ? next.delete(href) : next.add(href);
      return next;
    });
  };

  // Auto-abrir submenu del item activo al cambiar ruta
  useEffect(() => {
    navItems.forEach((item) => {
      if (!item.children) return;
      const href = getHref(item.href);
      const childMatch = item.children.some((c) => {
        const ch = getHref(c.href);
        const matches = (p: string, h: string) => p === h || p.startsWith(h + "/");
        if (!matches(pathname, ch)) return false;
        const best = item
          .children!.map((x) => getHref(x.href))
          .filter((h) => matches(pathname, h))
          .sort((a, b) => b.length - a.length)[0];
        return best === ch;
      });
      if (childMatch) {
        setOpenItems((prev) => new Set([...prev, item.href]));
      }
    });
  }, [pathname, navItems]);

  // Cerrar submenús al colapsar
  useEffect(() => {
    if (collapsed) setOpenItems(new Set());
  }, [collapsed]);

  return (
    <>
      {/* Desktop: sidebar fijo con transición de ancho */}
      <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-30 transition-all duration-300 overflow-hidden ${
        collapsed ? "w-16" : "w-64"
      }`}>
        <SidebarInner
          navItems={navItems}
          profile={profile}
          isCollapsed={collapsed}
          showCloseButton={false}
          openItems={openItems}
          pathname={pathname}
          onToggleSubmenu={toggleSubmenu}
          onClose={onClose}
        />
      </aside>

      {/* Mobile: overlay + drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 lg:hidden flex flex-col">
            <SidebarInner
              navItems={navItems}
              profile={profile}
              isCollapsed={false}
              showCloseButton={true}
              openItems={openItems}
              pathname={pathname}
              onToggleSubmenu={toggleSubmenu}
              onClose={onClose}
            />
          </aside>
        </>
      )}
    </>
  );
}
