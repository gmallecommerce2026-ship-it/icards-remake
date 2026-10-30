import Image from "next/image";
import Link from "next/link";
import { SHOP_CATEGORIES, discountPercent, formatVND, type Product } from "@/lib/shop";

/** Ảnh bìa sản phẩm: dùng ảnh thật nếu có, không thì nền màu theo tone của sản phẩm. */
export function ProductCover({ product, className = "" }: { product: Product; className?: string }) {
  const discount = discountPercent(product);

  return (
    <div
      className={"relative overflow-hidden " + className}
      style={{ backgroundColor: product.tone.bg }}
    >
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
        >
          <span
            className="select-none text-[9rem] font-black leading-none opacity-[0.12]"
            style={{ color: product.tone.ink }}
          >
            {product.name.charAt(0)}
          </span>
          <span
            className="absolute bottom-5 left-5 right-5 text-lg font-bold leading-snug"
            style={{ color: product.tone.ink }}
          >
            {product.name}
          </span>
        </div>
      )}

      <div className="absolute left-3 top-3 flex gap-2">
        {product.badge && (
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#27548A] shadow-sm">
            {product.badge}
          </span>
        )}
        {discount && (
          <span className="rounded-full bg-[#B42318] px-3 py-1 text-xs font-bold text-white shadow-sm">
            -{discount}%
          </span>
        )}
      </div>
    </div>
  );
}

export function ProductPrice({ product, size = "md" }: { product: Product; size?: "md" | "lg" }) {
  return (
    <p className="flex items-baseline gap-2">
      <span
        className={
          "font-bold text-[#27548A] " + (size === "lg" ? "text-3xl" : "text-lg")
        }
      >
        {formatVND(product.price)}
      </span>
      {product.compareAt && (
        <span className={"text-slate-400 line-through " + (size === "lg" ? "text-lg" : "text-sm")}>
          {formatVND(product.compareAt)}
        </span>
      )}
    </p>
  );
}

export function ProductRating({ product }: { product: Product }) {
  return (
    <p className="flex items-center gap-1.5 text-sm text-slate-500">
      <span className="text-amber-500" aria-hidden="true">★</span>
      <span className="font-medium text-slate-700">{product.rating.toFixed(1)}</span>
      <span aria-hidden="true">·</span>
      <span>Đã bán {product.sold.toLocaleString("vi-VN")}</span>
    </p>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const cat = SHOP_CATEGORIES.find((c) => c.slug === product.category);

  return (
    <article className="group">
      <Link
        href={`/shop/${product.slug}`}
        className="block rounded-3xl border border-line bg-white p-3 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#27548A]/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#27548A]"
      >
        <ProductCover product={product} className="aspect-[4/5] rounded-2xl" />

        <div className="space-y-2 px-2 pb-3 pt-4">
          {cat && (
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{cat.label}</p>
          )}
          <h3 className="text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#27548A]">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{product.excerpt}</p>
          <div className="flex items-end justify-between gap-3 pt-2">
            <ProductPrice product={product} />
            <ProductRating product={product} />
          </div>
        </div>
      </Link>
    </article>
  );
}