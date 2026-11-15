"use client";

// Khung dùng chung cho mọi kiểu hero 3D: khung hình (canvas) tỉ lệ cố định, cảnh trượt TRÁI / PHẢI theo tiến độ cuộn,
// và khối chữ ở phía đối diện. Mọi kích thước dùng cqw của canvas nên co giãn theo màn hình.

import { motion, useTransform, type MotionValue } from "motion/react";
import { useSyncExternalStore, type ReactNode } from "react";
import type { HeroPreset, TemplateHero } from "@/lib/template-heroes";

export const SERIF = "var(--font-display-raw), 'Cormorant Garamond', Georgia, serif";
export const SCRIPT = "var(--font-card-script), 'Great Vibes', cursive";
export const GOLD = "#c9a55c";
export const INK = "#2a2023";
export const MUTED = "#5b4d50";
export const mix = (a: string, pct: number, b: string) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;

/** Canvas: rộng 100cqw, cao 60cqw. Rộng tối đa 1280px và bị giới hạn theo chiều cao banner (75svh) để không tràn. */
export const CANVAS_H = 60;
const CANVAS_WIDTH = `min(100%, 1280px, calc((75svh - 24px) / ${CANVAS_H / 100}))`;

const NARROW = "(max-width: 767px)";
/** Màn hình hẹp (điện thoại): khối chữ nằm dưới khung thay vì bên cạnh. */
export function useNarrow(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(NARROW);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
}

export function Canvas({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ containerType: "inline-size", width: CANVAS_WIDTH, aspectRatio: `100 / ${CANVAS_H}` }}>
      {children}
    </div>
  );
}

/* ====================== Nội dung chữ hai bên ====================== */

export type CopyBlock = { n: string; eyebrow: string; title: string; body?: string; items?: string[] };

const COMMON_ITEMS = ["Chỉnh sửa trực quan: chữ, ảnh và màu sắc", "Xem trước ngay trên điện thoại", "Gửi link cho khách và theo dõi xác nhận"];

/** Hai khối chữ (A: cảnh ở bên trái, chữ bên phải. B: cảnh ở bên phải, chữ bên trái) theo từng kiểu. */
export function copyFor(preset: HeroPreset, label: string): { a: CopyBlock; b: CopyBlock } {
  const l = label.toLowerCase();
  const items = COMMON_ITEMS;
  switch (preset) {
    case "envelope":
      return {
        a: { n: "01", eyebrow: "Mở phong bì", title: "Một chiếc thiệp, trọn vẹn cảm xúc", body: "Từng thiệp được rút ra từ phong bì, mở ra những trang lời mời trang trọng như bản in thật." },
        b: { n: "02", eyebrow: "Thiệp bốn mặt", title: "Từng chi tiết đều được chăm chút", items },
      };
    case "fan":
      return {
        a: { n: "01", eyebrow: "Xòe thiệp", title: `Hàng trăm mẫu ${l} để bạn chọn`, body: "Từ cổ điển đến hiện đại, mỗi mẫu đều có thể đổi màu, đổi ảnh và đổi lời mời." },
        b: { n: "02", eyebrow: "Cá nhân hoá", title: "Của riêng bạn chỉ trong vài phút", items },
      };
    case "book":
      return {
        a: { n: "01", eyebrow: "Lật từng trang", title: "Câu chuyện của bạn, kể bằng hình ảnh", body: "Album ảnh, lời chúc và chương trình được sắp xếp thành từng trang mượt mà." },
        b: { n: "02", eyebrow: "Trọn vẹn khoảnh khắc", title: "Mọi thứ trong một chiếc thiệp", items },
      };
    case "flower":
      return {
        a: { n: "01", eyebrow: "Nở rộ", title: "Mỗi mẫu thiệp là một đóa hoa", body: "Màu sắc, hoạ tiết và bố cục được chọn lọc để lời mời của bạn luôn nổi bật." },
        b: { n: "02", eyebrow: "Dễ dàng tuỳ biến", title: "Biến ý tưởng thành thiệp thật", items },
      };
    default:
      return {
        a: { n: "01", eyebrow: "Mọi góc nhìn", title: "Thiết kế đẹp từ mọi phía", body: "Xoay để khám phá nhiều phong cách, từ tối giản đến sang trọng." },
        b: { n: "02", eyebrow: "Sẵn sàng gửi đi", title: "Từ ý tưởng đến lời mời trong vài phút", items },
      };
  }
}

/** Khối chữ mờ vào/ra theo tiến độ. window = [bắt đầu hiện, hiện đủ, bắt đầu mờ, mất hẳn]. */
export function SideCopy({ p, side, window: w, block, accent, narrow }: { p: MotionValue<number>; side: "left" | "right"; window: [number, number, number, number]; block: CopyBlock; accent: string; narrow: boolean }) {
  const dir = side === "right" ? 1 : -1;
  const opacity = useTransform(p, w, [0, 1, 1, 0]);
  const x = useTransform(p, w, [`${dir * 5}cqw`, "0cqw", "0cqw", `${dir * -3}cqw`]);
  const pos = narrow
    ? ({ left: "6cqw", right: "6cqw", top: "calc(100% + 4cqw)" } as const)
    : ({ left: side === "right" ? "60cqw" : "5cqw", width: "35cqw", top: 0, bottom: 0, display: "flex", alignItems: "center" } as const);
  return (
    <div aria-hidden={false} className="pointer-events-none absolute" style={{ ...pos, zIndex: 8 }}>
      <motion.div className="relative" style={{ opacity, x, textAlign: narrow ? "center" : "left" }}>
        {!narrow && <span aria-hidden className="absolute select-none" style={{ top: "-7.5cqw", left: narrow ? "50%" : "-1cqw", transform: narrow ? "translateX(-50%)" : undefined, fontFamily: SERIF, fontSize: "clamp(56px, 9cqw, 130px)", lineHeight: 1, color: mix(accent, 14, "transparent"), fontWeight: 600 }}>
          {block.n}
        </span>}
        <p className="relative font-semibold uppercase" style={{ color: accent, fontSize: "clamp(11px, 1.05cqw, 14px)", letterSpacing: "0.3em" }}>
          {block.eyebrow}
        </p>
        <h3 className="relative font-semibold" style={{ fontFamily: SERIF, color: INK, fontSize: "clamp(26px, 3.8cqw, 54px)", lineHeight: 1.12, marginTop: "0.9cqw" }}>
          {block.title}
        </h3>
        <span aria-hidden className="relative block" style={{ width: "5cqw", minWidth: 36, height: 2, margin: narrow ? "1.6cqw auto" : "1.6cqw 0", background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
        {block.body && (
          <p className="relative" style={{ color: MUTED, fontSize: "clamp(14px, 1.3cqw, 19px)", lineHeight: 1.65 }}>
            {block.body}
          </p>
        )}
        {block.items && (
          <ul className="relative" style={{ display: "grid", gap: "0.9cqw", color: MUTED, fontSize: "clamp(13.5px, 1.2cqw, 18px)", lineHeight: 1.5, textAlign: "left", maxWidth: narrow ? 360 : undefined, margin: narrow ? "0 auto" : undefined }}>
            {block.items.map((t) => (
              <li key={t} className="flex gap-[0.8em]">
                <span aria-hidden style={{ color: GOLD, flex: "none" }}>♥</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}

/* ====================== Tiêu đề đầu cảnh + gợi ý cuộn ====================== */

export function Intro({ p, hero, categoryLabel }: { p: MotionValue<number>; hero: TemplateHero; categoryLabel: string }) {
  const opacity = useTransform(p, [0, 0.07, 0.16], [1, 1, 0]);
  const y = useTransform(p, [0, 0.16], ["0cqw", "-3cqw"]);
  const title = hero.title || categoryLabel;
  return (
    <motion.div className="pointer-events-none absolute inset-x-0 text-center" style={{ top: "1.2cqw", opacity, y, zIndex: 8 }}>
      {hero.title && (
        <p className="font-semibold uppercase" style={{ color: hero.accent, fontSize: "clamp(11px, 1.2cqw, 16px)", letterSpacing: "0.32em" }}>
          {categoryLabel}
        </p>
      )}
      <h2 className="font-semibold" style={{ fontFamily: SERIF, color: INK, fontSize: "clamp(26px, 4.2cqw, 58px)", lineHeight: 1.1, marginTop: hero.title ? "0.6cqw" : 0 }}>
        {title}
      </h2>
      {hero.subtitle && (
        <p className="mx-auto" style={{ color: MUTED, fontSize: "clamp(13px, 1.5cqw, 21px)", lineHeight: 1.5, marginTop: "0.6cqw", maxWidth: "62cqw" }}>
          {hero.subtitle}
        </p>
      )}
    </motion.div>
  );
}

/** Gợi ý nằm dưới khung: hiện lúc đầu, mất khi bắt đầu cuộn. */
export function StartHint({ p, accent, text }: { p: MotionValue<number>; accent: string; text: string }) {
  const opacity = useTransform(p, [0, 0.05, 0.14], [1, 1, 0]);
  return (
    <motion.p className="pointer-events-none absolute inset-x-0 text-center" style={{ bottom: "1.2cqw", opacity, color: MUTED, fontSize: "clamp(13px, 1.6cqw, 20px)", letterSpacing: "0.12em", zIndex: 8 }}>
      {text} <span style={{ color: accent }}>↓</span>
    </motion.p>
  );
}

/** Gợi ý cuối cảnh: chuyển xuống bộ lọc mẫu. */
export function EndHint({ p, accent }: { p: MotionValue<number>; accent: string }) {
  const opacity = useTransform(p, [0.93, 1], [0, 1]);
  return (
    <motion.p className="pointer-events-none absolute inset-x-0 text-center" style={{ bottom: "1.2cqw", opacity, color: MUTED, fontSize: "clamp(13px, 1.6cqw, 20px)", letterSpacing: "0.12em", zIndex: 8 }}>
      Chọn mẫu yêu thích bên dưới <span style={{ color: accent }}>↓</span>
    </motion.p>
  );
}

/* ====================== Biên đạo trượt trái / phải ====================== */

/** Các mốc tiến độ dùng chung cho 4 kiểu cảnh (phong bì có biên đạo riêng). */
export const STAGE_BEATS = {
  stops: [0, 0.1, 0.26, 0.5, 0.68, 0.86, 1],
  copyA: [0.18, 0.28, 0.46, 0.54] as [number, number, number, number],
  copyB: [0.66, 0.74, 0.82, 0.9] as [number, number, number, number],
};

/**
 * Khung cho 4 kiểu cảnh: tiêu đề → cảnh trượt sang TRÁI (chữ A bên phải) → sang PHẢI (chữ B bên trái) → về giữa.
 * Cả cảnh thu nhỏ nhẹ khi lệch sang bên để chừa chỗ cho chữ.
 */
export function Stage({ p, hero, categoryLabel, preset, shift = 22, hint, children }: { p: MotionValue<number>; hero: TemplateHero; categoryLabel: string; preset: HeroPreset; shift?: number; hint: string; children: ReactNode }) {
  const narrow = useNarrow();
  const copy = copyFor(preset, categoryLabel);
  const s = STAGE_BEATS.stops;
  const ease = (t: number) => t * t * (3 - 2 * t); // smoothstep
  const xRaw = useTransform(p, s, [0, 0, -shift, -shift, shift, shift, 0], { ease });
  const x = useTransform(xRaw, (v) => `${v}cqw`);
  const scale = useTransform(p, s, [1, 1, 0.88, 0.88, 0.88, 0.88, 1], { ease });
  return (
    <Canvas>
      <Intro p={p} hero={hero} categoryLabel={categoryLabel} />
      <motion.div className="absolute inset-0" style={{ x, scale }}>
        <div className="absolute inset-0" style={{ perspective: 1400 }}>
          {children}
        </div>
      </motion.div>
      <SideCopy p={p} side="right" window={STAGE_BEATS.copyA} block={copy.a} accent={hero.accent} narrow={narrow} />
      <SideCopy p={p} side="left" window={STAGE_BEATS.copyB} block={copy.b} accent={hero.accent} narrow={narrow} />
      <StartHint p={p} accent={hero.accent} text={hint} />
      <EndHint p={p} accent={hero.accent} />
    </Canvas>
  );
}
