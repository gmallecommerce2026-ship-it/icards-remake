"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Search, X } from "lucide-react";
import { CardFaceStatic } from "@/components/invitation/editor/CardFaceStatic";
import { useEditorStore, type PageId, type Snap } from "@/components/invitation/editor/useEditorStore";
import type { InvitationTemplate } from "@/lib/templates";
import { CardFace, InvitationPreview, Motif } from "./InvitationPreview";
import { TemplateShowcase } from "./TemplateShowcase";

const DISPLAY = { fontFamily: "var(--font-tpl-display), Georgia, serif" } as const;
const BLUE = "#27548A";

/*
 * Kích thước khung xem: nhỏ gọn để cả khung + nút Trước/Sau nằm trong màn hình đầu tiên.
 * Trên desktop, khung được co theo chiều cao màn hình (340px = đầu trang + nhãn + nút điều hướng).
 * Trên điện thoại, giới hạn chiều rộng 320px. Khung preview được ghim (sticky) khi cuộn cột thông tin.
 */
const FRAME_H = "max(300px,100svh-340px)";
const CAP_SINGLE = `max-w-[min(320px,calc(${FRAME_H}*5/7))] lg:max-w-[calc(${FRAME_H}*5/7)]`;
const CAP_SPREAD = `max-w-[min(320px,calc(${FRAME_H}*10/7))] lg:max-w-[calc(${FRAME_H}*10/7)]`;
const CAP_ENVELOPE = "max-w-[min(320px,100svh-380px)] lg:max-w-[max(280px,calc(100svh-380px))]";
const AUTOPLAY_MS = 3500;

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

/* ---------- Các mặt thiết kế ---------- */

/** Khung 5:7 chứa một mặt thiết kế (lấy từ canvas của mẫu, đúng như trong trình thiết kế). */
function DesignFace({ page, ready }: { page: PageId; ready: boolean }) {
  return (
    <div className="relative aspect-[5/7] w-full overflow-hidden bg-white">
      {ready && <CardFaceStatic pageId={page} />}
    </div>
  );
}

/** Trang trong mở ra: hai mặt (trái và phải) cạnh nhau, có gáy trang ở giữa. Trên màn hình nhỏ xếp dọc. */
function DesignSpread({ ready }: { ready: boolean }) {
  return (
    <div className="relative grid grid-cols-1 bg-white lg:grid-cols-2">
      <DesignFace page="insideLeft" ready={ready} />
      <DesignFace page="inside" ready={ready} />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/[0.07] to-transparent lg:block" />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-[#0E1B2C]/15 lg:block" />
    </div>
  );
}

/* ---------- Carousel ---------- */

type Slide = { key: string; label: string; paper: boolean; wide?: boolean; node: ReactNode };

function ToolButton({
  label,
  icon,
  onClick,
  active,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex w-16 flex-col items-center gap-1.5 rounded-sm border px-1 py-2.5 text-[11px] font-medium leading-tight transition-colors ${
        active
          ? "border-[#27548A] bg-[#27548A] text-white"
          : "border-line bg-white text-ink hover:bg-porcelain"
      }`}
    >
      <span aria-hidden className="grid size-5 place-items-center">{icon}</span>
      <span>{label}</span>
    </button>
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
      { key: "inside", label: "Trang trong", paper: true, wide: true, node: <DesignSpread ready={ready} /> },
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
  const count = slides.length;

  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [playing, setPlaying] = useState(false);
  const touchX = useRef(0);

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);

  // Tự động lật (bật/tắt bằng nút trên thanh công cụ)
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [playing, count]);

  // Phóng to: Esc để đóng, khoá cuộn trang nền
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") setZoom(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom]);

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

  const current = slides[index];

  const toolbar = (
    <div
      role="toolbar"
      aria-label="Công cụ xem thiệp"
      className="order-last mt-5 flex items-start justify-center gap-2 lg:order-first lg:mt-1 lg:flex-col lg:justify-start"
    >
      <ToolButton label="Phóng to" icon={<Search className="size-4" />} onClick={() => setZoom(true)} />
      <ToolButton
        label={playing ? "Dừng lật" : "Tự động lật"}
        icon={playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        onClick={() => setPlaying((p) => !p)}
        active={playing}
      />
      <ToolButton label="Xem lại" icon={<RotateCcw className="size-4" />} onClick={() => { setPlaying(false); setIndex(0); }} />
    </div>
  );

  return (
    <>
      <section
        aria-roledescription="carousel"
        aria-label={`Các mặt của thiệp ${template.name}`}
        onKeyDown={onKeyDown}
        tabIndex={0}
        className="group mx-auto w-full max-w-[440px] outline-none focus-visible:ring-2 focus-visible:ring-[#27548A]/40 lg:flex lg:max-w-none lg:items-start lg:gap-4"
      >
        {toolbar}

        <div className="min-w-0 flex-1">
          <div className="rounded-2xl bg-porcelain px-4 py-5 sm:px-6 sm:py-6 lg:px-5 lg:py-5" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {/* Các slide cùng một ô lưới: chiều cao khung không nhảy khi đổi slide */}
            <div className="grid">
              {slides.map((s, k) => {
                const active = k === index;
                const side = k < index ? "-translate-x-8" : "translate-x-8";
                const cap = s.key === "envelope" ? CAP_ENVELOPE : s.wide ? CAP_SPREAD : CAP_SINGLE;
                return (
                  <div
                    key={s.key}
                    aria-hidden={!active}
                    className={`col-start-1 row-start-1 flex items-center justify-center transition-all duration-500 ease-out ${
                      active ? "z-10 translate-x-0 opacity-100" : `pointer-events-none z-0 opacity-0 ${side}`
                    }`}
                  >
                    {s.paper ? (
                      <div className={`w-full overflow-hidden rounded-[3px] shadow-[0_18px_40px_-16px_rgba(14,27,44,.45)] ring-1 ring-[#0E1B2C]/10 ${cap}`}>
                        {s.node}
                      </div>
                    ) : (
                      <div className={`w-full ${cap}`}>{s.node}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Mặt trước"
              title="Mặt trước"
              className="grid size-12 shrink-0 place-items-center rounded-sm border border-line bg-white text-ink shadow-sm transition-colors hover:bg-porcelain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27548A]/50 active:scale-95"
            >
              <ChevronLeft aria-hidden className="size-6" />
            </button>

            <div className="min-w-0 text-center">
              <p className="text-sm font-semibold text-ink">{slides[index].label}</p>
              <div className="mt-1 flex justify-center gap-1" role="tablist" aria-label="Chọn mặt thiệp">
                {slides.map((s, k) => (
                  <button
                    key={s.key}
                    type="button"
                    role="tab"
                    aria-selected={k === index}
                    aria-label={s.label}
                    onClick={() => setIndex(k)}
                    className="group flex h-8 w-6 items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27548A]/50"
                  >
                    <span
                      aria-hidden
                      className={`h-1.5 rounded-sm transition-all ${k === index ? "w-5" : "w-1.5 bg-line group-hover:bg-muted"}`}
                      style={k === index ? { background: BLUE } : undefined}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Mặt tiếp theo"
              title="Mặt tiếp theo"
              className="grid size-12 shrink-0 place-items-center rounded-sm border border-line bg-white text-ink shadow-sm transition-colors hover:bg-porcelain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27548A]/50 active:scale-95"
            >
              <ChevronRight aria-hidden className="size-6" />
            </button>
          </div>
        </div>
      </section>

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Xem phóng to: ${current.label}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1B2C]/85 p-4"
          onClick={() => setZoom(false)}
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Đóng"
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-sm bg-white text-ink"
          >
            <X className="size-5" />
          </button>
          <div
            className={`max-h-[92svh] overflow-y-auto rounded-sm ${
              current.wide ? "w-[min(94vw,calc(88svh*10/7))]" : "w-[min(94vw,calc(88svh*5/7))]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-[3px] bg-white">{current.node}</div>
          </div>
        </div>
      )}
    </>
  );
}
