"use client";

import Link from "next/link";
import { CHECKOUT_HREF, MAX_QTY, getProduct, getVariant, type Product, type Variant } from "@/lib/shop";
import { formatPrice } from "@/lib/format";
import { useCart, type CartLine } from "./CartProvider";
import { ProductThumb } from "./ProductThumb";

type Resolved = { line: CartLine; product: Product; variant: Variant };

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27548A]";

export function CartView() {
  const { lines, ready, setQty, remove, clear } = useCart();

  if (!ready) {
    return <p className="text-[#5B6B7F]" role="status">Đang tải giỏ hàng…</p>;
  }

  const items = lines.flatMap<Resolved>((line) => {
    const product = getProduct(line.slug);
    const variant = product ? getVariant(product, line.variantId) : undefined;
    return product && variant ? [{ line, product, variant }] : [];
  });

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#C5D0DE] bg-white px-6 py-16 text-center">
        <p className="text-lg font-semibold">Giỏ hàng đang trống</p>
        <p className="mt-1 text-sm text-[#5B6B7F]">Thêm thiệp giấy, standee hoặc gói tin nhắn để bắt đầu.</p>
        <Link href="/shop" className={`mt-6 inline-flex h-11 items-center rounded-lg bg-[#27548A] px-5 text-sm font-semibold text-white ${focus}`}>
          Vào cửa hàng
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((s, { line, variant }) => s + variant.price * line.qty, 0);
  const hasPhysical = items.some(({ product }) => product.shipping === "ship");

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
      <ul className="divide-y divide-[#DDE4EE] border-y border-[#DDE4EE]">
        {items.map(({ line, product, variant }) => (
          <li key={line.key} className="flex gap-4 py-5">
            <Link href={`/shop/${product.slug}`} className="w-24 shrink-0 sm:w-32" tabIndex={-1} aria-hidden>
              <ProductThumb product={product} className="rounded-lg" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row">
              <div className="min-w-0">
                <Link href={`/shop/${product.slug}`} className="font-semibold hover:underline hover:underline-offset-4">
                  {product.name}
                </Link>
                <p className="mt-0.5 text-sm text-[#5B6B7F]">{variant.label}</p>
                <button
                  type="button"
                  onClick={() => remove(line.key)}
                  className={`mt-2 text-sm text-[#B3261E] underline underline-offset-4 ${focus}`}
                >
                  Xóa khỏi giỏ
                </button>
              </div>
              <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end sm:justify-between">
                <div className="inline-flex items-center rounded-lg border border-[#DDE4EE] bg-white">
                  <button type="button" aria-label={`Giảm số lượng ${product.name}`} disabled={line.qty <= 1} onClick={() => setQty(line.key, line.qty - 1)} className={`size-9 disabled:opacity-35 ${focus}`}>−</button>
                  <span className="w-9 text-center text-sm font-semibold" aria-live="polite">{line.qty}</span>
                  <button type="button" aria-label={`Tăng số lượng ${product.name}`} disabled={line.qty >= MAX_QTY} onClick={() => setQty(line.key, line.qty + 1)} className={`size-9 disabled:opacity-35 ${focus}`}>+</button>
                </div>
                <p className="font-semibold">{formatPrice(variant.price * line.qty)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="rounded-xl border border-[#DDE4EE] bg-white p-6 lg:sticky lg:top-8">
        <h2 className="text-lg font-semibold">Tóm tắt đơn hàng</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-[#5B6B7F]">Tạm tính</dt>
            <dd className="font-semibold">{formatPrice(subtotal)}</dd>
          </div>
          {hasPhysical && (
            <div className="flex justify-between">
              <dt className="text-[#5B6B7F]">Vận chuyển</dt>
              <dd>Tính ở bước thanh toán</dd>
            </div>
          )}
        </dl>
        <div className="mt-4 flex items-baseline justify-between border-t border-[#DDE4EE] pt-4">
          <span className="font-semibold">Tổng cộng</span>
          <span className="text-xl font-bold">{formatPrice(subtotal)}</span>
        </div>
        <Link href={CHECKOUT_HREF} className={`mt-5 flex h-12 items-center justify-center rounded-lg bg-[#27548A] font-semibold text-white hover:bg-[#1F4573] ${focus}`}>
          Tiến hành thanh toán
        </Link>
        <button type="button" onClick={clear} className={`mt-3 w-full text-center text-sm text-[#5B6B7F] underline underline-offset-4 ${focus}`}>
          Xóa toàn bộ giỏ hàng
        </button>
      </aside>
    </div>
  );
}
