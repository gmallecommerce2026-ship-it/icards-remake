"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { contentApi, templatesApi } from "@/lib/api";

type Option = { id: string; label: string };
type Tpl = { slug: string; name: string };

const asList = (d: unknown): Tpl[] => (Array.isArray(d) ? (d as Tpl[]) : ((d as { items?: Tpl[] })?.items ?? []));

/** Mục "Mẫu thiệp" trên header: hover để mở menu nhiều cấp (danh mục → mẫu thiệp) */
export function TemplatesMenu({ label, href }: { label: string; href: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState<Option[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, Tpl[]>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  const enter = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => setOpen(false), 150);
  };

  // cấp 1: danh mục (tải một lần khi mở lần đầu)
  useEffect(() => {
    if (!open || cats.length) return;
    contentApi.getPublicContent<Option[]>("templates.categories")
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : [];
        setCats(list);
        if (list[0]) setCurrent(list[0].id);
      })
      .catch(() => {});
  }, [open, cats.length]);

  // cấp 2: mẫu thiệp của danh mục đang chọn (tải lazy, mỗi danh mục một lần)
  useEffect(() => {
    if (!open || !current || items[current]) return;
    templatesApi.getTemplates({ category: current, limit: 6 })
      .then((r) => setItems((m) => ({ ...m, [current]: asList(r.data) })))
      .catch(() => setItems((m) => ({ ...m, [current]: [] })));
  }, [open, current, items]);

  const currentLabel = cats.find((c) => c.id === current)?.label ?? "";
  const list = current ? items[current] : undefined;

  return (
    <div
      ref={wrap}
      className="relative"
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={(e) => { if (!wrap.current?.contains(e.relatedTarget as Node)) setOpen(false); }}
    >
      <Link
        href={href}
        aria-haspopup="true"
        aria-expanded={open}
        aria-current={active ? "page" : undefined}
        className={`inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-ink ${active ? "text-ink" : "text-muted"}`}
      >
        {label}
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-full z-50 w-[560px] -translate-x-1/2 pt-4"
          >
            <div className="grid grid-cols-[190px_1fr] gap-4 rounded-sm border border-line bg-white p-4 shadow-xl">
              <ul className="flex flex-col gap-1" role="menu">
                {cats.map((c) => (
                  <li key={c.id} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onMouseEnter={() => setCurrent(c.id)}
                      onFocus={() => setCurrent(c.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${current === c.id ? "bg-lacquer-soft text-lacquer" : "text-ink hover:bg-porcelain"}`}
                    >
                      {c.label}
                    </button>
                  </li>
                ))}
                {cats.length === 0 && <li className="px-3 py-2 text-sm text-muted">Đang tải…</li>}
              </ul>

              <div>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-muted">{currentLabel}</p>
                {list === undefined ? (
                  <p className="px-2 py-2 text-sm text-muted">Đang tải mẫu…</p>
                ) : list.length === 0 ? (
                  <p className="px-2 py-2 text-sm text-muted">Chưa có mẫu trong danh mục này.</p>
                ) : (
                  <ul className="grid grid-cols-2 gap-1">
                    {list.map((t) => (
                      <li key={t.slug}>
                        <Link href={`/templates/${t.slug}`} className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-lacquer-soft hover:text-lacquer">
                          {t.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link href={href} className="mt-3 inline-block px-3 text-sm font-semibold text-lacquer hover:underline">
                  Xem tất cả mẫu →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
