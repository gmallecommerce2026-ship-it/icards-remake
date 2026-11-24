"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { getProductsByCategory, isShopCategory, priceFrom, type Product, type ShopCategoryId } from "@/lib/shop";
import type { Option } from "@/lib/catalog";

type SortValue = "popular" | "price-asc" | "price-desc";
const SORTS: { value: SortValue; label: string }[] = [
  { value: "popular", label: "Nổi bật" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
];
const isSort = (v: string | null): v is SortValue => SORTS.some((s) => s.value === v);
const PAGE_SIZE = 8;

function buildHref(p: { category?: ShopCategoryId; sort?: SortValue; q?: string }) {
  const sp = new URLSearchParams();
  if (p.category) sp.set("category", p.category);
  if (p.sort && p.sort !== "popular") sp.set("sort", p.sort);
  if (p.q) sp.set("q", p.q);
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();

export default function ShopClient({ products: allProducts, categories }: { products: Product[]; categories: Option[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const catParam = sp.get("category") ?? undefined;
  const category = isShopCategory(catParam, categories) ? catParam : undefined;
  const sortParam = sp.get("sort");
  const sort: SortValue = isSort(sortParam) ? sortParam : "popular";
  const query = sp.get("q")?.trim() || undefined;

  const products = useMemo(() => {
    let list = getProductsByCategory(allProducts, category);
    if (query) {
      const n = norm(query);
      list = list.filter((p) => norm(`${p.name} ${p.summary}`).includes(n));
    }
    if (sort !== "popular") {
      list = [...list].sort((a, b) => (sort === "price-asc" ? priceFrom(a) - priceFrom(b) : priceFrom(b) - priceFrom(a)));
    }
    return list;
  }, [allProducts, category, query, sort]);

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    router.push(buildHref({ category, sort, q: value || undefined }));
  }

  return (
    <div id="san-pham" className="mx-auto w-full max-w-[1520px] scroll-mt-28 px-5 pb-28 pt-14">
      {/* Danh mục: tab gạch chân, cùng kiểu với trang mẫu thiệp */}
      <nav
        aria-label="Danh mục sản phẩm"
        className="flex flex-wrap justify-center gap-x-9 gap-y-3 border-b border-line pb-5"
      >
        <FilterTab href={buildHref({ sort, q: query })} label="Tất cả" count={allProducts.length} current={!category} />
        {categories.map((c) => (
          <FilterTab
            key={c.id}
            href={buildHref({ category: c.id as ShopCategoryId, sort, q: query })}
            label={c.label}
            count={allProducts.filter((p) => p.category === c.id).length}
            current={category === c.id}
          />
        ))}
      </nav>

      {/* Tìm kiếm (ô gạch dưới) và sắp xếp (chữ gạch dưới khi đang chọn) */}
      <div className="mt-8 flex flex-col items-center justify-between gap-5 sm:flex-row">
        <form onSubmit={onSearch} role="search" className="flex w-full items-end gap-3 sm:w-96">
          <label htmlFor="shop-search" className="sr-only">Tìm sản phẩm</label>
          <input
            key={query ?? ""}
            id="shop-search"
            name="q"
            defaultValue={query}
            placeholder="Tìm sản phẩm..."
            className="w-full border-b border-ink/25 bg-transparent px-1 py-2 outline-none placeholder:text-muted focus:border-lacquer"
          />
          <button type="submit" className="pb-2 text-sm font-medium text-ink hover:text-lacquer">Tìm</button>
        </form>
        <div className="flex gap-6 text-sm">
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={buildHref({ category, sort: s.value, q: query })}
              aria-current={sort === s.value ? "true" : undefined}
              className={`pb-0.5 transition-colors ${sort === s.value ? "border-b border-ink font-semibold text-ink" : "text-muted hover:text-ink"}`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-muted" aria-live="polite">
        {products.length} sản phẩm{query ? ` cho “${query}”` : ""}
      </p>

      {/* key đổi theo bộ lọc để "Xem thêm" quay về trang đầu */}
      <ProductGrid key={`${category ?? ""}|${sort}|${query ?? ""}`} products={products} />
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  const [shown, setShown] = useState(PAGE_SIZE);

  if (products.length === 0) {
    return (
      <div className="mt-16 text-center">
        <p className="font-display text-2xl font-medium">Chưa có sản phẩm phù hợp.</p>
        <Link href="/shop" className="mt-4 inline-block border-b border-ink pb-0.5 font-medium hover:text-lacquer hover:border-lacquer">
          Xem tất cả sản phẩm
        </Link>
      </div>
    );
  }

  const remaining = products.length - shown;

  return (
    <div className="mt-12 flex flex-col items-center gap-14">
      <div className="grid w-full grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-4">
        {products.slice(0, shown).map((p) => (
          <ShopProductCard key={p.slug} product={p} />
        ))}
      </div>
      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setShown((s) => s + PAGE_SIZE)}
          className="flex h-12 items-center rounded-sm border border-ink px-10 text-sm font-medium uppercase tracking-[0.12em] transition-colors hover:bg-ink hover:text-white"
        >
          Xem thêm ({remaining})
        </button>
      )}
    </div>
  );
}

function FilterTab({ href, label, count, current }: { href: string; label: string; count: number; current: boolean }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`pb-1 text-[15px] transition-colors ${current ? "border-b border-lacquer font-semibold text-lacquer" : "text-muted hover:text-ink"}`}
    >
      {label} <span className="text-xs opacity-60">{count}</span>
    </Link>
  );
}
