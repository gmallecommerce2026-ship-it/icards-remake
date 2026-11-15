"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { ProductThumb } from "@/components/shop/ProductThumb";
import { getProductsByCategory, isShopCategory, priceFrom, type Product, type ShopCategoryId } from "@/lib/shop";
import type { Option } from "@/lib/catalog";

/* Giá trị lấy từ ComponentCSS (ProductPageContent) của bản src. */

type SortValue = "popular" | "price-asc" | "price-desc";
const SORTS: { value: SortValue; label: string }[] = [
  { value: "popular", label: "Nổi bật" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
];
const isSort = (v: string | null): v is SortValue => SORTS.some((s) => s.value === v);
const PAGE_SIZE = 4; // mỗi lần "Xem thêm" (như bản src)

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
    <div className="flex w-full flex-col items-center pb-[120px] text-black font-inter">
      <div className="mx-auto flex w-full max-w-[1520px] flex-col items-center gap-5 px-5">
        {/* Bộ lọc danh mục (.invitation-type-filters + .category-button-pro) */}
        <nav
          aria-label="Danh mục sản phẩm"
          className="mt-[25px] flex w-full flex-wrap justify-center gap-5 overflow-x-auto whitespace-nowrap pb-2.5 max-[769px]:justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb:hover]:bg-[#27548A] [&::-webkit-scrollbar-thumb]:bg-[#CDD7E5] [&::-webkit-scrollbar-track]:bg-[#f1f1f1]"
        >
          <FilterButton href={buildHref({ sort, q: query })} label="Tất cả" current={!category} />
          {categories.map((c) => (
            <FilterButton
              key={c.id}
              href={buildHref({ category: c.id as ShopCategoryId, sort, q: query })}
              label={c.label}
              current={category === c.id}
            />
          ))}
        </nav>

        {/* Tìm kiếm & sắp xếp (không có trong bản src, giữ lại từ bản cũ) */}
        <div className="flex w-full flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
          <form onSubmit={onSearch} role="search" className="flex flex-1 gap-2 md:max-w-md">
            <label htmlFor="shop-search" className="sr-only">Tìm sản phẩm</label>
            <input
              key={query ?? ""}
              id="shop-search"
              name="q"
              defaultValue={query}
              placeholder="Tìm thiệp, phong bì, standee..."
              className="w-full border border-[#ddd] bg-white px-4 py-2.5 outline-none focus:border-[#27548A]"
            />
            <button type="submit" className="shrink-0 bg-[#27548A] px-5 py-2.5 font-semibold text-white">Tìm</button>
          </form>
          <div className="flex flex-wrap items-center gap-2">
            {SORTS.map((s) => (
              <Link
                key={s.value}
                href={buildHref({ category, sort: s.value, q: query })}
                aria-current={sort === s.value ? "true" : undefined}
                className={`px-3 py-2 ${sort === s.value ? "font-semibold text-[#27548A]" : "text-[#333]"}`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* key đổi theo bộ lọc để "Xem thêm" quay về trang đầu */}
        <ProductGrid key={`${category ?? ""}|${sort}|${query ?? ""}`} products={products} />
      </div>
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  const [shown, setShown] = useState(PAGE_SIZE);

  if (products.length === 0) {
    return (
      <div className="col-span-full px-5 py-20 text-center text-lg text-[#666]">
        Chưa có sản phẩm nào trong danh mục này.{" "}
        <Link href="/shop" className="font-semibold text-[#27548A] underline">Xem tất cả sản phẩm</Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div className="grid w-full grid-cols-4 gap-x-5 gap-y-[60px] max-[1200px]:grid-cols-3 max-[769px]:grid-cols-2 max-[769px]:gap-x-5 max-[769px]:gap-y-10 max-[481px]:grid-cols-1">
        {products.slice(0, shown).map((p) => (
          <Link key={p.slug} href={`/shop/${p.slug}`} className="group flex cursor-pointer flex-col gap-5">
            <div className="relative w-full overflow-hidden bg-[#f0f0f0] pt-[100%]">
              <div className="absolute inset-0 overflow-hidden">
                <ProductThumb product={p} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-base font-semibold uppercase leading-[1.3] tracking-[0.02em] text-[#27548A]">{p.name}</div>
            </div>
          </Link>
        ))}
      </div>
      {shown < products.length && (
        <button
          onClick={() => setShown((s) => s + PAGE_SIZE)}
          className="flex h-10 cursor-pointer items-center border-[0.5px] border-black px-6 text-base font-medium uppercase transition-all duration-300 hover:border-[#27548A] hover:bg-[#27548A] hover:text-white"
          style={{ borderRadius: 2 }}
        >
          Xem thêm
        </button>
      )}
    </div>
  );
}

function FilterButton({ href, label, current }: { href: string; label: string; current: boolean }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`flex h-10 shrink-0 items-center rounded-[2px] border-[0.5px] border-black px-6 text-base font-medium uppercase transition-all duration-300 ${
        current ? "border-[#27548A] bg-[#27548A] text-white" : "bg-transparent hover:border-[#27548A] hover:bg-[#27548A] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}
