"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/shop";

/* Khối chọn gói + nút liên hệ đặt hàng: chọn gói sẽ đổi trạng thái và thông báo gói đang chọn. */
export function ProductBuyBox({ product }: { product: Product }) {
  const variants = product.variants;
  const [selected, setSelected] = useState(variants[0]?.id);
  const current = variants.find((v) => v.id === selected) ?? variants[0];

  return (
    <div className="rounded-2xl border border-[#E3E9F2] bg-white p-5 sm:p-6">
      {variants.length > 0 && (
        <>
          <p className="text-sm font-semibold">Chọn gói</p>
          <div role="radiogroup" aria-label="Chọn gói" className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {variants.map((v) => {
              const active = v.id === current?.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected(v.id)}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                    active ? "border-[#27548A] bg-[#F3F7FC] ring-1 ring-[#27548A]" : "border-[#DDE4EE] bg-white hover:border-[#27548A]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                        active ? "border-[#27548A] bg-[#27548A]" : "border-[#C5D0DE]"
                      }`}
                    >
                      {active && <Check size={10} className="text-white" />}
                    </span>
                    <span className="font-medium">{v.label}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-[#27548A]">{formatPrice(v.price)}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <Link
        href="/contact"
        className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-[#27548A] text-base font-semibold text-white transition hover:bg-[#1F426B]"
      >
        Liên hệ để đặt sản phẩm
      </Link>
      <p className="mt-3 text-center text-sm text-[#5B6B7F]">
        {current ? <>Gói đang chọn: <b className="font-semibold text-[#0E1B2C]">{current.label}</b>. </> : null}
        Đội ngũ iCards sẽ báo giá và xác nhận đơn cho bạn.
      </p>
    </div>
  );
}
