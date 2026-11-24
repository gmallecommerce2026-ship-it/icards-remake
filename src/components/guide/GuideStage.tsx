"use client";

import { useRef, useState, type CSSProperties } from "react";

export type Hotspot = { x: number; y: number; title: string; text: string };

/* Ảnh hướng dẫn có chữ đặt ngay trên ảnh.
 * - Mỗi bước là một số (pin) đặt đúng vào thành phần trên ảnh (toạ độ tính theo % chiều rộng/cao ảnh).
 * - Bấm số trên ảnh hoặc bước bên trái: ảnh cuộn tới đúng chỗ, phần còn lại bị làm tối, nội dung hiện ngay cạnh pin.
 * - Di chuột vào bước bên trái chỉ đổi bước đang xem, không cuộn ảnh. */
export function GuideStage({ src, alt, caption, hotspots }: { src: string; alt: string; caption: string; hotspots: Hotspot[] }) {
  const [active, setActive] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const pinRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const h = hotspots[active];

  const focusOn = (i: number) => {
    setActive(i);
    const frame = frameRef.current;
    const pin = pinRefs.current[i];
    if (!frame || !pin) return;
    const fr = frame.getBoundingClientRect();
    const pr = pin.getBoundingClientRect();
    const top = frame.scrollTop + (pr.top - fr.top) - frame.clientHeight / 2 + pr.height / 2;
    frame.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  // Nhãn đặt bên phải/trái/dưới pin tuỳ vị trí để không tràn khỏi ảnh
  const bubbleStyle = (p: Hotspot): CSSProperties => {
    const pos: CSSProperties = { left: `${p.x}%`, top: `${p.y}%` };
    if (p.x < 35) return { ...pos, transform: "translate(26px, -50%)" };
    if (p.x > 65) return { ...pos, transform: "translate(calc(-100% - 26px), -50%)" };
    if (p.y > 80) return { ...pos, transform: "translate(-50%, calc(-100% - 22px))" };
    return { ...pos, transform: "translate(-50%, 22px)" };
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] lg:items-start">
      {/* Viewer: ảnh đứng yên bên phải khi cuộn đọc các bước */}
      <figure className="order-1 min-w-0 lg:sticky lg:top-24 lg:order-2">
        <div ref={frameRef} className="relative max-h-[min(70vh,600px)] overflow-auto border border-line bg-white">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} loading="lazy" className="block h-auto w-full" />

            {/* Làm tối phần ảnh ngoài thành phần đang xem */}
            <div
              aria-hidden
              className="pointer-events-none absolute z-0 rounded-[14px] transition-[left,top] duration-500 ease-out"
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`,
                width: 120,
                height: 56,
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 0 9999px rgba(15,23,42,.42)",
              }}
            />

            {hotspots.map((p, i) => {
              const on = i === active;
              return (
                <button
                  key={i}
                  ref={(el) => { pinRefs.current[i] = el; }}
                  type="button"
                  aria-label={`Bước ${i + 1}: ${p.title}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => focusOn(i)}
                  className="absolute z-10 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xs font-bold text-white shadow-md ring-2 ring-white transition-transform hover:scale-110"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, background: on ? "#27548A" : "#D0788C" }}
                >
                  {i + 1}
                </button>
              );
            })}

            {/* Nhãn chữ ngay trên ảnh, cạnh pin đang xem */}
            <div
              className="pointer-events-none absolute z-20 w-[230px] max-w-[70%] rounded-sm bg-white px-3.5 py-2.5 shadow-xl transition-[left,top] duration-500 ease-out"
              style={bubbleStyle(h)}
            >
              <p className="text-sm font-bold text-ink">{h.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{h.text}</p>
            </div>
          </div>
        </div>
        <figcaption className="mt-2 text-center text-xs text-muted">{caption}</figcaption>
      </figure>

      {/* Danh sách bước: bấm hoặc di chuột để đổi thành phần đang xem */}
      <ol className="order-2 space-y-2 lg:order-1">
        {hotspots.map((p, i) => {
          const on = i === active;
          return (
            <li key={i}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => focusOn(i)}
                aria-current={on ? "step" : undefined}
                className={`flex w-full gap-3 border-l-4 px-4 py-3 text-left transition-colors ${on ? "border-[#27548A] bg-white shadow-sm" : "border-transparent hover:bg-white/70"}`}
              >
                <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${on ? "bg-[#27548A] text-white" : "bg-line text-ink"}`}>{i + 1}</span>
                <span className="min-w-0">
                  <span className={`block font-semibold ${on ? "text-[#27548A]" : "text-ink"}`}>{p.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{p.text}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
