"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  cubicBezier,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTime,
  useTransform,
  useVelocity,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import { ArrowDown } from "lucide-react";
import { Be_Vietnam_Pro, Cormorant_Garamond, Great_Vibes } from "@/lib/fonts";
import { EVENT_FONT_VARS } from "@/components/invitation-send/EventDetailsEditor";

/* ------------------------------------------------------------------ */
/*  Cảnh thiệp 3D công khai: dựa trên ImmersiveScrollHero, có thêm:    */
/*   - trang GIỮA (L1) lật mở ở bước giữa                              */
/*   - trang CUỐI đóng lại ở bước cuối                                 */
/*  Nền cuối cảnh hoà vào màu nền phần nội dung bên dưới.              */
/* ------------------------------------------------------------------ */

const serifFont = Cormorant_Garamond({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-card-serif", display: "swap" });
const scriptFont = Great_Vibes({ subsets: ["latin", "vietnamese"], weight: "400", variable: "--font-card-script", display: "swap" });
const sansFont = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600"], variable: "--font-card-sans", display: "swap" });
const FONT_VARS = `${serifFont.variable} ${scriptFont.variable} ${sansFont.variable}`;

const SERIF = "var(--font-card-serif), 'Cormorant Garamond', 'Times New Roman', serif";
const SCRIPT = "var(--font-card-script), 'Great Vibes', 'Brush Script MT', cursive";
const SANS = "var(--font-card-sans), 'Be Vietnam Pro', system-ui, sans-serif";
const HAN = "'Songti SC','Noto Serif CJK SC','Source Han Serif SC','SimSun','Microsoft YaHei',serif";

const BG = "#FFFCF6"; // đúng màu --ev-bg mặc định của phần nội dung bên dưới
const CRIMSON = "#A3152F";
const GOLD = "#B8893E";
const GOLD_DK = "#8C6420";
const INK = "#1D1B2A";
const NAVY = "#14233F";
const MUTED = "#6B7A99";
const MUTED_DK = "#4F5F84";
const BLUE_LINE = "#2F4C8F";
const ARCH_FILL = "#CCD9EC";
const CARD_BG = "linear-gradient(145deg,#EBF0FA,#E2E9F5)";
const FOIL = "linear-gradient(100deg,#8C6420 0%,#D9B878 20%,#F7E7BC 33%,#B8893E 48%,#8C6420 60%,#E3C27C 78%,#B8893E 100%)";
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .1  0 0 0 0 .1  0 0 0 0 .2  0 0 0 1.4 -.55'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;
const HIDE_BACK: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

const EASE = cubicBezier(0.45, 0, 0.25, 1);
const E = { ease: EASE };
const OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fs = (k: number): CSSProperties => ({ fontSize: `calc(var(--cw) * ${k})` });
const lh = (h: number): CSSProperties => ({ height: `calc(var(--cw) * ${h})` });
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
function sample(v: number, stops: number[], vals: number[], ease: (t: number) => number = (t) => t) {
  const last = stops.length - 1;
  if (v <= stops[0]) return vals[0];
  if (v >= stops[last]) return vals[last];
  let i = 0;
  while (v > stops[i + 1]) i++;
  const t = ease((v - stops[i]) / (stops[i + 1] - stops[i]));
  return vals[i] + (vals[i + 1] - vals[i]) * t;
}

/* quỹ đạo máy quay (giữ nguyên như bản gốc) */
const SIDE_STOPS = [0, 0.11, 0.23, 0.41, 0.5, 0.65, 0.7, 0.91, 0.97, 1];
const SIDE_VALS = [0, 0, 1, 1, -1, -1, 1, 1, -1, -1];
const Z_STOPS = [0, 0.11, 0.23, 0.41, 0.455, 0.5, 0.6, 0.65, 0.7, 0.86, 0.93, 1];
const Z_VALS = [0, 140, -110, 40, -300, -40, -60, -200, 0, -60, -240, -200];
const F_STOPS = [0, 0.52, 0.545, 0.57, 0.605, 0.63, 0.66, 0.82, 0.85, 0.875, 0.905, 0.94, 1];
const F_K = [1, 1, 2.2, 3.0, 3.0, 2.6, 1, 1, 2.2, 2.2, 2.0, 1.12, 1];
const F_U = [0, 0, 0, -0.17, 0.17, 0, 0, 0, 0, 0, 0, 0, 0];
const F_V = [0, 0, -0.3, 0.14, 0.37, 0.525, 0, 0, -0.19, -0.05, 0.17, 0, 0];
const RY_STOPS = [0, 0.5, 0.545, 0.57, 0.605, 0.64, 0.7, 0.85, 0.875, 0.905, 0.95, 1];
const RY_VALS = [0, 0, -14, 10, -10, 0, 0, -12, 10, -6, 0, 0];
const RX_STOPS = [0, 0.545, 0.57, 0.605, 0.64, 0.85, 0.875, 0.9, 0.95, 1];
const RX_VALS = [0, 0, 6, -5, 0, 6, -5, 0, 0, 0];
const WIDE = 768;

/* mốc thời gian của các bước lật trang */
const COVER_OPEN: [number, number] = [0.68, 0.79]; // bìa mở
const MID_OPEN: [number, number] = [0.8, 0.86];    // trang giữa lật mở
const MID_CLOSE: [number, number] = [0.93, 0.99];  // trang cuối đóng lại

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/* ------------------------------------------------------------------ */
/*  DỮ LIỆU: lấy từ thông tin sự kiện của chủ thiệp                     */
/* ------------------------------------------------------------------ */
export type IntroInfo = {
  title: string;
  description: string;
  host: string;
  date: string;
  time: string;
  venue: string;
  address: string;
};

/** Tách "Lễ thành hôn của Minh Anh & Quốc Bảo" thành hai tên; không khớp thì hiện nguyên tiêu đề */
function parseNames(title: string): { first: string; second: string } {
  const m = title.match(/(?:.*?\s)?([^\s][^&]*?)\s*&\s*(.+)$/);
  if (m) return { first: m[1].trim(), second: m[2].trim() };
  return { first: title, second: "" };
}

type Chapter = {
  range: [number, number];
  side: "center" | "left" | "right";
  eyebrow: string;
  lines: { text: string; accent?: boolean }[];
  cta?: { label: string; href: string };
};

function buildChapters(info: IntroInfo): Chapter[] {
  const present = (...xs: string[]) => xs.filter((x) => x && x.trim()).join(" · ");
  return [
    { range: [0, 0.11], side: "center", eyebrow: info.host || "Trân trọng kính mời", lines: [{ text: info.title }, { text: "", accent: true }].filter((l) => l.text) },
    { range: [0.13, 0.4], side: "left", eyebrow: "Một lời mời", lines: [{ text: info.description || "Rất mong được đón tiếp bạn." }] },
    { range: [0.43, 0.64], side: "right", eyebrow: "Thời gian", lines: [{ text: present(info.time, info.date) || "Đang cập nhật" }] },
    { range: [0.66, 0.89], side: "left", eyebrow: "Địa điểm", lines: [{ text: present(info.venue, info.address) || "Đang cập nhật" }] },
    { range: [0.91, 1], side: "right", eyebrow: "Đến lượt bạn", lines: [{ text: "Xác nhận tham dự ngay bên dưới." }], cta: { label: "Xác nhận", href: "#rsvp-title" } },
  ];
}

type CardFx = {
  p: MotionValue<number>;
  coverOpacity: MotionValue<number>;
  coverShade: MotionValue<number>;
  castShadow: MotionValue<number>;
  sheenX: MotionValue<string>;
  foilPos: MotionValue<string>;
  glare: MotionValue<string>;
  glareOpacity: MotionValue<number>;
  shadow: MotionValue<string>;
};

/* ------------------------------------------------------------------ */
export function PublicEnvelopeIntro({ info }: { info: IntroInfo }) {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();
  const [active, setActive] = useState(0);
  const names = parseNames(info.title);
  const CHAPTERS = buildChapters(info);

  const vwMV = useMotionValue(1200);
  const vhMV = useMotionValue(800);
  const cwMV = useMotionValue(300);
  useEffect(() => {
    const stage = stageRef.current;
    const probe = probeRef.current;
    if (!stage || !probe) return;
    const measure = () => { vwMV.set(stage.clientWidth); vhMV.set(stage.clientHeight); cwMV.set(probe.offsetWidth); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    ro.observe(probe);
    return () => ro.disconnect();
  }, [vwMV, vhMV, cwMV]);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const { scrollYProgress: exit } = useScroll({ target: containerRef, offset: ["end end", "end start"] });
  const exitOpacity = useTransform(exit, [0, 0.7], [1, 0]);
  const exitY = useTransform(exit, [0, 1], ["0svh", "14svh"]);

  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.7 });
  useMotionValueEvent(p, "change", (v) => {
    let idx = 0;
    CHAPTERS.forEach((c, i) => { if (v >= c.range[0] - 0.005) idx = i; });
    setActive(idx);
  });

  /* nghiêng theo chuột + tốc độ cuộn */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const tiltY = useTransform(sx, [-1, 1], [-5, 5]);
  const tiltX = useTransform(sy, [-1, 1], [3, -3]);
  const velocity = useSpring(useVelocity(p), { stiffness: 80, damping: 30 });
  const lean = useTransform(velocity, [-1.2, 0, 1.2], [4, 0, -4]);
  const stageRotX = useTransform([tiltX, lean], ([t, l]: number[]) => t + (reduceMotion ? 0 : l));

  /* máy quay */
  const side = useTransform(p, SIDE_STOPS, SIDE_VALS, E);
  const rigX = useTransform([side, vwMV], ([s, w]: number[]) => s * (w >= WIDE ? 0.24 : 0.06) * w);
  const rigY = useTransform([p, vhMV, vwMV], ([v, h, w]: number[]) => (w >= WIDE ? 0 : -0.12 * h * sample(v, [0.11, 0.23], [0, 1])));
  const rigZ = useTransform(p, Z_STOPS, Z_VALS, E);
  const sideVel = useSpring(useVelocity(side), { stiffness: 90, damping: 28 });
  const yaw = useTransform([side, sideVel], ([s, vel]: number[]) => -s * 9 - (reduceMotion ? 0 : clamp(vel * 0.75, -20, 20)));

  /* cận cảnh */
  const kAt = (v: number, w: number) => { const k = sample(v, F_STOPS, F_K); return w >= WIDE ? k : 1 + (k - 1) * 0.55; };
  const focusK = useTransform([p, vwMV], ([v, w]: number[]) => kAt(v, w));
  const focusX = useTransform([p, vwMV, cwMV], ([v, w, c]: number[]) => -kAt(v, w) * sample(v, F_STOPS, F_U) * c);
  const focusY = useTransform([p, vwMV, cwMV], ([v, w, c]: number[]) => -kAt(v, w) * sample(v, F_STOPS, F_V) * c);

  /* lơ lửng */
  const time = useTime();
  const floatAmp = useTransform(p, [0.52, 0.58], [0, 1]);
  const floatY = useTransform([time, floatAmp], ([t, a]: number[]) => (reduceMotion ? 0 : Math.sin(t / 1200) * 5 * a));
  const floatRot = useTransform([time, floatAmp], ([t, a]: number[]) => (reduceMotion ? 0 : Math.sin(t / 1700) * 0.8 * a));

  /* phong bì */
  const envScale = useTransform(p, [0, 0.1], [0.9, 1], E);
  const envY = useTransform(p, [0, 0.42, 0.53], ["-50%", "-50%", "260%"], E);
  const envOpacity = useTransform(p, [0.43, 0.52], [1, 0]);
  const envPush = useTransform(p, [0.42, 0.52], [0, -320], E);
  const envZFront = useTransform(envPush, (v) => v + 3);
  const flapRot = useTransform(p, [0.08, 0.2], [0, 180], E);
  const flapZ = useTransform([p, envPush], ([pp, e]: number[]) => (pp < 0.17 ? 5 : 1) + e);

  /* thiệp rút ra + cuộn trang */
  const cardY = useTransform(p, [0, 0.2, 0.42, 0.54, 1], ["-48.5%", "-48.5%", "-133%", "-53%", "-53%"], E);
  const cardScale = useTransform(p, [0, 0.1, 0.42, 0.54, 1], [0.855, 0.95, 0.95, 1.05, 1.05], E);
  const cardRotZ = useTransform(p, [0, 0.42, 0.54, 1], [-90, -90, 0, 0], E);
  const cardRotY = useTransform(p, RY_STOPS, RY_VALS, E);
  const cardRotX = useTransform(p, RX_STOPS, RX_VALS, E);
  const cardZ = useTransform(p, [0, 0.415, 0.43, 1], [2, 2, 40, 40]);

  // bìa mở (L0)
  const coverRot = useTransform(p, COVER_OPEN, [0, -180], E);
  const coverOpacity = useTransform(p, [0.79, 0.84], [1, 0]);
  const coverShade = useTransform(p, [0.68, 0.74, 0.8], [0, 0.55, 0.15]);
  const castShadow = useTransform(p, [0.68, 0.74, 0.8], [0, 1, 0]);
  const sheenX = useTransform(p, [0.45, 0.62], ["-130%", "130%"]);
  const foilPos = useTransform(p, [0.42, 1], ["0% 50%", "100% 50%"]);

  // trang giữa (L1): lật mở ở bước giữa, ĐÓNG lại ở bước cuối
  const midRot = useTransform(p, [MID_OPEN[0], MID_OPEN[1], MID_CLOSE[0], MID_CLOSE[1]], [0, -180, -180, 0], E);
  // khi đang mở, trang giữa phải nằm trên bìa; khi đóng thì nằm dưới bìa
  const midZ = useTransform(midRot, [-180, 0], [6, 2]);

  const shX = useTransform(sx, [-1, 1], [18, -18]);
  const shY = useTransform(p, [0.42, 0.54], [22, 46]);
  const shBlur = useTransform(p, [0.42, 0.54], [38, 70]);
  const shAlpha = useTransform(p, [0.3, 0.5], [0, 0.5]);
  const shadow = useMotionTemplate`${shX}px ${shY}px ${shBlur}px -28px rgba(30,45,100,${shAlpha}), 0 1px 2px rgba(30,45,100,0.18)`;
  const gx = useTransform(sx, [-1, 1], [15, 85]);
  const gy = useTransform(sy, [-1, 1], [10, 90]);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.5), rgba(255,255,255,0) 55%)`;
  const glareOpacity = useTransform(p, [0.54, 0.6], [0, 1]);

  const fx: CardFx = { p, coverOpacity, coverShade, castShadow, sheenX, foilPos, glare, glareOpacity, shadow };

  /* lớp nền */
  const blobAX = useTransform([sx, side], ([m, s]: number[]) => m * 24 - s * 70);
  const blobAY = useTransform(p, [0, 1], ["0vh", "-16vh"]);
  const blobBX = useTransform([sx, side], ([m, s]: number[]) => m * -20 - s * 40);
  const blobBY = useTransform(p, [0, 1], ["0vh", "12vh"]);
  const railScale = useTransform(p, [0, 1], [0, 1]);
  const hintOpacity = useTransform(p, [0, 0.04], [1, 0]);
  // hoà nền: cuối cảnh, lớp dưới mờ dần về đúng màu nền phần nội dung
  const blendOpacity = useTransform(p, [0.9, 1], [0, 1]);

  const vars = { ["--cw" as string]: "min(62vw, 300px, 30svh)" } as CSSProperties;

  const goTo = (i: number) => {
    const el = containerRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const distance = el.offsetHeight - window.innerHeight;
    const at = CHAPTERS[i].range[0] + (i === 0 ? 0 : 0.06);
    window.scrollTo({ top: top + distance * at, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <section ref={containerRef} className={`relative h-[700vh] ${FONT_VARS} ${EVENT_FONT_VARS}`} style={{ background: BG }}>
      <motion.div className="sticky top-0 h-[100svh] w-full" style={{ opacity: exitOpacity, y: exitY }}>
        <div
          ref={stageRef}
          className="relative h-full w-full overflow-hidden"
          style={{ ...vars, background: `linear-gradient(to bottom, ${BG} 0%, ${BG} 100%)` }}
          onPointerMove={(e) => {
            if (e.pointerType === "touch" || reduceMotion) return;
            const r = e.currentTarget.getBoundingClientRect();
            mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
            my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
          }}
          onPointerLeave={() => { mx.set(0); my.set(0); }}
        >
          <div ref={probeRef} aria-hidden className="pointer-events-none absolute left-0 top-0 h-px opacity-0" style={{ width: "var(--cw)" }} />

          <motion.div aria-hidden className="pointer-events-none absolute -right-[12vw] -top-[10vh] aspect-square w-[55vw]" style={{ x: blobAX, y: blobAY, background: "radial-gradient(closest-side, rgba(226,170,185,.32), transparent)" }} />
          <motion.div aria-hidden className="pointer-events-none absolute -bottom-[12vh] -left-[14vw] aspect-square w-[50vw]" style={{ x: blobBX, y: blobBY, background: "radial-gradient(closest-side, rgba(238,208,150,.26), transparent)" }} />

          {mounted && !reduceMotion && <Particles progress={p} side={side} />}

          {/* SÂN KHẤU 3D */}
          <div className="absolute inset-0" style={{ perspective: 1400 }}>
            <motion.div className="absolute inset-0" style={{ rotateX: stageRotX, rotateY: tiltY, transformStyle: "preserve-3d" }}>
              <motion.div className="absolute inset-0" style={{ x: rigX, y: rigY, z: rigZ, rotateY: yaw, transformStyle: "preserve-3d" }}>
                {/* phong bì - lưng */}
                <EnvLayer y={envY} scale={envScale} opacity={envOpacity} z={envPush}>
                  <div className="absolute inset-0 rounded-[4px]" style={{ background: "linear-gradient(180deg, rgba(110,40,65,.30), transparent 42%), linear-gradient(160deg,#EBD5DA,#E1C6CD)", boxShadow: "0 40px 70px -28px rgba(120,50,75,.45)" }} />
                </EnvLayer>

                {/* thiệp */}
                <motion.div
                  className="absolute left-1/2 top-[54%]"
                  style={{ width: "var(--cw)", height: "calc(var(--cw) * 1.33)", x: "-50%", y: cardY, scale: cardScale, rotateX: cardRotX, rotateY: cardRotY, rotateZ: cardRotZ, z: cardZ }}
                >
                  <motion.div className="h-full w-full" style={{ y: floatY, rotateZ: floatRot }}>
                    <motion.div className="h-full w-full" style={{ scale: focusK, x: focusX, y: focusY, ["--k" as string]: focusK } as MotionStyle}>
                      <CardBody fx={fx} info={info} names={names} midRot={midRot} midZ={midZ} coverRot={coverRot} />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* phong bì - mặt trước */}
                <EnvLayer y={envY} scale={envScale} opacity={envOpacity} z={envZFront}>
                  <Tri clip="polygon(0 0, 50% 62%, 0 100%)" bg="linear-gradient(90deg,#F2E2E6,#F6E9EC)" />
                  <Tri clip="polygon(100% 0, 50% 62%, 100% 100%)" bg="linear-gradient(270deg,#F2E2E6,#F6E9EC)" />
                  <Tri clip="polygon(0 100%, 50% 62%, 100% 100%)" bg="linear-gradient(180deg,#FBF1F3,#F3E3E7)" />
                </EnvLayer>

                {/* nắp phong bì */}
                <EnvLayer y={envY} scale={envScale} opacity={envOpacity} z={flapZ}>
                  <motion.div className="absolute inset-0" style={{ rotateX: flapRot, transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}>
                    <Tri clip={FLAP_CLIP} bg="linear-gradient(180deg,#F8ECEF,#F1DFE4)" face="front" />
                    <Tri clip={FLAP_CLIP} bg={LINER} face="back" />
                    <WaxSeal progress={p} />
                  </motion.div>
                </EnvLayer>
              </motion.div>
            </motion.div>
          </div>

          <Grain opacity={0.18} className="z-10" />

          {/* hoà nền với phần nội dung bên dưới */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[35svh]"
            style={{ opacity: blendOpacity, background: `linear-gradient(to bottom, rgba(255,252,246,0), ${BG} 90%)` }}
          />

          {CHAPTERS.map((c, i) => (
            <ChapterView key={i} chapter={c} progress={p} first={i === 0} last={i === CHAPTERS.length - 1} />
          ))}

          <motion.div style={{ opacity: hintOpacity, color: "#6B6880" }} className="absolute bottom-[5svh] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest">Cuộn để mở thiệp</span>
            <ArrowDown className="size-5 animate-bounce" style={{ color: CRIMSON }} />
          </motion.div>

          <nav aria-label="Các chương" className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 md:block">
            <div className="relative h-44 w-px" style={{ background: "rgba(29,27,42,.12)" }}>
              <motion.div style={{ scaleY: railScale, background: CRIMSON }} className="h-full w-full origin-top" />
              {CHAPTERS.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={c.eyebrow}
                  aria-current={active === i ? "step" : undefined}
                  className="group absolute -left-[7px] grid size-[15px] -translate-y-1/2 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ top: `${c.range[0] * 100}%`, outlineColor: CRIMSON }}
                >
                  <span className="block rounded-full transition-all duration-300" style={{ width: active === i ? 10 : 6, height: active === i ? 10 : 6, background: i <= active ? CRIMSON : "rgba(29,27,42,.25)" }} />
                  <span className="pointer-events-none absolute right-7 whitespace-nowrap text-sm italic opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" style={{ color: MUTED, fontFamily: SERIF }}>
                    {c.eyebrow}
                  </span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Vân giấy, phong bì, dấu sáp                                         */
/* ------------------------------------------------------------------ */
function Grain({ opacity = 0.35, className = "" }: { opacity?: number; className?: string }) {
  return <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`} style={{ backgroundImage: GRAIN, backgroundSize: "calc(140px / var(--k, 1)) calc(140px / var(--k, 1))", opacity }} />;
}

const FLAP_CLIP = "polygon(0 0, 100% 0, 50% 62%)";
const LINER = "repeating-linear-gradient(45deg, rgba(240,214,160,.18) 0 1px, transparent 1px 9px), repeating-linear-gradient(-45deg, rgba(240,214,160,.18) 0 1px, transparent 1px 9px), linear-gradient(180deg,#B3243F,#8A1730)";

function EnvLayer({ children, y, scale, opacity, z }: { children: ReactNode; y: MotionValue<string>; scale: MotionValue<number>; opacity: MotionValue<number>; z: number | MotionValue<number> }) {
  return (
    <motion.div className="absolute left-1/2 top-[54%]" style={{ width: "calc(var(--cw) * 1.45)", height: "calc(var(--cw) * 1.1)", x: "-50%", y, scale, opacity, z, perspective: 1200 }}>
      {children}
    </motion.div>
  );
}

function Tri({ clip, bg, face }: { clip: string; bg: string; face?: "front" | "back" }) {
  const faceStyle: CSSProperties = face === "back" ? { ...HIDE_BACK, transform: "rotateY(180deg)" } : face === "front" ? HIDE_BACK : {};
  return <div className="absolute inset-0" style={{ clipPath: clip, background: bg, ...faceStyle }} />;
}

const SEAL_CRACK: [number, number] = [0.02, 0.08];
const CLIP_L = "polygon(0 0, 53% 0, 48% 20%, 55% 40%, 47% 60%, 54% 80%, 50% 100%, 0 100%)";
const CLIP_R = "polygon(52% 0, 100% 0, 100% 100%, 49% 100%, 53% 80%, 46% 60%, 54% 40%, 47% 20%)";
const SPARKS = Array.from({ length: 10 }, (_, i) => ({ a: (i / 10) * Math.PI * 2 + rnd(i) * 0.5, d: 34 + rnd(i + 20) * 40 }));

function SealFace() {
  return (
    <div className="grid h-full w-full place-items-center rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, #D8405A, ${CRIMSON} 58%, #5E0A1C)`, boxShadow: "inset 0 0 0 2px rgba(255,255,255,.08), inset 0 -3px 6px rgba(60,0,15,.45), inset 0 3px 5px rgba(255,160,175,.35)", color: "#F1D9A6", fontFamily: HAN, ...fs(0.1) }}>
      囍
    </div>
  );
}

function SealHalf({ side, progress }: { side: "l" | "r"; progress: MotionValue<number> }) {
  const dir = side === "l" ? -1 : 1;
  const x = useTransform(progress, SEAL_CRACK, ["0%", `${dir * 60}%`], E);
  const y = useTransform(progress, SEAL_CRACK, ["0%", "90%"], E);
  const rotate = useTransform(progress, SEAL_CRACK, [0, dir * 26], E);
  const opacity = useTransform(progress, [0.05, 0.1], [1, 0]);
  return (
    <motion.div className="absolute inset-0" style={{ x, y, rotate, opacity, clipPath: side === "l" ? CLIP_L : CLIP_R }}>
      <SealFace />
    </motion.div>
  );
}

function Spark({ progress, a, d }: { progress: MotionValue<number>; a: number; d: number }) {
  const x = useTransform(progress, [0.03, 0.11], [0, Math.cos(a) * d], E);
  const y = useTransform(progress, [0.03, 0.11], [0, Math.sin(a) * d + 14], E);
  const opacity = useTransform(progress, [0.03, 0.045, 0.11], [0, 1, 0]);
  const scale = useTransform(progress, [0.03, 0.11], [1.2, 0.2]);
  return <motion.span className="absolute left-1/2 top-1/2 -ml-[2px] -mt-[2px] size-1 rounded-full" style={{ x, y, opacity, scale, background: "#F6DDA0", boxShadow: "0 0 6px 1px rgba(240,200,120,.9)" }} />;
}

function WaxSeal({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: "55%", width: "calc(var(--cw) * 0.22)", height: "calc(var(--cw) * 0.22)", filter: "drop-shadow(0 5px 6px rgba(90,10,30,.45))", ...HIDE_BACK }}>
      <SealHalf side="l" progress={progress} />
      <SealHalf side="r" progress={progress} />
      {SPARKS.map((s, i) => <Spark key={i} progress={progress} a={s.a} d={s.d} />)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tấm thiệp: nhiều trang lật                                          */
/*   base  : trang trong cuối (địa điểm, lời cảm ơn, xác nhận)           */
/*   L1    : trang giữa - mặt trước (báo tin + tên), mặt sau (thời gian) */
/*   L0    : bìa - mặt trước (bìa), mặt sau (lời mời)                    */
/* ------------------------------------------------------------------ */
function Frame() {
  return <div aria-hidden className="pointer-events-none absolute" style={{ inset: "calc(var(--cw) * 0.028)", border: "1px solid rgba(184,137,62,.6)", outline: "1px solid rgba(184,137,62,.28)", outlineOffset: "calc(var(--cw) * 0.008)" }} />;
}

function Paper({ children, opacity, flip }: { children?: ReactNode; opacity?: MotionValue<number>; flip?: boolean }) {
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ background: CARD_BG, color: NAVY, boxShadow: "inset 0 0 0 1px rgba(47,76,143,.10), inset 0 1px 0 rgba(255,255,255,.7)", opacity, rotateY: flip ? 180 : 0, ...HIDE_BACK }}>
      {children}
      <Frame />
      <Grain opacity={0.35} />
    </motion.div>
  );
}

/** Một trang lật: mặt trước và mặt sau gắn vào cùng một bản lề bên trái */
function Leaf({ rot, z, front, back, opacity }: { rot: MotionValue<number>; z: number | MotionValue<number>; front: ReactNode; back: ReactNode; opacity?: MotionValue<number> }) {
  return (
    <motion.div className="absolute inset-0" style={{ rotateY: rot, z, transformOrigin: "left center", transformStyle: "preserve-3d" }}>
      <Paper opacity={opacity}>{front}</Paper>
      <Paper flip>{back}</Paper>
    </motion.div>
  );
}

function Line({ h, children, style }: { h: number; children: ReactNode; style?: CSSProperties }) {
  return <div className="flex items-center justify-center whitespace-nowrap text-center" style={{ ...lh(h), ...style }}>{children}</div>;
}

const caps = (k: number, color = BLUE_LINE, spacing = "0.16em"): CSSProperties => ({ ...fs(k), fontFamily: SANS, fontWeight: 600, letterSpacing: spacing, textTransform: "uppercase", color });
const serif = (k: number, weight = 500): CSSProperties => ({ ...fs(k), fontFamily: SERIF, fontWeight: weight, fontVariantNumeric: "lining-nums" });

function Arch({ w, h }: { w: number; h: number }) {
  return <div className="overflow-hidden" style={{ width: `calc(var(--cw) * ${w})`, height: `calc(var(--cw) * ${h})`, borderRadius: "999px 999px 0 0", background: ARCH_FILL, border: `1px solid ${BLUE_LINE}`, boxShadow: "inset 0 10px 24px -12px rgba(20,35,63,.25)" }} />;
}

function Foil({ pos, children, style }: { pos: MotionValue<string>; children: ReactNode; style?: CSSProperties }) {
  return (
    <motion.span className="inline-block" style={{ backgroundImage: FOIL, backgroundSize: "260% 100%", backgroundPosition: pos, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent", padding: "0 0.12em", ...style }}>
      {children}
    </motion.span>
  );
}

/** Tên hai người: dòng chữ viết tay + dấu & dát vàng */
function Names({ names, foil, k }: { names: { first: string; second: string }; foil: MotionValue<string>; k: number }) {
  const script: CSSProperties = { fontFamily: SCRIPT, ...fs(k), color: NAVY };
  return (
    <div className="flex flex-col items-center">
      <Line h={k + 0.02} style={script}>{names.first}</Line>
      {names.second && (
        <>
          <Line h={k * 0.5}>
            <Foil pos={foil} style={{ ...serif(k * 0.55, 500), fontStyle: "italic", lineHeight: 1 }}>&amp;</Foil>
          </Line>
          <Line h={k + 0.02} style={script}>{names.second}</Line>
        </>
      )}
    </div>
  );
}

function InsideItem({ p, at, children }: { p: MotionValue<number>; at: number; children: ReactNode }) {
  const opacity = useTransform(p, [at, at + 0.05], [0, 1]);
  const y = useTransform(p, [at, at + 0.05], ["8px", "0px"]);
  return <motion.div className="flex w-full flex-col items-center" style={{ opacity, y }}>{children}</motion.div>;
}

function CardBody({ fx, info, names, midRot, midZ, coverRot }: { fx: CardFx; info: IntroInfo; names: { first: string; second: string }; midRot: MotionValue<number>; midZ: MotionValue<number>; coverRot: MotionValue<number> }) {
  const { p, foilPos } = fx;
  const gold = "rgba(184,137,62,.6)";
  const label = info.host || "Trân trọng kính mời";

  /* ----- trang cuối (đáy): địa điểm + lời cảm ơn + xác nhận ----- */
  const lastPage = (
    <>
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: fx.castShadow, background: "linear-gradient(90deg, rgba(20,35,80,.38), rgba(20,35,80,0) 60%)" }} />
      <div className="relative flex h-full flex-col items-center justify-center" style={{ padding: "calc(var(--cw) * 0.08)", gap: "calc(var(--cw) * 0.05)" }}>
        <InsideItem p={p} at={0.795}>
          <Line h={0.035} style={caps(0.022, GOLD_DK, "0.24em")}>Tại</Line>
          <Line h={0.06} style={{ ...serif(0.058, 600), color: NAVY }}>{info.venue}</Line>
          <Line h={0.04} style={{ ...fs(0.027), fontFamily: SANS, fontWeight: 500, color: MUTED_DK }}>{info.address}</Line>
        </InsideItem>
        <InsideItem p={p} at={0.815}>
          <Line h={0.05} style={{ ...serif(0.036, 500), fontStyle: "italic", color: MUTED_DK }}>Rất hân hạnh được đón tiếp quý khách</Line>
          <div style={{ height: "calc(var(--cw) * 0.02)" }} />
          <div className="flex items-center justify-center rounded-full" style={{ ...lh(0.06), ...fs(0.032), fontFamily: SANS, fontWeight: 600, background: NAVY, color: "#fff", padding: "0 calc(var(--cw) * 0.08)" }}>
            Xác nhận tham dự
          </div>
        </InsideItem>
      </div>
    </>
  );

  /* ----- trang giữa, mặt trước: báo tin + tên ----- */
  const midFront = (
    <>
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(30,50,100,.10), transparent 14%)" }} />
      <div className="relative flex h-full flex-col items-center justify-center" style={{ gap: "calc(var(--cw) * 0.06)" }}>
        <InsideItem p={p} at={0.7}>
          <Line h={0.05} style={caps(0.026, BLUE_LINE, "0.12em")}>{label}</Line>
        </InsideItem>
        <InsideItem p={p} at={0.725}>
          <Names names={names} foil={foilPos} k={0.11} />
        </InsideItem>
      </div>
    </>
  );

  /* ----- trang giữa, mặt sau: thời gian ----- */
  const midBack = (
    <div className="relative flex h-full flex-col items-center justify-center" style={{ padding: "calc(var(--cw) * 0.08)", gap: "calc(var(--cw) * 0.05)" }}>
      <Line h={0.05} style={caps(0.023, MUTED_DK, "0.12em")}>Hôn lễ được cử hành vào lúc</Line>
      <Line h={0.08} style={{ ...serif(0.07, 600), color: NAVY }}>{info.time}</Line>
      <div className="grid w-full items-center" style={{ ...lh(0.12), borderTop: `1px solid ${gold}`, borderBottom: `1px solid ${gold}` }}>
        <Line h={0.12} style={{ ...serif(0.05, 600), color: NAVY }}>{info.date}</Line>
      </div>
      {info.description && (
        <Line h={0.1} style={{ ...serif(0.036, 500), fontStyle: "italic", color: MUTED_DK }}>{info.description}</Line>
      )}
    </div>
  );

  /* ----- bìa: mặt trước + mặt sau (lời mời) ----- */
  const coverFront = (
    <>
      <div className="flex h-full flex-col items-center justify-center" style={{ gap: "calc(var(--cw) * 0.05)" }}>
        <Line h={0.06} style={caps(0.034, MUTED_DK, "0.2em")}>{label}</Line>
        <Arch w={0.42} h={0.46} />
        <Names names={names} foil={foilPos} k={0.13} />
        <Line h={0.06} style={{ ...caps(0.036, NAVY, "0.1em"), fontVariantNumeric: "lining-nums" }}>{info.date}</Line>
      </div>
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: fx.coverShade, background: "linear-gradient(90deg, rgba(20,35,80,.6), rgba(20,35,80,0) 75%)" }} />
      <motion.div aria-hidden style={{ x: fx.sheenX }} className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </>
  );
  const coverBack = (
    <div className="flex h-full flex-col items-center justify-center px-[calc(var(--cw)*0.14)] text-center" style={{ gap: "calc(var(--cw) * 0.05)" }}>
      <span style={{ ...fs(0.08), fontFamily: HAN, color: GOLD, lineHeight: 1 }}>囍</span>
      <p style={{ ...serif(0.07, 500), fontStyle: "italic", color: MUTED_DK, lineHeight: 1.4 }}>{info.description || info.title}</p>
    </div>
  );

  return (
    <motion.div className="relative h-full w-full" style={{ boxShadow: fx.shadow, perspective: 1500 }}>
      {/* các trang nằm trong cùng một không gian 3D để lật có chiều sâu thật */}
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        <Paper>{lastPage}</Paper>
        <Leaf rot={midRot} z={midZ} front={midFront} back={midBack} />
        <Leaf rot={coverRot} z={4} opacity={fx.coverOpacity} front={coverFront} back={coverBack} />
      </div>

      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: fx.glare, opacity: fx.glareOpacity }} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hạt sáng                                                           */
/* ------------------------------------------------------------------ */
const PARTICLE_COLORS = ["#E2A9B8", "#D9B878", "#F3D9A0", "#EBC4CF"];

function Particles({ progress, side }: { progress: MotionValue<number>; side: MotionValue<number> }) {
  return <div aria-hidden className="pointer-events-none absolute inset-0">{Array.from({ length: 14 }).map((_, i) => <Particle key={i} i={i} progress={progress} side={side} />)}</div>;
}

function Particle({ i, progress, side }: { i: number; progress: MotionValue<number>; side: MotionValue<number> }) {
  const depth = 0.3 + rnd(i + 3) * 0.9;
  const size = Math.round((3 + rnd(i + 5) * 5) * 10) / 10;
  const left = (rnd(i + 1) * 100).toFixed(1);
  const top = (rnd(i + 2) * 100).toFixed(1);
  const petal = i % 3 === 0;
  const y = useTransform(progress, [0, 1], [0, -depth * 260]);
  const drift = (rnd(i + 9) - 0.5) * depth * 120;
  const x = useTransform([progress, side], ([pp, sd]: number[]) => drift * pp - sd * depth * 80);
  const rotate = useTransform(progress, [0, 1], [0, (rnd(i + 11) - 0.5) * 360]);
  return (
    <motion.span className="absolute" style={{ left: `${left}%`, top: `${top}%`, x, y, rotate }}>
      <motion.span className="block" style={{ width: size, height: petal ? size * 1.6 : size, borderRadius: petal ? "100% 0 100% 0" : "999px", background: PARTICLE_COLORS[i % PARTICLE_COLORS.length] }} animate={{ y: [0, -18 - rnd(i + 4) * 30, 0], opacity: [0, 0.6, 0] }} transition={{ duration: 6 + (i % 5) * 1.2, repeat: Infinity, delay: rnd(i + 6) * 5, ease: "easeInOut" }} />
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Chữ theo chương                                                    */
/* ------------------------------------------------------------------ */
const MASK_PAD: CSSProperties = { padding: "0.22em 0.06em 0.16em", margin: "-0.22em -0.06em -0.16em" };

type RevealProps = { progress: MotionValue<number>; range: [number, number]; order: number; count: number; first: boolean; last: boolean; mount?: boolean; mask?: boolean; dist?: string; children: ReactNode };

function Reveal({ progress, range, order, count, first, last, mount, mask, dist = "115%", children }: RevealProps) {
  const [s, e] = range;
  const wIn = Math.min(0.06, (e - s) * 0.4);
  const wOut = Math.min(0.03, (e - s) * 0.2);
  const t = order / count;
  const inS = s + t * wIn * 0.6;
  const inE = inS + wIn * 0.4;
  const outS = e - wOut + t * wOut * 0.5;
  const outE = outS + wOut * 0.5;
  const stops: number[] = [];
  const ys: string[] = [];
  const ops: number[] = [];
  const blurs: string[] = [];
  if (!first) { stops.push(inS, inE); ys.push(dist, "0%"); ops.push(0, 1); blurs.push("blur(8px)", "blur(0px)"); }
  if (!last) { stops.push(outS, outE); ys.push("0%", `-${dist}`); ops.push(1, 0); blurs.push("blur(0px)", "blur(8px)"); }
  if (stops.length === 0) { stops.push(0, 1); ys.push("0%", "0%"); ops.push(1, 1); blurs.push("blur(0px)", "blur(0px)"); }
  const y = useTransform(progress, stops, ys);
  const opacity = useTransform(progress, stops, ops);
  const filter = useTransform(progress, stops, blurs);

  if (mask) {
    return (
      <span className="inline-block overflow-hidden align-bottom" style={MASK_PAD}>
        <motion.span className="block" style={{ y, opacity, filter }}>
          {mount ? (
            <motion.span className="block" style={{ transformOrigin: "0% 100%" }} initial={{ y: "115%", rotate: 4, opacity: 0 }} animate={{ y: "0%", rotate: 0, opacity: 1 }} transition={{ duration: 1.1, delay: 0.25 + order * 0.07, ease: OUT }}>
              {children}
            </motion.span>
          ) : children}
        </motion.span>
      </span>
    );
  }
  return (
    <motion.div style={{ y, opacity, filter }}>
      {mount ? (
        <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.1, ease: OUT }}>{children}</motion.div>
      ) : children}
    </motion.div>
  );
}

const POS: Record<Chapter["side"], string> = {
  center: "inset-x-0 top-[8svh] items-center text-center",
  left: "inset-x-0 bottom-[5svh] items-center text-center md:inset-x-auto md:bottom-auto md:left-[6vw] md:top-0 md:h-full md:w-[40vw] md:items-start md:justify-center md:px-0 md:text-left",
  right: "inset-x-0 bottom-[5svh] items-center text-center md:inset-x-auto md:bottom-auto md:left-auto md:right-[8vw] md:top-0 md:h-full md:w-[36vw] md:items-start md:justify-center md:px-0 md:text-left",
};

function ChapterView({ chapter, progress, first, last }: { chapter: Chapter; progress: MotionValue<number>; first: boolean; last: boolean }) {
  const [s, e] = chapter.range;
  const centered = chapter.side === "center";
  let n = 1;
  const lines = chapter.lines.map((l) => ({ ...l, words: l.text.split(" ").map((w) => ({ w, order: n++ })) }));
  const total = n + (chapter.cta ? 1 : 0);
  const pointerEvents = useTransform(progress, (v): "auto" | "none" => (v >= s + 0.02 && (last || v <= e) ? "auto" : "none"));
  const scrim = useTransform(progress, [s, s + 0.03, e - 0.02, e], [0, 1, 1, last ? 1 : 0]);
  const common = { progress, range: chapter.range, count: total, first, last, mount: first } as const;

  return (
    <motion.div style={{ pointerEvents }} className={`absolute z-20 flex flex-col px-5 ${POS[chapter.side]}`}>
      {!centered && <motion.div aria-hidden style={{ opacity: scrim, background: `linear-gradient(to top, ${BG}, rgba(255,252,246,.85), transparent)` }} className="pointer-events-none absolute -top-16 -bottom-[5svh] inset-x-0 -z-10 md:hidden" />}

      <Reveal {...common} order={0} dist="100%">
        <p className="mb-3 text-base italic tracking-wide md:text-lg" style={{ color: CRIMSON, fontFamily: SERIF }}>{chapter.eyebrow}</p>
      </Reveal>

      <h2 className={centered ? "max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl" : "max-w-2xl text-xl font-semibold leading-snug tracking-tight sm:text-2xl md:text-4xl md:leading-[1.12] lg:text-5xl"} style={{ color: INK }}>
        {lines.map((line, li) => (
          <span key={li} className="flex flex-wrap justify-center gap-x-[0.26em] md:justify-start" style={line.accent ? { color: CRIMSON } : undefined}>
            {line.words.map(({ w, order }) => (
              <Reveal key={order} {...common} order={order} mask>{w}</Reveal>
            ))}
          </span>
        ))}
      </h2>

      {chapter.cta && (
        <Reveal {...common} order={total - 1} dist="70%">
          <div className="mt-6 flex flex-row items-center gap-3">
            <MagneticLink href={chapter.cta.href} primary>{chapter.cta.label}</MagneticLink>
          </div>
        </Reveal>
      )}
    </motion.div>
  );
}

function MagneticLink({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  return (
    <motion.a
      href={href}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.25);
        y.set((e.clientY - r.top - r.height / 2) * 0.35);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
      whileTap={{ scale: 0.96 }}
      style={{ x: sx, y: sy, ...(primary ? { background: CRIMSON, color: "#fff", outlineColor: CRIMSON, boxShadow: "0 10px 28px -10px rgba(163,21,47,.65)" } : { background: "#fff", color: INK, outlineColor: CRIMSON, border: "1px solid rgba(29,27,42,.15)" }) }}
      className="group relative overflow-hidden rounded-full px-6 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <span className="relative z-10">{children}</span>
    </motion.a>
  );
}
