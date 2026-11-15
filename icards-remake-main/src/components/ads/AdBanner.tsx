import { ArrowRight } from "lucide-react";

/**
 * Banner quảng cáo (placeholder). Nội dung truyền qua props để thay bằng quảng cáo thật sau này.
 * Luôn có nhãn "Quảng cáo" để người xem phân biệt được với nội dung của iCards.
 * Màu luôn là xanh thương hiệu, không đổi theo giao diện 1–5.
 */
export function AdBanner({
  title = "Bộ sưu tập thiệp mới",
  text = "Khám phá các mẫu thiệp được cập nhật thường xuyên cho mọi dịp.",
  cta = "Xem chi tiết",
  href = "/templates",
  className = "",
}: {
  title?: string;
  text?: string;
  cta?: string;
  href?: string;
  className?: string;
}) {
  return (
    <aside aria-label="Quảng cáo" className={`relative overflow-hidden bg-[#27548A] text-white ${className}`}>
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      />
      <div aria-hidden className="absolute -right-16 -top-16 size-64 rounded-full border border-white/15" />
      <div aria-hidden className="absolute -bottom-20 right-24 size-48 rounded-full border border-white/10" />

      <div className="relative flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center border border-white/30 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85">
            Quảng cáo
          </span>
          <p className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{title}</p>
          <p className="mt-2 text-white/80">{text}</p>
        </div>
        <a
          href={href}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 bg-white px-7 text-sm font-semibold text-[#27548A] transition-colors hover:bg-white/90"
        >
          {cta}
          <ArrowRight className="size-4" aria-hidden />
        </a>
      </div>
    </aside>
  );
}
