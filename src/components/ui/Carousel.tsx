"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Slide = {
  id: string;
  eyebrow?: string;
  title: string;
  text?: string;
  href?: string;
  cta?: string;
  /** lớp nền gradient Tailwind, ví dụ "from-lacquer-soft via-white to-porcelain" */
  tone: string;
  /** ảnh nền (URL), dùng cho banner toàn chiều rộng. Không có thì dùng lớp gradient tone. */
  image?: string;
};

/** Banner dạng carousel: tự chạy, dừng khi rê chuột / lấy tiêu điểm, có mũi tên và chấm chuyển trang */
export function Carousel({ slides, interval = 6000, className = "" }: { slides: Slide[]; interval?: number; className?: string }) {
  const [i, setI] = useState(0);
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
      className={`relative overflow-hidden rounded-sm border border-line ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, k) => (
          <div
            key={s.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${k + 1} / ${n}`}
            aria-hidden={k !== i}
            className={`relative min-w-full bg-gradient-to-br ${s.tone} px-8 py-14 md:px-16 md:py-20`}
          >
            <div className="max-w-xl">
              {s.eyebrow && <p className="text-sm font-semibold uppercase tracking-widest text-lacquer">{s.eyebrow}</p>}
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-ink md:text-5xl">{s.title}</h2>
              {s.text && <p className="mt-4 text-muted md:text-lg">{s.text}</p>}
              {s.href && s.cta && (
                <Link href={s.href} tabIndex={k === i ? 0 : -1} className="mt-8 inline-flex rounded-sm bg-lacquer px-6 py-3 text-sm font-semibold text-white transition hover:bg-lacquer-dark">
                  {s.cta}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {n > 1 && (
        <>
          <button type="button" onClick={() => go(i - 1)} aria-label="Banner trước" className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-sm bg-white/80 text-ink shadow transition hover:bg-white">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => go(i + 1)} aria-label="Banner tiếp" className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-sm bg-white/80 text-ink shadow transition hover:bg-white">
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((s, k) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(k)}
                aria-label={`Chuyển đến banner ${k + 1}`}
                aria-current={k === i ? "true" : undefined}
                className={`h-2 rounded-sm transition-all ${k === i ? "w-6 bg-lacquer" : "w-2 bg-ink/25 hover:bg-ink/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
