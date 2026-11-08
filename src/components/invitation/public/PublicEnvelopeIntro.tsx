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
import { Cormorant_Garamond, Be_Vietnam_Pro } from "@/lib/fonts";
import { FoldingCard } from "@/components/invitation/editor/FoldingCard";
import { useCardMotion } from "@/components/invitation/editor/useCardMotion";
import { useEditorStore, type Snap } from "@/components/invitation/editor/useEditorStore";
import { ENVELOPES, LINERS } from "@/components/invitation/envelope/envelope.data";
import { STAMPS, Stamp } from "@/components/invitation/envelope/Stamp";
import { WaxSeal } from "@/components/invitation/envelope/WaxSeal";

/* ------------------------------------------------------------------ */
/*  Chuyển động: giữ NGUYÊN như ImmersiveScrollHero (máy quay, lấy thiệp  */
/*  ra, cận cảnh, nghiêng theo chuột/tốc độ, chữ theo chương).            */
/*  Hình ảnh: thiệp = FoldingCard của studio (bìa · 2 trang giữa · mặt   */
/*  sau), phong bì = màu/lớp lót/tem/tên người nhận lấy từ thiết kế đã lưu.*/
/* ------------------------------------------------------------------ */

const serifFont = Cormorant_Garamond({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-card-serif", display: "swap" });
const sansFont = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600"], variable: "--font-card-sans", display: "swap" });
const FONT_VARS = `${serifFont.variable} ${sansFont.variable}`;
const SERIF = "var(--font-card-serif), 'Cormorant Garamond', 'Times New Roman', serif";
const SANS = "var(--font-card-sans), 'Be Vietnam Pro', system-ui, sans-serif";

const BG = "#FFFCF6";
const CRIMSON = "#A3152F";
const INK = "#1D1B2A";
const NAVY = "#14233F";
const MUTED = "#6B7A99";
const HIDE_BACK: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

const EASE = cubicBezier(0.45, 0, 0.25, 1);
const E = { ease: EASE };

const fs = (k: number): CSSProperties => ({ fontSize: `calc(var(--cw) * ${k})` });
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

/* quỹ đạo máy quay & thiệp (giữ nguyên bản ImmersiveScrollHero) */
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

/* tiến độ cuộn → trạng thái bìa của studio: 0 đóng · 1 mở hẳn · 2 mặt sau.
   Bìa mở ở 0.68–0.79 (như bản gốc), sau đó lật sang mặt sau ở 0.85–0.97 */
const POS_STOPS = [0, 0.68, 0.79, 0.85, 0.97, 1];
const POS_VALS = [0, 0, 1, 1, 2, 2];
const toPos = (v: number) => sample(v, POS_STOPS, POS_VALS);

/* thiết kế đã lưu của thiệp (API công khai trả về trong `design`) */
export type PublicDesign = {
  pages?: Snap["pages"];
  backdrops?: Snap["backdrops"];
  envelope?: { color?: string; liner?: string; stampId?: string; recipientName?: string };
} | null | undefined;

export type IntroInfo = {
  title: string;
  description: string;
  host: string;
  date: string;
  time: string;
  venue: string;
  address: string;
};

/* ------------------------------------------------------------------ */
export function PublicEnvelopeIntro({ info, design, guestName }: { info: IntroInfo; design?: PublicDesign; guestName?: string }) {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const CHAPTERS = buildChapters(info);

  // nạp đúng thiết kế thiệp đã lưu (cùng nguồn với trình chỉnh sửa trong studio)
  useEffect(() => {
    if (design?.pages && design?.backdrops) {
      useEditorStore.getState().hydrate({ pages: design.pages, backdrops: design.backdrops });
    }
  }, [design]);

  const env = design?.envelope ?? {};
  const envColor = env.color ?? ENVELOPES[0].color;
  const liner = env.liner ?? LINERS[0].background;
  const stampId = env.stampId ?? STAMPS[0].id;
  const recipientName = guestName || env.recipientName || "Tên người nhận";

  // trạng thái bìa/lật trang của studio, do cuộn trang điều khiển
  const cm = useCardMotion("cover");

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

  useEffect(() => { cm.pos.set(toPos(p.get())); }, [cm.pos, p]);
  useMotionValueEvent(p, "change", (v) => {
    cm.pos.set(toPos(v));
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
  // mặt trước (có tem + tên người nhận) xoay đi ở đầu, để lộ mặt sau có nắp và dấu sáp
  const sealDone = useMotionValue(1);   // dấu sáp đã đóng xong (trạng thái của studio)
  const frontRot = useTransform(p, [0, 0.07], [0, -90], E);
  const frontOpacity = useTransform(p, [0.05, 0.07], [1, 0]);
  const sealOpacity = useTransform(p, [0.03, 0.08], [1, 0]);

  /* thiệp rút ra */
  const cardY = useTransform(p, [0, 0.2, 0.42, 0.54, 1], ["-48.5%", "-48.5%", "-133%", "-53%", "-53%"], E);
  const cardScale = useTransform(p, [0, 0.1, 0.42, 0.54, 1], [0.855, 0.95, 0.95, 1.05, 1.05], E);
  const cardRotZ = useTransform(p, [0, 0.42, 0.54, 1], [-90, -90, 0, 0], E);
  const cardRotY = useTransform(p, RY_STOPS, RY_VALS, E);
  const cardRotX = useTransform(p, RX_STOPS, RX_VALS, E);
  const cardZ = useTransform(p, [0, 0.415, 0.43, 1], [2, 2, 40, 40]);

  const shX = useTransform(sx, [-1, 1], [18, -18]);
  const shY = useTransform(p, [0.42, 0.54], [22, 46]);
  const shBlur = useTransform(p, [0.42, 0.54], [38, 70]);
  const shAlpha = useTransform(p, [0.3, 0.5], [0, 0.5]);
  const shadow = useMotionTemplate`${shX}px ${shY}px ${shBlur}px -28px rgba(30,45,100,${shAlpha}), 0 1px 2px rgba(30,45,100,0.18)`;
  const gx = useTransform(sx, [-1, 1], [15, 85]);
  const gy = useTransform(sy, [-1, 1], [10, 90]);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.5), rgba(255,255,255,0) 55%)`;
  const glareOpacity = useTransform(p, [0.54, 0.6], [0, 1]);

  const blobAX = useTransform([sx, side], ([m, s]: number[]) => m * 24 - s * 70);
  const blobAY = useTransform(p, [0, 1], ["0vh", "-16vh"]);
  const blobBX = useTransform([sx, side], ([m, s]: number[]) => m * -20 - s * 40);
  const blobBY = useTransform(p, [0, 1], ["0vh", "12vh"]);
  const railScale = useTransform(p, [0, 1], [0, 1]);
  const hintOpacity = useTransform(p, [0, 0.04], [1, 0]);
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
    <section ref={containerRef} className={`relative h-[700vh] ${FONT_VARS}`} style={{ background: BG }}>
      <motion.div className="sticky top-0 h-[100svh] w-full" style={{ opacity: exitOpacity, y: exitY }}>
        <div
          ref={stageRef}
          className="relative h-full w-full overflow-hidden"
          style={{ ...vars, background: BG }}
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

          {/* SÂN KHẤU 3D (bố cục như ImmersiveScrollHero) */}
          <div className="absolute inset-0" style={{ perspective: 1400 }}>
            <motion.div className="absolute inset-0" style={{ rotateX: stageRotX, rotateY: tiltY, transformStyle: "preserve-3d" }}>
              <motion.div className="absolute inset-0" style={{ x: rigX, y: rigY, z: rigZ, rotateY: yaw, transformStyle: "preserve-3d" }}>
                {/* phong bì - lưng */}
                <EnvLayer y={envY} scale={envScale} opacity={envOpacity} z={envPush}>
                  <div className="absolute inset-0 rounded-[4px]" style={{ background: `linear-gradient(180deg, rgba(0,0,0,.22), transparent 42%), ${liner}`, boxShadow: "0 40px 70px -28px rgba(0,0,0,.25)" }} />
                </EnvLayer>

                {/* thiệp = FoldingCard của studio */}
                <motion.div
                  className="absolute left-1/2 top-[54%]"
                  style={{ width: "var(--cw)", height: "calc(var(--cw) * 1.4)", x: "-50%", y: cardY, scale: cardScale, rotateX: cardRotX, rotateY: cardRotY, rotateZ: cardRotZ, z: cardZ }}
                >
                  <motion.div className="h-full w-full" style={{ y: floatY, rotateZ: floatRot }}>
                    <motion.div className="relative h-full w-full" style={{ scale: focusK, x: focusX, y: focusY, boxShadow: shadow, ["--k" as string]: focusK } as MotionStyle}>
                      <FoldingCard cm={cm} view="cover" editable={false} />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* phong bì - mặt sau: thân (màu phong bì) */}
                <EnvLayer y={envY} scale={envScale} opacity={envOpacity} z={envZFront}>
                  <Tri clip="polygon(0 0, 50% 62%, 0 100%)" bg={`linear-gradient(90deg, rgba(0,0,0,.10), transparent), ${envColor}`} />
                  <Tri clip="polygon(100% 0, 50% 62%, 100% 100%)" bg={`linear-gradient(270deg, rgba(0,0,0,.10), transparent), ${envColor}`} />
                  <Tri clip="polygon(0 100%, 50% 62%, 100% 100%)" bg={`linear-gradient(180deg, rgba(255,255,255,.12), transparent), ${envColor}`} />
                </EnvLayer>

                {/* mặt trước phong bì: tem + tên người nhận (xoay đi khi mở đầu) */}
                <EnvLayer y={envY} scale={envScale} opacity={envOpacity} z={30}>
                  <motion.div className="absolute inset-0 rounded-[4px] overflow-hidden" style={{ rotateY: frontRot, opacity: frontOpacity, transformOrigin: "left center", transformStyle: "preserve-3d", background: `linear-gradient(180deg, rgba(255,255,255,.16), transparent 40%), ${envColor}`, boxShadow: "0 40px 70px -28px rgba(0,0,0,.35)", ...HIDE_BACK }}>
                    <div className="absolute right-[6%] top-[6%]" style={{ width: "calc(var(--cw) * 0.2)", height: "calc(var(--cw) * 0.24)" }}>
                      <Stamp id={stampId} />
                    </div>
                    <div className="absolute left-1/2 top-[58%] -translate-x-1/2 whitespace-nowrap" style={{ ...fs(0.05), fontFamily: SERIF, color: INK }}>
                      {recipientName}
                    </div>
                  </motion.div>
                </EnvLayer>

                {/* nắp phong bì: mặt ngoài = màu thiết kế, mặt trong = lớp lót */}
                <EnvLayer y={envY} scale={envScale} opacity={envOpacity} z={flapZ}>
                  <motion.div className="absolute inset-0" style={{ rotateX: flapRot, transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}>
                    <Tri clip={FLAP_CLIP} bg={`linear-gradient(180deg, rgba(255,255,255,.18), transparent), ${envColor}`} face="front" />
                    <Tri clip={FLAP_CLIP} bg={liner} face="back" />
                    <motion.div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: "55%", width: "calc(var(--cw) * 0.22)", height: "calc(var(--cw) * 0.22)", opacity: sealOpacity, filter: "drop-shadow(0 5px 6px rgba(90,10,30,.45))", ...HIDE_BACK }}>
                      <WaxSeal p={sealDone} color={CRIMSON} />
                    </motion.div>
                  </motion.div>
                </EnvLayer>
              </motion.div>
            </motion.div>
          </div>

          <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[35svh]" style={{ opacity: blendOpacity, background: `linear-gradient(to bottom, rgba(255,252,246,0), ${BG} 90%)` }} />

          {CHAPTERS.map((c, i) => (
            <ChapterView key={i} chapter={c} progress={p} first={i === 0} last={i === CHAPTERS.length - 1} />
          ))}

          <motion.div style={{ opacity: hintOpacity, color: "#6B6880" }} className="absolute bottom-[5svh] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest">Cuộn để mở thiệp</span>
            <ArrowDown className="size-5 animate-bounce" style={{ color: CRIMSON }} />
          </motion.div>

          <nav aria-label="Các chương" className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 md:block">
            <div className="relative h-44 w-px" style={{ background: "rgba(255,255,255,.25)" }}>
              <motion.div style={{ scaleY: railScale, background: CRIMSON }} className="h-full w-full origin-top" />
              {CHAPTERS.map((c, i) => (
                <button key={i} type="button" onClick={() => goTo(i)} aria-label={c.eyebrow} aria-current={active === i ? "step" : undefined} className="absolute -left-[7px] grid size-[15px] -translate-y-1/2 place-items-center rounded-full" style={{ top: `${c.range[0] * 100}%` }}>
                  <span className="block rounded-full transition-all duration-300" style={{ width: active === i ? 10 : 6, height: active === i ? 10 : 6, background: i <= active ? CRIMSON : "rgba(255,255,255,.5)" }} />
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
/*  Chữ theo chương (dữ liệu lấy từ thông tin sự kiện)                  */
/* ------------------------------------------------------------------ */
type Chapter = {
  range: [number, number];
  side: "center" | "left" | "right";
  eyebrow: string;
  lines: { text: string; accent?: boolean }[];
  cta?: { label: string; href: string };
};

function buildChapters(info: IntroInfo): Chapter[] {
  const join = (...xs: string[]) => xs.filter((x) => x && x.trim()).join(" · ");
  return [
    { range: [0, 0.11], side: "center", eyebrow: info.host || "Trân trọng kính mời", lines: [{ text: info.title }] },
    { range: [0.13, 0.4], side: "left", eyebrow: "Một lời mời", lines: [{ text: info.description || "Rất mong được đón tiếp bạn." }] },
    { range: [0.43, 0.64], side: "right", eyebrow: "Thời gian", lines: [{ text: join(info.time, info.date) || "Đang cập nhật" }] },
    { range: [0.66, 0.89], side: "left", eyebrow: "Địa điểm", lines: [{ text: join(info.venue, info.address) || "Đang cập nhật" }] },
    { range: [0.91, 1], side: "right", eyebrow: "Đến lượt bạn", lines: [{ text: "Xác nhận tham dự ngay bên dưới." }], cta: { label: "Xác nhận", href: "#rsvp-title" } },
  ];
}

const POS: Record<Chapter["side"], string> = {
  center: "inset-x-0 top-[8svh] items-center text-center",
  left: "inset-x-0 bottom-[5svh] items-center text-center md:inset-x-auto md:bottom-auto md:left-[6vw] md:top-0 md:h-full md:w-[40vw] md:items-start md:justify-center md:px-0 md:text-left",
  right: "inset-x-0 bottom-[5svh] items-center text-center md:inset-x-auto md:bottom-auto md:left-auto md:right-[8vw] md:top-0 md:h-full md:w-[36vw] md:items-start md:justify-center md:px-0 md:text-left",
};

const OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const MASK_PAD: CSSProperties = { padding: "0.22em 0.06em 0.16em", margin: "-0.22em -0.06em -0.16em" };

function ChapterView({ chapter, progress, first, last }: { chapter: Chapter; progress: MotionValue<number>; first: boolean; last: boolean }) {
  const [s, e] = chapter.range;
  const centered = chapter.side === "center";
  let n = 1;
  const lines = chapter.lines.map((l) => ({ ...l, words: l.text.split(" ").map((w) => ({ w, order: n++ })) }));
  const total = n + (chapter.cta ? 1 : 0);
  const pointerEvents = useTransform(progress, (v): "auto" | "none" => (v >= s + 0.02 && (last || v <= e) ? "auto" : "none"));
  const common = { progress, range: chapter.range, count: total, first, last, mount: first } as const;

  return (
    <motion.div style={{ pointerEvents }} className={`absolute z-20 flex flex-col px-5 ${POS[chapter.side]}`}>
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
            <a href={chapter.cta.href} className="rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ background: CRIMSON }}>{chapter.cta.label}</a>
          </div>
        </Reveal>
      )}
    </motion.div>
  );
}

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

/* ------------------------------------------------------------------ */
/*  Phong bì (hình học như ImmersiveScrollHero, màu/lớp lót/tem từ thiết kế) */
/* ------------------------------------------------------------------ */
const FLAP_CLIP = "polygon(0 0, 100% 0, 50% 62%)";

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


