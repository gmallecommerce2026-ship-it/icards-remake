"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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

/** Bánh xe 3D: vành xám-xanh có độ sâu, lốp đen, chấu xe. Quay ngược chiều kim đồng hồ (xe đi sang trái). */
function Wheel({ cx, cy, dur, grad }: { cx: number; cy: number; dur: string; grad: string }) {
  return (
    <g className="ann-wheel" style={{ animationDuration: dur }}>
      <circle cx={cx} cy={cy} r={WHEEL_R + 0.6} fill="#0A1526" />
      <circle cx={cx} cy={cy} r={WHEEL_R} fill={`url(#${grad})`} />
      <circle cx={cx} cy={cy} r={WHEEL_R - 1.1} fill="none" stroke="#A9C2E2" strokeWidth={0.5} opacity={0.7} />
      <path d={`M${cx} ${cy - WHEEL_R + 0.8}V${cy + WHEEL_R - 0.8}M${cx - WHEEL_R + 0.8} ${cy}H${cx + WHEEL_R - 0.8}`} stroke="#A9C2E2" strokeWidth={0.6} />
      <circle cx={cx} cy={cy} r={0.9} fill="#E8EEF6" />
    </g>
  );
}

/** Lớp bóng và gradient dùng chung cho xe. id riêng cho mỗi thanh để tránh trùng khi có nhiều đoàn. */
function VehicleDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6E9BD3" />
        <stop offset="0.45" stopColor="#2F5F9E" />
        <stop offset="1" stopColor="#15345E" />
      </linearGradient>
      <linearGradient id={`${id}-dark`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#24508A" />
        <stop offset="1" stopColor="#0F2544" />
      </linearGradient>
      <radialGradient id={`${id}-wheel`} cx="0.4" cy="0.35" r="0.75">
        <stop offset="0" stopColor="#3A5F8E" />
        <stop offset="0.7" stopColor="#0E1B2C" />
        <stop offset="1" stopColor="#060D18" />
      </radialGradient>
      <radialGradient id={`${id}-puff`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#E6EEF9" stopOpacity="1" />
        <stop offset="0.6" stopColor="#B9CFEA" stopOpacity="0.85" />
        <stop offset="1" stopColor="#B9CFEA" stopOpacity="0" />
      </radialGradient>
      <filter id={`${id}-soft`} x="-20%" y="-50%" width="140%" height="200%">
        <feGaussianBlur stdDeviation="0.7" />
      </filter>
    </defs>
  );
}

/** Đầu máy hơi nước 3D quay mặt sang trái, khói bay về phía sau (sang phải). */
function Locomotive({ wheelDur }: { wheelDur: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className="ann-vehicle" viewBox="0 0 84 34" width={84} height={34} aria-hidden focusable="false">
      <VehicleDefs id={id} />
      {/* bóng đổ dưới xe */}
      <ellipse cx={42} cy={30.6} rx={38} ry={1.8} fill="#0E1B2C" opacity={0.22} filter={`url(#${id}-soft)`} />
      {/* khói: bay lên và trôi về phía sau */}
      <g>
        {[0, -0.6, -1.2, -1.8].map((d) => (
          <circle key={d} className="ann-puff" cx={26.5} cy={1} r={2.6} fill={`url(#${id}-puff)`} style={{ animationDelay: `${d}s` }} />
        ))}
      </g>
      {/* ống khói + đỉnh */}
      <rect x={23.5} y={3} width={6} height={9} rx={1} fill={`url(#${id}-dark)`} />
      <rect x={22.5} y={1.5} width={8} height={2.2} rx={1} fill="#17386A" />
      {/* nồi hơi + đầu máy phía trước */}
      <rect x={4} y={15} width={16} height={9} rx={2.5} fill={`url(#${id}-dark)`} />
      <rect x={18} y={10} width={40} height={14} rx={3} fill={`url(#${id}-body)`} />
      <rect x={20} y={11.2} width={36} height={1.6} rx={0.8} fill="#FFFFFF" opacity={0.35} />
      {/* cabin */}
      <rect x={54} y={2} width={24} height={22} rx={2.5} fill={`url(#${id}-body)`} />
      <rect x={52} y={0} width={28} height={3} rx={1.2} fill="#17386A" />
      <rect x={60} y={6} width={12} height={8} rx={1.2} fill="#DCE8F6" opacity={0.9} />
      <rect x={61.5} y={7} width={3} height={6} fill="#FFFFFF" opacity={0.7} />
      {/* dải trang trí */}
      <rect x={18} y={21} width={56} height={2} fill="#A9C2E2" />
      <Wheel cx={11} cy={26.5} dur={wheelDur} grad={`${id}-wheel`} />
      <Wheel cx={28} cy={26.5} dur={wheelDur} grad={`${id}-wheel`} />
      <Wheel cx={47} cy={26.5} dur={wheelDur} grad={`${id}-wheel`} />
      <Wheel cx={66} cy={26.5} dur={wheelDur} grad={`${id}-wheel`} />
    </svg>
  );
}

/** Xe tải thùng 3D quay mặt sang trái: cabin ở đầu, thùng phía sau, đèn pha vàng. */
function Truck({ wheelDur }: { wheelDur: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className="ann-vehicle" viewBox="0 0 84 34" width={84} height={34} aria-hidden focusable="false">
      <VehicleDefs id={id} />
      <ellipse cx={42} cy={30.6} rx={38} ry={1.8} fill="#0E1B2C" opacity={0.22} filter={`url(#${id}-soft)`} />
      {/* cabin */}
      <path d={`M4 26 V14 Q4 10 8 10 H18 V26 Z`} fill={`url(#${id}-body)`} />
      <rect x={8} y={12} width={7} height={5} rx={1} fill="#DCE8F6" opacity={0.9} />
      <rect x={2} y={23} width={5} height={2.4} rx={0.8} fill="#E8A33D" />
      {/* thùng */}
      <rect x={20} y={3} width={60} height={22} rx={2} fill={`url(#${id}-body)`} />
      <rect x={20} y={20} width={60} height={2} fill="#A9C2E2" />
      <rect x={24} y={6} width={50} height={1.6} rx={0.8} fill="#FFFFFF" opacity={0.3} />
      <Wheel cx={12} cy={26.5} dur={wheelDur} grad={`${id}-wheel`} />
      <Wheel cx={36} cy={26.5} dur={wheelDur} grad={`${id}-wheel`} />
      <Wheel cx={68} cy={26.5} dur={wheelDur} grad={`${id}-wheel`} />
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
  // Nền tàu/xe tải luôn chạy kèm banner (không phụ thuộc tuỳ chọn "Chữ chạy"); chọn "Chỉ màu nền" để tắt
  const useConvoy = !bar.backgroundImage && (preset === "train" || preset === "truck");
  const presetSrc = !bar.backgroundImage && preset !== "none" ? ANNOUNCEMENT_PRESET_SRC[preset] : undefined;
  const staticImage = bar.backgroundImage || (!useConvoy ? presetSrc : undefined);
  const tiled = !bar.backgroundImage && !useConvoy && !!presetSrc;
  if (staticImage) style.backgroundImage = `url("${staticImage.replace(/"/g, "%22")}")`;
  // Đoàn xe: nền trắng hoà vào website, chữ xanh thương hiệu (riêng banner giữ nền xanh, chữ trắng)
  if (useConvoy) {
    style.backgroundColor = "#FFFFFF";
    style.color = "#27548A";
  }
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
      {staticImage && !useConvoy && <div className="ann-overlay" aria-hidden />}
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
