import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getPageCopy, getServices } from "@/lib/catalog";
import ServiceCover from "@/components/services/ServiceCover";
import { PageHero, Container } from "@/components/ui/Primitives";
import { AdBanner } from "@/components/ads/AdBanner";
import { SideAdsShell } from "@/components/ads/SideAdsShell";

export const metadata: Metadata = {
  title: "Dịch vụ hệ sinh thái | iCards",
  description: "Khám phá các dịch vụ tiện ích đi kèm của iCards giúp sự kiện của bạn trọn vẹn và chuyên nghiệp hơn.",
};

export default async function ServicesPage() {
  const [services, copy] = await Promise.all([getServices(), getPageCopy()]);

  return (
    <main className="min-h-screen bg-porcelain">
      <SideAdsShell hero={<PageHero
                title={copy.services.heroTitle}
                description={copy.services.heroDescription}
              />}>
      <Container className="py-20 lg:py-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-20 lg:mb-24">
          {services.map((service) => (
            <Link 
              key={service.slug} 
              href={`/services/${service.slug}`}
              className="group flex flex-col rounded-3xl border border-line bg-white p-4 transition-shadow hover:shadow-lg focus-visible:outline-none"
            >
              <ServiceCover service={service} className="aspect-[4/3] w-full mb-6" />
              <div className="px-2 flex-1 flex flex-col">
                <h2 className="text-xl font-bold text-ink mb-2 group-hover:text-lacquer transition-colors">
                  {service.name}
                </h2>
                <p className="text-muted text-sm leading-relaxed mb-6 flex-1">
                  {service.summary}
                </p>
                <div className="flex items-center text-sm font-medium text-ink group-hover:text-lacquer">
                  Xem chi tiết <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {copy.services.adTitle && (
          <AdBanner
            className="mb-20 lg:mb-24"
            title={copy.services.adTitle}
            text={copy.services.adText}
            cta={copy.services.adCta}
            href="/contact"
          />
        )}

        {/* CTA Box */}
        <section className="rounded-3xl bg-lacquer-soft px-6 py-12 text-center border border-lacquer/10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-ink mb-4">{copy.services.ctaTitle}</h2>
          <p className="text-muted mb-8 max-w-lg mx-auto">{copy.services.ctaText}</p>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-sm bg-white px-6 font-medium text-lacquer border border-line transition-colors hover:bg-porcelain focus-visible:outline-none"
          >
            {copy.services.ctaButton}
          </Link>
        </section>
      </Container>
      </SideAdsShell>
    </main>
  );
}