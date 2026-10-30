"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, type CategoryId, type InvitationTemplate } from "@/lib/templates";
import { TemplateCard } from "./TemplateCard";

type Sort = "popular" | "newest" | "price-asc";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27548A]";

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "popular", label: "Dùng nhiều nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá thấp đến cao" },
];

export function TemplateBrowser({ templates }: { templates: InvitationTemplate[] }) {
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("popular");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: templates.length };
    for (const t of templates) map[t.category] = (map[t.category] ?? 0) + 1;
    return map;
  }, [templates]);

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

  const tabs: { id: CategoryId | "all"; label: string }[] = [{ id: "all", label: "Tất cả" }, ...CATEGORIES];

  function reset() {
    setCategory("all");
    setQuery("");
    setSort("popular");
  }

  return (
    <div>
      {/* Danh mục */}
      <nav aria-label="Danh mục mẫu thiệp" className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((tab) => {
          const active = category === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(tab.id)}
              className={
                `shrink-0 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${focus} ` +
                (active
                  ? "bg-[#27548A] text-white"
                  : "border border-[#DDE4EE] bg-white text-[#27548A] hover:border-[#27548A]")
              }
            >
              {tab.label}
              <span
                className={
                  "rounded-full px-2 py-0.5 text-xs " +
                  (active ? "bg-white/20 text-white" : "bg-[#E8EEF6] text-[#27548A]")
                }
              >
                {counts[tab.id] ?? 0}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Thanh công cụ: tìm kiếm + sắp xếp */}
      <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-[#DDE4EE] bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2 md:max-w-md">
          <label htmlFor="tpl-search" className="sr-only">Tìm mẫu thiệp</label>
          <input
            id="tpl-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc phong cách..."
            className="w-full rounded-full border border-[#DDE4EE] bg-white px-5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#27548A] focus:ring-4 focus:ring-[#27548A]/10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="mr-1 text-slate-500">Sắp xếp:</span>
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSort(s.value)}
              aria-current={sort === s.value ? "true" : undefined}
              className={
                `rounded-full px-4 py-2 font-medium transition-colors ${focus} ` +
                (sort === s.value
                  ? "bg-[#E8EEF6] text-[#27548A]"
                  : "text-slate-600 hover:bg-slate-100")
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-6 text-sm text-slate-500" aria-live="polite">
        {list.length} mẫu
      </p>

      {list.length === 0 ? (
        <p className="mx-auto mt-8 max-w-3xl rounded-2xl bg-[#E8EEF6] p-8 text-center text-slate-700">
          Chưa có mẫu thiệp phù hợp.{" "}
          <button 
            type="button" 
            onClick={reset} 
            className={`font-semibold text-[#27548A] underline ${focus}`}
          >
            Xem tất cả mẫu
          </button>
        </p>
      ) : (
        <section aria-label="Danh sách mẫu thiệp" className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {list.map((t) => (
            <TemplateCard key={t.slug} template={t} />
          ))}
        </section>
      )}
    </div>
  );
}