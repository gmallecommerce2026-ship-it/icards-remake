"use client";

import { useRef, type KeyboardEvent, type ReactNode, type TouchEvent } from "react";
import { useState } from "react";
import { CardFace, InvitationPreview, Motif } from "./InvitationPreview";
import { TemplateShowcase } from "./TemplateShowcase";
import type { InvitationTemplate } from "@/lib/templates";

const DISPLAY = { fontFamily: "var(--font-tpl-display), Georgia, serif" } as const;

/** Trang bên trong thiệp gập: lời mời, thời gian, địa điểm, nút xác nhận. Mọi cỡ chữ theo cqw nên co giãn theo khung. */
function InsideFace({ t }: { t: InvitationTemplate }) {
  const p = t.palette;
  const s = t.sample;
  const block = (title: string, body: ReactNode) => (
    <section style={{ padding: "7cqw 8cqw", textAlign: "center", borderTop: `0.3cqw solid ${p.soft}` }}>
      <h4 style={{ ...DISPLAY, fontSize: "6cqw", fontWeight: 600, marginBottom: "2.5cqw" }}>{title}</h4>
      <div style={{ fontSize: "3.8cqw", lineHeight: 1.6, opacity: 0.9 }}>{body}</div>
    </section>
  );
  return (
    <div
      role="img"
      aria-label={`Bên trong thiệp ${t.name}`}
      className="h-full w-full overflow-y-auto"
      style={{ aspectRatio: "5 / 7", background: p.bg, color: p.ink, containerType: "inline-size" }}
    >
      <div style={{ padding: "10cqw 8cqw 4cqw", textAlign: "center" }}>
        <p style={{ fontSize: "3.6cqw", letterSpacing: "0.03em", opacity: 0.8 }}>Lời mời</p>
        <p style={{ fontSize: "4.2cqw", marginTop: "3cqw", lineHeight: 1.6 }}>{s.message}</p>
      </div>
      {block("Thời gian", <><p style={{ fontWeight: 600 }}>{s.date}</p><p>Lúc {s.time}</p></>)}
      {block("Địa điểm", <><p style={{ fontWeight: 600 }}>{s.place}</p><p>{s.address}</p></>)}
      <section style={{ padding: "7cqw 8cqw 12cqw", textAlign: "center", borderTop: `0.3cqw solid ${p.soft}` }}>
        <span
          style={{
            display: "inline-block",
            background: p.accent,
            color: p.bg,
            fontSize: "3.8cqw",
            fontWeight: 600,
            padding: "2.8cqw 7cqw",
            borderRadius: "999px",
          }}
        >
          Xác nhận tham dự
        </span>
      </section>
    </div>
  );
}

/** Mặt sau thiệp gập: nền màu phụ, họa tiết và tên cặp đôi. */
function BackFace({ t }: { t: InvitationTemplate }) {
  const p = t.palette;
  return (
    <div
      role="img"
      aria-label={`Mặt sau thiệp ${t.name}`}
      className="flex w-full flex-col items-center justify-center text-center"
      style={{ aspectRatio: "5 / 7", background: p.soft, color: p.ink, containerType: "inline-size", padding: "10cqw 8cqw", gap: "5cqw" }}
    >
      <Motif template={t} />
      <p style={{ fontSize: "3.4cqw", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.75 }}>{t.sample.kicker}</p>
      <p style={{ ...DISPLAY, fontSize: "7cqw", lineHeight: 1.2 }}>{t.sample.titleLines.join(" ")}</p>
    </div>
  );
}

type Slide = { key: string; label: string; paper: boolean; node: ReactNode };

export function TemplateCarousel({ template }: { template: InvitationTemplate }) {
  const isCard = template.format === "card" && !!template.layout;

  const slides: Slide[] = [
    {
      key: "envelope",
      label: "Phong bì",
      paper: false,
      node: (
        <div className="px-2 py-6">
          <TemplateShowcase template={template} />
        </div>
      ),
    },
    {
      key: "cover",
      label: "Mặt ngoài",
      paper: true,
      node: <InvitationPreview template={template} variant="card" ratio="tall" />,
    },
    ...(isCard
      ? []
      : [{ key: "inside", label: "Bên trong", paper: true, node: <InsideFace t={template} /> }]),
    {
      key: "back",
      label: "Mặt sau",
      paper: true,
      node: isCard ? <CardFace template={template} face="back" /> : <BackFace t={template} />,
    },
  ];

  const [index, setIndex] = useState(0);
  const count = slides.length;
  const touchX = useRef(0);

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={`Các mặt của thiệp ${template.name}`}
      onKeyDown={onKeyDown}
      tabIndex={0}
      className="group mx-auto w-full max-w-[440px] outline-none focus-visible:ring-2 focus-visible:ring-lacquer/40 rounded-2xl"
    >
      <div className="rounded-2xl bg-porcelain px-4 py-6 sm:px-8 sm:py-8" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {/* Các slide cùng nằm trong một ô lưới: chiều cao khung = slide cao nhất, không bị nhảy khi đổi slide */}
        <div className="grid">
          {slides.map((s, k) => {
            const active = k === index;
            const side = k < index ? "-translate-x-8" : "translate-x-8";
            return (
              <div
                key={s.key}
                aria-hidden={!active}
                className={`col-start-1 row-start-1 flex items-center justify-center transition-all duration-500 ease-out ${
                  active ? "z-10 translate-x-0 opacity-100" : `pointer-events-none z-0 opacity-0 ${side}`
                }`}
              >
                {s.paper ? (
                  <div className="w-full overflow-hidden rounded-[3px] shadow-[0_18px_40px_-16px_rgba(14,27,44,.45)] ring-1 ring-[#0E1B2C]/10">
                    {s.node}
                  </div>
                ) : (
                  <div className="w-full">{s.node}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Mặt trước"
          className="grid size-11 place-items-center rounded-full border border-line bg-white transition-colors hover:bg-porcelain"
        >
          <span aria-hidden className="text-lg leading-none">‹</span>
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-ink">{slides[index].label}</p>
          <div className="mt-2 flex justify-center gap-2" role="tablist" aria-label="Chọn mặt thiệp">
            {slides.map((s, k) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={k === index}
                aria-label={s.label}
                onClick={() => setIndex(k)}
                className={`h-2 rounded-full transition-all ${k === index ? "w-6 bg-lacquer" : "w-2 bg-line hover:bg-muted"}`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Mặt sau"
          className="grid size-11 place-items-center rounded-full border border-line bg-white transition-colors hover:bg-porcelain"
        >
          <span aria-hidden className="text-lg leading-none">›</span>
        </button>
      </div>
    </section>
  );
}
