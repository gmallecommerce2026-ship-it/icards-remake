import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import {
  ALL_LABEL,
  SHOP_CATEGORIES,
  SORTS,
  countByCategory,
  getProducts,
  getShopCategory,
  getSort,
  type SortValue,
} from "@/lib/shop";
import { PageHero, Container } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "Cửa hàng & Sản phẩm | iCards",
  description:
    "Thiệp in, quà tặng, thẻ NFC, standee QR và combo cho đám cưới, sự kiện. Đặt hàng nhanh, đồng bộ với thiệp mời online.",
};

type SearchParams = Promise<{ category?: string; sort?: string; q?: string }>;

/** Dựng URL giữ nguyên các bộ lọc còn lại. */
function buildHref(params: { category?: string; sort?: SortValue; q?: string }) {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.sort && params.sort !== "popular") sp.set("sort", params.sort);
  if (params.q) sp.set("q", params.q);
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, sort: sortParam, q } = await searchParams;
  const active = getShopCategory(category);
  const sort = getSort(sortParam);
  const query = q?.trim() || undefined;
  const products = getProducts({ category: active?.slug, sort, q: query });

  return (
    <main className="min-h-screen bg-porcelain">
      <PageHero
        title="Cửa hàng & Sản phẩm"
        description="Thiệp in, quà tặng và phụ kiện QR/NFC đồng bộ với thiệp mời online của bạn."
      />

      <Container className="py-12 lg:py-16">
        {/* Danh mục */}
        <nav aria-label="Danh mục sản phẩm" className="mb-8 flex flex-wrap gap-2">
          <FilterLink
            href={buildHref({ sort, q: query })}
            label={ALL_LABEL}
            count={countByCategory()}
            current={!active}
          />
          {SHOP_CATEGORIES.map((c) => (
            <FilterLink
              key={c.slug}
              href={buildHref({ category: c.slug, sort, q: query })}
              label={c.label}
              count={countByCategory(c.slug)}
              current={active?.slug === c.slug}
            />
          ))}
        </nav>

        {/* Thanh công cụ: tìm kiếm + sắp xếp */}
        <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 md:flex-row md:items-center md:justify-between">
          <form action="/shop" method="get" role="search" className="flex flex-1 gap-2 md:max-w-md">
            {active && <input type="hidden" name="category" value={active.slug} />}
            {sort !== "popular" && <input type="hidden" name="sort" value={sort} />}
            <label htmlFor="shop-search" className="sr-only">
              Tìm sản phẩm
            </label>
            <input
              id="shop-search"
              name="q"
              defaultValue={query}
              placeholder="Tìm thiệp, quà tặng, combo..."
              className="w-full rounded-full border border-line bg-white px-5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#27548A] focus:ring-4 focus:ring-[#27548A]/10"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-[#27548A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e4270]"
            >
              Tìm
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="mr-1 text-slate-500">Sắp xếp:</span>
            {SORTS.map((s) => (
              <Link
                key={s.value}
                href={buildHref({ category: active?.slug, sort: s.value, q: query })}
                aria-current={sort === s.value ? "true" : undefined}
                className={
                  "rounded-full px-4 py-2 font-medium transition-colors " +
                  (sort === s.value
                    ? "bg-[#E8EEF6] text-[#27548A]"
                    : "text-slate-600 hover:bg-slate-100")
                }
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        <p className="mb-6 text-sm text-slate-500" aria-live="polite">
          {products.length} sản phẩm
          {active ? ` trong “${active.label}”` : ""}
          {query ? ` cho “${query}”` : ""}
        </p>

        {products.length === 0 ? (
          <p className="mx-auto mt-8 max-w-3xl rounded-2xl bg-[#E8EEF6] p-8 text-center text-slate-700">
            Chưa có sản phẩm phù hợp.{" "}
            <Link href="/shop" className="font-semibold text-[#27548A] underline">
              Xem tất cả sản phẩm
            </Link>
          </p>
        ) : (
          <section
            aria-label="Danh sách sản phẩm"
            className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </section>
        )}

        <section className="mt-20 flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#27548A] p-8 text-white shadow-xl shadow-[#27548A]/20 sm:flex-row sm:items-center md:p-12">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Cần tư vấn số lượng hoặc thiết kế riêng?</h2>
            <p className="mt-3 max-w-xl text-lg text-white/90">
              Đội ngũ iCards báo giá nhanh và hỗ trợ thiết kế theo yêu cầu của bạn.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 rounded-full bg-white px-8 py-4 font-semibold text-[#27548A] transition-colors hover:bg-[#E8EEF6]"
          >
            Liên hệ tư vấn
          </Link>
        </section>
      </Container>
    </main>
  );
}

function FilterLink({
  href,
  label,
  count,
  current,
}: {
  href: string;
  label: string;
  count: number;
  current: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={
        "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors " +
        (current
          ? "bg-[#27548A] text-white"
          : "border border-line bg-white text-[#27548A] hover:border-[#27548A]")
      }
    >
      {label}
      <span
        className={
          "rounded-full px-2 py-0.5 text-xs " +
          (current ? "bg-white/20 text-white" : "bg-[#E8EEF6] text-[#27548A]")
        }
      >
        {count}
      </span>
    </Link>
  );
}