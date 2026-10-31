"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animate, cubicBezier, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { ArrowDown, ChevronLeft } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Hiệu ứng "gói thiệp" chạy THEO THỜI GIAN (không cần cuộn):          */
/*  thiệp dọc → xoay ngang → phong bì trồi lên → thiệp trượt vào vừa    */
/*  khít → nắp phong bì gập xuống che dần thiệp → dấu sáp đóng lại.     */
/*  Dùng lại đúng kỹ thuật lớp/z của ImmersiveScrollHero.               */
/* ------------------------------------------------------------------ */

const CRIMSON = "#A3152F";
const INK = "#1D1B2A";
const MUTED = "#6B6880";
const STAGE_BG = "#F8F8FB";
const HAN = "'Songti SC','Noto Serif CJK SC','Source Han Serif SC','SimSun','Microsoft YaHei',serif";

const EASE = cubicBezier(0.45, 0, 0.25, 1);
const E = { ease: EASE };
const HIDE_BACK: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

const FLAP_CLIP = "polygon(0 0, 100% 0, 50% 62%)";
const LINER =
  "repeating-linear-gradient(45deg, rgba(240,214,160,.18) 0 1px, transparent 1px 9px)," +
  "repeating-linear-gradient(-45deg, rgba(240,214,160,.18) 0 1px, transparent 1px 9px)," +
  "linear-gradient(180deg,#B3243F,#8A1730)";

const TOTAL_SECONDS = 5.2;
/** phong bì rộng hơn thiệp (khi nằm ngang) đúng chừng này, tính theo chiều rộng thiệp. 0.07 = hở mỗi mép ~3.5% */
const PAD = 0.07;

type Range = [number, number];
/** các mốc tiến độ 0 → 1 của từng đoạn. Muốn nhanh/chậm từng đoạn chỉ sửa ở đây */
const T: Record<"rotate" | "envIn" | "lift" | "insert" | "flap" | "seal", Range> = {
  rotate: [0.08, 0.3], // thiệp xoay ngang + thu nhỏ
  envIn: [0.12, 0.38], // phong bì (đang mở nắp) trồi lên từ dưới
  lift: [0.24, 0.4], // thiệp nhấc lên phía trên miệng phong bì
  insert: [0.46, 0.66], // thiệp trượt xuống, nằm gọn trong phong bì
  flap: [0.7, 0.86], // nắp gập xuống
  seal: [0.86, 0.93], // dấu sáp đóng
};

const u = (n: number) => `calc(var(--cw) * ${n})`;

export type EnvelopeSealStageProps = {
  /** ảnh chụp thiệp (ví dụ canvas.toDataURL / html-to-image). Hoặc truyền children để tự vẽ mặt thiệp */
  cardImage?: string;
  children?: ReactNode;
  /** tỉ lệ cao / rộng của thiệp (canvasHeight / canvasWidth). Phong bì tự khít theo tỉ lệ này */
  cardAspect?: number;
  /** đổi số này để chạy lại hiệu ứng */
  runKey?: number;
  sealGlyph?: string;
  /** gọi ~0.5s sau khi dấu sáp đóng xong: nơi để tự cuộn xuống phần cấu hình */
  onSealed?: () => void;
  onBack?: () => void;
};

export function EnvelopeSealStage({
  cardImage,
  children,
  cardAspect = 1.33,
  runKey = 0,
  sealGlyph = "囍",
  onSealed,
  onBack,
}: EnvelopeSealStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const sealedCb = useRef(onSealed);
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);

  useEffect(() => {
    sealedCb.current = onSealed;
  }, [onSealed]);

  const p = useMotionValue(0);
  const vhMV = useMotionValue(800);
  const cwMV = useMotionValue(300);

  /* ---------- HÌNH HỌC: phong bì khít theo thiệp ---------- */
  const portrait = cardAspect >= 1;
  const W = portrait ? cardAspect : 1; // kích thước thiệp khi NẰM NGANG (đơn vị = --cw)
  const H = portrait ? 1 : cardAspect;
  const envW = W + PAD;
  const envH = H + PAD;
  // thiệp nhấc lên: chừa ~65% chiều cao thiệp nhô khỏi miệng phong bì
  const liftY = -(envH / 2 + 0.15 * H);

  useEffect(() => {
    const stage = stageRef.current;
    const probe = probeRef.current;
    if (!stage || !probe) return;
    const measure = () => {
      vhMV.set(stage.clientHeight);
      cwMV.set(probe.offsetWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    ro.observe(probe);
    return () => ro.disconnect();
  }, [vhMV, cwMV]);

  /* ---------- CHẠY HIỆU ỨNG ---------- */
  useEffect(() => {
    setDone(false);
    p.set(0);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (reduce) {
      p.set(1);
      setDone(true);
      timer = setTimeout(() => sealedCb.current?.(), 400);
      return () => clearTimeout(timer);
    }
    const controls = animate(p, 1, {
      duration: TOTAL_SECONDS,
      ease: "linear",
      onComplete: () => {
        setDone(true);
        timer = setTimeout(() => sealedCb.current?.(), 500);
      },
    });
    return () => {
      controls.stop();
      if (timer) clearTimeout(timer);
    };
  }, [runKey, reduce, p]);

  /* ---------- THIỆP ---------- */
  const rotZ = useTransform(p, T.rotate, [0, portrait ? -90 : 0], E);
  const cardScale = useTransform(p, T.rotate, [1.3, 1], E);
  const cardYu = useTransform(p, [0, T.lift[0], T.lift[1], T.insert[0], T.insert[1], 1], [0, 0, liftY, liftY, 0, 0], E);
  const cardY = useTransform([cardYu, cwMV], ([k, c]: number[]) => k * c);

  /* ---------- PHONG BÌ ---------- */
  const envK = useTransform(p, [0, T.envIn[0], T.envIn[1], 1], [1, 1, 0, 0], E);
  const envY = useTransform([envK, vhMV, cwMV], ([k, vh, c]: number[]) => k * (vh * 0.5 + (envH * c) / 2 + 40));
  const flapRot = useTransform(p, T.flap, [180, 0], E);
  // Nắp đang mở nằm DƯỚI thiệp (z=1 < 2) để thiệp trượt qua; chỉ khi bắt đầu gập mới nhảy lên TRÊN thiệp (z=5).
  // Lúc đó thiệp đã nằm gọn trong phong bì nên bước nhảy này không nhìn thấy được.
  const flapZ = useTransform(p, (v): number => (v < T.flap[0] - 0.01 ? 1 : 5));
  const sealOpacity = useTransform(p, [T.seal[0], T.seal[0] + 0.015], [0, 1]);
  const sealScale = useTransform(p, [T.seal[0], 0.9, T.seal[1]], [1.8, 0.92, 1]);

  return (
    <div
      ref={stageRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: STAGE_BG, ["--cw" as string]: "min(46vw, 340px, 34svh)" } as CSSProperties}
    >
      <div ref={probeRef} aria-hidden className="pointer-events-none absolute left-0 top-0 h-px opacity-0" style={{ width: "var(--cw)" }} />

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute left-4 top-4 z-20 flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ color: INK, outlineColor: CRIMSON }}
        >
          <ChevronLeft className="size-4" /> Quay lại thiết kế
        </button>
      )}

      <div className="absolute inset-0" style={{ perspective: 1400 }}>
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {/* 1. Phong bì - lưng */}
          <EnvLayer w={envW} h={envH} y={envY} z={0}>
            <div
              className="absolute inset-0 rounded-[4px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(110,40,65,.30), transparent 42%), linear-gradient(160deg,#EBD5DA,#E1C6CD)",
                boxShadow: "0 40px 70px -28px rgba(120,50,75,.45)",
              }}
            />
          </EnvLayer>

          {/* 2. Thiệp - luôn opacity 1, chỉ bị che bởi mặt trước phong bì + nắp khi chúng thật sự phủ lên */}
          <motion.div
            className="absolute left-1/2"
            style={{
              top: "55%",
              width: u(1),
              height: u(cardAspect),
              marginLeft: u(-0.5),
              marginTop: u(-cardAspect / 2),
              y: cardY,
              scale: cardScale,
              rotateZ: rotZ,
              z: 2,
            }}
          >
            <div
              className="h-full w-full overflow-hidden rounded-[3px] bg-white"
              style={{ boxShadow: "0 18px 40px -18px rgba(30,45,100,.45), 0 1px 2px rgba(30,45,100,.2)" }}
            >
              {children ??
                (cardImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cardImage} alt="" draggable={false} className="h-full w-full object-cover" />
                ) : null)}
            </div>
          </motion.div>

          {/* 3. Phong bì - mặt trước (3 mảnh tam giác lấp kín phần dưới) */}
          <EnvLayer w={envW} h={envH} y={envY} z={3}>
            <Tri clip="polygon(0 0, 50% 62%, 0 100%)" bg="linear-gradient(90deg,#F2E2E6,#F6E9EC)" />
            <Tri clip="polygon(100% 0, 50% 62%, 100% 100%)" bg="linear-gradient(270deg,#F2E2E6,#F6E9EC)" />
            <Tri clip="polygon(0 100%, 50% 62%, 100% 100%)" bg="linear-gradient(180deg,#FBF1F3,#F3E3E7)" />
          </EnvLayer>

          {/* 4. Nắp phong bì: gập từ 180° về 0° quanh mép trên */}
          <EnvLayer w={envW} h={envH} y={envY} z={flapZ}>
            <motion.div
              className="absolute inset-0"
              style={{ rotateX: flapRot, transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}
            >
              <Tri clip={FLAP_CLIP} bg="linear-gradient(180deg,#F8ECEF,#F1DFE4)" face="front" />
              <Tri clip={FLAP_CLIP} bg={LINER} face="back" />
              <Seal glyph={sealGlyph} opacity={sealOpacity} scale={sealScale} />
            </motion.div>
          </EnvLayer>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-[6svh] z-20 flex flex-col items-center gap-2 text-center"
        style={{ color: MUTED }}
      >
        <p className="text-base italic" style={{ fontFamily: "var(--ev-serif), 'Cormorant Garamond', serif" }} aria-live="polite">
          {done ? "Thiệp đã được niêm phong" : "Đang gói thiệp của bạn…"}
        </p>
        {done && <ArrowDown className="size-5 animate-bounce" style={{ color: CRIMSON }} />}
      </div>
    </div>
  );
}

function EnvLayer({
  children,
  w,
  h,
  y,
  z,
}: {
  children: ReactNode;
  w: number;
  h: number;
  y: MotionValue<number>;
  z: number | MotionValue<number>;
}) {
  return (
    <motion.div
      className="absolute left-1/2"
      style={{
        top: "55%",
        width: u(w),
        height: u(h),
        marginLeft: u(-w / 2),
        marginTop: u(-h / 2),
        y,
        z,
        perspective: 1200,
      }}
    >
      {children}
    </motion.div>
  );
}

function Tri({ clip, bg, face }: { clip: string; bg: string; face?: "front" | "back" }) {
  // "back" = mặt trong của nắp: tự lật 180° nên chỉ thấy được khi nắp đang dựng lên
  const faceStyle: CSSProperties =
    face === "back" ? { ...HIDE_BACK, transform: "rotateY(180deg)" } : face === "front" ? HIDE_BACK : {};
  return <div className="absolute inset-0" style={{ clipPath: clip, background: bg, ...faceStyle }} />;
}

function Seal({ glyph, opacity, scale }: { glyph: string; opacity: MotionValue<number>; scale: MotionValue<number> }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        top: "55%",
        width: u(0.2),
        height: u(0.2),
        filter: "drop-shadow(0 5px 6px rgba(90,10,30,.45))",
        ...HIDE_BACK,
      }}
    >
      <motion.div
        className="grid h-full w-full place-items-center rounded-full"
        style={{
          opacity,
          scale,
          background: `radial-gradient(circle at 35% 30%, #D8405A, ${CRIMSON} 58%, #5E0A1C)`,
          boxShadow:
            "inset 0 0 0 2px rgba(255,255,255,.08), inset 0 -3px 6px rgba(60,0,15,.45), inset 0 3px 5px rgba(255,160,175,.35)",
          color: "#F1D9A6",
          fontFamily: HAN,
          fontSize: u(0.1),
        }}
      >
        {glyph}
      </motion.div>
    </div>
  );
}
