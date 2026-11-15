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
const ease = cubicBezier(0.45, 0.05, 0.2, 1);
const mix = (a: string, pct: number, b: string) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;
const slot = (images: string[], i: number) => (images.length ? images[i % images.length] || undefined : undefined);

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

/* ====================== 2. Album lật trang 3D ====================== */

const LEAVES = 5;
const LEAF_SPAN = 0.16;
const LEAF_START = 0.08;

/** Một quyển album mở: mỗi tờ có hai mặt ảnh, lật lần lượt từ phải sang trái. */
export function BookScene(props: SceneProps) {
  const { p, hero, categoryLabel } = props;
  const accent = hero.accent;
  const tilt = useTransform(p, [0, 1], [-16, -6]);
  return (
    <Frame {...props} height={50} hint="Cuộn để lật album">
      <div className="absolute inset-0" style={{ perspective: 1800 }}>
        <motion.div className="absolute" style={{ left: "26cqw", top: "7cqw", width: "48cqw", height: "32cqw", transformStyle: "preserve-3d", rotateX: tilt }}>
          {/* Hai trang nền đứng yên: bìa bên trái, trang trống bên phải */}
          <div className="absolute overflow-hidden rounded-l-[0.8cqw]" style={{ left: 0, top: 0, width: "24cqw", height: "32cqw", background: `linear-gradient(160deg, ${mix(accent, 70, "#fff")}, ${mix(accent, 60, "#000")})` }}>
            <div className="flex size-full items-center justify-center p-[2cqw] text-center" style={{ color: "#fff", fontFamily: SCRIPT, fontSize: "4.6cqw", lineHeight: 1.1 }}>
              {hero.title || categoryLabel}
            </div>
          </div>
          <div className="absolute overflow-hidden rounded-r-[0.8cqw]" style={{ left: "24cqw", top: 0, width: "24cqw", height: "32cqw", background: "linear-gradient(160deg, #fffdf8, #f2e8d5)" }}>
            <CreamText text={hero.subtitle || "Trân trọng kính mời"} accent={accent} />
          </div>
          {Array.from({ length: LEAVES }, (_, i) => (
            <Leaf key={i} i={i} p={p} front={slot(hero.images, i * 2)} back={slot(hero.images, i * 2 + 1)} accent={accent} />
          ))}
        </motion.div>
        <div aria-hidden className="absolute rounded-[50%]" style={{ left: "24cqw", top: "40cqw", width: "52cqw", height: "3cqw", background: "rgba(40,20,20,0.35)", filter: "blur(1.6cqw)" }} />
      </div>
    </Frame>
  );
}

function Leaf({ i, p, front, back, accent }: { i: number; p: MotionValue<number>; front?: string; back?: string; accent: string }) {
  const a0 = LEAF_START + i * LEAF_SPAN;
  const angle = useTransform(p, [a0, a0 + LEAF_SPAN], [0, -180], { ease });
  // Tờ đang nằm bên phải thì xếp theo thứ tự; tờ đã lật sang trái thì xếp ngược lại để chồng đúng.
  const z = useTransform(angle, (v) => (v > -90 ? LEAVES - i : i + 1) * 2);
  const faceStyle: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
  return (
    <motion.div className="absolute" style={{ left: "24cqw", top: 0, width: "24cqw", height: "32cqw", transformOrigin: "0% 50%", transformStyle: "preserve-3d", rotateY: angle, z }}>
      <div className="absolute inset-0 overflow-hidden rounded-r-[0.8cqw]" style={{ ...faceStyle, boxShadow: "0 0.6cqw 1.6cqw -0.6cqw rgba(0,0,0,0.35)" }}>
        <Art src={front} accent={accent} i={i} text="♥" />
      </div>
      <div className="absolute inset-0 overflow-hidden rounded-l-[0.8cqw]" style={{ ...faceStyle, transform: "rotateY(180deg)", background: "#fffdf8" }}>
        {back ? <Art src={back} accent={accent} i={i + 1} /> : <CreamText text={`Kỷ niệm ${i + 1}`} accent={accent} />}
      </div>
    </motion.div>
  );
}

function CreamText({ text, accent }: { text: string; accent: string }) {
  return (
    <div className="flex size-full flex-col items-center justify-center p-[2.4cqw] text-center">
      <p style={{ fontFamily: SERIF, fontStyle: "italic", color: INK, fontSize: "2.6cqw", lineHeight: 1.3 }}>{text}</p>
      <span style={{ color: accent, fontSize: "1.8cqw", marginTop: "1cqw" }} aria-hidden>♥</span>
    </div>
  );
}

/* ====================== 3. Hoa nở 3D ====================== */

const PETAL_N = 8;

/** Tám cánh ảnh đang khép, mở dần ra quanh một tâm, rồi xoay nhẹ. */
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
      </motion.div>
      <motion.div
        aria-hidden
        className="absolute flex items-center justify-center rounded-full"
        style={{
          left: "calc(50% - 5cqw)",
          top: "calc(50% - 5cqw)",
          width: "10cqw",
          height: "10cqw",
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
    </Frame>
  );
}

function Petal({ i, open, src, accent }: { i: number; open: MotionValue<number>; src?: string; accent: string }) {
  const a = i * (360 / PETAL_N);
  const dist = useTransform(open, (v) => -(3 + v * 19));
  const tilt = useTransform(open, (v) => (1 - v) * 64);
  const transform = useMotionTemplate`rotateZ(${a}deg) translateY(${dist}cqw) rotateX(${tilt}deg)`;
  return (
    <motion.div
      className="absolute"
      style={{ left: "calc(50% - 8cqw)", top: "calc(50% - 10cqw)", width: "16cqw", height: "20cqw", transform }}
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
