"use client";

import { useCallback, useEffect, useRef, type ReactNode, type TouchEvent } from "react";
import type { InvitationTemplate } from "@/lib/templates";
import { InvitationPreview } from "./InvitationPreview";
import { TemplateShowcase } from "./TemplateShowcase";
import "./TemplateDetailStudio.css";

/* Khung trình diễn của trang chi tiết mẫu (bố cục kiểu Paperless Post):
 * thanh biểu tượng bên trái chọn slide; khung giữa có mũi tên, vuốt, bàn phím và chấm chuyển slide.
 * Các slide minh hoạ tính năng có thật của trang thiệp, dùng dữ liệu mẫu (sample) và ảnh bìa của chính mẫu. */

const Svg = ({ children }: { children: ReactNode }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

export const Icons = {
  card: () => <Svg><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m3.5 6 8.5 7 8.5-7" /></Svg>,
  preview: () => <Svg><path d="M7 4.5v15l12-7.5z" /></Svg>,
  album: () => <Svg><rect x="3" y="4" width="18" height="16" rx="1.5" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m21 16-5-5-8 8" /></Svg>,
  location: () => <Svg><path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></Svg>,
  rsvp: () => <Svg><path d="M4 6.5 5.5 8 8 5.5" /><path d="M11 7h9" /><path d="M4 12.5 5.5 14 8 11.5" /><path d="M11 13h9" /><path d="M4.5 18h3" /><path d="M11 19h9" /></Svg>,
  wishes: () => <Svg><path d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" /><path d="M12 13.2s-3-1.8-3-3.6a1.5 1.5 0 0 1 3-.4 1.5 1.5 0 0 1 3 .4c0 1.8-3 3.6-3 3.6z" /></Svg>,
  send: () => <Svg><path d="M21 3 10 14" /><path d="M21 3l-7 18-4-7-7-4z" /></Svg>,
  tracking: () => <Svg><rect x="4" y="3.5" width="16" height="17" rx="1.5" /><path d="M8 8.5 9.5 10 12 7.5" /><path d="M8 14.5 9.5 16 12 13.5" /><path d="M14.5 9h2.5" /><path d="M14.5 15h2.5" /></Svg>,
  chevronLeft: () => <Svg><path d="m14.5 6-6 6 6 6" /></Svg>,
  chevronRight: () => <Svg><path d="m9.5 6 6 6-6 6" /></Svg>,
};

export type ShowcaseKey = "card" | "album" | "location" | "rsvp" | "wishes" | "send" | "tracking";

type ShowcaseSlide = { key: ShowcaseKey; label: string; caption: string };

export const SLIDES: ShowcaseSlide[] = [
  { key: "card", label: "Thiệp", caption: "Mẫu thiệp. Đổi chữ, ảnh, màu sắc và thêm khối hình tùy ý." },
  { key: "album", label: "Album ảnh", caption: "Trang thiệp online kèm album ảnh, video và nhạc nền." },
  { key: "location", label: "Địa điểm", caption: "Lịch trình, địa chỉ và bản đồ chỉ đường cho khách." },
  { key: "rsvp", label: "Xác nhận tham dự", caption: "Khách xác nhận tham dự ngay trên thiệp, kèm số người đi cùng." },
  { key: "wishes", label: "Sổ lời chúc", caption: "Khách gửi lời chúc; bạn duyệt, ẩn hoặc trả lời." },
  { key: "send", label: "Gửi thiệp riêng", caption: "Mỗi khách một đường link riêng, gọi đúng xưng hô. Gửi bằng email hoặc dán link vào Zalo, Messenger." },
  { key: "tracking", label: "Theo dõi khách", caption: "Theo dõi ai tham dự, ai chưa phản hồi. Nhập, xuất danh sách bằng Excel." },
];

const RAIL_ICON: Record<ShowcaseKey | "preview", () => ReactNode> = {
  card: Icons.card,
  album: Icons.album,
  location: Icons.location,
  rsvp: Icons.rsvp,
  wishes: Icons.wishes,
  send: Icons.send,
  tracking: Icons.tracking,
  preview: Icons.preview,
};

const RAIL_LABEL: Record<ShowcaseKey, string> = {
  card: "Thiệp",
  album: "Album ảnh",
  location: "Địa điểm",
  rsvp: "Xác nhận tham dự",
  wishes: "Sổ lời chúc",
  send: "Gửi thiệp riêng",
  tracking: "Theo dõi khách",
};

const WISHES = [
  { name: "Lan Anh", text: "Chúc mừng cả nhà! Mong mọi điều tốt đẹp nhất sẽ đến." },
  { name: "Anh Tuấn", text: "Hẹn gặp mọi người ở buổi tiệc nhé!" },
  { name: "Cô Hoa", text: "Chúc hạnh phúc, vui vẻ và thật nhiều sức khỏe." },
];

const GUESTS = [
  { name: "Nguyễn Văn Minh", group: "Gia đình", status: "yes" },
  { name: "Trần Thị Lan", group: "Bạn bè", status: "wait" },
  { name: "Lê Hoàng Nam", group: "Đồng nghiệp", status: "yes" },
  { name: "Phạm Thu Hà", group: "Bạn bè", status: "no" },
] as const;
const STATUS_LABEL = { yes: "Tham dự", no: "Không tham dự", wait: "Chưa phản hồi" } as const;

function SlideBody({ k, template, onOpenPreview }: { k: ShowcaseKey; template: InvitationTemplate; onOpenPreview: () => void }) {
  const s = template.sample;
  switch (k) {
    case "card": {
      const pageCount = template.design?.pages ? Object.keys(template.design.pages).length : 0;
      return (
        <div className="fs-slide flex-col gap-[14px]" style={{ flexDirection: "column" }}>
          <div className="fs-card-art">
            <TemplateShowcase template={template} />
          </div>
          {pageCount > 1 && (
            <button type="button" className="fs-pages-btn" onClick={onOpenPreview}>
              Xem từng trang ({pageCount} trang)
            </button>
          )}
        </div>
      );
    }
    case "album":
      return (
        <div className="fs-slide">
          <div className="fs-browser">
            <div className="fs-browser-bar" aria-hidden="true">
              <i /><i /><i />
              <span className="fs-browser-url">icards.com.vn/events/...</span>
            </div>
            <div className="fs-album-title">Album ảnh</div>
            <div className="fs-album-grid">
              <div className="fs-album-cover fs-thumb">
                <InvitationPreview template={template} variant="card" ratio="tall" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className={`fs-photo fs-photo--${i}`}>
                  {Icons.album()}
                  {i === 1 && <small>Ảnh của bạn</small>}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    case "location":
      return (
        <div className="fs-slide fs-location">
          <div className="fs-map" aria-hidden="true">
            <span className="fs-map-road fs-map-road--h" />
            <span className="fs-map-road fs-map-road--v" />
            <span className="fs-map-road fs-map-road--d" />
            <span className="fs-map-pin">{Icons.location()}</span>
          </div>
          <div className="fs-panel fs-schedule">
            <div className="fs-panel-title">Lịch trình</div>
            <div className="fs-event">
              <span className="fs-time">{s.time}</span>
              <span><b>{s.date}</b><small>{s.place}</small></span>
            </div>
            <div className="fs-field">Địa chỉ<span>{s.address}</span></div>
            <span className="fs-btn">Chỉ đường</span>
          </div>
        </div>
      );
    case "rsvp":
      return (
        <div className="fs-slide fs-rsvp">
          <div className="fs-side-card fs-thumb" aria-hidden="true">
            <InvitationPreview template={template} variant="card" ratio="tall" />
          </div>
          <div className="fs-panel">
            <div className="fs-panel-title">Xác nhận tham dự</div>
            <p className="fs-muted">Sự hiện diện của bạn là niềm vinh hạnh cho gia đình chúng tôi.</p>
            <div className="fs-choice">
              <span className="is-on">✓ Sẽ tham dự</span>
              <span>Không thể tham dự</span>
            </div>
            <div className="fs-field">Số người tham dự<span className="fs-select">2 người ▾</span></div>
            <span className="fs-btn">Gửi xác nhận</span>
          </div>
        </div>
      );
    case "wishes":
      return (
        <div className="fs-slide fs-wishes">
          <div className="fs-panel">
            <div className="fs-panel-title">Sổ lời chúc</div>
            {WISHES.map((w) => (
              <div key={w.name} className="fs-wish">
                <span className="fs-avatar" aria-hidden="true">{w.name.split(" ").pop()?.[0]}</span>
                <span><b>{w.name}</b>{w.text}</span>
              </div>
            ))}
            <div className="fs-input">Viết lời chúc của bạn...<span className="fs-btn fs-btn--sm">Gửi</span></div>
          </div>
        </div>
      );
    case "send":
      return (
        <div className="fs-slide fs-send">
          <div className="fs-mail">
            <div className="fs-mail-head">
              <div><span>Đến</span>Bố Minh</div>
              <div><span>Tiêu đề</span>Trân trọng kính mời Bố Minh</div>
            </div>
            <div className="fs-mail-body">
              <div className="fs-thumb">
                <InvitationPreview template={template} variant="card" ratio="tall" />
              </div>
              <span className="fs-btn">Mở thiệp</span>
            </div>
          </div>
          <div className="fs-link-chip">
            {Icons.send()}
            <span>icards.com.vn/events/...?guestId=...</span>
            <b>Sao chép</b>
          </div>
        </div>
      );
    case "tracking":
      return (
        <div className="fs-slide fs-tracking">
          <div className="fs-panel">
            <div className="fs-stats">
              <div><b>86</b>Tham dự</div>
              <div><b>12</b>Không tham dự</div>
              <div><b>40</b>Chưa phản hồi</div>
            </div>
            {GUESTS.map((g) => (
              <div key={g.name} className="fs-row">
                <span>{g.name}</span>
                <span className="fs-muted">{g.group}</span>
                <span className={`fs-pill fs-pill--${g.status}`}>{STATUS_LABEL[g.status]}</span>
              </div>
            ))}
            <div className="fs-excel">
              <span>⬆ Nhập Excel</span>
              <span>⬇ Xuất Excel</span>
            </div>
          </div>
        </div>
      );
  }
}

type RailProps = {
  activeKey: ShowcaseKey;
  onSelect: (k: ShowcaseKey) => void;
  onPreview: () => void;
};

export function ShowcaseRail({ activeKey, onSelect, onPreview }: RailProps) {
  const items: (ShowcaseKey | "preview")[] = ["card", "preview", "album", "location", "rsvp", "wishes", "send", "tracking"];
  return (
    <nav className="idp-rail" aria-label="Tính năng của mẫu thiệp">
      {items.map((key) => {
        if (key === "preview") {
          return (
            <button key="preview" type="button" className="idp-rail-item" onClick={onPreview}>
              {RAIL_ICON.preview()}
              <span>Xem trước</span>
            </button>
          );
        }
        const isActive = key === activeKey;
        const Icon = RAIL_ICON[key];
        return (
          <button
            key={key}
            type="button"
            className={`idp-rail-item ${isActive ? "is-active" : ""}`}
            aria-current={isActive ? "true" : undefined}
            onClick={() => onSelect(key)}
          >
            <Icon />
            <span>{RAIL_LABEL[key]}</span>
          </button>
        );
      })}
    </nav>
  );
}

type StageProps = {
  template: InvitationTemplate;
  activeKey: ShowcaseKey;
  onSelect: (k: ShowcaseKey) => void;
  onOpenPreview: () => void;
};

export function ShowcaseStage({ template, activeKey, onSelect, onOpenPreview }: StageProps) {
  const index = Math.max(0, SLIDES.findIndex((s) => s.key === activeKey));
  const slide = SLIDES[index];
  const Icon = RAIL_ICON[slide.key];
  const touchX = useRef<number | null>(null);
  const stageRef = useRef<HTMLElement>(null);

  const go = useCallback(
    (delta: number) => onSelect(SLIDES[(index + delta + SLIDES.length) % SLIDES.length].key),
    [index, onSelect],
  );

  // Mũi tên trái/phải khi khung đang được chọn (bàn phím)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go]);

  const onTouchStart = (e: TouchEvent<HTMLElement>) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: TouchEvent<HTMLElement>) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  return (
    <div className="idp-stage-wrap">
      <section
        ref={stageRef}
        className={`idp-stage${slide.key === "card" ? " idp-stage--paper" : ""}`}
        aria-roledescription="carousel"
        aria-label={`Giới thiệu mẫu thiệp: ${slide.label} (${index + 1}/${SLIDES.length})`}
        tabIndex={0}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <span className="idp-stage-badge"><Icon />{slide.label}</span>
        <div className="idp-stage-body" key={slide.key}>
          <SlideBody k={slide.key} template={template} onOpenPreview={onOpenPreview} />
        </div>
        <p className="idp-stage-caption">{slide.caption}</p>
        <button type="button" className="idp-stage-arrow idp-stage-arrow--prev" aria-label="Tính năng trước" onClick={() => go(-1)}>
          {Icons.chevronLeft()}
        </button>
        <button type="button" className="idp-stage-arrow idp-stage-arrow--next" aria-label="Tính năng tiếp theo" onClick={() => go(1)}>
          {Icons.chevronRight()}
        </button>
      </section>
      <div className="idp-dots">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className={i === index ? "is-active" : ""}
            aria-label={`${s.label} (${i + 1}/${SLIDES.length})`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => onSelect(s.key)}
          />
        ))}
      </div>
    </div>
  );
}
