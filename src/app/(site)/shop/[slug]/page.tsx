import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight, Clock, Download, Truck } from "lucide-react";
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
      <div className="mx-auto w-full max-w-[1280px] px-5 pb-24 pt-8 text-[#0E1B2C] lg:pt-12">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-[#5B6B7F]">
          <Link href="/shop" className="hover:text-[#27548A]">Cửa hàng</Link>
          {cat && (
            <>
              <ChevronRight size={14} aria-hidden />
              <Link href={`/shop?category=${cat.id}`} className="hover:text-[#27548A]">{cat.label}</Link>
            </>
          )}
          <ChevronRight size={14} aria-hidden />
          <span className="truncate font-medium text-[#0E1B2C]">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
          {/* Ảnh sản phẩm: giữ cố định khi cuộn */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#EEF2F7] lg:sticky lg:top-28 lg:self-start">
            {product.image ? (
              <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <ProductThumb product={product} className="absolute inset-0 h-full w-full" />
            )}
            {off > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-[#B94A12] px-3 py-1.5 text-sm font-semibold text-white">-{off}%</span>
            )}
          </div>

          <div className="flex flex-col">
            {cat && (
              <span className="w-fit rounded-full bg-[#EEF2F7] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#27548A]">
                {cat.label}
              </span>
            )}
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
            <p className="mt-4 text-lg leading-relaxed text-[#5B6B7F]">{product.summary}</p>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-sm text-[#5B6B7F]">Từ</span>
              <span className="text-3xl font-bold text-[#27548A]">{formatPrice(priceFrom(product))}</span>
              {off > 0 && <del className="text-base text-[#9AA3AF]">{formatPrice(product.compareAtPrice!)}</del>}
            </div>

            <ProductBuyBox product={product} />

            <ul className="mt-8 grid gap-3">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-[#3D4C61]">
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
                    style={{ background: product.tone.bg, color: product.tone.ink }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <InfoChip icon={<Clock size={18} aria-hidden />} label={digital ? "Nhận hàng" : "Thời gian làm"} value={product.leadTime} />
              <InfoChip
                icon={digital ? <Download size={18} aria-hidden /> : <Truck size={18} aria-hidden />}
                label="Hình thức"
                value={digital ? "Tệp kỹ thuật số" : "Giao hàng"}
              />
            </div>
          </div>
        </div>

        <section className="mt-20 grid gap-12 border-t border-[#E3E9F2] pt-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Mô tả chi tiết</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-[#3D4C61]">{product.description}</p>
          </div>
          {product.specs.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Thông số</h2>
              <dl className="mt-4 divide-y divide-[#EEF2F7] rounded-2xl border border-[#E3E9F2] bg-white px-5">
                {product.specs.map((s) => (
                  <div key={s.label} className="flex items-start justify-between gap-6 py-3.5 text-sm">
                    <dt className="text-[#5B6B7F]">{s.label}</dt>
                    <dd className="text-right font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>

        {related.length > 0 && (
          <section aria-label="Sản phẩm liên quan" className="mt-20 border-t border-[#E3E9F2] pt-12">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">Có thể bạn cũng thích</h2>
              <Link href="/shop" className="text-sm font-semibold text-[#27548A] hover:underline">Xem tất cả</Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

function InfoChip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#E3E9F2]">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2F7] text-[#27548A]">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-[#5B6B7F]">{label}</p>
        <p className="mt-0.5 text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
