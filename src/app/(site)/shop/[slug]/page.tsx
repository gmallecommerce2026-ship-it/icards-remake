import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard, {
  ProductCover,
  ProductPrice,
  ProductRating,
} from "@/components/shop/ProductCard";
import { PRODUCTS, SHOP_CATEGORIES, getProduct, getRelatedProducts } from "@/lib/shop";
import { Container } from "@/components/ui/Primitives";

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
    description: product.excerpt,
    openGraph: { title: product.name, description: product.excerpt, type: "website" },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const cat = SHOP_CATEGORIES.find((c) => c.slug === product.category);
  const related = getRelatedProducts(product);

  return (
    <main className="min-h-screen bg-white pt-[72px]">
      <Container className="py-10 lg:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <Link href="/shop" className="transition-colors hover:text-[#27548A]">
            Cửa hàng
          </Link>
          {cat && (
            <>
              {" / "}
              <Link
                href={`/shop?category=${cat.slug}`}
                className="font-medium transition-colors hover:text-[#27548A]"
              >
                {cat.label}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="group">
            <ProductCover product={product} className="aspect-[4/5] w-full rounded-3xl" />
          </div>

          <div className="lg:py-4">
            {cat && (
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{cat.label}</p>
            )}
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-4">
              <ProductRating product={product} />
            </div>

            <div className="mt-6">
              <ProductPrice product={product} size="lg" />
              <p className="mt-1 text-sm text-slate-500">Giá tham khảo, chưa gồm phí vận chuyển.</p>
            </div>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">{product.excerpt}</p>

            <ul className="mt-8 space-y-3 text-[17px] text-slate-700">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ backgroundColor: product.tone.bg, color: product.tone.ink }}
                  >
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/contact?product=${product.slug}`}
                className="rounded-full bg-[#27548A] px-8 py-4 text-center font-semibold text-white transition-colors hover:bg-[#1e4270]"
              >
                Đặt hàng / Nhận báo giá
              </Link>
              <Link
                href="/templates"
                className="rounded-full border border-[#27548A] px-8 py-4 text-center font-semibold text-[#27548A] transition-colors hover:bg-[#E8EEF6]"
              >
                Chọn mẫu thiệp
              </Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section aria-label="Sản phẩm liên quan" className="mt-20 border-t border-line pt-12">
            <h2 className="text-2xl font-bold text-slate-900">Có thể bạn cũng thích</h2>
            <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}