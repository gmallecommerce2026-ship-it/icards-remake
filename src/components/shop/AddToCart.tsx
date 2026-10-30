"use client";

import Link from "next/link";
import { useState } from "react";
import { MAX_QTY, type Product } from "@/lib/shop";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27548A]";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const total = variant.price * qty;

  function handleAdd() {
    add(product.slug, variant.id, qty);
    setAdded(true);
  }

  return (
    <div className="rounded-xl border border-[#DDE4EE] bg-white p-5 sm:p-6">
      <fieldset>
        <legend className="text-sm font-semibold">Chọn gói</legend>
        <div className="mt-3 grid gap-2">
          {product.variants.map((v) => {
            const active = v.id === variantId;
            return (
              <label
                key={v.id}
                className={
                  "flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors " +
                  (active ? "border-[#27548A] bg-[#F0F5FB]" : "border-[#DDE4EE] hover:border-[#9DB3D1]")
                }
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="variant"
                    value={v.id}
                    checked={active}
                    onChange={() => {
                      setVariantId(v.id);
                      setAdded(false);
                    }}
                    className="size-4 accent-[#27548A]"
                  />
                  <span className="font-medium">{v.label}</span>
                </span>
                <span className="text-[#3D4C61]">{formatPrice(v.price)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 flex items-center justify-between">
        <span id="qty-label" className="text-sm font-semibold">Số lượng</span>
        <div role="group" aria-labelledby="qty-label" className="inline-flex items-center rounded-lg border border-[#DDE4EE]">
          <button
            type="button"
            aria-label="Giảm số lượng"
            disabled={qty <= 1}
            onClick={() => {
              setQty((q) => Math.max(1, q - 1));
              setAdded(false);
            }}
            className={`size-10 text-lg disabled:opacity-35 ${focus}`}
          >
            −
          </button>
          <output aria-live="polite" className="w-10 text-center text-sm font-semibold">{qty}</output>
          <button
            type="button"
            aria-label="Tăng số lượng"
            disabled={qty >= MAX_QTY}
            onClick={() => {
              setQty((q) => Math.min(MAX_QTY, q + 1));
              setAdded(false);
            }}
            className={`size-10 text-lg disabled:opacity-35 ${focus}`}
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-baseline justify-between border-t border-[#DDE4EE] pt-5">
        <span className="text-sm text-[#5B6B7F]">Tạm tính</span>
        <span className="text-xl font-bold">{formatPrice(total)}</span>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className={`mt-4 h-12 w-full rounded-lg bg-[#27548A] text-base font-semibold text-white transition-colors hover:bg-[#1F4573] ${focus}`}
      >
        Thêm vào giỏ
      </button>

      <p role="status" className="mt-3 min-h-5 text-sm text-[#1D5B35]">
        {added && (
          <>
            Đã thêm vào giỏ.{" "}
            <Link href="/shop/cart" className="font-semibold underline underline-offset-4">
              Xem giỏ hàng
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
