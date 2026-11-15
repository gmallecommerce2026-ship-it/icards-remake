import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui/Primitives";
import { SideAdsShell } from "@/components/ads/SideAdsShell";

export const metadata: Metadata = {
  title: "Hướng dẫn tạo thiệp online",
  description:
    "Hướng dẫn tạo thiệp mời online trong vài phút: chọn mẫu, điền thông tin, gửi link cho khách mời và theo dõi xác nhận tham dự.",
};

const STEPS = [
  {
    no: "01",
    title: "Chọn mẫu thiệp",
    text: "Duyệt mẫu theo dịp: thiệp cưới, sinh nhật, đầy tháng, thôi nôi và sự kiện. Xem trước trên điện thoại trước khi quyết định.",
    href: "/templates",
    cta: "Xem mẫu thiệp",
  },
  {
    no: "02",
    title: "Điền thông tin và cá nhân hóa",
    text: "Thay tên, ngày giờ, địa điểm và lời nhắn. Đổi màu sắc, font chữ và hình ảnh để tấm thiệp đúng với câu chuyện của bạn.",
  },
  {
    no: "03",
    title: "Gửi link cho khách mời",
    text: "Gửi một đường link qua Email, Zalo hoặc Facebook. Khách mở thiệp trực tiếp trên trình duyệt, không cần cài ứng dụng.",
  },
];

const TIPS = [
  "Chuẩn bị sẵn tên người mời, ngày giờ và địa điểm trước khi bắt đầu.",
  "Chọn mẫu theo dịp trước, sau đó mới đổi màu và chữ cho hợp ý.",
  "Xem lại thiệp trên điện thoại, vì khách thường mở link trên điện thoại.",
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-porcelain">
      <SideAdsShell
        hero={
          <PageHero
            eyebrow="Hướng dẫn"
            title="Tạo thiệp mời online trong 3 bước"
            description="Không cần biết thiết kế. Chọn mẫu, điền thông tin và gửi link cho khách mời trong vài phút."
          />
        }
      >
        <Container className="py-12 lg:py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-ink">Các bước thực hiện</h2>
            <ol className="mt-8 grid gap-5">
              {STEPS.map((s) => (
                <li key={s.no} className="flex gap-5 border border-line bg-white p-6 shadow-sm">
                  <span aria-hidden className="shrink-0 font-mono text-lg font-semibold text-[#27548A]">
                    {s.no}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                    <p className="mt-2 leading-relaxed text-slate-600">{s.text}</p>
                    {s.href && s.cta && (
                      <Link href={s.href} className="mt-4 inline-flex text-sm font-semibold text-[#27548A] underline underline-offset-4 hover:text-[#1b3d66]">
                        {s.cta}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <section className="mt-14 border-t border-line pt-10">
              <h2 className="text-2xl font-bold text-ink">Sau khi gửi thiệp</h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                Ai sẽ đến và lời chúc đều hiện trên một bảng theo dõi, nên bạn không phải ghi chép thủ công từ nhiều nguồn.
              </p>
            </section>

            <section className="mt-14 border-t border-line pt-10">
              <h2 className="text-2xl font-bold text-ink">Trước khi bắt đầu</h2>
              <ul className="mt-5 grid gap-3">
                {TIPS.map((t) => (
                  <li key={t} className="flex gap-3 leading-relaxed text-slate-600">
                    <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#27548A]" />
                    {t}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-14 flex flex-col items-start justify-between gap-4 rounded-3xl bg-[#E8EEF6] p-8 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Còn thắc mắc?</h2>
                <p className="mt-1 text-slate-600">Xem các câu hỏi thường gặp hoặc gửi câu hỏi cho chúng tôi.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/faq" className="rounded-full border border-[#27548A] px-6 py-3 font-semibold text-[#27548A] transition-colors hover:bg-[#27548A] hover:text-white">
                  Hỏi đáp
                </Link>
                <Link href="/contact" className="rounded-full bg-[#27548A] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#1f4472]">
                  Liên hệ hỗ trợ
                </Link>
              </div>
            </section>

            <section className="mt-14 flex flex-col items-center gap-4 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-ink">Sẵn sàng làm thiệp cho ngày vui của bạn?</h2>
              <p className="max-w-xl text-slate-600">Chọn mẫu, điền thông tin và gửi link cho khách mời trong vài phút.</p>
              <Link href="/templates" className="mt-2 inline-flex h-12 items-center bg-[#27548A] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#1b3d66]">
                Xem mẫu thiệp
              </Link>
            </section>
          </div>
        </Container>
      </SideAdsShell>
    </main>
  );
}
