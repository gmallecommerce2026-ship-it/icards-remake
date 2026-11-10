"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Menu, Search, X } from "lucide-react";
import type { BlogCategory } from "@/lib/blog";

/** Header riêng của blog: nút về trang chủ, chuyên mục, tìm kiếm và lối vào mẫu thiệp. */
export function BlogHeader({ categories }: { categories: BlogCategory[] }) {
  const sp = useSearchParams();
  const current = sp.get("category") ?? "";
  const [open, setOpen] = useState(false);

  const items = [{ slug: "", label: "Tất cả" }, ...categories];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 lg:h-[72px] lg:gap-8">
        {/* Nút về trang chủ */}
        <Link
          href="/"
          className="inline-flex h-10 shrink-0 items-center gap-2 border border-line px-3.5 text-sm font-semibold text-ink transition-colors hover:border-lacquer hover:text-lacquer"
        >
          <ArrowLeft className="size-4" aria-hidden />
          <span className="hidden sm:inline">Trang chủ</span>
        </Link>

        {/* Logo blog */}
        <Link href="/blog" className="flex shrink-0 items-center gap-2.5">
          <span aria-hidden className="grid size-9 place-items-center bg-lacquer text-base font-bold text-white">i</span>
          <span className="leading-none">
            <span className="block text-base font-bold tracking-tight">iCards</span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-lacquer">Blog</span>
          </span>
        </Link>

        {/* Chuyên mục trên máy tính */}
        <nav aria-label="Chuyên mục" className="hidden flex-1 items-center gap-1 overflow-x-auto lg:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((c) => {
            const on = current === c.slug;
            return (
              <Link
                key={c.slug || "all"}
                href={c.slug ? `/blog?category=${c.slug}` : "/blog"}
                aria-current={on ? "page" : undefined}
                className={`relative flex h-[72px] shrink-0 items-center px-3 text-sm font-medium transition-colors ${on ? "text-lacquer" : "text-muted hover:text-ink"}`}
              >
                {c.label}
                {on && <span aria-hidden className="absolute inset-x-3 bottom-0 h-0.5 bg-lacquer" />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* Tìm kiếm: GET tới /blog?q=... nên không cần JavaScript */}
          <form action="/blog" role="search" className="hidden xl:block">
            <label htmlFor="blog-header-search" className="sr-only">Tìm bài viết</label>
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                id="blog-header-search"
                name="q"
                type="search"
                placeholder="Tìm bài viết"
                className="h-10 w-56 rounded-[2px] border border-[#ddd] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-lacquer"
              />
            </div>
          </form>

          <Link
            href="/templates"
            className="hidden h-10 items-center bg-lacquer px-5 text-sm font-semibold text-white transition-colors hover:bg-lacquer-dark md:inline-flex"
          >
            Tạo thiệp
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="blog-mobile-nav"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            className="grid size-10 place-items-center border border-line text-ink lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Menu di động */}
      {open && (
        <nav id="blog-mobile-nav" aria-label="Menu blog" className="border-t border-line bg-white px-5 py-5 lg:hidden">
          <form action="/blog" role="search" className="mb-5">
            <input
              name="q"
              type="search"
              placeholder="Tìm bài viết"
              className="h-11 w-full rounded-[2px] border border-[#ddd] bg-white px-4 text-sm outline-none focus:border-lacquer"
            />
          </form>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Chuyên mục</p>
          <ul className="grid grid-cols-2 gap-2">
            {items.map((c) => (
              <li key={c.slug || "all"}>
                <Link
                  href={c.slug ? `/blog?category=${c.slug}` : "/blog"}
                  onClick={() => setOpen(false)}
                  className={`block border px-3 py-2.5 text-sm font-medium ${current === c.slug ? "border-lacquer bg-lacquer text-white" : "border-[#ddd] text-ink"}`}
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/templates" onClick={() => setOpen(false)} className="mt-5 flex h-11 items-center justify-center bg-lacquer text-sm font-semibold text-white">
            Tạo thiệp
          </Link>
        </nav>
      )}
    </header>
  );
}
