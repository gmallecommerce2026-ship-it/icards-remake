"use client";

import { BANNER_LAYOUTS, LAYOUT_ORDER, type BannerLayout } from "@/lib/banner-groups";

/** Sơ đồ thu nhỏ của bố cục: admin nhìn là hiểu banner sẽ xếp thế nào. */
export function Wireframe({ layout }: { layout: BannerLayout }) {
  const spec = BANNER_LAYOUTS[layout];
  const count = spec.carousel ? 1 : spec.cols === 1 ? 2 : spec.spans.length === 3 || spec.cols === 3 ? 3 : 4;
  return (
    <div
      aria-hidden
      className="grid h-16 w-full gap-1 rounded-sm bg-[#F3F6FA] p-1.5"
      style={{ gridTemplateColumns: `repeat(${spec.cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: count }, (_, i) => {
        const span = spec.spans[i % spec.spans.length];
        return (
          <div
            key={i}
            className="flex items-center justify-center rounded-[2px] bg-[#27548A]/85 text-[10px] font-semibold text-white"
            style={{ gridColumn: `span ${span} / span ${span}` }}
          >
            {spec.carousel ? "▶" : i + 1}
          </div>
        );
      })}
    </div>
  );
}

/** Chọn bố cục bằng hình minh hoạ, thay cho danh sách thả xuống. */
export function LayoutPicker({ value, onChange }: { value: BannerLayout; onChange: (l: BannerLayout) => void }) {
  return (
    <div role="radiogroup" aria-label="Bố cục nhóm" className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {LAYOUT_ORDER.map((key) => {
        const spec = BANNER_LAYOUTS[key];
        const active = key === value;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(key)}
            className={`grid gap-2 rounded-md border p-3 text-left transition-colors ${
              active ? "border-[#27548A] bg-[#EEF4FB] ring-1 ring-[#27548A]" : "border-[#D9E1EC] bg-white hover:border-[#27548A]/60"
            }`}
          >
            <Wireframe layout={key} />
            <span className="text-sm font-semibold">{spec.label}</span>
            <span className="text-xs leading-snug text-[#5B6B7F]">{spec.description}</span>
          </button>
        );
      })}
    </div>
  );
}
