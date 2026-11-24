"use client";

import { useEffect, useState } from "react";

/* Mục lục: làm nổi bật mục đang đọc. Trên điện thoại thu gọn thành một khối bấm để mở. */
export function GuideSectionNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  const list = (
    <ol className="space-y-1 text-sm">
      {items.map((s, i) => {
        const on = active === s.id;
        return (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={on ? "location" : undefined}
              className={`block border-l-2 py-1.5 pl-3 transition-colors ${on ? "border-[#27548A] font-semibold text-[#27548A]" : "border-transparent text-muted hover:text-[#27548A]"}`}
            >
              {i + 1}. {s.label}
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      <details className="rounded-sm border border-line bg-white p-4 lg:hidden">
        <summary className="cursor-pointer text-sm font-semibold text-ink">Mục lục ({items.length} phần)</summary>
        <div className="mt-3">{list}</div>
      </details>
      <nav aria-label="Mục lục hướng dẫn" className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
        <p className="mb-3 text-sm font-semibold text-ink">Mục lục</p>
        {list}
      </nav>
    </>
  );
}
