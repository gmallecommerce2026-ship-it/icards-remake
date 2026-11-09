"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { FileText, Home, LogOut, Settings } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { useUiTheme } from "@/components/ui/useUiTheme";

export type ShellUser = { name: string; email: string; avatarBg: string };

const NAV = [
  { href: "/", label: "Về trang chủ", icon: Home },
  { href: ROUTES.invitationManagement, label: "Quản lý thiệp mời", icon: FileText },
  { href: "/account-settings", label: "Cài đặt tài khoản", icon: Settings },
];

type Props = { user: ShellUser; pathname: string; onLogout: () => void; children: ReactNode };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/* ================================================================== */
/*  1 · THIỆP GIẤY: thanh trên serif, menu ngang có gạch chân, nội dung rộng  */
/* ================================================================== */
function Shell1({ user, pathname, onLogout, children }: Props) {
  return (
    <div className="tone-blue min-h-screen bg-white text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-5 lg:px-8">
          <Link href="/" className="font-display text-2xl font-medium">iCards</Link>
          <nav className="flex flex-wrap gap-7 text-sm">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={isActive(pathname, n.href) ? "page" : undefined}
                className={`pb-1 ${isActive(pathname, n.href) ? "border-b border-lacquer font-semibold text-lacquer" : "text-muted hover:text-ink"}`}>{n.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-5 text-sm">
            <span className="text-muted">{user.name}</span>
            <button type="button" onClick={onLogout} className="text-muted underline underline-offset-4 hover:text-lacquer">Đăng xuất</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-14 lg:px-8">{children}</main>
    </div>
  );
}

/* ================================================================== */
/*  2 · TỐI GIẢN: thanh bên hẹp, chữ thường, vạch đen cho mục đang chọn  */
/* ================================================================== */
function Shell2({ user, pathname, onLogout, children }: Props) {
  return (
    <div className="flex min-h-screen bg-white text-ink">
      <aside className="hidden w-56 shrink-0 border-r border-line md:flex md:flex-col">
        <div className="px-6 pb-10 pt-10">
          <p className="font-semibold">{user.name}</p>
          <p className="mt-1 truncate text-xs text-muted">{user.email}</p>
        </div>
        <nav className="flex-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(pathname, n.href) ? "page" : undefined}
              className={`block border-l-2 px-6 py-3 text-sm ${isActive(pathname, n.href) ? "border-ink font-semibold" : "border-transparent text-muted hover:text-ink"}`}>{n.label}</Link>
          ))}
        </nav>
        <button type="button" onClick={onLogout} className="px-6 py-6 text-left text-sm text-muted hover:text-ink">Đăng xuất</button>
      </aside>
      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 md:hidden">
          <span className="font-semibold">iCards</span>
          <button type="button" onClick={onLogout} className="text-sm text-muted">Đăng xuất</button>
        </div>
        <main className="mx-auto max-w-4xl px-6 py-12 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  3 · HIỆN ĐẠI: thanh bên tối màu, mục chọn là ô sáng, nền sáng cho nội dung  */
/* ================================================================== */
function Shell3({ user, pathname, onLogout, children }: Props) {
  return (
    <div className="flex min-h-screen bg-porcelain text-ink">
      <aside className="hidden w-64 shrink-0 flex-col bg-ink p-5 text-white md:flex">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span className="grid size-10 place-items-center rounded-lg font-bold text-white" style={{ backgroundColor: user.avatarBg }}>{user.name.charAt(0)}</span>
          <span className="min-w-0"><span className="block truncate text-sm font-semibold">{user.name}</span><span className="block truncate text-xs text-white/50">{user.email}</span></span>
        </div>
        <nav className="mt-8 flex-1 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const on = isActive(pathname, n.href);
            return (
              <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${on ? "bg-lacquer text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <Icon className="size-5" />{n.label}
              </Link>
            );
          })}
        </nav>
        <button type="button" onClick={onLogout} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <LogOut className="size-5" />Đăng xuất
        </button>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between bg-ink px-5 py-4 text-white md:hidden">
          <span className="font-semibold">iCards</span>
          <button type="button" onClick={onLogout} className="text-sm text-white/70">Đăng xuất</button>
        </div>
        <main className="mx-auto max-w-5xl p-5 sm:p-10">{children}</main>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  4 · BOHO ẤM: menu viên thuốc căn giữa, thanh trên mềm, nội dung hẹp  */
/* ================================================================== */
function Shell4({ user, pathname, onLogout, children }: Props) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="px-5 pt-8 text-center">
        <Link href="/" className="font-display text-3xl italic">iCards</Link>
        <nav className="mt-6 flex flex-wrap justify-center gap-2">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(pathname, n.href) ? "page" : undefined}
              className={`rounded-sm border px-5 py-2 text-sm transition-colors ${isActive(pathname, n.href) ? "border-lacquer bg-lacquer text-white" : "border-ink/15 bg-white hover:border-lacquer"}`}>{n.label}</Link>
          ))}
        </nav>
        <p className="mt-6 text-sm text-muted">{user.name} · <button type="button" onClick={onLogout} className="underline underline-offset-4 hover:text-lacquer">Đăng xuất</button></p>
      </header>
      <main className="mx-auto max-w-4xl px-5 pb-20 pt-12">{children}</main>
    </div>
  );
}

/* ================================================================== */
/*  5 · CỔ ĐIỂN: thanh bên xanh đêm, đường vàng, chữ serif                 */
/* ================================================================== */
function Shell5({ user, pathname, onLogout, children }: Props) {
  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <aside className="hidden w-64 shrink-0 flex-col bg-lacquer px-7 py-10 text-white md:flex">
        <p className="font-display text-2xl">iCards</p>
        <span className="my-6 block h-px w-12 bg-gold" aria-hidden />
        <p className="font-display text-lg">{user.name}</p>
        <p className="mt-1 truncate text-xs text-white/60">{user.email}</p>
        <nav className="mt-12 flex-1 space-y-5">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(pathname, n.href) ? "page" : undefined}
              className={`block font-display text-lg transition-colors ${isActive(pathname, n.href) ? "text-gold" : "text-white/75 hover:text-white"}`}>{n.label}</Link>
          ))}
        </nav>
        <button type="button" onClick={onLogout} className="text-left font-display text-base text-white/60 hover:text-white">Đăng xuất</button>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between bg-lacquer px-5 py-4 text-white md:hidden">
          <span className="font-display text-xl">iCards</span>
          <button type="button" onClick={onLogout} className="text-sm text-white/70">Đăng xuất</button>
        </div>
        <main className="mx-auto max-w-4xl px-6 py-14 lg:px-12">{children}</main>
      </div>
    </div>
  );
}

const SHELLS: Record<string, (p: Props) => React.ReactElement> = { "1": Shell1, "2": Shell2, "3": Shell3, "4": Shell4, "5": Shell5 };

export function DashboardShell(props: Props) {
  const theme = useUiTheme();
  const Shell = SHELLS[theme] ?? Shell1;
  return <Shell {...props} />;
}
