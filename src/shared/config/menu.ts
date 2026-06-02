import type { UserRole } from "../types";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
  children?: { label: string; href: string }[];
}

export const WEB_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["propietario", "gestor"] },
  { label: "Propiedades", href: "/propiedades", icon: "Building2", roles: ["propietario", "gestor"] },
  { label: "Inquilinos", href: "/inquilinos", icon: "Users", roles: ["propietario", "gestor"] },
  { label: "Contratos", href: "/contratos", icon: "FileText", roles: ["propietario", "gestor"] },
  {
    label: "Mantenimiento", href: "/mantenimiento", icon: "Wrench", roles: ["propietario", "gestor"],
    children: [
      { label: "Tickets", href: "/mantenimiento" },
      { label: "Manitas", href: "/mantenimiento/maestros" },
    ],
  },
  { label: "Contabilidad", href: "/finanzas", icon: "TrendingUp", roles: ["propietario", "gestor"] },
  { label: "Informes", href: "/informes", icon: "BarChart3", roles: ["propietario", "gestor"] },
  { label: "Calculadora", href: "/calculadora", icon: "Calculator", roles: ["propietario", "gestor", "inquilino", "manitas", "agente"] },
  // inquilino
  { label: "Mi contrato", href: "/mi-contrato", icon: "FileText", roles: ["inquilino"] },
  { label: "Mis pagos", href: "/mis-pagos", icon: "CreditCard", roles: ["inquilino"] },
  {
    label: "Mantenimiento", href: "/mantenimiento", icon: "Wrench", roles: ["inquilino"],
    children: [
      { label: "Tickets", href: "/mantenimiento" },
    ],
  },
  { label: "Mensajes", href: "/mensajes", icon: "MessageCircle", roles: ["inquilino"] },
];
