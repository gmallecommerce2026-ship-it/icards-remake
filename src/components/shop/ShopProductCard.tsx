import Link from "next/link";
import { ProductThumb } from "@/components/shop/ProductThumb";
import { discountPercent, priceFrom, type Product } from "@/lib/shop";
import { formatPrice } from "@/lib/format";

/* Thẻ sản phẩm dùng chung: khung vuông, viền mảnh, chữ serif căn giữa (cùng ngôn ngữ với trang mẫu thiệp). */
export function ShopProductCard({ product: p }: { product: Product }) {
  const off = discountPercent(p);
  return (
    <Link href={`/shop/${p.slug}`} className="group block text-center">
      <div className="relative border border-line bg-white p-3 transition-shadow duration-500 group-hover:shadow-lg">
        <div className="relative aspect-[4/5] overflow-hidden bg-paper-deep">
          {p.image ? (
            <img
              src={p.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <ProductThumb product={p} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105" />
          )}
        </div>
        {off > 0 && (
          <span className="absolute left-5 top-5 bg-lacquer px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">-{off}%</span>
        )}
      </div>
      <h3 className="mt-5 font-display text-xl font-medium leading-snug transition-colors duration-300 group-hover:text-lacquer">
        {p.name}
      </h3>
      <p className="mt-1 line-clamp-1 text-sm text-muted">{p.summary}</p>
      <p className="mt-2 text-sm">
        {off > 0 && <del className="mr-2 text-muted">{formatPrice(p.compareAtPrice!)}</del>}
        <span className="font-semibold text-ink">
          {off > 0 ? "" : "Từ "}
          {formatPrice(priceFrom(p))}
        </span>
      </p>
    </Link>
  );
}
