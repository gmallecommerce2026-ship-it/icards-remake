"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function ShopBar() {
  const { count } = useCart();
  return (
    <div className="border-b border-[#DDE4EE] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-sm sm:px-6 lg:px-8">
        <nav aria-label="Cửa hàng và dịch vụ" className="flex gap-5 font-medium">
          <Link href="/shop" className="hover:underline hover:underline-offset-4">Cửa hàng</Link>
          <Link href="/services" className="hover:underline hover:underline-offset-4">Dịch vụ</Link>
        </nav>
        <Link
          href="/shop/cart"
          className="inline-flex items-center gap-2 rounded-lg border border-[#DDE4EE] px-3 py-1.5 font-medium hover:border-[#27548A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27548A]"
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
