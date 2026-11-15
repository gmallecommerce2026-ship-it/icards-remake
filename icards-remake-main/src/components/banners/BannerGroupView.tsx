"use client";

import Link from "next/link";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import type { Slide } from "@/components/ui/Carousel";
import { BANNER_LAYOUTS, tileSize, type BannerGroupData, type BannerItemData } from "@/lib/banner-groups";

/* Lớp Tailwind viết đầy đủ (không ghép chuỗi động) để Tailwind nhận diện khi build. */
const COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
};
const SPAN: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
};
const HEIGHT: Record<"wide" | "half" | "third", string> = {
  wide: "h-[260px] md:h-[min(60vh,560px)] md:min-h-[360px]",
  half: "h-[240px] md:h-[min(44vh,440px)] md:min-h-[300px]",
  third: "h-[220px] md:h-[min(36vh,360px)] md:min-h-[260px]",
};

/* Một banner dạng ô: ảnh nền (nếu có), lớp phủ tối, chữ trắng, nút trắng. Không có liên kết thì chỉ hiển thị, không bấm được. */
function Tile({ b, className }: { b: BannerItemData; className: string }) {
  const body = (
    <>
      <div className="absolute inset-0 bg-[#0E1B2C]" />
      {b.imgSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={b.imgSrc}
          alt={b.title || b.name}
          className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative flex w-full flex-col justify-end p-6 text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] md:p-10">
        {b.eyebrow && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/85">{b.eyebrow}</p>}
        {b.title && <h3 className="mt-3 text-2xl font-bold leading-[1.2] tracking-tight md:text-4xl">{b.title}</h3>}
        {b.text && <p className="mt-3 max-w-md text-base leading-relaxed text-white/90">{b.text}</p>}
        {b.link && (
          <span className="mt-6 inline-flex h-11 w-fit items-center rounded-sm bg-white px-6 text-sm font-semibold text-[#0E1B2C] transition group-hover:bg-white/90">
            {b.ctaLabel || "Xem thêm"}
          </span>
        )}
      </div>
    </>
  );

  const cls = `group relative flex overflow-hidden rounded-sm bg-[#0E1B2C] ${className}`;
  if (b.link) {
    return (
      <Link href={b.link} className={cls}>
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
}

export function BannerGroupView({ group, fullHeight = false }: { group: BannerGroupData; fullHeight?: boolean }) {
  const spec = BANNER_LAYOUTS[group.layout];
  const items = group.banners.filter((b) => b.isEnabled);
  if (!group.isEnabled || items.length === 0) return null;

  if (spec.carousel) {
    const slides: Slide[] = items.map((b) => ({
      id: b.id,
      eyebrow: b.eyebrow,
      title: b.title || b.name,
      text: b.text,
      href: b.link,
      cta: b.link ? b.ctaLabel || "Xem thêm" : undefined,
      tone: "",
      image: b.imgSrc || undefined,
    }));
    return <HeroCarousel slides={slides} fullHeight={fullHeight} />;
  }

  return (
    <section aria-label={group.name} className={`grid w-full gap-6 ${COLS[spec.cols]}`}>
      {items.map((b, i) => {
        const span = spec.spans[i % spec.spans.length];
        const spanCls = spec.cols === 1 ? "" : SPAN[span];
        return <Tile key={b.id} b={b} className={`${spanCls} ${HEIGHT[tileSize(group.layout, i)]}`} />;
      })}
    </section>
  );
}

/** Hiển thị dãy nhóm theo đúng thứ tự admin đã sắp xếp. heroFirst: nhóm đầu tiên là hero, cao bằng màn hình (nếu là băng chuyền). */
export function BannerGroupList({ groups, heroFirst = false }: { groups: BannerGroupData[]; heroFirst?: boolean }) {
  const visible = groups.filter((g) => g.isEnabled && g.banners.some((b) => b.isEnabled));
  if (visible.length === 0) return null;
  return (
    <div className="flex w-full flex-col gap-6">
      {visible.map((g, i) => (
        <BannerGroupView key={g.id} group={g} fullHeight={heroFirst && i === 0} />
      ))}
    </div>
  );
}
