"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useHeaderHeight } from "./useHeaderHeight";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Slide } from "./Carousel";

/* Banner đầu trang toàn chiều rộng: ảnh (hoặc gradient) nền, chữ nằm trên ảnh có lớp phủ tối để dễ đọc. */
/** fullHeight: banner cao đúng bằng màn hình trừ header, người dùng phải cuộn mới thấy phần dưới. */
export function HeroCarousel({ slides, interval = 6000, fullHeight = false }: { slides: Slide[]; interval?: number; fullHeight?: boolean }) {
  const [i, setI] = useState(0);
  const headerH = useHeaderHeight();
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  useEffect(() => {
    if (paused || n < 2) return;
    const id = setInterval(() => setI((x) => (x + 1) % n), interval);
    return () => clearInterval(id);
  }, [paused, n, interval]);

  if (n === 0) return null;
  const go = (k: number) => setI(((k % n) + n) % n);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Banner"
      className="relative w-full overflow-hidden bg-[#0E1B2C]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className={`relative w-full ${fullHeight ? "min-h-[480px]" : "h-[min(72vh,640px)] min-h-[420px]"}`}
        style={fullHeight ? { height: headerH ? `calc(100svh - ${headerH}px)` : "100svh" } : undefined}
      >
        {slides.map((s, k) => (
          <div
            key={s.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${k + 1} / ${n}`}
            aria-hidden={k !== i}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${k === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            {s.image ? (
              <img src={s.image} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${s.tone}`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />

            <div className="relative mx-auto flex h-full w-full max-w-[1520px] items-end px-6 pb-20 md:px-12 md:pb-24">
              <div className="max-w-2xl text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
                {s.eyebrow && (
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/85">{s.eyebrow}</p>
                )}
                <h2 className="mt-3 text-4xl font-bold leading-[1.15] tracking-tight md:text-6xl">{s.title}</h2>
                {s.text && <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">{s.text}</p>}
                {s.href && s.cta && (
                  <Link
                    href={s.href}
                    tabIndex={k === i ? 0 : -1}
                    className="mt-8 inline-flex h-12 items-center rounded-sm bg-white px-7 text-sm font-semibold text-[#0E1B2C] transition hover:bg-white/90"
                  >
                    {s.cta}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {n > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(i - 1)}
            aria-label="Banner trước"
            className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-sm bg-white/20 text-white backdrop-blur transition hover:bg-white/35"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(i + 1)}
            aria-label="Banner tiếp"
            className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-sm bg-white/20 text-white backdrop-blur transition hover:bg-white/35"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((s, k) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(k)}
                aria-label={`Chuyển đến banner ${k + 1}`}
                aria-current={k === i ? "true" : undefined}
                className={`h-2 rounded-sm transition-all ${k === i ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/75"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
