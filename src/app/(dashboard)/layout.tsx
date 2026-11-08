"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-porcelain">
        <p className="text-muted">Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  return (
    <DashboardShell user={{ name: user.name, email: user.email, avatarBg: user.avatarBg }} pathname={pathname} onLogout={logout}>
      {children}
    </DashboardShell>
  );
}
