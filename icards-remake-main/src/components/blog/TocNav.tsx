"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; text: string };

/** Mục lục: đánh dấu mục đang đọc theo vị trí cuộn. */
export default function TocNav({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.35; // heading nào vượt qua đường này thì coi là đang đọc
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(atBottom ? els[els.length - 1].id : current);
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
  }, [items]);

  return (
    <nav aria-label="Mục lục">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Trong bài này</p>
      <ol className="mt-4 space-y-1 border-l border-line">
        {items.map((h, i) => {
          const on = active === h.id;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={on ? "location" : undefined}
                className={
                  "-ml-px flex gap-3 border-l-2 py-1.5 pl-4 text-[15px] leading-snug transition-colors " +
                  (on ? "border-lacquer font-semibold text-lacquer" : "border-transparent text-muted hover:text-ink")
                }
              >
                <span className="tabular-nums opacity-60">{String(i + 1).padStart(2, "0")}</span>
                <span>{h.text}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
