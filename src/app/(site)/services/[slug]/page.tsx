import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getService, getServices, getRelatedServices } from "@/lib/services";
import { FAQS } from "@/lib/faq";
import ServiceCover from "@/components/services/ServiceCover";
import { Container } from "@/components/ui/Primitives";

export async function generateStaticParams() {
  const services = getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  
  if (!service) return { title: "Không tìm thấy dịch vụ | iCards" };
  
  return {
    title: `${service.name} | Dịch vụ iCards`,
    description: service.summary,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    notFound();
  }

  const relatedServices = getRelatedServices(service.slug);
  const serviceFaqs = FAQS.filter(f => service.faqIds.includes(f.id));

  return (
    <main className="min-h-screen bg-white pt-[72px]">
      <Container className="py-10 lg:py-14">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 text-sm font-medium">
          <Link href="/services" className="text-muted hover:text-lacquer transition-colors">Dịch vụ</Link>
          <span className="mx-2 text-line">/</span>
          <span className="text-ink font-semibold" aria-current="page">{service.name}</span>
        </nav>

        {/* Hero Chi tiết */}
        <div className="grid gap-12 lg:grid-cols-2 mb-20 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink mb-6">
              {service.name}
            </h1>
            <p className="text-lg text-muted leading-relaxed mb-8">
              {service.description}
            </p>
            
            <div className="mb-10">
              <h3 className="font-bold text-ink mb-4 text-lg">Tiện ích nổi bật:</h3>
              <ul className="space-y-4">
                {service.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-lacquer mt-0.5" />
                    <span className="text-ink leading-relaxed text-[17px]">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-full bg-lacquer px-8 font-medium text-white transition-colors hover:bg-lacquer-dark shadow-lg shadow-lacquer/20 focus-visible:outline-none"
            >
              Đăng ký dịch vụ ngay
            </Link>
          </div>
          <div className="order-first lg:order-last">
            <ServiceCover service={service} className="aspect-square w-full rounded-[2rem] shadow-xl shadow-ink/5" />
          </div>
        </div>

        {/* Quy trình */}
        <section className="mb-24 rounded-[2rem] bg-porcelain p-8 md:p-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-12 text-center">Quy trình thực hiện</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {service.process.map((step, index) => (
              <div key={index} className="relative bg-white p-8 rounded-3xl border border-line shadow-sm hover:border-lacquer/30 transition-colors">
                <div className="mb-4 text-5xl font-extrabold text-lacquer-soft">
                  0{index + 1}
                </div>
                <h3 className="text-xl font-bold text-ink mb-3">{step.title}</h3>
                <p className="text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        {serviceFaqs.length > 0 && (
          <section className="mb-24 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-ink mb-8 text-center">Câu hỏi về {service.name.toLowerCase()}</h2>
            <div className="space-y-4">
              {serviceFaqs.map((faq) => (
                <details key={faq.id} className="group rounded-2xl bg-white border border-line p-6 [&_summary::-webkit-details-marker]:hidden hover:border-lacquer/30 transition-colors">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-ink focus-visible:outline-none text-[17px]">
                    {faq.q}
                    <span className="transition group-open:rotate-180 bg-porcelain rounded-full p-1 text-muted group-hover:text-lacquer">
                      <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-muted leading-relaxed border-t border-line pt-4">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Dịch vụ liên quan */}
        <section className="mb-12 pt-12 border-t border-line">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-ink">Có thể bạn quan tâm</h2>
            <Link href="/services" className="text-sm font-semibold text-lacquer hover:underline">
              Xem tất cả &rarr;
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {relatedServices.map((rs) => (
              <Link 
                key={rs.slug}
                href={`/services/${rs.slug}`}
                className="group flex items-center gap-5 rounded-2xl bg-white border border-line p-5 transition-shadow hover:shadow-lg hover:border-lacquer/20 focus-visible:outline-none"
              >
                <div 
                  className="h-24 w-24 shrink-0 rounded-[1.25rem] flex items-center justify-center"
                  style={{ backgroundColor: rs.tone.bg }}
                >
                  <div className="h-10 w-10 rounded-full border-[3px]" style={{ borderColor: rs.tone.ink, opacity: 0.6 }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink group-hover:text-lacquer transition-colors">{rs.name}</h3>
                  <p className="text-[15px] text-muted line-clamp-2 mt-2 leading-relaxed">{rs.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Cuối trang */}
        <section className="rounded-[2.5rem] bg-lacquer-soft px-6 py-16 text-center mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-4">Cần tư vấn thêm?</h2>
          <p className="text-muted text-lg mb-8 max-w-lg mx-auto">Đừng ngần ngại liên hệ nếu bạn có yêu cầu đặc biệt chưa có trong danh sách.</p>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-full bg-lacquer px-10 font-semibold text-white transition-colors hover:bg-lacquer-dark shadow-xl shadow-lacquer/10 focus-visible:outline-none"
          >
            Liên hệ hỗ trợ ngay
          </Link>
        </section>
      </Container>
    </main>
  );
}