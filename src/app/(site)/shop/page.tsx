import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ShopClient from "./ShopClient";
import { getProducts, getServices, getShopCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Cửa hàng & Dịch vụ | iCards",
  description:
    "Thiệp in, phong bì, hộp quà, standee QR và các dịch vụ hỗ trợ sự kiện, đồng bộ với thiệp mời online.",
};

export default async function Page() {
  const [products, categories, services] = await Promise.all([getProducts(), getShopCategories(), getServices()]);
  return (
    <>
      <Suspense fallback={null}>
        <ShopClient products={products} categories={categories} />
      </Suspense>

      {/* Dịch vụ được gộp vào cùng trang Cửa hàng */}
      <section id="dich-vu" className="mx-auto max-w-[1520px] scroll-mt-24 px-5 pb-24 lg:px-8">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#27548A]">Dịch vụ</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Dịch vụ tiện ích mở rộng</h2>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="group flex flex-col rounded-xl border border-[#DDE4EE] bg-white p-5 transition-colors hover:border-[#27548A]"
            >
              <h3 className="text-base font-semibold group-hover:underline group-hover:underline-offset-4">{s.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5B6B7F]">{s.summary}</p>
              <div className="mt-4 flex items-center justify-between border-t border-[#EEF2F7] pt-3 text-sm">
                <span className="font-semibold text-[#27548A]">Từ {Number(s.priceFrom).toLocaleString("vi-VN")} ₫</span>
                <span className="text-[#5B6B7F]">{s.duration}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
