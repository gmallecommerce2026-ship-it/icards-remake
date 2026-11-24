import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ShopClient from "./ShopClient";
import ServiceCover from "@/components/services/ServiceCover";
import { getBannerGroups, getPageCopy, getProducts, getServices, getShopCategories } from "@/lib/catalog";
import { groupsFor } from "@/lib/banner-groups";
import { BannerGroupList } from "@/components/banners/BannerGroupView";
import { formatPrice } from "@/lib/format";
import { AdBanner } from "@/components/ads/AdBanner";
import { SideAdsShell } from "@/components/ads/SideAdsShell";

export const metadata: Metadata = {
  title: "Cửa hàng & Dịch vụ | iCards",
  description:
    "Thiệp in, phong bì, hộp quà, standee QR và các dịch vụ hỗ trợ sự kiện, đồng bộ với thiệp mời online.",
};

export default async function Page() {
  const [products, categories, services, copy, bannerGroups] = await Promise.all([getProducts(), getShopCategories(), getServices(), getPageCopy(), getBannerGroups()]);
  // Banner đầu trang do admin quản lý (trang "shop")
  const heroGroups = groupsFor(bannerGroups, "shop", "top");
  return (
    <SideAdsShell>
    <>
      <BannerGroupList groups={heroGroups} heroFirst />

      <header className="mx-auto w-full max-w-[1520px] px-5 pb-8 pt-12 lg:pt-16">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#27548A]">Cửa hàng</p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#0E1B2C] lg:text-5xl">Cửa hàng & Dịch vụ</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#5B6B7F]">
              Thiệp in, phong bì, hộp quà, standee QR và các dịch vụ hỗ trợ sự kiện, đồng bộ với thiệp mời online.
            </p>
          </div>
          <nav aria-label="Chuyển nhanh" className="flex shrink-0 gap-2">
            <a href="#san-pham" className="rounded-full border border-[#DDE4EE] bg-white px-4 py-2 text-sm font-medium transition hover:border-[#27548A] hover:text-[#27548A]">
              Sản phẩm
            </a>
            <a href="#dich-vu" className="rounded-full border border-[#DDE4EE] bg-white px-4 py-2 text-sm font-medium transition hover:border-[#27548A] hover:text-[#27548A]">
              Dịch vụ
            </a>
          </nav>
        </div>
      </header>

      <Suspense fallback={null}>
        <ShopClient products={products} categories={categories} />
      </Suspense>

      {copy.shop.adTitle && (
        <div className="mx-auto w-full max-w-[1520px] px-5 pt-20 lg:pt-24">
          <AdBanner title={copy.shop.adTitle} text={copy.shop.adText} cta={copy.shop.adCta} href="/shop" />
        </div>
      )}

      {/* Dịch vụ: thẻ có ảnh, giá và thời lượng */}
      {services.length > 0 && (
        <section id="dich-vu" className="mx-auto w-full max-w-[1520px] scroll-mt-24 px-5 pb-24 pt-20 lg:pt-24">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#27548A]">Dịch vụ</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#0E1B2C] lg:text-4xl">
              {copy.shop.servicesHeading || "Dịch vụ hỗ trợ sự kiện"}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#5B6B7F]">
              Trọn gói từ thiết kế đến in ấn và tổ chức, để ngày vui của bạn gọn gàng hơn.
            </p>
          </div>
          <div className="grid w-full grid-cols-3 gap-6 max-[1000px]:grid-cols-2 max-[640px]:grid-cols-1">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E3E9F2] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_-26px_rgba(14,27,44,0.45)]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <ServiceCover
                    service={s}
                    className="h-full w-full rounded-none transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="text-lg font-semibold leading-snug text-[#0E1B2C] transition-colors group-hover:text-[#27548A]">{s.name}</h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-[#5B6B7F]">{s.summary}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#EEF2F7] pt-4">
                    <div>
                      <p className="text-xs text-[#8A97A8]">Giá từ</p>
                      <p className="font-bold text-[#27548A]">{formatPrice(s.priceFrom)}</p>
                    </div>
                    <span className="rounded-full bg-[#EEF2F7] px-3 py-1 text-xs font-medium text-[#27548A]">{s.duration}</span>
                  </div>
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
