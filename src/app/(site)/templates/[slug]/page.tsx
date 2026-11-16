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

const SERIF = "var(--font-tpl-display), Georgia, 'Times New Roman', serif";

function Check({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full"
      style={{ background: color }}
    >
      <svg viewBox="0 0 20 20" className="size-3" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="m4 10.5 4 4 8-9" />
      </svg>
    </span>
  );
}

const STEPS = [
  { title: "Chọn mẫu", text: "Mẫu này đã có sẵn bố cục, font và hiệu ứng. Bạn không cần thiết kế từ đầu." },
  { title: "Điền thông tin", text: "Thay tên cô dâu chú rể, thời gian, địa điểm và ảnh của bạn ngay trên thiệp." },
  { title: "Gửi cho khách", text: "Chia sẻ đường link hoặc gửi email mời. Khách xác nhận tham dự ngay trên thiệp." },
];

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const [template, all, categories] = await Promise.all([getTemplate(slug), getTemplates(), getTemplateCategories()]);
  if (!template) notFound();

  const related = getRelatedTemplates(all, slug, 4);
  const free = template.price === 0;
  const categoryLabel = categories.find((c) => c.id === template.category)?.label ?? "";
  const { accent, soft, bg, ink } = template.palette;
  const dateLabel = new Date(template.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <SideAdsShell>
      <main className="min-h-screen pt-[72px]" style={{ background: "#FBFAF7" }}>
        {/* Dải màu lấy từ chính mẫu thiệp */}
        <section
          className="relative overflow-hidden"
          style={{ background: `radial-gradient(120% 90% at 85% 0%, ${soft} 0%, ${bg} 55%, #FBFAF7 100%)` }}
        >
          <Container className="relative py-8 sm:py-12">
            <nav aria-label="Đường dẫn" className="text-sm text-[#5B6B7F]">
              <Link href="/templates" className="hover:text-[#0E1B2C] hover:underline hover:underline-offset-4">Mẫu thiệp</Link>
              <span className="mx-2" aria-hidden>/</span>
              <span className="font-medium text-[#0E1B2C]">{template.name}</span>
            </nav>

            <div className="mt-8 grid items-center gap-12 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-20">
              {/* Khung điện thoại */}
              <div className="mx-auto w-full max-w-[300px] lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-[44px] bg-[#111827] p-[10px] shadow-[0_40px_80px_-30px_rgba(17,24,39,0.55)] ring-1 ring-black/5">
                  <div className="relative overflow-hidden rounded-[36px] bg-white">
                    <div
                      tabIndex={0}
                      role="region"
                      aria-label={`Thiệp mẫu ${template.name}, cuộn để xem toàn bộ`}
                      className="h-[540px] overflow-y-auto overscroll-contain [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#27548A] [&::-webkit-scrollbar]:hidden"
                    >
                      <InvitationPreview template={template} variant="full" />
                    </div>
                    <div aria-hidden className="pointer-events-none absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-[#111827]" />
                  </div>
                </div>
                <p className="mt-4 text-center text-sm text-[#5B6B7F]">Cuộn trong khung để xem toàn bộ thiệp</p>
              </div>

              <div className="max-w-xl">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
                  style={{ background: "#fff", color: accent, boxShadow: `inset 0 0 0 1px ${accent}33` }}
                >
                  {categoryLabel || "Thiệp cưới"}
                </span>
                <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl" style={{ fontFamily: SERIF, color: ink }}>
                  {template.name}
                </h1>
                <p className="mt-4 text-lg leading-relaxed text-[#3D4C61]">{template.tagline}</p>
                <p className="mt-4 leading-relaxed text-[#5B6B7F]">{template.description}</p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex h-7 items-center rounded-full px-3 text-sm font-semibold ${free ? "bg-[#E3F1E8] text-[#1D5B35]" : "bg-white text-[#0E1B2C] shadow-sm"}`}
                  >
                    {formatPrice(template.price)}
                  </span>
                  <span className="text-sm text-[#5B6B7F]">
                    {free ? "Dùng ngay sau khi đăng nhập" : "Chỉ thanh toán khi bạn xuất bản"}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href={`${CREATE_EVENT_HREF}?template=${template.slug}`}
                    className="inline-flex h-12 items-center rounded-xl bg-[#27548A] px-7 text-base font-semibold text-white shadow-lg shadow-[#27548A]/25 transition-all hover:-translate-y-0.5 hover:bg-[#1F4573] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27548A]"
                  >
                    Dùng mẫu này
                  </Link>
                  <Link
                    href="/templates"
                    className="inline-flex h-12 items-center rounded-xl border border-[#C5D0DE] bg-white/80 px-5 text-base font-medium text-[#0E1B2C] backdrop-blur transition-colors hover:border-[#27548A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27548A]"
                  >
                    Xem mẫu khác
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <Container className="py-14 sm:py-16">
          {/* Tính năng */}
          <section aria-labelledby="features-title" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: accent }}>Tính năng</p>
              <h2 id="features-title" className="mt-2 text-2xl font-semibold text-[#0E1B2C] sm:text-3xl" style={{ fontFamily: SERIF }}>
                Thiệp này có gì
              </h2>
              <p className="mt-3 text-[#5B6B7F]">Mọi phần cần thiết cho một thiệp cưới online, không cần cài thêm gì.</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {template.features.map((f) => (
                <li key={f} className="flex gap-3 rounded-2xl border border-[#E4E9F1] bg-white p-4 text-[15px] text-[#0E1B2C] shadow-[0_1px_2px_rgba(14,27,44,0.04)]">
                  <Check color={accent} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Thống kê */}
          <dl className="mt-12 grid grid-cols-3 gap-3 sm:gap-5">
            {[
              { k: "Giá", v: formatPrice(template.price) },
              { k: "Số phần", v: `${template.features.length}` },
              { k: "Đã dùng", v: `${new Intl.NumberFormat("vi-VN").format(template.popularity)} lần` },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl p-4 text-center sm:p-6" style={{ background: soft }}>
                <dt className="text-xs uppercase tracking-wide text-[#5B6B7F]">{s.k}</dt>
                <dd className="mt-1.5 text-lg font-semibold text-[#0E1B2C] sm:text-2xl" style={{ fontFamily: SERIF }}>{s.v}</dd>
              </div>
            ))}
          </dl>

          {/* Cách làm */}
          <section aria-labelledby="steps-title" className="mt-16">
            <h2 id="steps-title" className="text-2xl font-semibold text-[#0E1B2C] sm:text-3xl" style={{ fontFamily: SERIF }}>
              Làm thiệp trong 3 bước
            </h2>
            <ol className="mt-8 grid gap-5 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-2xl border border-[#E4E9F1] bg-white p-6">
                  <span
                    className="grid size-10 place-items-center rounded-full text-sm font-semibold text-white"
                    style={{ background: accent }}
                  >
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-[#0E1B2C]">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#5B6B7F]">{s.text}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Mẫu liên quan */}
          {related.length > 0 && (
            <section className="mt-20 border-t border-[#E4E9F1] pt-12" aria-labelledby="related-title">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id="related-title" className="text-2xl font-semibold text-[#0E1B2C] sm:text-3xl" style={{ fontFamily: SERIF }}>
                  Mẫu bạn có thể thích
                </h2>
                <Link href="/templates" className="text-sm font-medium text-[#27548A] hover:underline hover:underline-offset-4">
                  Xem tất cả mẫu →
                </Link>
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

          <p className="mt-16 text-center text-xs text-[#8A97A8]">Phát hành: {dateLabel}</p>
        </Container>
      </main>
    </SideAdsShell>
  );
}
