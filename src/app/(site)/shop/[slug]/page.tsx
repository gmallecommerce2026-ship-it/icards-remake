import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductThumb } from "@/components/shop/ProductThumb";
import { AddToCart } from "@/components/shop/AddToCart";
import { PRODUCTS, SHOP_CATEGORIES, getProduct, getRelatedProducts, priceFrom } from "@/lib/shop";
import { formatPrice } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} | iCards`,
    description: product.summary,
    openGraph: { title: product.name, description: product.summary, type: "website" },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const cat = SHOP_CATEGORIES.find((c) => c.id === product.category);
  const related = getRelatedProducts(product.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-[#5B6B7F]">
        <Link href="/shop" className="hover:text-[#27548A]">Cửa hàng</Link>
        {cat && (
          <>
            {" / "}
            <Link href={`/shop?category=${cat.id}`} className="font-medium hover:text-[#27548A]">{cat.label}</Link>
          </>
        )}
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductThumb product={product} className="rounded-2xl ring-1 ring-[#0E1B2C]/10 lg:sticky lg:top-24 lg:self-start" />

        <div>
          {cat && <p className="text-sm font-semibold uppercase tracking-wide text-[#5B6B7F]">{cat.label}</p>}
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-lg font-semibold text-[#27548A]">Từ {formatPrice(priceFrom(product))}</p>
          <p className="mt-4 leading-relaxed text-[#3D4C61]">{product.description}</p>

          <ul className="mt-6 space-y-2.5 text-[#3D4C61]">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3">
                <span aria-hidden className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: product.tone.bg, color: product.tone.ink }}>✓</span>
                {h}
              </li>
            ))}
          </ul>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-[#DDE4EE] pt-6 text-sm">
            <dt className="text-[#5B6B7F]">{product.shipping === "digital" ? "Nhận hàng" : "Thời gian làm"}</dt>
            <dd className="font-medium">{product.leadTime}</dd>
            {product.specs.map((s) => (
              <div key={s.label} className="contents">
                <dt className="text-[#5B6B7F]">{s.label}</dt>
                <dd className="font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <AddToCart product={product} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-label="Sản phẩm liên quan" className="mt-20 border-t border-[#DDE4EE] pt-12">
          <h2 className="text-2xl font-bold">Có thể bạn cũng thích</h2>
          <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
