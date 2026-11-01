"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { SHOP_CATEGORIES, getProducts, isShopCategory, priceFrom, type ShopCategoryId } from "@/lib/shop";

type SortValue = "popular" | "price-asc" | "price-desc";
const SORTS: { value: SortValue; label: string }[] = [
  { value: "popular", label: "Nổi bật" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
];
const isSort = (v: string | null): v is SortValue => SORTS.some((s) => s.value === v);

function buildHref(p: { category?: ShopCategoryId; sort?: SortValue; q?: string }) {
  const sp = new URLSearchParams();
  if (p.category) sp.set("category", p.category);
  if (p.sort && p.sort !== "popular") sp.set("sort", p.sort);
  if (p.q) sp.set("q", p.q);
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLowerCase();

export default function ShopClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const catParam = sp.get("category") ?? undefined;
  const category = isShopCategory(catParam) ? catParam : undefined;
  const sortParam = sp.get("sort");
  const sort: SortValue = isSort(sortParam) ? sortParam : "popular";
  const query = sp.get("q")?.trim() || undefined;
  const activeLabel = SHOP_CATEGORIES.find((c) => c.id === category)?.label;

  let products = getProducts(category);
  if (query) {
    const n = norm(query);
    products = products.filter((p) => norm(`${p.name} ${p.summary}`).includes(n));
  }
  if (sort !== "popular") {
    products = [...products].sort((a, b) => (sort === "price-asc" ? priceFrom(a) - priceFrom(b) : priceFrom(b) - priceFrom(a)));
  }

  const count = (c?: ShopCategoryId) => getProducts(c).length;

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    router.push(buildHref({ category, sort, q: value || undefined }));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Cửa hàng</h1>
      <p className="mt-3 max-w-2xl text-[#5B6B7F]">Thiệp in, quà tặng và phụ kiện QR đồng bộ với thiệp mời online của bạn.</p>

      <nav aria-label="Danh mục sản phẩm" className="mt-8 flex flex-wrap gap-2">
        <FilterLink href={buildHref({ sort, q: query })} label="Tất cả" count={count()} current={!category} />
        {SHOP_CATEGORIES.map((c) => (
          <FilterLink key={c.id} href={buildHref({ category: c.id, sort, q: query })} label={c.label} count={count(c.id)} current={category === c.id} />
        ))}
      </nav>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-[#DDE4EE] bg-white p-4 md:flex-row md:items-center md:justify-between">
        <form onSubmit={onSearch} role="search" className="flex flex-1 gap-2 md:max-w-md">
          <label htmlFor="shop-search" className="sr-only">Tìm sản phẩm</label>
          <input
            key={query ?? ""}
            id="shop-search"
            name="q"
            defaultValue={query}
            placeholder="Tìm thiệp, phong bì, standee..."
            className="w-full rounded-lg border border-[#C5D0DE] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#27548A] focus:ring-4 focus:ring-[#27548A]/10"
          />
          <button type="submit" className="shrink-0 rounded-lg bg-[#27548A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1F4573]">Tìm</button>
        </form>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="mr-1 text-[#5B6B7F]">Sắp xếp:</span>
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={buildHref({ category, sort: s.value, q: query })}
              aria-current={sort === s.value ? "true" : undefined}
              className={"rounded-lg px-3 py-2 font-medium transition-colors " + (sort === s.value ? "bg-[#E8EEF6] text-[#27548A]" : "text-[#3D4C61] hover:bg-[#EEF2F7]")}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-[#5B6B7F]" aria-live="polite">
        {products.length} sản phẩm{activeLabel ? ` trong “${activeLabel}”` : ""}{query ? ` cho “${query}”` : ""}
      </p>

      {products.length === 0 ? (
        <p className="mt-6 rounded-xl bg-[#E8EEF6] p-8 text-center text-[#3D4C61]">
          Chưa có sản phẩm phù hợp.{" "}
          <Link href="/shop" className="font-semibold text-[#27548A] underline">Xem tất cả sản phẩm</Link>
        </p>
      ) : (
        <section aria-label="Danh sách sản phẩm" className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => <ProductCard key={p.slug} product={p} />)}
        </section>
      )}

      <section className="mt-20 flex flex-col items-start justify-between gap-6 rounded-2xl bg-[#27548A] p-8 text-white sm:flex-row sm:items-center md:p-10">
        <div>
          <h2 className="text-2xl font-bold">Cần tư vấn số lượng hoặc thiết kế riêng?</h2>
          <p className="mt-2 max-w-xl text-white/90">Đội ngũ iCards báo giá nhanh và hỗ trợ theo yêu cầu của bạn.</p>
        </div>
        <Link href="/contact" className="shrink-0 rounded-lg bg-white px-6 py-3 font-semibold text-[#27548A] hover:bg-[#E8EEF6]">Liên hệ tư vấn</Link>
      </section>
    </div>
  );
}

function FilterLink({ href, label, count, current }: { href: string; label: string; count: number; current: boolean }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={"inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors " + (current ? "bg-[#27548A] text-white" : "border border-[#DDE4EE] bg-white text-[#27548A] hover:border-[#27548A]")}
    >
      {label}
      <span className={"rounded-full px-2 py-0.5 text-xs " + (current ? "bg-white/20 text-white" : "bg-[#E8EEF6] text-[#27548A]")}>{count}</span>
    </Link>
  );
}
