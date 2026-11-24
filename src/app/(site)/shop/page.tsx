import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
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
  const [products, categories, services, copy, bannerGroups] = await Promise.all([
    getProducts(),
    getShopCategories(),
    getServices(),
    getPageCopy(),
    getBannerGroups(),
  ]);
  // Banner đầu trang do admin quản lý (trang "shop")
  const heroGroups = groupsFor(bannerGroups, "shop", "top");

  return (
    <SideAdsShell>
      <>
        <BannerGroupList groups={heroGroups} heroFirst />

        <header className="border-b border-line bg-paper">
          <div className="mx-auto max-w-[1520px] px-5 pb-16 pt-16 text-center lg:pt-20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lacquer">Cửa hàng iCards</p>
            <h1 className="mt-4 font-display text-5xl font-medium leading-tight sm:text-6xl">Cửa hàng & Dịch vụ</h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Thiệp in, phong bì, hộp quà, standee QR và các dịch vụ hỗ trợ sự kiện, đồng bộ với thiệp mời online.
            </p>
            <nav aria-label="Chuyển nhanh" className="mt-9 flex justify-center gap-10 text-sm">
              <a href="#san-pham" className="border-b border-ink pb-1 font-medium transition-colors hover:border-lacquer hover:text-lacquer">
                Sản phẩm
              </a>
              <a href="#dich-vu" className="border-b border-ink pb-1 font-medium transition-colors hover:border-lacquer hover:text-lacquer">
                Dịch vụ
              </a>
            </nav>
          </div>
        </header>

        <Suspense fallback={null}>
          <ShopClient products={products} categories={categories} />
        </Suspense>

        {copy.shop.adTitle && (
          <div className="mx-auto w-full max-w-[1520px] px-5 pb-24">
            <AdBanner title={copy.shop.adTitle} text={copy.shop.adText} cta={copy.shop.adCta} href="/shop" />
          </div>
        )}

        {/* Dịch vụ: danh sách dạng hàng kẻ, ảnh vuông bên trái, giá và thời lượng bên phải */}
        {services.length > 0 && (
          <section id="dich-vu" className="scroll-mt-28 border-t border-line bg-paper">
            <div className="mx-auto grid max-w-[1520px] gap-14 px-5 py-24 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-20">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lacquer">Dịch vụ</p>
                <h2 className="mt-4 font-display text-4xl font-medium leading-tight sm:text-5xl">
                  {copy.shop.servicesHeading || "Dịch vụ hỗ trợ sự kiện"}
                </h2>
                <p className="mt-5 leading-relaxed text-muted">
                  Trọn gói từ thiết kế đến in ấn và tổ chức, để ngày vui của bạn gọn gàng hơn.
                </p>
              </div>

              <ul className="border-t border-ink">
                {services.map((s, i) => (
                  <li key={s.slug} className="border-b border-line">
                    <Link
                      href={`/services/${s.slug}`}
                      className="group grid grid-cols-[104px_minmax(0,1fr)_auto] items-center gap-6 py-7 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:gap-8"
                    >
                      <div className="relative aspect-square overflow-hidden bg-white">
                        <ServiceCover
                          service={s}
                          className="h-full w-full rounded-none transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs tabular-nums text-muted">0{i + 1}</p>
                        <h3 className="mt-1 font-display text-2xl font-medium leading-snug transition-colors group-hover:text-lacquer">
                          {s.name}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{s.summary}</p>
                        <p className="mt-3 text-sm">
                          <span className="text-muted">Từ </span>
                          <span className="font-semibold text-ink">{formatPrice(s.priceFrom)}</span>
                          <span className="mx-2 text-line">|</span>
                          <span className="text-muted">{s.duration}</span>
                        </p>
                      </div>
                      <ArrowRight
                        size={20}
                        aria-hidden
                        className="text-ink transition-transform duration-300 group-hover:translate-x-1 group-hover:text-lacquer"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </>
    </SideAdsShell>
  );
}
