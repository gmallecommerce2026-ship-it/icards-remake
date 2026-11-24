"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./AnnouncementBar.css";

/** Nền động: "train" (mặc định) và "truck" là đoàn xe chạy kéo banner chữ, "none" chỉ dùng màu nền. */
export type AnnouncementPreset = "train" | "truck" | "none";

/** Ảnh nền không có xe (núi, đường ray). Xe và banner được vẽ bằng DOM để chữ luôn nằm trên banner. */
export const ANNOUNCEMENT_PRESET_SRC: Record<Exclude<AnnouncementPreset, "none">, string> = {
  train: "/announcement/scene-train.png",
  truck: "/announcement/scene-truck.png",
};

export type AnnouncementBarData = {
  isEnabled?: boolean;
  text?: string;
  link?: string;
  backgroundColor?: string;
  textColor?: string;
  backgroundImage?: string;
  /** Nền động có sẵn; bỏ trống = "train" (mặc định). Ảnh nền tuỳ chỉnh (backgroundImage) luôn được ưu tiên. */
  backgroundPreset?: AnnouncementPreset;
  isMarquee?: boolean;
  /** px/giây */
  speed?: number;
  isDismissible?: boolean;
};

export const DEFAULT_ANNOUNCEMENT_BG = "#27548A";
const DEFAULT_SPEED = 60;
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/* Hằng số hình học khớp với CSS: chiều cao thanh, số ô nền trong một khung ảnh, bán kính bánh xe. */
const BAR_H = 34;
const SCENE_TILES = 9;
const WHEEL_R = 3;

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

/* ---------- Chữ chạy thuần (nền màu hoặc ảnh tuỳ chỉnh) ---------- */

/* Mỗi đơn vị = nội dung + dấu phân cách; lặp đủ để lấp kín, nhân đôi để vòng lặp nối liền. */
function Marquee({ text, link, speed }: { text: string; link?: string; speed: number }) {
  const viewport = useRef<HTMLDivElement>(null);
  const unit = useRef<HTMLSpanElement>(null);
  const [{ reps, seconds }, setLayout] = useState({ reps: 1, seconds: 20 });

  useLayoutEffect(() => {
    const measure = () => {
      const vw = viewport.current?.clientWidth ?? 0;
      const uw = unit.current?.offsetWidth ?? 0;
      if (!vw || !uw) return;
      const r = Math.max(1, Math.ceil(vw / uw));
      setLayout({ reps: r, seconds: (r * uw) / Math.max(1, speed) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (viewport.current) ro.observe(viewport.current);
    if (unit.current) ro.observe(unit.current);
    return () => ro.disconnect();
  }, [text, link, speed]);

  const half = (hidden: boolean) => (
    <div className="ann-half" aria-hidden={hidden || undefined}>
      {Array.from({ length: reps }, (_, i) => (
        <span key={i} className="ann-unit" ref={!hidden && i === 0 ? unit : undefined}>
          <span className="ann-item">
            <Message text={text} link={hidden ? undefined : link} />
          </span>
          <span className="ann-sep" aria-hidden />
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

/* ---------- Đoàn xe kéo banner ---------- */

/** Bánh xe: quay ngược chiều kim đồng hồ (xe đi sang trái), tốc độ góc khớp với tốc độ đoàn. */
function Wheel({ cx, cy, dur }: { cx: number; cy: number; dur: string }) {
  return (
    <g className="ann-wheel" style={{ animationDuration: dur }}>
      <circle cx={cx} cy={cy} r={WHEEL_R} fill="#0E1B2C" stroke="#E8EEF6" strokeWidth={1} />
      <path d={`M${cx} ${cy - WHEEL_R + 1}V${cy + WHEEL_R - 1}M${cx - WHEEL_R + 1} ${cy}H${cx + WHEEL_R - 1}`} stroke="#E8EEF6" strokeWidth={0.7} />
    </g>
  );
}

/** Đầu máy hơi nước quay mặt sang trái, có khói bốc từ ống khói. */
function Locomotive({ wheelDur }: { wheelDur: string }) {
  const fill = "#E8EEF6";
  return (
    <svg className="ann-vehicle" viewBox="0 0 84 34" width={84} height={34} aria-hidden focusable="false">
      <rect x={24} y={2} width={5} height={9} fill={fill} />
      <g className="ann-puffs">
        <circle className="ann-puff" cx={26.5} cy={2} r={2.4} fill={fill} style={{ animationDelay: "0s" }} />
        <circle className="ann-puff" cx={26.5} cy={2} r={2.4} fill={fill} style={{ animationDelay: "-0.55s" }} />
        <circle className="ann-puff" cx={26.5} cy={2} r={2.4} fill={fill} style={{ animationDelay: "-1.1s" }} />
      </g>
      <rect x={6} y={13} width={18} height={9} fill={fill} />
      <rect x={22} y={9} width={34} height={13} fill={fill} />
      <rect x={54} y={3} width={22} height={19} fill={fill} />
      <rect x={60} y={7} width={10} height={7} fill="#0E1B2C" />
      <rect x={22} y={19} width={54} height={2} fill="#A9C2E2" />
      <Wheel cx={12} cy={26} dur={wheelDur} />
      <Wheel cx={28} cy={26} dur={wheelDur} />
      <Wheel cx={48} cy={26} dur={wheelDur} />
      <Wheel cx={66} cy={26} dur={wheelDur} />
    </svg>
  );
}

/** Xe tải thùng quay mặt sang trái: cabin ở đầu, thùng phía sau. */
function Truck({ wheelDur }: { wheelDur: string }) {
  const fill = "#E8EEF6";
  return (
    <svg className="ann-vehicle" viewBox="0 0 84 34" width={84} height={34} aria-hidden focusable="false">
      <rect x={4} y={11} width={20} height={11} fill={fill} />
      <rect x={6} y={6} width={14} height={7} fill={fill} />
      <rect x={8} y={8} width={8} height={4} fill="#0E1B2C" />
      <rect x={26} y={3} width={54} height={21} fill={fill} />
      <rect x={26} y={19} width={54} height={2} fill="#A9C2E2" />
      <rect x={2} y={22} width={6} height={2} fill="#FFD27A" />
      <Wheel cx={12} cy={26} dur={wheelDur} />
      <Wheel cx={36} cy={26} dur={wheelDur} />
      <Wheel cx={68} cy={26} dur={wheelDur} />
    </svg>
  );
}

/** Một đoàn = xe + dây kéo + banner chữ. Đoàn chạy từ mép phải ra mép trái; hai đoàn cách đều nhau. */
function Convoy({ text, link, speed, vehicle }: { text: string; link?: string; speed: number; vehicle: "train" | "truck" }) {
  const viewport = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [{ vw, len }, setSize] = useState({ vw: 0, len: 0 });

  useLayoutEffect(() => {
    const measure = () => setSize({ vw: viewport.current?.clientWidth ?? 0, len: measureRef.current?.offsetWidth ?? 0 });
    measure();
    const ro = new ResizeObserver(measure);
    if (viewport.current) ro.observe(viewport.current);
    if (measureRef.current) ro.observe(measureRef.current);
    return () => ro.disconnect();
  }, [text, link, vehicle]);

  const v = Math.max(20, speed);
  const ready = vw > 0 && len > 0;
  const dur = (vw + len) / v;
  const wheelDur = `${(2 * Math.PI * WHEEL_R) / v}s`;
  const vars = {
    ["--ann-from" as string]: `${vw}px`,
    ["--ann-to" as string]: `${-len}px`,
    ["--ann-dur" as string]: `${dur}s`,
  } as CSSProperties;

  const train = (withLink: boolean) => (
    <>
      {vehicle === "train" ? <Locomotive wheelDur={wheelDur} /> : <Truck wheelDur={wheelDur} />}
      <span className="ann-rope" aria-hidden />
      <span className="ann-banner">
        <Message text={text} link={withLink ? link : undefined} />
      </span>
    </>
  );

  return (
    <div ref={viewport} className="ann-convoy-view">
      {/* Bản đo: ẩn, chỉ để biết chiều rộng của một đoàn */}
      <span ref={measureRef} className="ann-train-set ann-measure" aria-hidden>
        {train(false)}
      </span>
      {ready &&
        [0, 1].map((k) => (
          <div
            key={k}
            className="ann-convoy"
            aria-hidden={k === 1 || undefined}
            style={{ ...vars, animationDelay: k === 1 ? `calc(var(--ann-dur) * -0.5)` : undefined }}
          >
            <span className="ann-train-set">{train(k === 0)}</span>
          </div>
        ))}
    </div>
  );
}

/** Hiển thị thanh (không có logic tắt/bật) để dùng cả ở trang chủ lẫn khung xem trước trong admin. */
export function AnnouncementBarView({ bar, onClose, children }: { bar: AnnouncementBarData; onClose?: () => void; children?: ReactNode }) {
  const style: CSSProperties = {
    color: bar.textColor && HEX.test(bar.textColor) ? bar.textColor : "#ffffff",
    backgroundColor: bar.backgroundColor && HEX.test(bar.backgroundColor) ? bar.backgroundColor : DEFAULT_ANNOUNCEMENT_BG,
  };

  const text = bar.text ?? "";
  const speed = bar.speed ?? DEFAULT_SPEED;
  const preset: AnnouncementPreset = bar.backgroundPreset ?? "train";

  // Đoàn xe chạy khi bật chữ chạy + dùng nền động (không có ảnh tuỳ chỉnh)
  const useConvoy = !!bar.isMarquee && !bar.backgroundImage && (preset === "train" || preset === "truck");
  const presetSrc = !bar.backgroundImage && preset !== "none" ? ANNOUNCEMENT_PRESET_SRC[preset] : undefined;
  const staticImage = bar.backgroundImage || (!useConvoy ? presetSrc : undefined);
  const tiled = !bar.backgroundImage && !useConvoy && !!presetSrc;
  if (staticImage) style.backgroundImage = `url("${staticImage.replace(/"/g, "%22")}")`;
  const groundSrc = useConvoy ? ANNOUNCEMENT_PRESET_SRC[preset as "train" | "truck"] : "";

  return (
    <div
      className={`ann-bar ${useConvoy ? "ann-bar--convoy" : ""} ${bar.isMarquee && !useConvoy ? "ann-bar--marquee" : ""} ${onClose ? "ann-bar--closable" : ""} ${tiled ? "ann-bar--preset" : ""} ${staticImage || useConvoy ? "ann-bar--image" : ""}`}
      style={style}
      role="region"
      aria-label="Thông báo"
    >
      {useConvoy && (
        <div
          className="ann-ground"
          aria-hidden
          style={{
            backgroundImage: `url("${groundSrc}")`,
            animationDuration: `${(SCENE_TILES * BAR_H) / Math.max(20, speed)}s`,
          }}
        />
      )}
      {(staticImage || useConvoy) && <div className="ann-overlay" aria-hidden />}
      <div className="ann-inner">
        {useConvoy ? (
          <>
            <p className="ann-static ann-reduced-only"><Message text={text} link={bar.link} /></p>
            <Convoy text={text} link={bar.link} speed={speed} vehicle={preset as "train" | "truck"} />
          </>
        ) : bar.isMarquee ? (
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
