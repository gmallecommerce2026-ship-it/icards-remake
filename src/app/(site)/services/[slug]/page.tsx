import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PROCESS_STEPS, getRelatedServices, getService, getServices } from "@/lib/services";
import { formatPrice } from "@/lib/format";
import ServiceCover from "@/components/services/ServiceCover";
import { ServiceRequestForm } from "@/components/shop/ServiceRequestForm";
import { ServiceCard } from "@/components/shop/ServiceCard";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getServices().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Không tìm thấy dịch vụ | iCards" };
  return { title: `${service.name} | Dịch vụ iCards`, description: service.summary };
}

export default async function ServiceDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = getRelatedServices(service.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm font-medium">
        <Link href="/services" className="text-[#5B6B7F] hover:text-[#27548A]">Dịch vụ</Link>
        <span className="mx-2 text-[#C5D0DE]">/</span>
        <span className="font-semibold" aria-current="page">{service.name}</span>
      </nav>

      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{service.name}</h1>
          <p className="mt-4 text-lg leading-relaxed text-[#3D4C61]">{service.description}</p>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-[#5B6B7F]">Giá từ</dt>
            <dd className="font-semibold text-[#27548A]">{formatPrice(service.priceFrom)}</dd>
            <dt className="text-[#5B6B7F]">Thời gian</dt>
            <dd className="font-medium">{service.duration}</dd>
            <dt className="text-[#5B6B7F]">Phù hợp với</dt>
            <dd className="font-medium">{service.audience}</dd>
          </dl>

          <h2 className="mt-8 text-lg font-bold">Bao gồm</h2>
          <ul className="mt-3 space-y-3">
            {service.includes.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#27548A]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <ServiceCover service={service} className="aspect-[4/3] w-full" />
          <div className="rounded-xl border border-[#DDE4EE] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold">Gửi yêu cầu</h2>
            <ServiceRequestForm serviceSlug={service.slug} serviceName={service.name} />
          </div>
        </div>
      </div>

      <section className="mt-20 rounded-2xl bg-white p-8 ring-1 ring-[#DDE4EE] md:p-12">
        <h2 className="text-center text-2xl font-bold">Quy trình thực hiện</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-4">
          {PROCESS_STEPS.map((step, i) => (
            <li key={step.title}>
              <div className="text-4xl font-extrabold text-[#E8EEF6]">0{i + 1}</div>
              <h3 className="mt-2 font-bold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#5B6B7F]">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {related.length > 0 && (
        <section className="mt-16 border-t border-[#DDE4EE] pt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Có thể bạn quan tâm</h2>
            <Link href="/services" className="text-sm font-semibold text-[#27548A] hover:underline">Xem tất cả →</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {related.map((rs) => <ServiceCard key={rs.slug} service={rs} />)}
          </div>
        </section>
      )}
    </div>
  );
}
