"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

// Tab nằm cạnh logo (thêm mục mới vào đây, ví dụ { href: "/business", label: "Doanh nghiệp" })
const tabs = [{ href: "/professional", label: "Chuyên nghiệp" }];

// Menu nằm giữa header
const links = [
  { href: "/templates", label: "Mẫu thiệp" },
  { href: "/shop", label: "Cửa hàng" },
  { href: "/services", label: "Dịch vụ" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "Hỏi đáp" },
];

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(href + "/");

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Đóng menu mobile khi chuyển trang
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? "border-b border-line bg-white/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      {/* Desktop: 3 cột (trái | giữa | phải) để menu giữa luôn nằm chính giữa */}
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        {/* Trái: logo + tab dịch vụ */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold tracking-tight text-lacquer">
            iCards
          </Link>
          <span className="hidden h-5 w-px bg-line lg:block" aria-hidden="true" />
          <nav className="hidden items-center gap-2 lg:flex" aria-label="Dịch vụ">
            {tabs.map((t) => {
              const active = isActive(pathname, t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-lacquer text-white"
                      : "bg-lacquer-soft text-lacquer hover:bg-lacquer hover:text-white"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Giữa: menu chính */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Điều hướng chính">
          {links.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm font-medium transition-colors hover:text-ink ${
                  active ? "text-ink" : "text-muted"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Phải: tài khoản */}
        <div className="hidden items-center justify-end gap-3 lg:flex">
          {!loading && isAuthenticated ? (
            <Link
              href="/invitation-management"
              className="rounded-full bg-lacquer px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-lacquer-dark"
            >
              Xin chào, {user?.username ?? "bạn"}
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="px-3 py-2 text-sm font-medium text-ink hover:text-lacquer">
                Đăng nhập
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-lacquer px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(163,21,47,.6)] transition hover:bg-lacquer-dark"
              >
                Tạo thiệp miễn phí
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-line bg-white lg:hidden"
          >
            <div className="flex flex-col gap-1 p-5">
              {tabs.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="rounded-lg bg-lacquer-soft px-3 py-3 font-semibold text-lacquer"
                >
                  {t.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-line" aria-hidden="true" />
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-lg px-3 py-3 font-medium hover:bg-lacquer-soft">
                  {l.label}
                </Link>
              ))}
              <Link
                href="/sign-up"
                className="mt-2 rounded-full bg-lacquer px-5 py-3 text-center font-semibold text-white"
              >
                Tạo thiệp miễn phí
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}