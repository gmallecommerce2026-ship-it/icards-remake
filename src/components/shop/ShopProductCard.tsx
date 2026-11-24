import Link from "next/link";
import { ProductThumb } from "@/components/shop/ProductThumb";
import { discountPercent, priceFrom, type Product } from "@/lib/shop";
import { formatPrice } from "@/lib/format";

/* Thẻ sản phẩm dùng chung cho trang danh sách và phần "Có thể bạn cũng thích". */
export function ShopProductCard({ product: p }: { product: Product }) {
  const off = discountPercent(p);
  return (
    <Link
      href={`/shop/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#E3E9F2] bg-white p-3 transition duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_22px_40px_-26px_rgba(14,27,44,0.45)]"
    >
      <span className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-[#EEF2F7]">
        {p.image ? (
          <img
            src={p.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ProductThumb product={p} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
        )}
        {off > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-[#B94A12] px-2.5 py-1 text-xs font-semibold text-white">-{off}%</span>
        )}
      </span>
      <span className="flex flex-1 flex-col gap-1.5 px-1.5 pb-1.5 pt-4">
        <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#0E1B2C] transition-colors group-hover:text-[#27548A]">
          {p.name}
        </span>
        <span className="line-clamp-1 text-sm text-[#5B6B7F]">{p.summary}</span>
        <span className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2">
          {off > 0 && <del className="text-sm text-[#9AA3AF]">{formatPrice(p.compareAtPrice!)}</del>}
          <span className="font-bold text-[#27548A]">
            {off > 0 ? "" : "Từ "}
            {formatPrice(priceFrom(p))}
          </span>
        </span>
      </span>
    </Link>
  );
}
