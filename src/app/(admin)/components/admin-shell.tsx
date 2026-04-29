"use client";

import { useState } from "react";
import type { NavItem, Profile } from "@/shared";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

interface AdminShellProps {
  navItems: NavItem[];
  profile: Profile;
  children: React.ReactNode;
}

export function AdminShell({ navItems, profile, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        navItems={navItems}
        profile={profile}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        <AdminTopbar
          profile={profile}
          onMenuToggle={() => setMobileOpen((prev) => !prev)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
