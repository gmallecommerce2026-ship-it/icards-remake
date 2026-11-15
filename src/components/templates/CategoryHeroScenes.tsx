"use client";

// Bốn kiểu 3D mới cho hero danh mục. Cùng khung cuộn với phong bì (CategoryHero3D): tiến độ p chạy 0 → 1 theo cuộn trang.
// Chữ, màu và ảnh đều lấy từ cấu hình admin. Chưa có ảnh thì dùng ô màu nhấn để bố cục vẫn đẹp.

import { cubicBezier, motion, useMotionTemplate, useTransform, type MotionValue } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import type { TemplateHero } from "@/lib/template-heroes";

export type SceneProps = { p: MotionValue<number>; reduce: boolean; hero: TemplateHero; categoryLabel: string };

const SERIF = "var(--font-display-raw), 'Cormorant Garamond', Georgia, serif";
const SCRIPT = "var(--font-card-script), 'Great Vibes', cursive";
const GOLD = "#c9a55c";
const INK = "#2a2023";
const MUTED = "#5b4d50";
const CREAM_PAPER = "linear-gradient(160deg, #fffdf8 0%, #f2e8d5 100%)";
const ease = cubicBezier(0.45, 0.05, 0.2, 1);
const mix = (a: string, pct: number, b: string) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;
const slot = (images: string[], i: number) => (images.length ? images[i % images.length] || undefined : undefined);
const hidden: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

/** Khung chung: tiêu đề phía trên, sân khấu 3D ở giữa, gợi ý cuộn bên dưới. Đơn vị cqw co giãn theo chiều rộng. */
function Frame({ hero, categoryLabel, height, hint, p, children }: SceneProps & { height: number; hint: string; children: ReactNode }) {
  const accent = hero.accent;
  const title = hero.title || categoryLabel;
  return (
    <div className="relative mx-auto w-full" style={{ containerType: "inline-size", maxWidth: "min(1080px, calc((75svh - 56px) * 1.05))" }}>
      <div className="text-center">
        {hero.title && (
          <p className="font-semibold uppercase" style={{ color: accent, fontSize: "1.6cqw", letterSpacing: "0.32em" }}>
            {categoryLabel}
          </p>
        )}
        <h2 className="font-semibold" style={{ fontFamily: SERIF, color: INK, fontSize: "4.6cqw", lineHeight: 1.1, marginTop: hero.title ? "0.8cqw" : 0 }}>
          {title}
        </h2>
        {hero.subtitle && <p className="mx-auto" style={{ color: MUTED, fontSize: "2cqw", lineHeight: 1.5, marginTop: "0.8cqw", maxWidth: "60cqw" }}>{hero.subtitle}</p>}
      </div>
      <div className="relative w-full" style={{ height: `${height}cqw`, perspective: 1400 }}>
        {children}
      </div>
      <Hint p={p} accent={accent} text={hint} />
    </div>
  );
}

/** Gợi ý đầu cảnh: mờ dần khi bắt đầu cuộn. */
function Hint({ p, accent, text }: { p: MotionValue<number>; accent: string; text: string }) {
  const opacity = useTransform(p, [0, 0.06, 0.2], [1, 1, 0]);
  return (
    <motion.p className="pointer-events-none text-center" style={{ opacity, color: MUTED, fontSize: "1.9cqw", letterSpacing: "0.12em", marginTop: "0.6cqw" }}>
      {text} <span style={{ color: accent }}>↓</span>
    </motion.p>
  );
}

/** Nội dung một ô: ảnh nếu có, không thì ô màu nhấn có chữ. */
function Art({ src, accent, i, text }: { src?: string; accent: string; i: number; text?: string }) {
  if (src) return <img src={src} alt="" draggable={false} className="size-full object-cover" />;
  return (
    <div
      className="flex size-full items-center justify-center px-[1cqw] text-center"
      style={{
        background: `linear-gradient(145deg, ${mix(accent, 82 - (i % 3) * 12, "#fff")}, ${mix(accent, 72, "#000")})`,
        color: "rgba(255,255,255,0.94)",
        fontFamily: SERIF,
        fontSize: "2.2cqw",
        lineHeight: 1.2,
      }}
    >
      {text ?? "♥"}
    </div>
  );
}

/** Trang giấy kem có dòng chữ ở giữa (trang trống hoặc trang không có ảnh). */
function CreamText({ text, accent }: { text: string; accent: string }) {
  return (
    <div className="flex size-full flex-col items-center justify-center p-[2.4cqw] text-center">
      <p style={{ fontFamily: SERIF, fontStyle: "italic", color: INK, fontSize: "2.2cqw", lineHeight: 1.3 }}>{text}</p>
      <span style={{ color: accent, fontSize: "1.6cqw", marginTop: "0.8cqw" }} aria-hidden>♥</span>
    </div>
  );
}

/* ====================== 1. Xòe quạt 3D ====================== */

const FAN_N = 7;

/** Các thiệp chồng nhau, lật dần ra thành quạt quanh một điểm phía dưới. */
export function FanScene(props: SceneProps) {
  const { p, hero } = props;
  const e = useTransform(p, [0.04, 0.5], [0, 1], { ease });
  const rotX = useTransform(p, [0, 1], [-12, -24]);
  const rotY = useTransform(p, [0.5, 1], [0, 26]);
  return (
    <Frame {...props} height={56} hint="Cuộn để xòe thiệp">
      <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d", rotateX: rotX, rotateY: rotY }}>
        {Array.from({ length: FAN_N }, (_, i) => (
          <FanCard key={i} i={i} e={e} src={slot(hero.images, i)} accent={hero.accent} />
        ))}
      </motion.div>
    </Frame>
  );
}

function FanCard({ i, e, src, accent }: { i: number; e: MotionValue<number>; src?: string; accent: string }) {
  const mid = (FAN_N - 1) / 2;
  const angle = useTransform(e, (v) => (i - mid) * 15 * v);
  return (
    <motion.div
      className="absolute overflow-hidden rounded-[1cqw]"
      style={{
        left: "calc(50% - 8cqw)",
        top: "calc(50% - 11cqw)",
        width: "16cqw",
        height: "22cqw",
        border: "0.5cqw solid #fffdf8",
        boxShadow: "0 1.4cqw 2.4cqw -0.8cqw rgba(0,0,0,0.45)",
        transformOrigin: "50% 230%",
        rotate: angle,
        z: i * 3,
      }}
    >
      <Art src={src} accent={accent} i={i} />
    </motion.div>
  );
}

/* ====================== 2. Album lật trang 3D (4 trang) ====================== */

/**
 * Album 4 trang gồm 2 tờ, mỗi tờ hai mặt:
 * - Tờ 1: mặt trước là trang 1 (bên phải lúc đầu), mặt sau là trang 2 (bên trái sau khi lật).
 * - Tờ 2: mặt trước là trang 3 (nằm dưới tờ 1 ở bên phải), mặt sau là trang 4 (bên trái sau khi lật).
 * Lúc đầu bên trái là trang trống, bên phải luôn có trang 1. Lật hết thì bên trái có trang 2 và 4, bên phải trống.
 */
const BOOK_WINDOWS: [number, number][] = [
  [0.1, 0.4],
  [0.5, 0.8],
];

export function BookScene(props: SceneProps) {
  const { p, hero } = props;
  const accent = hero.accent;
  return (
    <Frame {...props} height={50} hint="Cuộn để lật album">
      <div className="absolute" style={{ left: "26cqw", top: "6cqw", width: "48cqw", height: "32cqw", perspective: 1800 }}>
        {/* Nền: trang trái trống lúc đầu, trang phải trống sau khi lật hết */}
        <div className="absolute overflow-hidden rounded-l-[0.8cqw]" style={{ left: 0, top: 0, width: "24cqw", height: "32cqw", background: CREAM_PAPER, boxShadow: "inset -1cqw 0 2cqw -1.4cqw rgba(0,0,0,0.25)" }}>
          <CreamText text="" accent={accent} />
        </div>
        <div className="absolute overflow-hidden rounded-r-[0.8cqw]" style={{ left: "24cqw", top: 0, width: "24cqw", height: "32cqw", background: CREAM_PAPER, boxShadow: "inset 1cqw 0 2cqw -1.4cqw rgba(0,0,0,0.25)" }} />
        {BOOK_WINDOWS.map(([a, b], i) => (
          <BookLeaf
            key={i}
            i={i}
            from={a}
            to={b}
            p={p}
            front={slot(hero.images, i * 2)}
            back={slot(hero.images, i * 2 + 1)}
            frontText={`Trang ${i * 2 + 1}`}
            backText={`Trang ${i * 2 + 2}`}
            accent={accent}
          />
        ))}
      </div>
    </Frame>
  );
}

function BookLeaf({ i, from, to, p, front, back, frontText, backText, accent }: {
  i: number; from: number; to: number; p: MotionValue<number>;
  front?: string; back?: string; frontText: string; backText: string; accent: string;
}) {
  const angle = useTransform(p, [from, to], [0, -180], { ease });
  // Tờ chưa lật nằm bên phải, xếp tờ 1 lên trên tờ 2. Tờ đã lật nằm bên trái, tờ lật sau xếp lên trên.
  const z = useTransform(angle, (v) => (v > -90 ? 10 - i : 20 + i));
  return (
    <motion.div
      className="absolute"
      style={{ left: "24cqw", top: 0, width: "24cqw", height: "32cqw", transformOrigin: "0% 50%", transformStyle: "preserve-3d", rotateY: angle, zIndex: z }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-r-[0.8cqw]" style={{ ...hidden, boxShadow: "0 0.6cqw 1.6cqw -0.6cqw rgba(0,0,0,0.35)" }}>
        <Art src={front} accent={accent} i={i * 2} text={frontText} />
      </div>
      <div className="absolute inset-0 overflow-hidden rounded-l-[0.8cqw]" style={{ ...hidden, transform: "rotateY(180deg)" }}>
        <Art src={back} accent={accent} i={i * 2 + 1} text={backText} />
      </div>
    </motion.div>
  );
}

/* ====================== 3. Hoa nở 3D ====================== */

const PETAL_N = 8;

/**
 * Tám cánh ảnh mở dần quanh một tâm, rồi xoay nhẹ.
 * Mỗi cánh có độ sâu Z riêng (translateZ), nên lúc khép lại cánh nào nằm trên cánh nào được xác định rõ ràng.
 */
export function FlowerScene(props: SceneProps) {
  const { p, hero } = props;
  const accent = hero.accent;
  const open = useTransform(p, [0.02, 0.6], [0, 1], { ease });
  const spin = useTransform(p, [0.6, 1], [0, 45]);
  const core = useTransform(p, [0.45, 0.7], [0, 1]);
  return (
    <Frame {...props} height={54} hint="Cuộn để hoa nở">
      <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d", rotateZ: spin }}>
        {Array.from({ length: PETAL_N }, (_, i) => (
          <Petal key={i} i={i} open={open} src={slot(hero.images, i)} accent={accent} />
        ))}
        <motion.div
          aria-hidden
          className="absolute flex items-center justify-center rounded-full"
          style={{
            left: "calc(50% - 4.5cqw)",
            top: "calc(50% - 4.5cqw)",
            width: "9cqw",
            height: "9cqw",
            z: 30,
            scale: core,
            background: `radial-gradient(circle at 35% 30%, ${mix(GOLD, 60, "#fff")}, ${GOLD} 60%, ${mix(GOLD, 70, "#000")})`,
            boxShadow: "0 0.8cqw 2cqw rgba(0,0,0,0.3)",
            color: "#fff",
            fontFamily: SCRIPT,
            fontSize: "4.4cqw",
          }}
        >
          ♥
        </motion.div>
      </motion.div>
    </Frame>
  );
}

function Petal({ i, open, src, accent }: { i: number; open: MotionValue<number>; src?: string; accent: string }) {
  const a = i * (360 / PETAL_N);
  // Thứ tự lớp: cánh giữa dãy nằm gần tâm hơn, hai đầu lùi xa hơn; lớp Z khác nhau nên không cùng mặt phẳng.
  const depth = (i - (PETAL_N - 1) / 2) * 4;
  const dist = useTransform(open, (v) => -(2 + v * 12)); // tâm cánh đi tối đa 14cqw; nửa chiều cao cánh 9cqw: không vượt khung
  const tilt = useTransform(open, (v) => (1 - v) * 64);
  const transform = useMotionTemplate`translateZ(${depth}px) rotateZ(${a}deg) translateY(${dist}cqw) rotateX(${tilt}deg)`;
  return (
    <motion.div
      className="absolute"
      style={{ left: "calc(50% - 7cqw)", top: "calc(50% - 9cqw)", width: "14cqw", height: "18cqw", transform }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[1cqw] p-[0.7cqw]" style={{ background: "#fffdf8", boxShadow: "0 1.2cqw 2.2cqw -0.8cqw rgba(0,0,0,0.4)" }}>
        <div className="size-full overflow-hidden rounded-[0.5cqw]">
          <Art src={src} accent={accent} i={i} />
        </div>
      </div>
    </motion.div>
  );
}

/* ====================== 4. Khối xoay 3D ====================== */

const CUBE = 22;

/** Khối lập phương, sáu mặt là sáu ảnh (hoặc chữ). Cuộn để xoay quanh các trục. */
export function CubeScene(props: SceneProps) {
  const { p, hero, categoryLabel } = props;
  const accent = hero.accent;
  const rotX = useTransform(p, [0, 0.5, 1], [-24, 10, -12]);
  const rotY = useTransform(p, [0, 1], [-30, 560], { ease });
  const scale = useTransform(p, [0, 0.12], [0.5, 1]);
  const half = CUBE / 2;
  const faces: { t: string; text: string }[] = [
    { t: `translateZ(${half}cqw)`, text: hero.title || categoryLabel },
    { t: `rotateY(180deg) translateZ(${half}cqw)`, text: hero.subtitle || "Trân trọng kính mời" },
    { t: `rotateY(90deg) translateZ(${half}cqw)`, text: categoryLabel },
    { t: `rotateY(-90deg) translateZ(${half}cqw)`, text: "♥" },
    { t: `rotateX(90deg) translateZ(${half}cqw)`, text: "Đón chờ bạn" },
    { t: `rotateX(-90deg) translateZ(${half}cqw)`, text: categoryLabel },
  ];
  return (
    <Frame {...props} height={56} hint="Cuộn để xoay khối">
      <motion.div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          width: `${CUBE}cqw`,
          height: `${CUBE}cqw`,
          marginLeft: `-${half}cqw`,
          marginTop: `-${half}cqw`,
          transformStyle: "preserve-3d",
          rotateX: rotX,
          rotateY: rotY,
          scale,
        }}
      >
        {faces.map((f, i) => (
          <div key={i} className="absolute inset-0 overflow-hidden rounded-[1cqw]" style={{ transform: f.t, border: "0.3cqw solid rgba(255,255,255,0.7)" }}>
            <Art src={slot(hero.images, i)} accent={accent} i={i} text={f.text} />
          </div>
        ))}
      </motion.div>
      <div aria-hidden className="absolute rounded-[50%]" style={{ left: "calc(50% - 12cqw)", top: `calc(50% + ${half + 3}cqw)`, width: "24cqw", height: "3cqw", background: "rgba(40,20,20,0.3)", filter: "blur(1.6cqw)" }} />
    </Frame>
  );
}
