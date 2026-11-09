import Link from "next/link";
import type { Slide } from "./Carousel";

/* Thẻ banner nền tối, chữ trắng, nút trắng vuông. Dùng chung cho các banner cuối trang. */
export function BannerCard({ b, className }: { b: Slide; className: string }) {
  return (
    <Link href={b.href ?? "#"} className={`group relative flex overflow-hidden rounded-sm bg-[#0E1B2C] ${className}`}>
      {b.image ? (
        <img src={b.image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 bg-[#0E1B2C]" />
      )}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative flex w-full flex-col justify-end p-8 text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] md:p-12">
        {b.eyebrow && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/85">{b.eyebrow}</p>}
        <h3 className="mt-3 text-3xl font-bold leading-[1.2] tracking-tight md:text-4xl">{b.title}</h3>
        {b.text && <p className="mt-4 max-w-md text-base leading-relaxed text-white/90">{b.text}</p>}
        {b.cta && (
          <span className="mt-7 inline-flex h-12 w-fit items-center rounded-sm bg-white px-7 text-sm font-semibold text-[#0E1B2C] transition group-hover:bg-white/90">
            {b.cta}
          </span>
        )}
      </div>
    </Link>
  );
}
