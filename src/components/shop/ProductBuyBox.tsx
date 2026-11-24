"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/shop";

/* Bảng chọn gói (hàng kẻ mảnh, ô vuông) và nút đặt hàng. */
export function ProductBuyBox({ product }: { product: Product }) {
  const variants = product.variants;
  const [selected, setSelected] = useState(variants[0]?.id);
  const current = variants.find((v) => v.id === selected) ?? variants[0];

  return (
    <div>
      {variants.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Chọn gói</p>
          <div role="radiogroup" aria-label="Chọn gói" className="mt-3 border-t border-ink">
            {variants.map((v) => {
              const active = v.id === current?.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected(v.id)}
                  className={`flex w-full items-center justify-between gap-4 border-b border-line px-1 py-4 text-left transition-colors ${
                    active ? "bg-lacquer-soft" : "hover:bg-paper"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span
                      aria-hidden
                      className={`size-4 shrink-0 border ${active ? "border-lacquer bg-lacquer" : "border-ink/40 bg-white"}`}
                    />
                    <span className="text-[15px] font-medium">{v.label}</span>
                  </span>
                  <span className={`shrink-0 text-[15px] ${active ? "font-semibold text-lacquer" : "text-ink"}`}>
                    {formatPrice(v.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Link
        href="/contact"
        className="mt-8 flex h-14 w-full items-center justify-center rounded-sm bg-ink text-sm font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-lacquer"
      >
        Liên hệ để đặt sản phẩm
      </Link>
      <p className="mt-4 text-center text-sm text-muted">
        {current ? <>Gói đang chọn: <span className="font-semibold text-ink">{current.label}</span>. </> : null}
        Đội ngũ iCards sẽ báo giá và xác nhận đơn cho bạn.
      </p>
    </div>
  );
}
