import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { ProductThumb } from "@/components/shop/ProductThumb";
import { ProductBuyBox } from "@/components/shop/ProductBuyBox";
import { discountPercent, getRelatedProducts, priceFrom } from "@/lib/shop";
import { getProduct, getProducts, getShopCategories } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { SideAdsShell } from "@/components/ads/SideAdsShell";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} | iCards`,
    description: product.summary,
    openGraph: { title: product.name, description: product.summary, type: "website" },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [product, all, categories] = await Promise.all([getProduct(slug), getProducts(), getShopCategories()]);
  if (!product) notFound();

  const cat = categories.find((c) => c.id === product.category);
  const related = getRelatedProducts(all, product.slug);
  const off = discountPercent(product);
  const digital = product.shipping === "digital";

  return (
    <SideAdsShell>
      <div className="pb-28 pt-12 lg:pt-16">
        <div className="mx-auto max-w-[1520px] px-5">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted">
            <Link href="/shop" className="hover:text-lacquer">Cửa hàng</Link>
            {cat && (
              <>
                <span aria-hidden>/</span>
                <Link href={`/shop?category=${cat.id}`} className="hover:text-lacquer">{cat.label}</Link>
              </>
            )}
            <span aria-hidden>/</span>
            <span className="truncate text-ink">{product.name}</span>
          </nav>

          <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-24">
            {/* Ảnh: khung vuông viền mảnh, dính khi cuộn */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="relative border border-line bg-white p-3">
                <div className="relative aspect-[4/5] overflow-hidden bg-paper-deep">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <ProductThumb product={product} className="absolute inset-0 h-full w-full" />
                  )}
                </div>
                {off > 0 && (
                  <span className="absolute left-6 top-6 bg-lacquer px-3 py-1.5 text-xs font-semibold tracking-wide text-white">-{off}%</span>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              {cat && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lacquer">{cat.label}</p>}
              <h1 className="mt-4 font-display text-5xl font-medium leading-[1.1] sm:text-6xl">{product.name}</h1>
              <p className="mt-5 text-lg leading-relaxed text-muted">{product.summary}</p>

              <div className="mt-8 flex flex-wrap items-baseline gap-4 border-y border-line py-6">
                <span className="text-sm text-muted">Từ</span>
                <span className="font-display text-4xl font-medium text-lacquer">{formatPrice(priceFrom(product))}</span>
                {off > 0 && <del className="text-base text-muted">{formatPrice(product.compareAtPrice!)}</del>}
              </div>

              <ProductBuyBox product={product} />

              <ol className="mt-12 divide-y divide-line border-y border-line">
                {product.highlights.map((h, i) => (
                  <li key={h} className="flex items-baseline gap-6 py-4">
                    <span className="w-6 shrink-0 font-display text-base text-lacquer tabular-nums">0{i + 1}</span>
                    <span className="text-[15px] leading-relaxed text-ink">{h}</span>
                  </li>
                ))}
              </ol>

              <dl className="mt-10 grid grid-cols-2 gap-px border border-line bg-line">
                <InfoCell label={digital ? "Nhận hàng" : "Thời gian làm"} value={product.leadTime} />
                <InfoCell label="Hình thức" value={digital ? "Tệp kỹ thuật số" : "Giao hàng"} />
              </dl>
            </div>
          </div>
        </div>

        {(product.description || product.specs.length > 0) && (
          <section className="mt-28 bg-paper py-24">
            <div className="mx-auto grid max-w-[1520px] gap-16 px-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-24">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lacquer">Chi tiết</p>
                <h2 className="mt-4 font-display text-4xl font-medium leading-tight">Về sản phẩm này</h2>
                <p className="mt-6 whitespace-pre-line font-display text-xl leading-relaxed text-ink/85">{product.description}</p>
              </div>
              {product.specs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lacquer">Thông số</p>
                  <dl className="mt-4 divide-y divide-line border-y border-ink bg-white">
                    {product.specs.map((s) => (
                      <div key={s.label} className="flex items-start justify-between gap-6 px-5 py-4 text-sm">
                        <dt className="text-muted">{s.label}</dt>
                        <dd className="text-right font-medium">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section aria-label="Sản phẩm liên quan" className="mx-auto mt-28 max-w-[1520px] px-5">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <h2 className="font-display text-4xl font-medium">Có thể bạn cũng thích</h2>
              <Link href="/shop" className="border-b border-ink pb-0.5 text-sm font-medium hover:border-lacquer hover:text-lacquer">
                Xem tất cả sản phẩm
              </Link>
            </div>
            <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-3">
              {related.map((p) => (
                <ShopProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </SideAdsShell>
  );
}

function InfoCell({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-white p-5">
      <dt className="text-xs uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="mt-2 text-[15px] font-medium text-ink">{value}</dd>
    </div>
  );
}
