import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Container } from "@/components/ui/Primitives";

export type LegalSection = { id: string; title: string; body: ReactNode };

const pad = (n: number) => String(n).padStart(2, "0");

/** Bố cục chung cho trang pháp lý: tiêu đề, tóm tắt, mục lục sticky và nội dung từng mục. */
export function LegalPage({
  title,
  lead,
  updated,
  current,
  summary,
  sections,
}: {
  title: string;
  lead: string;
  updated: string;
  current: string;
  summary: string[];
  sections: LegalSection[];
}) {
  return (
    // tone-blue: ép màu thương hiệu #27548A, không theo theme 1–5
    <div className="tone-blue bg-[#FEFDFD]">
      {/* Đầu trang */}
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-lacquer" />
        <Container className="py-16 lg:py-20">
          <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <Link href="/" className="transition-colors hover:text-lacquer">Trang chủ</Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-ink">{current}</span>
          </nav>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lacquer">Pháp lý · iCards</p>
              <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-5 text-lg leading-relaxed text-muted">{lead}</p>
            </div>
            <p className="inline-flex w-fit shrink-0 items-center gap-2 border border-line bg-porcelain px-4 py-2.5 text-sm text-muted">
              Cập nhật lần cuối: <strong className="font-semibold text-ink">{updated}</strong>
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-16">
          {/* Mục lục: sticky trên máy tính */}
          <aside className="hidden lg:block">
            <nav aria-label="Mục lục" className="sticky top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Nội dung</p>
              <ol className="mt-4 space-y-1 border-l border-line">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="-ml-px flex gap-3 border-l-2 border-transparent py-1.5 pl-4 text-sm leading-snug text-muted transition-colors hover:border-lacquer hover:text-lacquer">
                      <span className="tabular-nums opacity-60">{pad(i + 1)}</span>
                      <span>{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="min-w-0 max-w-3xl">
            {/* Mục lục thu gọn trên điện thoại */}
            <details className="group mb-10 border border-line bg-white p-5 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold uppercase tracking-[0.14em] text-muted marker:hidden">
                Nội dung
                <span aria-hidden className="text-lg text-lacquer transition-transform group-open:rotate-45">+</span>
              </summary>
              <ol className="mt-4 space-y-2.5">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="flex gap-3 text-[15px] hover:text-lacquer">
                      <span className="tabular-nums text-muted">{pad(i + 1)}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </details>

            {/* Tóm tắt */}
            <div className="border-l-4 border-lacquer bg-lacquer-soft/60 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-lacquer">Tóm tắt nhanh</p>
              <ul className="mt-4 space-y-2.5">
                {summary.map((t) => (
                  <li key={t} className="flex gap-3 text-[15px] leading-7 text-ink/85">
                    <span aria-hidden className="mt-3 size-1.5 shrink-0 bg-lacquer" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 space-y-12">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-28 border-t border-line pt-10 first:border-t-0 first:pt-0">
                  <h2 className="flex items-baseline gap-3 text-2xl font-bold tracking-tight">
                    <span className="text-base font-semibold tabular-nums text-lacquer">{pad(i + 1)}</span>
                    {s.title}
                  </h2>
                  <div className="mt-5 space-y-4 text-[16px] leading-8 text-ink/85">{s.body}</div>
                </section>
              ))}
            </div>

            {/* Liên hệ */}
            <div className="mt-16 flex flex-col items-start justify-between gap-5 bg-lacquer p-7 text-white sm:flex-row sm:items-center sm:p-9">
              <div>
                <p className="text-lg font-bold">Có thắc mắc về nội dung này?</p>
                <p className="mt-1 text-sm text-white/80">Gửi email cho chúng tôi, đội ngũ iCards sẽ phản hồi sớm nhất có thể.</p>
              </div>
              <a
                href="mailto:hello@icards.vn"
                className="inline-flex h-11 shrink-0 items-center gap-2 bg-white px-5 text-sm font-semibold text-lacquer transition-colors hover:bg-white/90"
              >
                <Mail className="size-4" aria-hidden />
                hello@icards.vn
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm font-semibold text-lacquer">
              <Link href="/terms" className="inline-flex items-center gap-1.5 hover:underline">Điều khoản sử dụng <ArrowRight className="size-4" aria-hidden /></Link>
              <Link href="/privacy" className="inline-flex items-center gap-1.5 hover:underline">Chính sách bảo mật <ArrowRight className="size-4" aria-hidden /></Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

/** Đoạn văn dùng trong nội dung pháp lý. */
export function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

/** Danh sách có ô vuông nhỏ làm bullet, đúng màu thương hiệu. */
export function UL({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="mt-3 size-1.5 shrink-0 bg-lacquer" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
