import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PROCESS_STEPS, TIERS, PORTFOLIO } from "@/lib/professional";
import { FAQS } from "@/lib/faq";
import PortfolioCover from "@/components/professional/PortfolioCover";
import { Container } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "Thiết kế chuyên nghiệp | iCards",
  description: "Giải pháp thiết kế thiệp điện tử độc quyền và vận hành công nghệ dành cho cá nhân cao cấp, doanh nghiệp và agency sự kiện.",
};

export default function ProfessionalPage() {
  // Lấy một số câu hỏi thường gặp liên quan đến thanh toán/bắt đầu làm mẫu
  const proFaqs = FAQS.filter(f => f.group === "bat-dau" || f.group === "thanh-toan").slice(0, 4);

  return (
    <main className="min-h-screen bg-porcelain">
      {/* Custom Hero đồng bộ với cấu trúc padding của Header */}
      <div className="border-b border-line bg-white pt-[72px]">
        <Container className="flex flex-col items-center text-center py-16 md:py-24">
          <div className="inline-flex items-center rounded-full bg-lacquer-soft px-4 py-1.5 text-sm font-medium text-lacquer mb-6">
            Dành cho khách hàng cao cấp & Doanh nghiệp
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink max-w-3xl mb-6 leading-tight">
            Thiết kế bản sắc riêng, kiến tạo trải nghiệm đẳng cấp
          </h1>
          <p className="text-lg text-muted max-w-2xl mb-10">
            Vượt ra khỏi những mẫu thiệp có sẵn, đội ngũ iCards đồng hành cùng bạn để phác họa câu chuyện độc bản và tích hợp công nghệ quản lý sự kiện chuyên sâu.
          </p>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-full bg-lacquer px-8 font-medium text-white shadow-lg shadow-lacquer/20 transition-colors hover:bg-lacquer-dark focus-visible:outline-none"
          >
            Liên hệ tư vấn ngay
          </Link>
        </Container>
      </div>

      <Container className="py-16 lg:py-24">
        {/* Quy trình làm việc */}
        <section className="mb-24">
          <h2 className="text-2xl font-bold text-ink mb-12 text-center">Quy trình kiến tạo</h2>
          <div className="grid gap-8 md:grid-cols-4">
            {PROCESS_STEPS.map((step, index) => (
              <div key={index} className="relative">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-lacquer-soft text-lacquer font-bold text-lg">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-ink mb-3">{step.title}</h3>
                <p className="text-muted leading-relaxed">{step.description}</p>
                {index < PROCESS_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-16 right-0 h-[1px] bg-line -z-10" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Gói dịch vụ - Chuyển sang bg-white để nổi bật trên nền trang porcelain */}
        <section className="mb-24 rounded-3xl bg-white border border-line p-8 md:p-12 shadow-sm">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-ink mb-4">Giải pháp dành cho bạn</h2>
            <p className="text-muted">Lựa chọn gói dịch vụ phù hợp với quy mô sự kiện</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {TIERS.map((tier) => (
              <div 
                key={tier.id} 
                className={`flex flex-col rounded-2xl bg-white p-8 ${
                  tier.isPopular ? "ring-2 ring-lacquer shadow-lg" : "border border-line bg-porcelain/30"
                }`}
              >
                <h3 className="text-xl font-bold text-ink mb-2">{tier.name}</h3>
                <p className="text-sm text-muted mb-6">{tier.description}</p>
                <div className="text-2xl font-bold text-ink mb-8">{tier.price}</div>
                
                <ul className="mb-8 flex-1 space-y-4">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-lacquer mt-0.5" />
                      <span className="text-muted text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/contact"
                  className={`mt-auto inline-flex h-11 items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none w-full ${
                    tier.isPopular 
                      ? "bg-lacquer text-white hover:bg-lacquer-dark" 
                      : "bg-lacquer-soft text-lacquer hover:bg-lacquer-soft/80"
                  }`}
                >
                  Nhận báo giá
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Dự án tiêu biểu */}
        <section className="mb-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-ink mb-2">Tác phẩm tiêu biểu</h2>
              <p className="text-muted">Những câu chuyện được kể bằng màu sắc và công nghệ.</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PORTFOLIO.map((item) => (
              <div key={item.id} className="group">
                <PortfolioCover item={item} className="mb-4 aspect-[3/4]" />
                <h3 className="font-semibold text-ink group-hover:text-lacquer transition-colors">{item.name}</h3>
                <p className="text-sm text-muted">{item.client}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-ink mb-8 text-center">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            {proFaqs.map((faq) => (
              <details key={faq.id} className="group rounded-2xl border border-line bg-white p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-ink focus-visible:outline-none">
                  {faq.q}
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" className="text-muted"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="mt-4 text-muted leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA Cuối trang */}
        <section className="rounded-3xl bg-lacquer px-6 py-16 text-center text-white shadow-xl shadow-lacquer/10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Sẵn sàng hiện thực hóa ý tưởng?</h2>
          <p className="text-lacquer-soft mb-8 max-w-xl mx-auto opacity-90">
            Hãy cho chúng tôi biết về sự kiện của bạn. Đội ngũ iCards sẽ liên hệ trong vòng 24 giờ làm việc.
          </p>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 font-medium text-lacquer transition-colors hover:bg-porcelain focus-visible:outline-none"
          >
            Trò chuyện cùng chuyên gia <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </section>
      </Container>
    </main>
  );
}