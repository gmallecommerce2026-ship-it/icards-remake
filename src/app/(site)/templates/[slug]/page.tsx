import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TemplateDetailStudio, TemplateRecommendations } from "@/components/templates/TemplateDetailStudio";
import { getRelatedTemplates } from "@/lib/templates";
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

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const [template, all, categories] = await Promise.all([getTemplate(slug), getTemplates(), getTemplateCategories()]);
  if (!template) notFound();

  const related = getRelatedTemplates(all, slug, 4);
  const categoryLabel = categories.find((c) => c.id === template.category)?.label ?? "Thiệp cưới";

  return (
    <SideAdsShell>
      <main className="min-h-screen bg-white text-ink">
        <Container className="pt-3 pb-6 sm:pb-8 lg:pb-5">
          <nav aria-label="Đường dẫn" className="text-sm text-muted">
            <Link href="/templates" className="hover:text-ink hover:underline hover:underline-offset-4">Mẫu thiệp</Link>
            <span className="mx-2" aria-hidden>/</span>
            <span className="font-medium text-ink">{template.name}</span>
          </nav>

          <div className="mt-6 lg:mt-4">
            <TemplateDetailStudio template={template} categoryLabel={categoryLabel} />
          </div>

          <section aria-labelledby="steps-title" className="mx-auto mt-20 max-w-4xl">
            <h2 id="steps-title" className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Làm thiệp trong 3 bước</h2>
            <ol className="mt-10 grid gap-5 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-xl border border-line bg-white p-6 text-center">
                  <span className="mx-auto grid size-10 place-items-center rounded-full bg-[#E8EEF6] text-sm font-semibold text-[#27548A]">{i + 1}</span>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <TemplateRecommendations
            items={related.map((t) => ({ template: t, categoryName: categories.find((c) => c.id === t.category)?.label }))}
          />
        </Container>
      </main>
    </SideAdsShell>
  );
}
