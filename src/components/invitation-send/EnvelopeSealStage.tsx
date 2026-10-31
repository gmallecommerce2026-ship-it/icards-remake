"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animate, cubicBezier, motion, useMotionValue, useTransform, type AnimationPlaybackControls, type MotionValue } from "motion/react";
import { ArrowDown, ChevronLeft } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Hiệu ứng "gói thiệp" chạy THEO THỜI GIAN (không cần cuộn), cùng kỹ   */
/*  thuật lớp / trục z như ImmersiveScrollHero:                         */
/*   1) thiệp dọc xoay NGANG ngay tại chỗ                               */
/*   2) thiệp nhấc lên, phong bì (nắp đang mở) trồi lên từ dưới         */
/*   3) thiệp trượt xuống, nằm VỪA KHÍT trong phong bì                  */
/*   4) nắp gập xuống, che DẦN thiệp từ mép trên xuống mũi nắp          */
/*  Thiệp luôn opacity 1 - chỉ bị che bởi chính mảnh phong bì phủ lên.   */
/* ------------------------------------------------------------------ */

const CRIMSON = "#A3152F";
const INK = "#1D1B2A";
const MUTED = "#6B6880";
const STAGE_BG = "#F8F8FB";

const EASE = cubicBezier(0.45, 0, 0.25, 1);
const E = { ease: EASE };
const SETTLE = cubicBezier(0.2, 0.6, 0.4, 1);
const HIDE_BACK: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

/** mũi nắp chạm tới 62% chiều cao phong bì - cũng là đỉnh chữ V của miệng túi */
const FLAP_CLIP = "polygon(0 0, 100% 0, 50% 62%)";
const MOUTH = 0.62;

const TOTAL_SECONDS = 6.2;
/** phong bì lớn hơn thiệp (khi nằm ngang) đúng chừng này, tính theo chiều rộng thiệp dọc. 0.06 = hở mỗi mép 3% */
const PAD = 0.06;

type Range = [number, number];
/** các mốc tiến độ 0 → 1 của từng đoạn. Muốn nhanh / chậm từng đoạn chỉ sửa ở đây */
const T: Record<"rotate" | "lift" | "envIn" | "insert" | "flap", Range> = {
  rotate: [0.05, 0.26], // thiệp xoay ngang + thu về cỡ thật
  lift: [0.14, 0.3], // thiệp nhấc lên phía trên miệng phong bì
  envIn: [0.2, 0.44], // phong bì (đang mở nắp) trồi lên từ dưới, nằm ngay dưới thiệp
  insert: [0.46, 0.62], // thiệp trượt xuống, nằm gọn trong phong bì
  flap: [0.64, 0.93], // nắp gập xuống che dần thiệp (~1.8s: mở miệng chữ V → khép kín từ trên xuống)
};

const u = (n: number) => `calc(var(--cw) * ${n})`;

/* ---------- màu phong bì suy ra từ màu người dùng chọn ---------- */
function mix(a: string, b: string, t: number) {
  const f = (h: string) => {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const A = f(a);
  const B = f(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
const lighten = (c: string, t: number) => mix(c, "#ffffff", t);
const darken = (c: string, t: number) => mix(c, "#000000", t);

export type EnvelopeSealStageProps = {
  /** mặt thiệp (đặt sẵn `absolute inset-0`, tỉ lệ 5:7) - thường là <CardFaceStatic /> */
  children: ReactNode;
  /** tỉ lệ cao / rộng của thiệp. Phong bì tự khít theo tỉ lệ này */
  cardAspect?: number;
  /** màu phong bì (hex 6 ký tự) */
  envelopeColor?: string;
  /** giá trị CSS background của lớp lót (mặt trong nắp + lòng phong bì) */
  liner?: string;
  /** đổi số này để chạy lại hiệu ứng */
  runKey?: number;
  /** gọi ~0.5s sau khi nắp đóng xong: nơi để tự cuộn xuống phần cấu hình */
  onSealed?: () => void;
  onBack?: () => void;
};

export function EnvelopeSealStage({
  children,
  cardAspect = 1.4,
  envelopeColor = "#f6dfd4",
  liner = "linear-gradient(180deg,#B3243F,#8A1730)",
  runKey = 0,
  onSealed,
  onBack,
}: EnvelopeSealStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const sealedCb = useRef(onSealed);
  const ctl = useRef<AnimationPlaybackControls | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [done, setDone] = useState(false);

  useEffect(() => {
    sealedCb.current = onSealed;
  }, [onSealed]);

  const p = useMotionValue(0);
  const vhMV = useMotionValue(800);
  const cwMV = useMotionValue(300);

  /* ---------- HÌNH HỌC: phong bì khít theo thiệp ---------- */
  const W = Math.max(cardAspect, 1); // cạnh dài của thiệp khi NẰM NGANG (đơn vị = --cw)
  const H = Math.min(cardAspect, 1) || 1; // cạnh ngắn
  const envW = W + PAD;
  const envH = H + PAD;
  // thiệp nhấc lên: ~65% chiều cao thiệp nhô khỏi miệng phong bì
  const liftY = -(envH / 2 + 0.15 * H);
  // cả cụm (nắp mở + thiệp nhô lên) cao hơn phong bì nên "máy quay" hạ xuống để cụm luôn nằm giữa khung
  const topExt = Math.min(-envH / 2 - MOUTH * envH, liftY - H / 2); // mép trên cùng của cả cụm, tính từ tâm phong bì
  const camShift = -(topExt + envH / 2) / 2;

  const tone = useMemo(
    () => ({
      left: `linear-gradient(90deg, ${lighten(envelopeColor, 0.02)}, ${lighten(envelopeColor, 0.1)})`,
      right: `linear-gradient(270deg, ${lighten(envelopeColor, 0.02)}, ${lighten(envelopeColor, 0.1)})`,
      bottom: `linear-gradient(180deg, ${lighten(envelopeColor, 0.14)}, ${lighten(envelopeColor, 0.03)})`,
      flap: `linear-gradient(180deg, ${lighten(envelopeColor, 0.12)}, ${envelopeColor})`,
      body: darken(envelopeColor, 0.14),
    }),
    [envelopeColor],
  );

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
  const finish = useCallback(() => {
    setDone(true);
    timer.current = setTimeout(() => sealedCb.current?.(), 500);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDone(false);
    p.set(0);
    ctl.current = animate(p, 1, { duration: TOTAL_SECONDS, ease: "linear", onComplete: finish });
    return () => {
      ctl.current?.stop();
      clearTimeout(timer.current);
    };
  }, [runKey, p, finish]);

  /** chạy nốt phần còn lại thật nhanh (không nhảy cóc) */
  const skip = () => {
    ctl.current?.stop();
    ctl.current = animate(p, 1, { duration: 0.8, ease: "easeOut", onComplete: finish });
  };

  /* ---------- THIỆP ---------- */
  const rotZ = useTransform(p, T.rotate, [0, cardAspect >= 1 ? -90 : 0], E);
  const cardScale = useTransform(p, T.rotate, [1.25, 1], E);
  const cardYu = useTransform(p, [0, T.lift[0], T.lift[1], T.insert[0], T.insert[1], 1], [0, 0, liftY, liftY, 0, 0], E);
  const cardY = useTransform([cardYu, cwMV], ([k, c]: number[]) => k * c);
  // thiệp nghiêng nhẹ khi nhấc lên cho có chiều sâu
  const cardTilt = useTransform(p, [T.lift[0], (T.lift[0] + T.lift[1]) / 2, T.lift[1]], [0, -10, 0]);

  /* ---------- MÁY QUAY ---------- */
  const cam = useTransform([p, cwMV], ([v, c]: number[]) => {
    const a = Math.min(1, Math.max(0, (v - T.lift[0]) / (T.envIn[1] - T.lift[0])));
    const e = a * a * (3 - 2 * a);
    return e * camShift * c;
  });

  /* ---------- PHONG BÌ ---------- */
  const envK = useTransform(p, [0, T.envIn[0], T.envIn[1], 1], [1, 1, 0, 0], E);
  const envY = useTransform([envK, vhMV, cwMV], ([k, vh, c]: number[]) => k * (vh * 0.55 + (envH * c) / 2 + 40));
  // nắp: 180° (mở, nằm ngửa phía trên) → 0° (đóng). Đi đều tay (mềm đầu, mềm cuối) để thấy rõ nắp phủ DẦN lên thiệp,
  // rồi chạm thân phong bì và nảy nhẹ một nhịp
  const [f0, f1] = T.flap;
  const d = f1 - f0;
  const flapRot = useTransform(p, [f0, f0 + 0.78 * d, f0 + 0.9 * d, f1], [180, 0, 5, 0], { ease: [EASE, SETTLE, EASE] });
  // Nắp đang mở nằm DƯỚI thiệp (z=1 < 2) để thiệp trượt qua; chỉ khi bắt đầu gập mới lên TRÊN mọi thứ (z=5).
  // Lúc đó thiệp đã nằm gọn dưới mép trên phong bì, không chạm vào nắp nên bước nhảy này không nhìn thấy được.
  const flapZ = useTransform(p, (v): number => (v < f0 - 0.005 ? 1 : 5));
  // bóng của nắp đổ lên thiệp: đậm dần khi nắp sát xuống
  const flapShade = useTransform(p, [f0 + 0.45 * d, f1], [0, 0.22]);

  return (
    <div
      ref={stageRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: STAGE_BG, ["--cw" as string]: "min(46vw, 380px, 37svh)" } as CSSProperties}
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
        <motion.div className="absolute inset-0" style={{ y: cam, transformStyle: "preserve-3d" }}>
          {/* 1. Phong bì - lưng: lòng phong bì là lớp lót, chỉ lộ ra qua miệng túi */}
          <EnvLayer w={envW} h={envH} y={envY} z={0}>
            <div
              className="absolute inset-0 rounded-[4px]"
              style={{
                background: liner,
                boxShadow: "0 40px 70px -28px rgba(40,30,60,.5)",
                outline: `1px solid ${darken(envelopeColor, 0.18)}`,
              }}
            />
          </EnvLayer>

          {/* 2. Thiệp - nằm giữa lưng và mặt trước phong bì, luôn opacity 1 */}
          <motion.div
            className="absolute left-1/2"
            style={{
              top: "50%",
              width: u(1),
              height: u(cardAspect),
              marginLeft: u(-0.5),
              marginTop: u(-cardAspect / 2),
              y: cardY,
              scale: cardScale,
              rotateZ: rotZ,
              rotateX: cardTilt,
              z: 2,
            }}
          >
            <div
              className="relative h-full w-full overflow-hidden rounded-[3px]"
              style={{ boxShadow: "0 18px 40px -18px rgba(30,45,100,.5), 0 1px 2px rgba(30,45,100,.25)" }}
            >
              {children}
              {/* bóng của nắp đang sập xuống */}
              <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: flapShade, background: "#000" }} />
            </div>
          </motion.div>

          {/* 3. Phong bì - mặt trước (3 mảnh tam giác lấp kín phần dưới, chừa miệng túi hình chữ V) */}
          <EnvLayer w={envW} h={envH} y={envY} z={3}>
            <Piece clip="polygon(0 0, 50% 62%, 0 100%)" bg={tone.left} />
            <Piece clip="polygon(100% 0, 50% 62%, 100% 100%)" bg={tone.right} />
            <Piece clip="polygon(0 100%, 50% 62%, 100% 100%)" bg={tone.bottom} shadow="drop-shadow(0 -2px 3px rgba(0,0,0,.18))" />
          </EnvLayer>

          {/* 4. Nắp phong bì: gập từ 180° về 0° quanh mép trên */}
          <EnvLayer w={envW} h={envH} y={envY} z={flapZ}>
            <motion.div className="absolute inset-0" style={{ rotateX: flapRot, transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}>
              <Tri clip={FLAP_CLIP} bg={tone.flap} face="front" />
              <Tri clip={FLAP_CLIP} bg={liner} face="back" />
            </motion.div>
          </EnvLayer>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[6svh] z-20 flex flex-col items-center gap-2 text-center" style={{ color: MUTED }}>
        <p className="text-base italic" style={{ fontFamily: "var(--ev-serif), 'Cormorant Garamond', serif" }} aria-live="polite">
          {done ? "Đã gói xong thiệp" : "Đang gói thiệp của bạn…"}
        </p>
        {done ? (
          <ArrowDown className="size-5 animate-bounce" style={{ color: CRIMSON }} />
        ) : (
          <button
            type="button"
            onClick={skip}
            className="pointer-events-auto rounded-full px-3 py-1 text-xs font-semibold underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: INK, outlineColor: CRIMSON }}
          >
            Bỏ qua
          </button>
        )}
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
        top: "50%",
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

/** Một mảnh mặt trước. Bóng đổ đặt ở lớp ngoài vì clip-path sẽ cắt mất bóng của chính nó. */
function Piece({ clip, bg, shadow }: { clip: string; bg: string; shadow?: string }) {
  return (
    <div className="absolute inset-0" style={{ filter: shadow }}>
      <div className="absolute inset-0" style={{ clipPath: clip, background: bg }} />
    </div>
  );
}

function Tri({ clip, bg, face }: { clip: string; bg: string; face: "front" | "back" }) {
  // "back" = mặt trong của nắp: tự lật 180° quanh trục dọc nên chỉ thấy được khi nắp đang dựng lên
  const faceStyle: CSSProperties = face === "back" ? { ...HIDE_BACK, transform: "rotateY(180deg)" } : HIDE_BACK;
  return <div className="absolute inset-0" style={{ clipPath: clip, background: bg, ...faceStyle }} />;
}
