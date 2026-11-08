"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

/* Thanh phụ chỉ còn nút giỏ hàng: Cửa hàng và Dịch vụ đã gộp vào mục menu chung */
export function ShopBar() {
  const { count } = useCart();
  return (
    <div className="flex justify-end border-b border-[#DDE4EE] bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-end px-4 py-3 text-sm sm:px-6 lg:px-8">
        <Link
          href="/shop/cart"
          className="inline-flex items-center gap-2 rounded-lg border border-[#DDE4EE] px-3 py-1.5 font-medium hover:border-[#27548A]"
        >
          Giỏ hàng
          <span className={"min-w-5 rounded-full px-1.5 text-center text-xs font-semibold " + (count > 0 ? "bg-[#27548A] text-white" : "bg-[#EEF2F7] text-[#5B6B7F]")}>
            {count}
          </span>
        </Link>
      </div>
    </div>
  );
}
