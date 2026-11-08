"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Option } from "@/lib/catalog";
import { type InvitationTemplate } from "@/lib/templates";
import { InvitationPreview } from "./InvitationPreview";

/* Giá trị lấy từ InvitationContent.css của bản src. */

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
  const filtersRef = useRef<HTMLDivElement>(null);

  // Cuộn ngang dải lọc bằng con lăn chuột (như bản src)
  useEffect(() => {
    const el = filtersRef.current;
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

  const tabs: Option[] = [{ id: "all", label: "Tất cả" }, ...categories];
  const current = categories.find((c) => c.id === category);

  return (
    <div className="bg-[#FEFDFD] font-inter text-[#333]">
      {/* Tiêu đề trang (UniversalBanner của bản src chưa có mã nguồn, dùng tiêu đề thay thế) */}
      <section className="flex flex-col items-center gap-2 px-5 pb-10 pt-10 text-center">
        <h1 className="font-playfair text-[42px] font-bold leading-[1.2] text-[#1a1a1a] max-[769px]:text-[28px]">
          {current?.label ?? "Khám Phá Các Mẫu Thiệp"}
        </h1>
        <p className="text-base text-[#555]">Thiết kế ấn tượng, thao tác dễ dàng chỉ trong vài phút</p>
      </section>

      <div className="mx-auto w-full max-w-[1520px] px-5 py-[20px]">
        {/* Bộ lọc danh mục: nền xanh, chữ trắng như bản src */}
        <div
          ref={filtersRef}
          role="tablist"
          aria-label="Danh mục"
          className="mt-[25px] flex w-full justify-start gap-5 overflow-x-auto whitespace-nowrap pb-2.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb:hover]:bg-[#27548A] [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-[#CDD7E5] [&::-webkit-scrollbar-track]:rounded-[10px] [&::-webkit-scrollbar-track]:bg-[#f1f1f1]"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={category === t.id}
              onClick={() => setCategory(t.id)}
              className="h-10 shrink-0 cursor-pointer rounded-[2px] border-[0.5px] border-black bg-[#27548A] px-6 text-base font-medium uppercase text-white transition-all duration-300 hover:border-[#27548A] hover:bg-[#27548A]"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tìm kiếm & sắp xếp (không có trong bản src, giữ lại từ bản cũ) */}
        <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc phong cách"
            aria-label="Tìm mẫu thiệp"
            className="w-full rounded-[2px] border border-[#ddd] bg-white px-4 py-2.5 outline-none focus:border-[#27548A] sm:max-w-sm"
          />
          <div className="flex items-center gap-3">
            <span className="text-[#666]" aria-live="polite">{list.length} mẫu</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sắp xếp"
              className="rounded-[2px] border border-[#ddd] bg-white px-3 py-2 outline-none"
            >
              {SORTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Lưới thẻ: auto-fill minmax(250px, 1fr), gap 40px 30px */}
        {list.length === 0 ? (
          <p className="col-span-full px-5 py-20 text-center text-lg text-[#666]">Chưa có mẫu thiệp nào trong danh mục này.</p>
        ) : (
          <div className="grid gap-x-[30px] gap-y-10 py-[45px] [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
            {list.map((t) => (
              <Link key={t.slug} href={`/templates/${t.slug}`} className="group flex cursor-pointer flex-col items-center gap-4 [color:inherit] no-underline">
                <div className="relative w-full overflow-hidden rounded-[4px] bg-white pt-[100%] transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)]">
                  <div className="absolute inset-0">
                    {t.previewImage ? (
                      <img src={t.previewImage} alt={t.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <InvitationPreview template={t} />
                    )}
                  </div>
                </div>
                <h3 className="box-border h-[45px] w-full overflow-hidden px-[5px] text-center text-base font-semibold uppercase leading-[1.4] tracking-[0.02em] text-[#27548A] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] text-ellipsis">
                  {t.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
