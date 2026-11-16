"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode, type TouchEvent } from "react";
import { CardFaceStatic } from "@/components/invitation/editor/CardFaceStatic";
import { useEditorStore, type PageId, type Snap } from "@/components/invitation/editor/useEditorStore";
import type { InvitationTemplate } from "@/lib/templates";
import { CardFace, InvitationPreview, Motif } from "./InvitationPreview";
import { TemplateShowcase } from "./TemplateShowcase";

const DISPLAY = { fontFamily: "var(--font-tpl-display), Georgia, serif" } as const;
const BLUE = "#27548A";

/* ---------- Dự phòng khi mẫu chưa có thiết kế canvas (template.design) ---------- */

function FallbackInside({ t }: { t: InvitationTemplate }) {
  const p = t.palette;
  const s = t.sample;
  const block = (title: string, body: ReactNode) => (
    <section style={{ padding: "7cqw 8cqw", textAlign: "center", borderTop: `0.3cqw solid ${p.soft}` }}>
      <h4 style={{ ...DISPLAY, fontSize: "6cqw", fontWeight: 600, marginBottom: "2.5cqw" }}>{title}</h4>
      <div style={{ fontSize: "3.8cqw", lineHeight: 1.6, opacity: 0.9 }}>{body}</div>
    </section>
  );
  return (
    <div style={{ aspectRatio: "5 / 7", background: p.bg, color: p.ink, containerType: "inline-size" }} className="w-full overflow-y-auto">
      <div style={{ padding: "10cqw 8cqw 4cqw", textAlign: "center" }}>
        <p style={{ fontSize: "4.2cqw", lineHeight: 1.6 }}>{s.message}</p>
      </div>
      {block("Thời gian", <><p style={{ fontWeight: 600 }}>{s.date}</p><p>Lúc {s.time}</p></>)}
      {block("Địa điểm", <><p style={{ fontWeight: 600 }}>{s.place}</p><p>{s.address}</p></>)}
    </div>
  );
}

function FallbackBack({ t }: { t: InvitationTemplate }) {
  const p = t.palette;
  return (
    <div
      className="flex w-full flex-col items-center justify-center text-center"
      style={{ aspectRatio: "5 / 7", background: p.soft, color: p.ink, containerType: "inline-size", padding: "10cqw 8cqw", gap: "5cqw" }}
    >
      <Motif template={t} />
      <p style={{ ...DISPLAY, fontSize: "7cqw", lineHeight: 1.2 }}>{t.sample.titleLines.join(" ")}</p>
    </div>
  );
}

/* ---------- Carousel ---------- */

type Slide = { key: string; label: string; paper: boolean; node: ReactNode };

/** Khung 5:7 chứa một mặt thiết kế (lấy từ canvas của mẫu, đúng như trong trình thiết kế). */
function DesignFace({ page, ready }: { page: PageId; ready: boolean }) {
  return (
    <div className="relative aspect-[5/7] w-full overflow-hidden bg-white">
      {ready && <CardFaceStatic pageId={page} />}
    </div>
  );
}

export function TemplateCarousel({ template }: { template: InvitationTemplate }) {
  const isCard = template.format === "card" && !!template.layout;
  const design = template.design;
  const useDesign = !isCard && !!design?.pages && !!design?.backdrops;

  // Nạp thiết kế canvas của mẫu vào store (cùng cách trình thiết kế đang làm) để các mặt hiển thị đúng bố cục.
  const [ready, setReady] = useState(!useDesign);
  useEffect(() => {
    if (!useDesign || !design) return;
    useEditorStore.getState().hydrate({
      pages: design.pages,
      backdrops: design.backdrops,
      format: design.format,
      orientation: design.orientation,
    } as unknown as Snap);
    setReady(true);
  }, [useDesign, design]);

  const envelope: Slide = {
    key: "envelope",
    label: "Phong bì",
    paper: false,
    node: (
      <div className="px-2 py-6">
        <TemplateShowcase template={template} />
      </div>
    ),
  };

  let faces: Slide[];
  if (useDesign) {
    faces = [
      { key: "cover", label: "Mặt ngoài", paper: true, node: <DesignFace page="cover" ready={ready} /> },
      { key: "insideLeft", label: "Trang trái", paper: true, node: <DesignFace page="insideLeft" ready={ready} /> },
      { key: "inside", label: "Trang phải", paper: true, node: <DesignFace page="inside" ready={ready} /> },
      { key: "back", label: "Mặt sau", paper: true, node: <DesignFace page="back" ready={ready} /> },
    ];
  } else if (isCard) {
    faces = [
      { key: "cover", label: "Mặt ngoài", paper: true, node: <InvitationPreview template={template} variant="card" /> },
      { key: "back", label: "Mặt sau", paper: true, node: <CardFace template={template} face="back" /> },
    ];
  } else {
    faces = [
      { key: "cover", label: "Mặt ngoài", paper: true, node: <InvitationPreview template={template} variant="card" ratio="tall" /> },
      { key: "inside", label: "Bên trong", paper: true, node: <FallbackInside t={template} /> },
      { key: "back", label: "Mặt sau", paper: true, node: <FallbackBack t={template} /> },
    ];
  }

  const slides: Slide[] = [envelope, ...faces];

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
      className="group mx-auto w-full max-w-[440px] rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#27548A]/40 lg:max-w-[min(340px,max(240px,calc((100svh-240px)*5/7)))]"
    >
      <div className="rounded-2xl bg-porcelain px-4 py-5 sm:px-6 sm:py-6 lg:px-5 lg:py-5" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {/* Các slide cùng một ô lưới: chiều cao khung không nhảy khi đổi slide */}
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

      <div className="mt-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Mặt trước"
          className="grid size-9 place-items-center rounded-sm border border-line bg-white transition-colors hover:bg-porcelain"
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
                className={`h-1.5 rounded-sm transition-all ${k === index ? "w-5" : "w-1.5 bg-line hover:bg-muted"}`}
                style={k === index ? { background: BLUE } : undefined}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Mặt sau"
          className="grid size-9 place-items-center rounded-sm border border-line bg-white transition-colors hover:bg-porcelain"
        >
          <span aria-hidden className="text-lg leading-none">›</span>
        </button>
      </div>
    </section>
  );
}
