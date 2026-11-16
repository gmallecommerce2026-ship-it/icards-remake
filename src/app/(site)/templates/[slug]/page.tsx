import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InvitationPreview } from "@/components/templates/InvitationPreview";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { CREATE_EVENT_HREF, formatPrice, getRelatedTemplates } from "@/lib/templates";
import { getTemplate, getTemplateCategories, getTemplates } from "@/lib/catalog";
import { Container } from "@/components/ui/Primitives";
import { SideAdsShell } from "@/components/ads/SideAdsShell";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTemplate(slug);
  if (!t) return { title: "Không tìm thấy mẫu thiệp" };
  return {
    title: `Mẫu thiệp ${t.name}`,
    description: t.description,
    openGraph: { title: `Mẫu thiệp ${t.name}`, description: t.tagline, ...(t.previewImage ? { images: [t.previewImage] } : {}) },
  };
}

const STEPS = [
  { title: "Chọn mẫu", text: "Mẫu đã có sẵn bố cục, font và hiệu ứng. Bạn không cần thiết kế từ đầu." },
  { title: "Điền thông tin", text: "Thay tên cô dâu chú rể, thời gian, địa điểm và ảnh của bạn ngay trên thiệp." },
  { title: "Gửi cho khách", text: "Chia sẻ đường link hoặc gửi email mời. Khách xác nhận tham dự ngay trên thiệp." },
];

function Check() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0 text-lacquer" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 10.5 4 4 8-9" />
    </svg>
  );
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const [template, all, categories] = await Promise.all([getTemplate(slug), getTemplates(), getTemplateCategories()]);
  if (!template) notFound();

  const related = getRelatedTemplates(all, slug, 4);
  const free = template.price === 0;
  const categoryLabel = categories.find((c) => c.id === template.category)?.label ?? "Thiệp cưới";

  return (
    <SideAdsShell>
      <main className="min-h-screen bg-white pt-[72px] text-ink">
        <Container className="py-8 sm:py-12">
          <nav aria-label="Đường dẫn" className="text-center text-sm text-muted">
            <Link href="/templates" className="hover:text-ink hover:underline hover:underline-offset-4">Mẫu thiệp</Link>
            <span className="mx-2" aria-hidden>/</span>
            <span className="font-medium text-ink">{template.name}</span>
          </nav>

          {/* Tiêu đề, căn giữa */}
          <header className="mx-auto mt-8 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">{categoryLabel}</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{template.name}</h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">{template.tagline}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`${CREATE_EVENT_HREF}?template=${template.slug}`}
                className="inline-flex h-12 items-center rounded-xl bg-lacquer px-7 text-base font-semibold text-white transition-colors hover:bg-lacquer-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lacquer"
              >
                Dùng mẫu này
              </Link>
              <Link
                href="/templates"
                className="inline-flex h-12 items-center rounded-xl border border-line bg-white px-5 text-base font-medium text-ink transition-colors hover:bg-porcelain focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lacquer"
              >
                Xem mẫu khác
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted">
              {free ? "Mẫu miễn phí, dùng ngay sau khi đăng nhập." : `Giá ${formatPrice(template.price)} cho mỗi thiệp. Chỉ thanh toán khi bạn xuất bản.`}
            </p>
          </header>

          {/* Preview ở giữa: cột đơn, không khung trang trí, cuộn theo trang như màn xem thiệp thật */}
          <section aria-label={`Xem thiệp mẫu ${template.name}`} className="mx-auto mt-12 w-full max-w-md overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)]">
            <InvitationPreview template={template} variant="full" />
          </section>

          {/* Tính năng + thống kê, căn giữa theo cột */}
          <section aria-labelledby="features-title" className="mx-auto mt-20 max-w-4xl">
            <h2 id="features-title" className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Thiệp này có</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted">Mọi phần cần thiết cho một thiệp cưới online, không cần cài thêm gì.</p>
            <ul className="mt-10 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {template.features.map((f) => (
                <li key={f} className="flex gap-3 border-b border-line pb-4 text-[15px]">
                  <Check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-12 grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-porcelain text-center">
              <div className="p-5">
                <dt className="text-sm text-muted">Giá</dt>
                <dd className="mt-1 text-lg font-semibold">{formatPrice(template.price)}</dd>
              </div>
              <div className="p-5">
                <dt className="text-sm text-muted">Số phần</dt>
                <dd className="mt-1 text-lg font-semibold">{template.features.length}</dd>
              </div>
              <div className="p-5">
                <dt className="text-sm text-muted">Đã dùng</dt>
                <dd className="mt-1 text-lg font-semibold">{new Intl.NumberFormat("vi-VN").format(template.popularity)} lần</dd>
              </div>
            </dl>
          </section>

          {/* Cách làm */}
          <section aria-labelledby="steps-title" className="mx-auto mt-20 max-w-4xl">
            <h2 id="steps-title" className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Làm thiệp trong 3 bước</h2>
            <ol className="mt-10 grid gap-5 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-xl border border-line bg-white p-6 text-center">
                  <span className="mx-auto grid size-10 place-items-center rounded-full bg-lacquer-soft text-sm font-semibold text-lacquer">{i + 1}</span>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </section>

          {related.length > 0 && (
            <section className="mt-20 border-t border-line pt-14" aria-labelledby="related-title">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id="related-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">Mẫu bạn có thể thích</h2>
                <Link href="/templates" className="text-sm font-medium text-lacquer hover:underline hover:underline-offset-4">Xem tất cả mẫu →</Link>
              </div>
              <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 lg:gap-x-6">
                {related.map((t) => (
                  <li key={t.slug}>
                    <TemplateCard template={t} categoryName={categories.find((c) => c.id === t.category)?.label} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Container>
      </main>
    </SideAdsShell>
  );
}
