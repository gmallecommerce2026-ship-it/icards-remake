"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Option } from "@/lib/catalog";
import { type InvitationTemplate } from "@/lib/templates";
import { TemplateShowcase } from "./TemplateShowcase";
import { findPath, type TreeNode } from "@/lib/templates-tree";
import { templatesApi } from "@/lib/api";
import { SideAdsShell } from "@/components/ads/SideAdsShell";
import { PageHero } from "@/components/ui/Primitives";

/* Giá trị lấy từ InvitationContent.css của bản src. */

type Sort = "popular" | "newest" | "price-asc";
const SORTS: { value: Sort; label: string }[] = [
  { value: "popular", label: "Dùng nhiều nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá thấp đến cao" },
];

const SORT_VALUES = SORTS.map((o) => o.value) as string[];

type Props = {
  templates: InvitationTemplate[];
  categories: Option[];
  /** Cây danh mục nhiều cấp; rỗng thì dùng danh mục phẳng `categories` */
  tree?: TreeNode[];
  /** Lấy từ URL: ?category=<gốc>&group=<nhóm>&sort=<...> */
  category?: string;
  group?: string;
  initialSort?: string;
};

const chip =
  "inline-flex h-10 shrink-0 items-center rounded-[2px] border-[0.5px] border-black px-6 text-base font-medium uppercase no-underline transition-all duration-300";

export function TemplatesListing({ templates, categories, tree = [], category = "all", group, initialSort }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>(SORTS.some((o) => o.value === initialSort) ? (initialSort as Sort) : "popular");
  const filtersRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Nút cha đang hover: dropdown hiện nhóm con của nút đó, căn theo vị trí nút
  const [hover, setHover] = useState<{ id: string; left: number } | null>(null);
  // Trễ nhỏ trước khi đóng để chuột kịp đi từ nút xuống dropdown
  const closeTimer = useRef<number | null>(null);
  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setHover(null), 180);
  };
  useEffect(() => cancelClose, []);
  const openFor = (id: string, el: HTMLElement) => {
    cancelClose();
    const r = el.getBoundingClientRect();
    const w = wrapRef.current?.getBoundingClientRect();
    setHover({ id, left: r.left - (w?.left ?? 0) });
  };

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

  // Nút đang chọn trong cây (gốc hoặc nhóm). Đường đi dùng cho breadcrumb và dải nhóm con.
  const trail = useMemo(() => {
    if (!tree.length || category === "all") return [] as TreeNode[];
    const t = findPath(tree, group ?? category);
    return t.length ? t : findPath(tree, category);
  }, [tree, category, group]);
  const node = trail[trail.length - 1];

  // Lọc danh mục, tìm kiếm và sắp xếp đều do backend thực hiện (GET /invitation-templates?categoryId=&search=&sort=).
  // `templates` từ server đã đúng cho trạng thái trên URL (không tìm kiếm); chỉ gọi lại API khi người dùng đổi tìm kiếm hoặc sắp xếp.
  const categoryId = group ?? (category !== "all" ? category : undefined);
  const urlSort: Sort = SORT_VALUES.includes(initialSort ?? "") ? (initialSort as Sort) : "popular";
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(t);
  }, [query]);

  const [list, setList] = useState<InvitationTemplate[]>(templates);
  const [loading, setLoading] = useState(false);
  // Khóa của danh sách hiện có (danh mục | sắp xếp | từ khóa). Trùng khóa thì không gọi lại API.
  const loadedKey = useRef(`${categoryId ?? ""}|${urlSort}|`);

  // Server gửi danh sách mới (đổi danh mục qua link): dùng luôn, không cần gọi lại.
  useEffect(() => {
    setList(templates);
    loadedKey.current = `${categoryId ?? ""}|${urlSort}|`;
  }, [templates, categoryId, urlSort]);

  const key = `${categoryId ?? ""}|${sort}|${debouncedQuery}`;
  useEffect(() => {
    if (key === loadedKey.current) return;
    loadedKey.current = key;
    let cancelled = false;
    setLoading(true);
    templatesApi
      .getTemplates({ categoryId, sort, search: debouncedQuery || undefined })
      .then((r) => {
        if (!cancelled) setList(Array.isArray(r.data) ? (r.data as InvitationTemplate[]) : []);
      })
      .catch(() => {
        if (!cancelled) setList([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key, categoryId, sort, debouncedQuery]);


  const tabs: Option[] = [{ id: "all", label: "Tất cả" }, ...(tree.length ? tree.map((r) => ({ id: r.id, label: r.label })) : categories)];
  const currentLabel = node?.label ?? categories.find((c) => c.id === category)?.label;
  // Dải nhóm con: con của nút đang chọn; nếu nút là lá thì hiện các nhóm cùng cấp để chuyển qua lại
  const rootOfId = (id: string) => tree.find((r) => r.id === id);
  const hoverRoot = hover ? rootOfId(hover.id) : undefined;

  return (
    <SideAdsShell hero={<PageHero title={currentLabel ?? "Khám Phá Các Mẫu Thiệp"} description="Thiết kế ấn tượng, thao tác dễ dàng chỉ trong vài phút" />}>
    <div className="bg-[#FEFDFD] font-inter text-[#333]">
      <div className="mx-auto w-full max-w-[1520px] px-5 py-[20px]">
        {/* Bộ lọc danh mục: nền xanh, chữ trắng như bản src */}
        <div ref={wrapRef} className="relative" onMouseLeave={scheduleClose}>
        <div
          ref={filtersRef}
          role="tablist"
          aria-label="Danh mục"
          className="mt-[25px] flex w-full justify-start gap-5 overflow-x-auto whitespace-nowrap pb-2.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb:hover]:bg-[#27548A] [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-[#CDD7E5] [&::-webkit-scrollbar-track]:rounded-[10px] [&::-webkit-scrollbar-track]:bg-[#f1f1f1]"
        >
          {tabs.map((t) => {
            const active = category === t.id;
            return (
              <Link
                key={t.id}
                href={t.id === "all" ? "/templates" : `/templates?category=${t.id}`}
                role="tab"
                aria-selected={active}
                scroll={false}
                onMouseEnter={(e) => openFor(t.id, e.currentTarget)}
                onFocus={(e) => openFor(t.id, e.currentTarget)}
                className={`${chip} ${active ? "bg-[#1a3a63] text-white" : "bg-[#27548A] text-white hover:border-[#27548A]"}`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        {/* Dropdown nhóm con (vuông), hiện khi hover nút cha ngay phía trên */}
        {hoverRoot && hoverRoot.children.length > 0 && (
          // Phần đệm trong suốt phía trên (pt-2) nằm trong cùng vùng hover, không còn khe hở
          <div
            className="absolute z-20 pt-2"
            style={{ left: hover?.left ?? 0, top: "100%" }}
            onMouseEnter={cancelClose}
          >
          <div
            role="menu"
            aria-label={`Nhóm trong ${hoverRoot.label}`}
            className="flex max-w-[min(90vw,720px)] flex-wrap gap-2 border border-black/10 bg-white p-3 shadow-[0_12px_28px_-12px_rgba(14,27,44,0.35)]"
          >
            <Link
              href={hoverRoot.path}
              scroll={false}
              className={`rounded-sm border px-4 py-2 text-sm no-underline ${node?.id === hoverRoot.id ? "border-[#27548A] bg-[#27548A] text-white" : "border-[#ddd] bg-white text-[#27548A] hover:border-[#27548A]"}`}
            >
              Tất cả {hoverRoot.label.toLowerCase()} ({hoverRoot.count})
            </Link>
            {hoverRoot.children.map((c) => (
              <Link
                key={c.id}
                href={c.path}
                scroll={false}
                className={`rounded-sm border px-4 py-2 text-sm no-underline ${node?.id === c.id ? "border-[#27548A] bg-[#27548A] text-white" : "border-[#ddd] bg-white text-[#27548A] hover:border-[#27548A]"}`}
              >
                {c.label} ({c.count})
              </Link>
            ))}
          </div>
          </div>
        )}
        </div>

        {trail.length > 0 && (
          <nav aria-label="Vị trí danh mục" className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#666]">
            <Link href="/templates" className="hover:text-[#27548A]">Tất cả</Link>
            {trail.map((n, i) => (
              <span key={n.id} className="flex items-center gap-2">
                <span aria-hidden>›</span>
                {i === trail.length - 1 ? <span className="font-medium text-[#1a1a1a]">{n.label}</span> : <Link href={n.path} className="hover:text-[#27548A]">{n.label}</Link>}
              </span>
            ))}
          </nav>
        )}
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
          <div aria-busy={loading} className={`grid gap-x-[30px] gap-y-10 py-[45px] transition-opacity [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] ${loading ? "opacity-50" : ""}`}>
            {list.map((t) => (
              <Link key={t.slug} href={`/templates/${t.slug}`} className="group flex cursor-pointer flex-col items-center gap-4 [color:inherit] no-underline">
                <div className="w-full">
                  <TemplateShowcase template={t} />
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
    </SideAdsShell>
  );
}
