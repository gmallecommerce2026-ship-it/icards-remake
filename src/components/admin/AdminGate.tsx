"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { LayoutDashboard, LogOut, FileText, Users, Image as ImageIcon, Menu as MenuIcon, ShoppingBag, Newspaper, LayoutTemplate, Mail } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

const NAV = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/invitations", label: "Thiệp mời", icon: FileText },
  { href: "/admin/templates", label: "Thiết kế mẫu", icon: LayoutTemplate },
  { href: "/admin/envelopes", label: "Phong bì", icon: Mail },
  { href: "/admin/banners", label: "Banner", icon: ImageIcon },
  { href: "/admin/menu", label: "Menu", icon: MenuIcon },
  { href: "/admin/shop", label: "Cửa hàng & Dịch vụ", icon: ShoppingBag },
  { href: "/admin/news", label: "Tin tức", icon: Newspaper },
];

/** Chỉ tài khoản role=admin mới vào được khu quản trị. Trang đăng nhập được hiển thị trần, không có thanh điều hướng. */
export function AdminGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const isLogin = pathname === "/admin/login";
  const isAdmin = !!user && user.role === "admin";

  useEffect(() => {
    if (loading) return;
    if (isLogin && isAdmin) router.replace("/admin");
    if (!isLogin && !isAdmin) router.replace("/admin/login");
  }, [loading, isLogin, isAdmin, router]);

  if (isLogin) return <>{children}</>;
  if (loading || !isAdmin) {
    return <div className="grid min-h-screen place-items-center bg-[#F6F8FB] text-sm text-[#5B6B7F]">Đang kiểm tra quyền truy cập…</div>;
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#0E1B2C] md:flex">
      <aside className="border-b border-[#D9E1EC] bg-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-4 md:block md:py-6">
          <div>
            <p className="text-lg font-bold">iCards Admin</p>
            <p className="mt-0.5 text-xs text-[#5B6B7F]">{user?.name || user?.email}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.replace("/admin/login");
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#27548A] hover:underline md:mt-4"
          >
            <LogOut className="size-4" aria-hidden /> Đăng xuất
          </button>
        </div>
        <nav aria-label="Quản trị" className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:px-3 md:pb-0">
          {NAV.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-[#27548A] text-white" : "text-[#0E1B2C] hover:bg-[#EEF3F9]"
                }`}
              >
                <Icon className="size-4" aria-hidden /> {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
    </div>
  );
}
