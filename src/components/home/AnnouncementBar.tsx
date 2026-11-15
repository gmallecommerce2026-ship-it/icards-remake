"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./AnnouncementBar.css";

export type AnnouncementBarData = {
  isEnabled?: boolean;
  text?: string;
  link?: string;
  backgroundColor?: string;
  textColor?: string;
  backgroundImage?: string;
  isMarquee?: boolean;
  /** px/giây */
  speed?: number;
  isDismissible?: boolean;
};

export const DEFAULT_ANNOUNCEMENT_BG = "#27548A";
const DEFAULT_SPEED = 60;
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Khóa lưu việc khách đã tắt: gắn với nội dung nên khi admin đổi thông báo thì thanh hiện lại. */
const dismissKey = (b: AnnouncementBarData) => {
  const raw = `${b.text ?? ""}|${b.link ?? ""}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) | 0;
  return `announcementDismissed:${(h >>> 0).toString(36)}`;
};

function Message({ text, link }: { text: string; link?: string }) {
  if (!link) return <>{text}</>;
  const internal = link.startsWith("/") && !link.startsWith("//");
  return internal ? (
    <Link href={link} className="ann-link">{text}</Link>
  ) : (
    <a href={link} className="ann-link" target="_blank" rel="noopener noreferrer">{text}</a>
  );
}

/** Chữ chạy vô hạn: lặp đủ số bản để lấp kín bề ngang, rồi nhân đôi để vòng lặp nối liền. */
function Marquee({ text, link, speed }: { text: string; link?: string; speed: number }) {
  const viewport = useRef<HTMLDivElement>(null);
  const item = useRef<HTMLSpanElement>(null);
  const [{ reps, seconds }, setLayout] = useState({ reps: 1, seconds: 20 });

  useLayoutEffect(() => {
    const measure = () => {
      const vw = viewport.current?.clientWidth ?? 0;
      const iw = item.current?.offsetWidth ?? 0;
      if (!vw || !iw) return;
      const r = Math.max(1, Math.ceil(vw / iw));
      setLayout({ reps: r, seconds: (r * iw) / Math.max(1, speed) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (viewport.current) ro.observe(viewport.current);
    return () => ro.disconnect();
  }, [text, link, speed]);

  const half = (hidden: boolean) => (
    <div className="ann-half" aria-hidden={hidden || undefined}>
      {Array.from({ length: reps }, (_, i) => (
        <span key={i} className="ann-item" ref={!hidden && i === 0 ? item : undefined}>
          <Message text={text} link={hidden ? undefined : link} />
        </span>
      ))}
    </div>
  );

  return (
    <div ref={viewport} className="ann-viewport">
      <div className="ann-track" style={{ animationDuration: `${seconds}s` }}>
        {half(false)}
        {half(true)}
      </div>
    </div>
  );
}

/** Hiển thị thanh (không có logic tắt/bật) để dùng cả ở trang chủ lẫn khung xem trước trong admin. */
export function AnnouncementBarView({ bar, onClose, children }: { bar: AnnouncementBarData; onClose?: () => void; children?: ReactNode }) {
  const style: CSSProperties = {
    color: bar.textColor && HEX.test(bar.textColor) ? bar.textColor : "#ffffff",
    backgroundColor: bar.backgroundColor && HEX.test(bar.backgroundColor) ? bar.backgroundColor : DEFAULT_ANNOUNCEMENT_BG,
  };
  if (bar.backgroundImage) style.backgroundImage = `url("${bar.backgroundImage.replace(/"/g, "%22")}")`;

  const text = bar.text ?? "";
  const speed = bar.speed ?? DEFAULT_SPEED;

  return (
    <div className={`ann-bar ${bar.isMarquee ? "ann-bar--marquee" : ""} ${onClose ? "ann-bar--closable" : ""}`} style={style} role="region" aria-label="Thông báo">
      {bar.backgroundImage && <div className="ann-overlay" aria-hidden />}
      <div className="ann-inner">
        {bar.isMarquee ? (
          <Marquee text={text} link={bar.link} speed={speed} />
        ) : (
          <p className="ann-static"><Message text={text} link={bar.link} /></p>
        )}
      </div>
      {onClose && (
        <button type="button" className="ann-close" onClick={onClose} aria-label="Đóng thông báo">&times;</button>
      )}
      {children}
    </div>
  );
}

/** Thanh thông báo trên đầu website: bật/tắt, nội dung, màu/ảnh nền do admin cấu hình (tab Tuỳ chỉnh giao diện). */
export function AnnouncementBar({ bar }: { bar?: AnnouncementBarData }) {
  const [dismissed, setDismissed] = useState(true); // mặc định ẩn tới khi đọc xong localStorage, tránh nháy
  const key = bar ? dismissKey(bar) : "";

  useEffect(() => {
    if (!bar?.isDismissible) return setDismissed(false);
    try {
      setDismissed(localStorage.getItem(key) === "1");
    } catch {
      setDismissed(false);
    }
  }, [bar?.isDismissible, key]);

  if (!bar?.isEnabled || !bar.text || dismissed) return null;

  const close = bar.isDismissible
    ? () => {
        setDismissed(true);
        try {
          localStorage.setItem(key, "1");
        } catch {
          /* trình duyệt chặn lưu: chỉ tắt trong phiên này */
        }
      }
    : undefined;

  return <AnnouncementBarView bar={bar} onClose={close} />;
}
