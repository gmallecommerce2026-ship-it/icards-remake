"use client";

import { useEffect, useRef } from "react";

/** Thanh tiến độ đọc mỏng ở mép trên màn hình. Cập nhật qua ref để không re-render khi cuộn. */
export default function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.5;
      const done = Math.min(1, Math.max(0, (window.innerHeight * 0.3 - rect.top) / Math.max(total, 1)));
      if (bar.current) bar.current.style.transform = `scaleX(${done})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [targetId]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[1000] h-[3px] bg-transparent">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-lacquer" />
    </div>
  );
}
