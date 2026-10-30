import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getServices } from "@/lib/services";
import ServiceCover from "@/components/services/ServiceCover";
import { PageHero, Container } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "Dịch vụ hệ sinh thái | iCards",
  description: "Khám phá các dịch vụ tiện ích đi kèm của iCards giúp sự kiện của bạn trọn vẹn và chuyên nghiệp hơn.",
};

export default function ServicesPage() {
  const services = getServices();

  return (
    <main className="min-h-screen bg-porcelain">
      <PageHero 
        title="Dịch vụ tiện ích mở rộng"
        description="Hệ sinh thái công cụ hỗ trợ xuyên suốt từ bước mời khách đến khâu đón tiếp, giúp bạn tổ chức sự kiện thảnh thơi và trọn vẹn nhất."
      />

      <Container className="py-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-24">
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

        {/* CTA Box */}
        <section className="rounded-3xl bg-lacquer-soft px-6 py-12 text-center border border-lacquer/10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-ink mb-4">Bạn không tìm thấy dịch vụ mong muốn?</h2>
          <p className="text-muted mb-8 max-w-lg mx-auto">
            iCards luôn sẵn sàng tinh chỉnh và xây dựng giải pháp riêng theo yêu cầu thực tế của sự kiện.
          </p>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 font-medium text-lacquer border border-line transition-colors hover:bg-porcelain focus-visible:outline-none"
          >
            Yêu cầu dịch vụ riêng
          </Link>
        </section>
      </Container>
    </main>
  );
}