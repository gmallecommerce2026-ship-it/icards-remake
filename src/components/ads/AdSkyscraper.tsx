import { ArrowRight } from "lucide-react";

export type SideAd = {
  title: string;
  text: string;
  cta: string;
  href: string;
  /** Ảnh quảng cáo 160×600 (nếu có thì thay toàn bộ phần chữ) */
  imgSrc?: string;
};

/**
 * Banner dọc 160×600 (wide skyscraper, cỡ chuẩn của Google Ads) đặt hai bên trang.
 * Luôn có nhãn "Quảng cáo". Thay nội dung qua props hoặc danh sách trong lib/side-ads.ts.
 */
export function AdSkyscraper({ ad }: { ad: SideAd }) {
  return (
    <aside
      aria-label="Quảng cáo"
      className="relative flex h-[600px] w-[160px] flex-col overflow-hidden border border-line bg-white shadow-[0_10px_30px_-18px_rgba(39,84,138,0.45)]"
    >
      <span className="absolute right-0 top-0 z-10 bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-muted">Quảng cáo</span>

      {ad.imgSrc ? (
        <a href={ad.href} rel="sponsored noopener" className="block h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.imgSrc} alt={ad.title} width={160} height={600} className="h-full w-full object-cover" />
        </a>
      ) : (
        <a href={ad.href} rel="sponsored noopener" className="group relative flex h-full flex-col bg-[#27548A] text-white">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "18px 18px" }}
          />
          <div aria-hidden className="absolute -bottom-16 -left-16 size-44 rounded-full border border-white/15" />
          <div aria-hidden className="absolute -bottom-8 -left-8 size-28 rounded-full border border-white/10" />

          <div className="relative mt-auto flex flex-1 flex-col justify-center gap-3 px-4 pb-4 pt-10">
            <p className="text-balance text-xl font-bold leading-tight tracking-tight">{ad.title}</p>
            <p className="text-pretty text-[13px] leading-relaxed text-white/80">{ad.text}</p>
          </div>

          <span className="relative m-3 mt-0 inline-flex h-10 items-center justify-center gap-1.5 bg-white text-[13px] font-semibold text-[#27548A] transition-colors group-hover:bg-white/90">
            {ad.cta}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </a>
      )}
    </aside>
  );
}
