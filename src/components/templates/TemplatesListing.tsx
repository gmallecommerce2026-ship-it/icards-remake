"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Option } from "@/lib/catalog";
import { formatPrice, type InvitationTemplate } from "@/lib/templates";
import { InvitationPreview } from "./InvitationPreview";

type Sort = "popular" | "newest" | "price-asc";
const SORTS: { value: Sort; label: string }[] = [
  { value: "popular", label: "Dùng nhiều nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá thấp đến cao" },
];

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

type Props = { templates: InvitationTemplate[]; categories: Option[] };

export function TemplatesListing({ templates, categories }: Props) {
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("popular");
  const chipsRef = useRef<HTMLDivElement>(null);

  // Cuộn ngang dải danh mục bằng con lăn chuột (giống bản src)
  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      const atStart = el.scrollLeft === 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      if ((e.deltaY > 0 && !atEnd) || (e.deltaY < 0 && !atStart)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const list = useMemo(() => {
    const q = normalize(query.trim());
    const filtered = templates.filter(
      (t) =>
        (category === "all" || t.category === category) &&
        (!q || normalize(`${t.name} ${t.tagline} ${t.description}`).includes(q)),
    );
    return [...filtered].sort((a, b) => {
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "price-asc") return a.price - b.price;
      return b.popularity - a.popularity;
    });
  }, [templates, category, query, sort]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: templates.length };
    for (const t of templates) map[t.category] = (map[t.category] ?? 0) + 1;
    return map;
  }, [templates]);

  const tabs: Option[] = [{ id: "all", label: "Tất cả" }, ...categories];
  const current = categories.find((c) => c.id === category);
  const reset = () => { setCategory("all"); setQuery(""); setSort("popular"); };

  return (
    <>
      {/* Banner tiêu đề: đổi theo danh mục đang chọn */}
      <section className="bg-gradient-to-br from-paper via-white to-porcelain px-5 pb-16 pt-40 text-center lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lacquer">Thư viện mẫu thiệp</p>
        <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-medium md:text-5xl">
          {current?.label ?? "Khám Phá Các Mẫu Thiệp"}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Thiết kế ấn tượng, thao tác dễ dàng chỉ trong vài phút.
        </p>
      </section>

      <main className="mx-auto max-w-[1440px] px-5 py-10 lg:px-8">
        {/* Bộ lọc danh mục */}
        <div
          ref={chipsRef}
          className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Danh mục"
        >
          {tabs.map((t) => {
            const active = category === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(t.id)}
                className={`shrink-0 rounded-full border px-5 py-2 text-sm font-medium transition ${
                  active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink"
                }`}
              >
                {t.label} <span className="opacity-60">{counts[t.id] ?? 0}</span>
              </button>
            );
          })}
        </div>

        {/* Tìm kiếm & sắp xếp */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc phong cách"
            aria-label="Tìm mẫu thiệp"
            className="w-full rounded-full border border-line bg-white px-5 py-2.5 text-sm outline-none placeholder:text-muted focus:border-lacquer sm:max-w-sm"
          />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted" aria-live="polite">{list.length} mẫu</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sắp xếp"
              className="rounded-full border border-line bg-white px-4 py-2 outline-none"
            >
              {SORTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Lưới mẫu thiệp */}
        {list.length === 0 ? (
          <p className="mt-16 text-center text-muted">
            Chưa có mẫu thiệp nào trong danh mục này.{" "}
            <button onClick={reset} className="font-semibold text-ink underline underline-offset-4">Xem tất cả</button>
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
            {list.map((t) => (
              <Link key={t.slug} href={`/templates/${t.slug}`} className="group block">
                <div className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
                  {t.previewImage ? (
                    <img
                      src={t.previewImage}
                      alt={t.name}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <InvitationPreview template={t} />
                  )}
                </div>
                <h3 className="mt-3 line-clamp-2 text-sm font-semibold md:text-base">{t.name}</h3>
                <p className="mt-0.5 text-xs text-muted">
                  {formatPrice(t.price)} · {categories.find((c) => c.id === t.category)?.label}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
