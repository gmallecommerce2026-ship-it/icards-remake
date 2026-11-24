"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { getProductsByCategory, isShopCategory, priceFrom, type Product, type ShopCategoryId } from "@/lib/shop";
import type { Option } from "@/lib/catalog";

/* Giá trị lấy từ ComponentCSS (ProductPageContent) của bản src. */

type SortValue = "popular" | "price-asc" | "price-desc";
const SORTS: { value: SortValue; label: string }[] = [
  { value: "popular", label: "Nổi bật" },
  { value: "price-asc", label: "Giá thấp → cao" },
  { value: "price-desc", label: "Giá cao → thấp" },
];
const isSort = (v: string | null): v is SortValue => SORTS.some((s) => s.value === v);
const PAGE_SIZE = 8; // mỗi lần "Xem thêm"

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
    <div id="san-pham" className="w-full scroll-mt-24 pb-24 text-[#0E1B2C]">
      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6 px-5">
        {/* Bộ lọc danh mục: pill bo tròn, cuộn ngang trên điện thoại */}
        <nav
          aria-label="Danh mục sản phẩm"
          className="flex w-full gap-2.5 overflow-x-auto pb-1 md:flex-wrap md:justify-center [&::-webkit-scrollbar]:hidden"
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

        {/* Tìm kiếm & sắp xếp trong một thanh */}
        <div className="flex w-full flex-col gap-3 rounded-2xl border border-[#E3E9F2] bg-white p-3 md:flex-row md:items-center md:justify-between">
          <form onSubmit={onSearch} role="search" className="relative w-full md:max-w-md">
            <label htmlFor="shop-search" className="sr-only">Tìm sản phẩm</label>
            <Search size={18} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A97A8]" />
            <input
              key={query ?? ""}
              id="shop-search"
              name="q"
              defaultValue={query}
              placeholder="Tìm thiệp, phong bì, standee..."
              className="h-11 w-full rounded-full border border-[#DDE4EE] bg-[#F6F8FB] pl-11 pr-20 text-sm outline-none transition focus:border-[#27548A] focus:bg-white"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-full bg-[#27548A] px-4 text-sm font-semibold text-white transition hover:bg-[#1F426B]"
            >
              Tìm
            </button>
          </form>

          <div role="group" aria-label="Sắp xếp" className="flex w-full items-center gap-1 rounded-full bg-[#F6F8FB] p-1 md:w-auto">
            {SORTS.map((s) => (
              <Link
                key={s.value}
                href={buildHref({ category, sort: s.value, q: query })}
                aria-current={sort === s.value ? "true" : undefined}
                className={`flex-1 whitespace-nowrap rounded-full px-4 py-2 text-center text-sm transition md:flex-none ${
                  sort === s.value ? "bg-white font-semibold text-[#27548A] shadow-sm" : "text-[#5B6B7F] hover:text-[#0E1B2C]"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex w-full items-center justify-between text-sm text-[#5B6B7F]">
          <p>
            <b className="font-semibold text-[#0E1B2C]">{products.length}</b> sản phẩm
          </p>
          {query && <p>Kết quả cho “{query}”</p>}
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
      <div className="w-full rounded-2xl border border-dashed border-[#C9D3E0] bg-white px-6 py-20 text-center">
        <p className="text-lg font-semibold">Chưa có sản phẩm nào trong danh mục này.</p>
        <p className="mt-2 text-sm text-[#5B6B7F]">Thử danh mục khác hoặc xem toàn bộ sản phẩm.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-[#27548A] px-6 text-sm font-semibold text-white transition hover:bg-[#1F426B]"
        >
          Xem tất cả sản phẩm
        </Link>
      </div>
    );
  }

  const remaining = products.length - shown;

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div className="grid w-full grid-cols-4 gap-6 max-[1200px]:grid-cols-3 max-[769px]:grid-cols-2 max-[769px]:gap-4">
        {products.slice(0, shown).map((p) => (
          <ShopProductCard key={p.slug} product={p} />
        ))}
      </div>
      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setShown((s) => s + PAGE_SIZE)}
          className="inline-flex h-11 items-center rounded-full border border-[#27548A] px-7 text-sm font-semibold text-[#27548A] transition hover:bg-[#27548A] hover:text-white"
        >
          Xem thêm sản phẩm ({remaining} còn lại)
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
      className={`inline-flex h-10 shrink-0 items-center rounded-full border px-5 text-sm font-medium transition-colors duration-200 ${
        current
          ? "border-[#27548A] bg-[#27548A] text-white shadow-[0_8px_18px_-10px_rgba(39,84,138,0.6)]"
          : "border-[#DDE4EE] bg-white text-[#0E1B2C] hover:border-[#27548A] hover:text-[#27548A]"
      }`}
    >
      {label}
    </Link>
  );
}
