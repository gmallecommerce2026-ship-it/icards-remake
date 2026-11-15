"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Option } from "@/lib/catalog";
import { formatPrice, type CategoryId, type InvitationTemplate } from "@/lib/templates";
import { useUiTheme } from "@/components/ui/useUiTheme";
import { InvitationPreview } from "./InvitationPreview";

type Sort = "popular" | "newest" | "price-asc";
const SORTS: { value: Sort; label: string }[] = [
  { value: "popular", label: "Dùng nhiều nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá thấp đến cao" },
];

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
}

/* ------------------------------------------------------------------ */
/*  Trạng thái lọc / tìm / sắp xếp dùng chung cho cả 5 giao diện          */
/* ------------------------------------------------------------------ */
type Props = { templates: InvitationTemplate[]; categories: Option[] };

function useCatalog({ templates, categories }: Props) {
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
      (t) => (category === "all" || t.category === category) && (!q || normalize(`${t.name} ${t.tagline} ${t.description}`).includes(q)),
    );
    return [...filtered].sort((a, b) => {
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "price-asc") return a.price - b.price;
      return b.popularity - a.popularity;
    });
  }, [templates, category, query, sort]);

  const tabs: { id: string; label: string }[] = [{ id: "all", label: "Tất cả" }, ...categories];
  const reset = () => { setCategory("all"); setQuery(""); setSort("popular"); };
  const catName = (id: string) => categories.find((c) => c.id === id)?.label;

  return { category, setCategory, query, setQuery, sort, setSort, counts, list, tabs, reset, catName };
}
type State = ReturnType<typeof useCatalog>;

/* ================================================================== */
/*  GIAO DIỆN 1 · THIỆP GIẤY                                             */
/*  Tiêu đề serif căn giữa, bộ lọc là chữ gạch chân, lưới 4 cột như trưng bày thiệp. */
/* ================================================================== */
function View1(s: State) {
  return (
    <>
      <header className="bg-paper pt-40 text-center">
        <div className="mx-auto max-w-3xl px-5 pb-16">
          <h1 className="font-display text-5xl font-medium leading-tight sm:text-6xl">Mẫu thiệp mời</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Chọn một mẫu, điền thông tin sự kiện, rồi gửi link cho khách. Mẫu nào cũng xem trước được như khách sẽ thấy.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-28">
        <nav aria-label="Danh mục" className="flex flex-wrap justify-center gap-x-9 gap-y-3 border-b border-line pb-5">
          {s.tabs.map((t) => (
            <button key={t.id} type="button" aria-pressed={s.category === t.id} onClick={() => s.setCategory(t.id as CategoryId | "all")}
              className={`pb-1 text-[15px] transition-colors ${s.category === t.id ? "border-b border-lacquer font-semibold text-lacquer" : "text-muted hover:text-ink"}`}>
              {t.label} <span className="text-xs opacity-60">{s.counts[t.id] ?? 0}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <input type="search" value={s.query} onChange={(e) => s.setQuery(e.target.value)} placeholder="Tìm theo tên hoặc phong cách"
            aria-label="Tìm mẫu thiệp" className="w-full border-b border-ink/25 bg-transparent px-1 py-2 text-center outline-none placeholder:text-muted focus:border-lacquer sm:w-80 sm:text-left" />
          <div className="flex gap-6 text-sm">
            {SORTS.map((o) => (
              <button key={o.value} type="button" onClick={() => s.setSort(o.value)} aria-current={s.sort === o.value ? "true" : undefined}
                className={s.sort === o.value ? "font-semibold text-ink" : "text-muted hover:text-ink"}>{o.label}</button>
            ))}
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-muted" aria-live="polite">{s.list.length} mẫu</p>

        {s.list.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-muted">Chưa có mẫu thiệp phù hợp.</p>
            <button type="button" onClick={s.reset} className="mt-3 font-semibold text-lacquer underline underline-offset-4">Xem tất cả mẫu</button>
          </div>
        ) : (
          <section aria-label="Danh sách mẫu thiệp" className="mt-12 grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-4">
            {s.list.map((t) => (
              <Link key={t.slug} href={`/templates/${t.slug}`} className="group block text-center">
                <div className="border border-line bg-white p-3 transition-shadow duration-500 group-hover:shadow-lg">
                  <InvitationPreview template={t} />
                </div>
                <h3 className="mt-5 font-display text-xl font-medium group-hover:text-lacquer">{t.name}</h3>
                <p className="mt-1 text-sm text-muted">{s.catName(t.category)} · {formatPrice(t.price)}</p>
              </Link>
            ))}
          </section>
        )}
      </div>
    </>
  );
}

/* ================================================================== */
/*  GIAO DIỆN 2 · TỐI GIẢN                                               */
/*  Cột bộ lọc bên trái như bảng kê, lưới 3 cột chữ đen, thông tin dưới mỗi mẫu là dòng kẻ. */
/* ================================================================== */
function View2(s: State) {
  return (
    <div className="mx-auto grid max-w-7xl gap-14 px-5 pb-28 pt-40 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
        <div>
          <p className="mb-3 text-sm font-semibold">Danh mục</p>
          <ul>
            {s.tabs.map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => s.setCategory(t.id as CategoryId | "all")} aria-pressed={s.category === t.id}
                  className={`flex w-full items-center justify-between border-b border-line py-2.5 text-left text-sm ${s.category === t.id ? "font-semibold text-ink" : "text-muted hover:text-ink"}`}>
                  {t.label}<span>{s.counts[t.id] ?? 0}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Sắp xếp</p>
          <ul className="space-y-2 text-sm">
            {SORTS.map((o) => (
              <li key={o.value}>
                <button type="button" onClick={() => s.setSort(o.value)} className={`${s.sort === o.value ? "font-semibold text-ink" : "text-muted hover:text-ink"}`}>{o.label}</button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main>
        <h1 className="font-display text-5xl font-semibold tracking-tight">Mẫu thiệp</h1>
        <div className="mt-6 flex items-center gap-4 border-b border-ink pb-3">
          <input type="search" value={s.query} onChange={(e) => s.setQuery(e.target.value)} placeholder="Tìm mẫu" aria-label="Tìm mẫu thiệp"
            className="w-full bg-transparent outline-none placeholder:text-muted" />
          <span className="whitespace-nowrap text-sm text-muted" aria-live="polite">{s.list.length} mẫu</span>
        </div>

        {s.list.length === 0 ? (
          <p className="mt-16 text-muted">Không có mẫu phù hợp. <button type="button" onClick={s.reset} className="font-semibold text-ink underline">Xem tất cả</button></p>
        ) : (
          <section aria-label="Danh sách mẫu thiệp" className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {s.list.map((t) => (
              <Link key={t.slug} href={`/templates/${t.slug}`} className="group block">
                <InvitationPreview template={t} />
                <div className="mt-4 flex items-baseline justify-between border-t border-ink pt-3">
                  <h3 className="font-semibold group-hover:underline">{t.name}</h3>
                  <span className="text-sm text-muted">{formatPrice(t.price)}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{s.catName(t.category)}</p>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

/* ================================================================== */
/*  GIAO DIỆN 3 · HIỆN ĐẠI                                               */
/*  Dải tiêu đề màu, bộ lọc là các ô đặc, lưới bento với mẫu đầu tiên nổi bật. */
/* ================================================================== */
function View3(s: State) {
  return (
    <>
      <header className="bg-lacquer pb-14 pt-40 text-white">
        <div className="mx-auto max-w-7xl px-5">
          <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">Chọn mẫu thiệp của bạn</h1>
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
            <input type="search" value={s.query} onChange={(e) => s.setQuery(e.target.value)} placeholder="Tìm theo tên hoặc phong cách" aria-label="Tìm mẫu thiệp"
              className="w-full rounded-lg bg-white px-5 py-3.5 text-ink outline-none placeholder:text-muted md:max-w-md" />
            <select value={s.sort} onChange={(e) => s.setSort(e.target.value as Sort)} aria-label="Sắp xếp"
              className="rounded-lg bg-white/15 px-4 py-3.5 text-sm text-white outline-none">
              {SORTS.map((o) => <option key={o.value} value={o.value} className="text-ink">{o.label}</option>)}
            </select>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {s.tabs.map((t) => (
              <button key={t.id} type="button" aria-pressed={s.category === t.id} onClick={() => s.setCategory(t.id as CategoryId | "all")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${s.category === t.id ? "bg-white text-lacquer" : "bg-white/15 text-white hover:bg-white/25"}`}>
                {t.label} · {s.counts[t.id] ?? 0}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <p className="mb-6 text-sm text-muted" aria-live="polite">{s.list.length} mẫu</p>
        {s.list.length === 0 ? (
          <p className="text-muted">Không có mẫu phù hợp. <button type="button" onClick={s.reset} className="font-semibold text-lacquer underline">Xem tất cả</button></p>
        ) : (
          <div aria-label="Danh sách mẫu thiệp" className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {s.list.map((t, i) => (
              <Link key={t.slug} href={`/templates/${t.slug}`} className={`group flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-xl ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
                <div className="bg-paper p-4"><InvitationPreview template={t} /></div>
                <div className="flex items-center justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{t.name}</h3>
                    <p className="mt-0.5 text-sm text-muted">{s.catName(t.category)}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-lacquer-soft px-2.5 py-1 text-xs font-semibold text-lacquer">{formatPrice(t.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

/* ================================================================== */
/*  GIAO DIỆN 4 · BOHO ẤM                                                */
/*  Tiêu đề serif nghiêng căn giữa, bộ lọc viên thuốc, thẻ có khung vòm. */
/* ================================================================== */
function View4(s: State) {
  return (
    <>
      <header className="pt-40 text-center">
        <div className="mx-auto max-w-2xl px-5 pb-14">
          <h1 className="font-display text-5xl font-medium italic leading-tight sm:text-6xl">Mẫu thiệp mời</h1>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-muted">Một mẫu thật đẹp cho ngày vui của hai bạn. Điền thông tin, rồi gửi đi.</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-28">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-2">
            {s.tabs.map((t) => (
              <button key={t.id} type="button" aria-pressed={s.category === t.id} onClick={() => s.setCategory(t.id as CategoryId | "all")}
                className={`rounded-sm border px-5 py-2 text-sm transition-colors ${s.category === t.id ? "border-lacquer bg-lacquer text-white" : "border-ink/15 bg-white text-ink hover:border-lacquer"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex w-full max-w-xl flex-col items-center gap-3 sm:flex-row">
            <input type="search" value={s.query} onChange={(e) => s.setQuery(e.target.value)} placeholder="Tìm mẫu thiệp" aria-label="Tìm mẫu thiệp"
              className="w-full rounded-sm border border-ink/15 bg-white px-5 py-3 outline-none placeholder:text-muted focus:border-lacquer" />
            <select value={s.sort} onChange={(e) => s.setSort(e.target.value as Sort)} aria-label="Sắp xếp" className="rounded-sm border border-ink/15 bg-white px-4 py-3 text-sm outline-none">
              {SORTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-muted" aria-live="polite">{s.list.length} mẫu</p>

        {s.list.length === 0 ? (
          <p className="mt-12 text-center text-muted">Chưa có mẫu phù hợp. <button type="button" onClick={s.reset} className="font-semibold text-lacquer underline">Xem tất cả</button></p>
        ) : (
          <section aria-label="Danh sách mẫu thiệp" className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {s.list.map((t, i) => (
              <Link key={t.slug} href={`/templates/${t.slug}`} className={`group block text-center ${i % 2 ? "lg:translate-y-10" : ""}`}>
                <div className="overflow-hidden rounded-t-full bg-paper-deep px-6 pb-6 pt-10">
                  <div className="overflow-hidden rounded-t-[999px]"><InvitationPreview template={t} /></div>
                </div>
                <h3 className="mt-6 font-display text-2xl italic group-hover:text-lacquer">{t.name}</h3>
                <p className="mt-1 text-sm text-muted">{s.catName(t.category)} · {formatPrice(t.price)}</p>
              </Link>
            ))}
          </section>
        )}
      </div>
    </>
  );
}

/* ================================================================== */
/*  GIAO DIỆN 5 · CỔ ĐIỂN                                                */
/*  Dải xanh đêm với đường vàng, mục lục đường gạch chân, thẻ có khung viền kép. */
/* ================================================================== */
function View5(s: State) {
  return (
    <>
      <header className="bg-lacquer pb-16 pt-40 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <span className="block h-px w-16 bg-gold" aria-hidden />
            <h1 className="mt-8 font-display text-5xl font-medium sm:text-6xl">Bộ sưu tập mẫu thiệp</h1>
            <p className="mt-5 max-w-xl text-white/75">Mỗi mẫu là một tấm thiệp hoàn chỉnh, sẵn sàng để điền tên và ngày cưới.</p>
          </div>
          <input type="search" value={s.query} onChange={(e) => s.setQuery(e.target.value)} placeholder="Tìm mẫu thiệp" aria-label="Tìm mẫu thiệp"
            className="w-full border-b border-gold bg-transparent px-1 py-2 text-white outline-none placeholder:text-white/50 lg:w-72" />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-gold/50 pb-4">
          <nav aria-label="Danh mục" className="flex flex-wrap gap-7">
            {s.tabs.map((t) => (
              <button key={t.id} type="button" aria-pressed={s.category === t.id} onClick={() => s.setCategory(t.id as CategoryId | "all")}
                className={`pb-2 font-display text-lg transition-colors ${s.category === t.id ? "border-b-2 border-gold text-lacquer" : "text-muted hover:text-ink"}`}>{t.label}</button>
            ))}
          </nav>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-muted" aria-live="polite">{s.list.length} mẫu</span>
            <select value={s.sort} onChange={(e) => s.setSort(e.target.value as Sort)} aria-label="Sắp xếp" className="bg-transparent outline-none">
              {SORTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {s.list.length === 0 ? (
          <p className="mt-16 text-center text-muted">Không có mẫu phù hợp. <button type="button" onClick={s.reset} className="font-semibold text-lacquer underline">Xem tất cả</button></p>
        ) : (
          <section aria-label="Danh sách mẫu thiệp" className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {s.list.map((t) => (
              <Link key={t.slug} href={`/templates/${t.slug}`} className="group block">
                <div className="border border-gold/60 bg-white p-2">
                  <div className="border border-gold/40 p-3"><InvitationPreview template={t} /></div>
                </div>
                <div className="mt-5 flex items-end justify-between gap-4 border-t border-gold/50 pt-4">
                  <div>
                    <h3 className="font-display text-2xl group-hover:text-lacquer">{t.name}</h3>
                    <p className="mt-1 text-sm italic text-muted">{s.catName(t.category)}</p>
                  </div>
                  <span className="font-display text-lg text-gold">{formatPrice(t.price)}</span>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </>
  );
}

const VIEWS: Record<string, (s: State) => React.ReactElement> = { "1": View1, "2": View2, "3": View3, "4": View4, "5": View5 };

/** Điểm vào: chọn bố cục theo giao diện đang bật */
export function TemplatesView(props: Props) {
  const theme = useUiTheme();
  const state = useCatalog(props);
  const View = VIEWS[theme] ?? View1;
  return <View {...state} />;
}
