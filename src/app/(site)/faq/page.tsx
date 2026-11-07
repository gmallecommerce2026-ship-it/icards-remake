import type { Metadata } from "next";
import Link from "next/link";
import FaqAccordion from "@/components/faq/FaqAccordion";
import { getFaq } from "@/lib/catalog";
import { PageHero, Container } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "Hỏi đáp | iCards",
  description:
    "Giải đáp các câu hỏi thường gặp về tạo thiệp mời online, gửi thiệp, xác nhận tham dự, thanh toán và tài khoản.",
};

export default async function FaqPage() {
  const faq = await getFaq();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="min-h-screen bg-porcelain">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <PageHero 
        title="Hỏi đáp"
        description="Tìm nhanh câu trả lời về cách tạo thiệp, gửi cho khách và quản lý đơn hàng."
      />

      <Container className="py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          <FaqAccordion groups={faq.groups} items={faq.items} />

          <section className="mt-14 flex flex-col items-start justify-between gap-4 rounded-3xl bg-[#E8EEF6] p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Chưa tìm thấy câu trả lời?</h2>
              <p className="mt-1 text-slate-600">Gửi câu hỏi cho chúng tôi, chúng tôi sẽ phản hồi sớm.</p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 rounded-full bg-[#27548A] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#1f4472]"
            >
              Liên hệ hỗ trợ
            </Link>
          </section>
        </div>
      </Container>
    </main>
  );
}