import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InvitationPreview } from "@/components/templates/InvitationPreview";
import { TemplateCard } from "@/components/templates/TemplateCard";
import {
  CREATE_EVENT_HREF,
  categoryLabel,
  formatPrice,
  getRelatedTemplates,
  getTemplateBySlug,
  getTemplates,
} from "@/lib/templates";
import { Container } from "@/components/ui/Primitives";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getTemplates().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplateBySlug(slug);
  if (!t) return { title: "Không tìm thấy mẫu thiệp" };
  return {
    title: `Mẫu thiệp ${t.name}`,
    description: t.description,
    openGraph: { title: `Mẫu thiệp ${t.name}`, description: t.tagline, ...(t.previewImage ? { images: [t.previewImage] } : {}) },
  };
}

function Check() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0 text-[#27548A]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 10.5 4 4 8-9" />
    </svg>
  );
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) notFound();

  const related = getRelatedTemplates(slug, 4);
  const free = template.price === 0;

  return (
    <main className="min-h-screen pt-[72px]">
      <Container className="py-8 sm:py-12">
        <nav aria-label="Đường dẫn" className="text-sm text-[#5B6B7F]">
          <Link href="/templates" className="hover:underline hover:underline-offset-4">Mẫu thiệp</Link>
          <span className="mx-2" aria-hidden>/</span>
          <span className="text-[#0E1B2C] font-medium">{template.name}</span>
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-20">
          {/* Khung điện thoại */}
          <div className="mx-auto w-full max-w-[320px] lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[46px] bg-[#0E1B2C] p-3 shadow-[0_30px_60px_-20px_rgba(14,27,44,0.45)]">
              <div className="relative overflow-hidden rounded-[36px] bg-white">
                <div
                  tabIndex={0}
                  role="region"
                  aria-label={`Thiệp mẫu ${template.name}, cuộn để xem toàn bộ`}
                  className="h-[560px] overflow-y-auto overscroll-contain [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#27548A] [&::-webkit-scrollbar]:hidden"
                >
                  <InvitationPreview template={template} variant="full" />
                </div>
                <div aria-hidden className="pointer-events-none absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0E1B2C]" />
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-[#5B6B7F]">Cuộn trong khung để xem toàn bộ thiệp</p>
          </div>

          <div className="max-w-xl">
            <p className="text-sm font-medium text-[#27548A]">{categoryLabel(template.category)}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{template.name}</h1>
            <p className="mt-3 text-lg leading-relaxed text-[#3D4C61]">{template.tagline}</p>
            <p className="mt-4 leading-relaxed text-[#5B6B7F]">{template.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={`${CREATE_EVENT_HREF}?template=${template.slug}`}
                className="inline-flex h-12 items-center rounded-lg bg-[#27548A] px-6 text-base font-semibold text-white transition-colors hover:bg-[#1F4573] shadow-lg shadow-[#27548A]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27548A]"
              >
                Dùng mẫu này
              </Link>
              <Link
                href="/templates"
                className="inline-flex h-12 items-center rounded-lg border border-[#C5D0DE] bg-white px-5 text-base font-medium hover:border-[#27548A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27548A]"
              >
                Xem mẫu khác
              </Link>
            </div>
            <p className="mt-3 text-sm text-[#5B6B7F]">
              {free ? "Mẫu miễn phí, dùng ngay sau khi đăng nhập." : `Giá ${formatPrice(template.price)} cho mỗi thiệp. Chỉ thanh toán khi bạn xuất bản.`}
            </p>

            <section className="mt-10" aria-labelledby="features-title">
              <h2 id="features-title" className="text-lg font-semibold">Thiệp này có</h2>
              <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {template.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-[15px]">
                    <Check />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </section>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-[#DDE4EE] pt-6 text-sm">
              <div>
                <dt className="text-[#5B6B7F]">Giá</dt>
                <dd className="mt-1 font-semibold">{formatPrice(template.price)}</dd>
              </div>
              <div>
                <dt className="text-[#5B6B7F]">Số phần</dt>
                <dd className="mt-1 font-semibold">{template.features.length}</dd>
              </div>
              <div>
                <dt className="text-[#5B6B7F]">Đã dùng</dt>
                <dd className="mt-1 font-semibold">{new Intl.NumberFormat("vi-VN").format(template.popularity)} lần</dd>
              </div>
            </dl>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-[#DDE4EE] pt-10" aria-labelledby="related-title">
            <h2 id="related-title" className="text-xl font-bold">Mẫu bạn có thể thích</h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 lg:gap-x-6">
              {related.map((t) => (
                <li key={t.slug}>
                  <TemplateCard template={t} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </main>
  );
}