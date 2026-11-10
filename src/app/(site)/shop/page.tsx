import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ShopClient from "./ShopClient";
import ServiceCover from "@/components/services/ServiceCover";
import { getProducts, getServices, getShopCategories } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { AdBanner } from "@/components/ads/AdBanner";
import { SideAdsShell } from "@/components/ads/SideAdsShell";

export const metadata: Metadata = {
  title: "Cửa hàng & Dịch vụ | iCards",
  description:
    "Thiệp in, phong bì, hộp quà, standee QR và các dịch vụ hỗ trợ sự kiện, đồng bộ với thiệp mời online.",
};

export default async function Page() {
  const [products, categories, services] = await Promise.all([getProducts(), getShopCategories(), getServices()]);
  return (
    <SideAdsShell>
    <>
      <Suspense fallback={null}>
        <ShopClient products={products} categories={categories} />
      </Suspense>

      <div className="mx-auto w-full max-w-[1520px] px-5 pt-20 lg:pt-24">
        <AdBanner
          title="Phong bì và hộp quà đồng bộ thiệp"
          text="Chọn bộ sản phẩm đồng bộ cho ngày trọng đại của bạn."
          cta="Xem sản phẩm"
          href="/shop"
        />
      </div>

      {/* Dịch vụ: lưới ảnh giống lưới sản phẩm, chỉ có tên và giá */}
      {services.length > 0 && (
        <section id="dich-vu" className="mx-auto w-full max-w-[1520px] scroll-mt-24 px-5 py-20 lg:py-24">
          <h2 className="mb-12 text-center text-base font-semibold uppercase tracking-[0.02em] text-[#27548A]">
            Dịch vụ
          </h2>
          <div className="grid w-full grid-cols-4 gap-x-5 gap-y-[60px] max-[1200px]:grid-cols-3 max-[769px]:grid-cols-2 max-[769px]:gap-y-10 max-[481px]:grid-cols-1">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="group flex cursor-pointer flex-col gap-5">
                <div className="relative w-full overflow-hidden pt-[100%]">
                  <div className="absolute inset-0 overflow-hidden">
                    <ServiceCover
                      service={s}
                      className="h-full w-full rounded-none! transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="text-base font-semibold uppercase leading-[1.3] tracking-[0.02em] text-[#27548A]">
                    {s.name}
                  </div>
                  <div className="text-sm text-[#5B6B7F]">Từ {formatPrice(s.priceFrom)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
    </SideAdsShell>
  );
}
