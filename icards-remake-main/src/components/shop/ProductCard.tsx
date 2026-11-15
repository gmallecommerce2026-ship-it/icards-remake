import Link from "next/link";
import { priceFrom, type Product } from "@/lib/shop";
import { formatPrice } from "@/lib/format";
import { ProductThumb } from "./ProductThumb";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#27548A]"
    >
      <ProductThumb product={product} className="rounded-lg ring-1 ring-[#0E1B2C]/10" />
      <h3 className="mt-3 text-base font-semibold group-hover:underline group-hover:underline-offset-4">{product.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#5B6B7F]">{product.summary}</p>
      <p className="mt-2 text-sm font-semibold text-[#27548A]">Từ {formatPrice(priceFrom(product))}</p>
    </Link>
  );
}
