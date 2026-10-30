"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, LogOut, FileText, CreditCard, Home } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

const NAV_LINKS = [
  { href: "/", label: "Về trang chủ", icon: Home },
  { href: "/invitation-management", label: "Quản lý thiệp mời", icon: FileText },
  { href: "/account-settings", label: "Cài đặt tài khoản", icon: Settings },
  // { href: "/orders", label: "Lịch sử đơn hàng", icon: CreditCard }, // Mở rộng sau
];

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
    <div className="flex min-h-screen flex-col bg-porcelain md:flex-row">
      {/* Sidebar Desktop & Mobile Topbar */}
      <aside className="w-full border-b border-line bg-white md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex h-full flex-col px-4 py-6">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div 
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold"
              style={{ backgroundColor: user.avatarBg }}
            >
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="truncate font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {NAV_LINKS.map((link) => {
              // Xử lý active riêng cho trang chủ (tránh việc trang chủ luôn active khi ở route khác)
              const isActive = link.href === "/" 
                ? pathname === "/" 
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
              
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none ${
                    isActive 
                      ? "bg-lacquer-soft text-lacquer" 
                      : "text-muted hover:bg-porcelain hover:text-ink"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="mt-8 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-porcelain hover:text-lacquer focus-visible:outline-none"
          >
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8">
        <div className="mx-auto max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}