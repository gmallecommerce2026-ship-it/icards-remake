"use client";

import { useRef, type ComponentType, type CSSProperties, type ReactNode, type RefObject } from "react";
import { cubicBezier, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTime, useTransform, useVelocity, type MotionValue } from "motion/react";
import type { HeroPreset, TemplateHero } from "@/lib/template-heroes";
import { CubeScene, BookScene, FanScene, FlowerScene, type SceneProps } from "./CategoryHeroScenes";

type Props = { hero: TemplateHero; categoryLabel: string };

/**
 * Hero 3D cho trang danh mục mẫu thiệp. Kiểu do admin chọn, nội dung do admin nhập.
 * Banner cao khoảng 3/4 màn hình (không ghim) để group filter bên dưới luôn lộ ra. Animation chạy theo tiến trình cuộn
 * khi banner đi qua đầu màn hình. Speed do admin đặt: từ 1 trở lên thì animation chạy nhanh hơn (dưới 1 coi như 1).
 * - envelope: phong bì lật lấy thiệp (EnvelopeHero).
 * - fan / book / flower / cube: các cảnh 3D trong CategoryHeroScenes.
 */
export function CategoryHero3D(props: Props) {
  const preset = props.hero.preset;
  if (preset === "envelope") return <EnvelopeHero {...props} />;
  const Scene = SCENES[preset as Exclude<HeroPreset, "envelope">];
  return <HeroSection {...props} Scene={Scene} />;
}

const SCENES: Record<Exclude<HeroPreset, "envelope">, ComponentType<SceneProps>> = {
  fan: FanScene,
  book: BookScene,
  flower: FlowerScene,
  cube: CubeScene,
};

/** Chiều cao banner (svh): để phần dưới màn hình cho group filter. */
export const HERO_HEIGHT = "75svh";

/** Tiến trình cuộn của banner: 0 khi banner nằm đầu màn hình, 1 khi đã đi qua hết. Speed nhân tiến trình, tối đa 1. */
export function useHeroProgress(ref: RefObject<HTMLElement | null>, speed: number) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const eased = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.7 }); // làm mượt như trước
  const k = Math.max(1, Number.isFinite(speed) ? speed : 1);
  return useTransform(eased, (v) => Math.min(1, v * k));
}

/** Khung banner dùng chung cho các kiểu mới: một cảnh, cao 75svh, không ghim. */
function HeroSection({ hero, categoryLabel, Scene }: Props & { Scene: ComponentType<SceneProps> }) {
  const ref = useRef<HTMLElement>(null);
  const p = useHeroProgress(ref, hero.speed);
  return (
    <section
      ref={ref}
      aria-label={`Giới thiệu danh mục ${categoryLabel}`}
      className="relative flex items-center justify-center overflow-hidden border-b border-black/5 px-5"
      style={{ height: HERO_HEIGHT, background: `linear-gradient(180deg, ${hero.accent}1f 0%, #FEFDFD 85%)` }}
    >
      <div className="w-full">
        <Scene p={p} reduce={false} hero={hero} categoryLabel={categoryLabel} />
      </div>
    </section>
  );
}

/* ====================== Phong bì: cảnh ghim + cuộn ====================== */


function EnvelopeHero({ hero, categoryLabel }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  // Cùng thông số làm mượt với trang xem thiệp mời (PublicEnvelopeIntro), và cùng cách tính tiến trình như các kiểu khác
  const p = useHeroProgress(ref, hero.speed);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const look = { x: useSpring(mx, { stiffness: 60, damping: 18 }), y: useSpring(my, { stiffness: 60, damping: 18 }) };
  const velocity = useSpring(useVelocity(p), { stiffness: 80, damping: 30 });
  const leanRaw = useTransform(velocity, [-1.2, 0, 1.2], [4, 0, -4]);
  const zero = useMotionValue(0);
  const lean = reduce ? zero : leanRaw;

  return (
    <section
      ref={ref}
      aria-label={`Giới thiệu danh mục ${categoryLabel}`}
      className="relative border-b border-black/5"
      style={{ height: HERO_HEIGHT, background: `linear-gradient(180deg, ${hero.accent}1f 0%, #FEFDFD 85%)` }}
    >
      <div
        className="flex h-full items-center justify-center overflow-hidden px-5"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || reduce) return;
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
      >
        <div className="w-full">
          <EnvelopeScene p={p} look={look} lean={lean} reduce={reduce} hero={hero} categoryLabel={categoryLabel} />
        </div>
      </div>
    </section>
  );
}

/* ---------- Phong bì 3D + thiệp cưới gấp đôi 4 mặt ----------
   Kịch bản (p = tiến độ cuộn, 0 → 1):
   0.00–0.04  phong bì kem ở giữa khung, MẶT TRƯỚC (tên + tem), nhấp nhô nhẹ, gợi ý "Cuộn để mở thiệp"
   0.04–0.17  phong bì nhấc lên gần camera, lật 180° để lộ MẶT SAU: nếp gấp chữ V, nắp đóng, dấu sáp
   0.17–0.24  đổi sang cảnh chi tiết (hai bên vẽ giống hệt nhau nên không giật); dấu sáp nảy lên rồi tan
   0.21–0.33  nắp lật mở
   0.27–0.43  thiệp (đang gập, bìa ngoài hướng ra) trượt lên khỏi phong bì
   0.42–0.52  phong bì rơi xuống và mờ dần
   0.50–0.62  thiệp nhấc lên, bay sang TRÁI (hơi xoay 3D); chữ giới thiệu hiện ở bên PHẢI
   0.68–0.78  thiệp bay sang PHẢI, xoay trọn một vòng (lộ MẶT 4 = bìa sau); chữ chuyển sang bên TRÁI
   0.80–0.86  thiệp về giữa khung
   0.86–0.95  bìa thiệp mở theo gáy bên trái: lộ MẶT 2 (nhà trai, nhà gái) và MẶT 3 (lời mời); bụi vàng + hào quang
   0.95–1.00  nghỉ ở cuối, gợi ý cuộn tiếp
   Bốn mặt: 1 bìa ngoài · 2 mặt trong bìa (trái) · 3 mặt trong (phải) · 4 bìa sau.
   Vị trí tính theo % chiều rộng sân khấu; kích thước dùng cqw để co giãn theo khung. */
const SWAP = 0.17; // lúc đổi từ "phong bì đang lật" sang "phong bì chi tiết"
const PW = 23; // chiều rộng một mặt thiệp (cqw)
const PH = 31; // chiều cao thiệp (cqw)
const ease = cubicBezier(0.45, 0.05, 0.2, 1);
const SERIF = "var(--font-display-raw), 'Cormorant Garamond', Georgia, serif";
const SCRIPT = "var(--font-card-script), 'Great Vibes', cursive";
const GOLD = "#c9a55c";
const mix = (a: string, pct: number, b: string) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;
const c01 = (x: number) => Math.min(1, Math.max(0, x));

/** Nội dung mẫu của thiệp (thay bằng dữ liệu thật của từng mẫu). */
const DEMO = {
  groom: "Hoàng Nam",
  bride: "Minh Anh",
  groomHouse: ["Ông Hoàng Văn Hùng", "Bà Nguyễn Thị Lan"],
  groomAddr: "Số 5, đường Lê Lợi",
  brideHouse: ["Ông Trần Quốc Bảo", "Bà Lê Thị Mai"],
  brideAddr: "Số 18, đường Phan Đình Phùng",
  time: "10 giờ 00",
  date: "Thứ Bảy, 20 . 12 . 2026",
  lunar: "Nhằm ngày 12 tháng 11 năm Bính Ngọ",
  venue: "Trung tâm Tiệc cưới Hoa Sen",
  venueAddr: "Số 12, đường Trần Phú",
};

const CREAM = "linear-gradient(160deg, #fbf6ec 0%, #f1e7d3 100%)";
const creamShade = (a: number) => `linear-gradient(${a}deg, #f6eddc 0%, #e9dcc3 100%)`;
const FLAP_BG = "linear-gradient(180deg, #fbf6ec 0%, #eadfc8 100%)";
const ENV_SHADOW = "0 1.4cqw 3cqw -1cqw rgba(0,0,0,0.45)";
/** Ba mảnh gấp chữ V ở mặt sau phong bì (dùng chung cho cảnh lật và cảnh chi tiết). Chồng nhẹ lên nhau để không hở đường may. */
const POCKET = [
  { clip: "polygon(0 0, 50.6% 54.5%, 0 100%)", bg: creamShade(100) },
  { clip: "polygon(100% 0, 49.4% 54.5%, 100% 100%)", bg: creamShade(80) },
  { clip: "polygon(-0.2% 100.2%, 50% 54%, 100.2% 100.2%)", bg: CREAM },
];
/** Nét gấp: chỉ vẽ hai cạnh bên, cạnh đáy và hai đường chéo chữ V. KHÔNG vẽ cạnh trên, vì khi nắp mở cạnh đó sẽ cắt ngang thiệp. */
const FOLD = (
  <>
    <path d="M0.06 0.06 L0.06 32.94 L47.94 32.94 L47.94 0.06" fill="none" stroke="rgba(120,90,50,0.28)" strokeWidth="0.12" />
    <path d="M0 0 L24 17.9 L48 0 M0 33 L24 17.9 L48 33" fill="none" stroke="rgba(120,90,50,0.3)" strokeWidth="0.12" />
  </>
);
const sealStyle = (accent: string): CSSProperties => ({
  width: "6.4cqw",
  height: "6.4cqw",
  background: `radial-gradient(circle at 35% 30%, ${mix(accent, 75, "#fff")}, ${accent} 55%, ${mix(accent, 60, "#000")})`,
  boxShadow: "0 0.5cqw 1cqw rgba(0,0,0,0.4), inset 0 0 0 0.45cqw rgba(255,255,255,0.14), inset 0 -0.3cqw 0.6cqw rgba(0,0,0,0.3)",
  color: "rgba(255,255,255,0.9)",
  fontFamily: SCRIPT,
  fontSize: "3.6cqw",
  lineHeight: 1,
});

type Look = { x: MotionValue<number>; y: MotionValue<number> };

function EnvelopeScene({ p, look, lean, reduce, hero, categoryLabel }: { p: MotionValue<number>; look: Look; lean: MotionValue<number>; reduce: boolean; hero: TemplateHero; categoryLabel: string }) {
  const accent = hero.accent;
  const title = hero.title || categoryLabel;
  const tr = (input: number[], output: number[]) => useTransform(p, input, output, { ease });
  const time = useTime();

  /* --- Giai đoạn 1: mặt trước → lật sang mặt sau (phong bì "đang lật" là một tấm hai mặt) --- */
  const flipEnv = tr([0.04, SWAP], [0, 180]);
  const flipZ = tr([0.04, 0.1, SWAP], [20, 170, 20]); // nhấc lại gần camera rồi hạ về đúng độ sâu của cảnh chi tiết
  const flipLift = tr([0.04, 0.1, SWAP], [0, 3, 0]);
  const flipRotZ = tr([0.04, 0.085, 0.13, SWAP], [0, -3.5, 2.5, 0]);
  const flipRotX = tr([0.04, 0.1, SWAP], [0, -8, 0]);
  const flipOpacity = useTransform(p, (v) => (v < SWAP ? 1 : 0));
  const asmOpacity = useTransform(p, (v) => (v < SWAP ? 0 : 1 - c01((v - 0.42) / 0.08))); // cảnh chi tiết: chỉ hiện sau SWAP, mờ dần khi phong bì rơi
  const cardOpacity = useTransform(p, (v) => (v < SWAP ? 0 : 1));
  const envShine = useTransform(flipEnv, [0, 90, 180], ["130%", "40%", "-30%"]);
  const envBob = useTransform([time, p], ([t, pv]: number[]) => (reduce ? 0 : Math.sin(t / 1100) * 0.4 * (1 - c01(pv / 0.05)))); // nhấp nhô lúc nằm yên

  /* --- Giai đoạn 2: dấu sáp tan, mở nắp, rút thiệp, phong bì rơi --- */
  const envLeft = tr([0, 0.42, 0.52], [50, 50, 56]);
  const envDrop = tr([0.42, 0.52], [0, 6]);
  const envOpacity = useTransform(p, [0.42, 0.5], [1, 0]);
  const sealOpacity = useTransform(p, (v) => (v < SWAP ? 0 : 1 - c01((v - 0.19) / 0.05)));
  const sealScale = useTransform(p, [0.19, 0.22, 0.24], [1, 1.2, 0.6]);
  const flapDeg = tr([0.21, 0.33], [0, -150]);
  const flapZ = useTransform(flapDeg, (d) => (d < -80 ? -6 : 34)); // nắp mở thì ra sau thiệp, đóng thì ở trước

  /* --- Giai đoạn 3: thiệp bay trái → phải → giữa, rồi mở 4 mặt --- */
  const cardLeft = tr([0, 0.5, 0.62, 0.68, 0.78, 0.8, 0.86], [50, 50, 26, 26, 74, 74, 50]); // tâm thiệp đang gập, tính theo % chiều rộng
  const cardShift = tr([0.88, 0.95], [0, PW / 2]); // khi mở, dịch gáy sang giữa để cả hai trang nằm giữa khung
  const cardLeftCss = useTransform([cardLeft, cardShift], ([v, s]: number[]) => `calc(${v}% - ${PW / 2}cqw + ${s}cqw)`);
  const cardTop = tr([0, 0.27, 0.43, 0.5, 0.62, 1], [14.5, 14.5, 3, 3, 9.5, 9.5]);
  const cardArc = useTransform(p, [0.5, 0.56, 0.62, 0.68, 0.73, 0.78, 0.8, 0.86], [0, -2, 0, 0, -3, 0, 0, 0]);
  const floatAmp = useTransform(p, [0.4, 0.46], [0, 1]);
  const floatY = useTransform([time, floatAmp], ([t, a]: number[]) => (reduce ? 0 : Math.sin(t / 1200) * 0.5 * a)); // thiệp lơ lửng nhẹ khi đã rút ra
  const cardTopCss = useTransform([cardTop, cardArc, floatY], ([t, a, f]: number[]) => `${t + a + f}cqw`);
  const cardTilt = useTransform(p, [0.3, 0.4, 0.46, 0.5, 0.56, 0.62, 0.7, 0.78, 0.84, 0.9], [0, -2.5, 0, 0, 2, 0, -2, 2, 0, 0]);
  const cardScale = useTransform(p, [0.38, 0.46, 0.5, 0.58, 0.82, 0.9], [1, 1.03, 1.03, 0.82, 0.82, 1.14]); // bù phối cảnh khi thiệp nhấc gần camera; cuối cảnh phóng to cho dễ đọc
  const cardZ = useTransform(p, [0.5, 0.58, 0.82, 0.9], [10, 320, 320, 120]); // chỉ nhấc cao sau khi phong bì đã mờ hẳn, nên không bị đổi lớp giật
  // Xoay quanh trục dọc: nghiêng nhẹ khi sang trái; sang phải thì xoay trọn vòng (lộ bìa sau ở giữa đường bay)
  const cardRotY = tr([0.5, 0.58, 0.62, 0.68, 0.73, 0.78, 0.86], [0, -12, -8, -8, 172, 352, 360]);
  const flipEase = cubicBezier(0.4, 0, 0.2, 1.22); // mở có đà: vượt nhẹ rồi rung về chỗ (1.1 nhẹ, 1.4 nảy rõ)
  const coverDeg = useTransform(p, [0.86, 0.95], [0, -180], { ease: flipEase });
  const cardShadowScale = useTransform(cardZ, [10, 320], [1, 0.75]);
  const cardShadowSpread = useTransform(p, [0.86, 0.95], [1, 1.5]);
  const shine = useTransform(p, [0.5, 1], ["130%", "-30%"]);

  // Hào quang vàng sau thiệp
  const haloOpacity = useTransform(p, [0.5, 0.62, 0.9, 1], [0, 0.35, 0.7, 0.8]);
  const haloScale = useTransform(p, [0.5, 1], [0.6, 1.1]);
  const haloLeft = useTransform(cardLeft, (v) => `calc(${v}% - 30cqw)`);
  const haloTop = useTransform(cardTop, (v) => `${v + PH / 2 - 22.5}cqw`);

  // Camera: đầu cảnh nhìn thẳng để phong bì vuông vức, nghiêng nhẹ ở giữa, cuối cảnh về thẳng để dễ đọc thiệp
  const tiltY = useTransform(p, [0, 0.2, 0.45, 0.8, 1], [0, 0, -4, 2, 0]);
  const tiltX = useTransform(p, [0, 0.2, 0.45, 1], [0, 0, 4, 1]);
  const camY = useTransform([tiltY, look.x], ([t, x]: number[]) => t + x * 6);
  const camX = useTransform([tiltX, look.y, lean], ([t, y, l]: number[]) => t - y * 4 + l); // lean: ngả theo tốc độ cuộn
  const camScale = useTransform(p, [0, 0.5, 0.9, 1], [1, 1, 1.02, 1.02]);
  const textShift = useTransform(look.x, (x) => `${-x * 1.6}cqw`);

  // Chữ giới thiệu: bên phải khi thiệp ở trái; bên trái khi thiệp ở phải
  const rightOpacity = useTransform(p, [0.54, 0.6, 0.66, 0.7], [0, 1, 1, 0]);
  const rightY = useTransform(p, [0.54, 0.6, 0.66, 0.7], [2, 0, 0, -2]);
  const leftOpacity = useTransform(p, [0.74, 0.78, 0.8, 0.83], [0, 1, 1, 0]);
  const leftY = useTransform(p, [0.74, 0.78, 0.8, 0.83], [2, 0, 0, -2]);
  const rightY2 = useTransform(rightY, (v) => `calc(-50% + ${v}cqw)`);
  const leftY2 = useTransform(leftY, (v) => `calc(-50% + ${v}cqw)`);

  const envLeftCss = useTransform(envLeft, (v) => `calc(${v}% - 24cqw)`);
  const envTopCss = useTransform([envDrop, flipLift, envBob], ([d, l, b]: number[]) => `${12.5 + d - l + b}cqw`);
  const sealLeft = useTransform(envLeft, (v) => `calc(${v}% - 3.2cqw)`);
  const sealTop = useTransform(envDrop, (d) => `${12.5 + 18 - 3.2 + d}cqw`); // tâm dấu sáp nằm đúng đỉnh nắp
  const envShadowLeft = useTransform(envLeft, (v) => `calc(${v}% - 22cqw)`);
  const envShadowOp = useTransform(envOpacity, (o) => o * 0.55);
  const envShadowScale = useTransform(flipZ, [20, 170], [1, 0.8]);
  const cardShadowLeft = useTransform(cardLeft, (v) => `calc(${v}% - 19cqw)`);
  const cardShadowOp = useTransform(p, [0.3, 0.46, 0.7, 0.9], [0, 0.35, 0.18, 0.4]);

  const liner = `linear-gradient(170deg, ${mix(accent, 88, "#fff")} 0%, ${mix(accent, 70, "#000")} 100%)`;
  const W = "48cqw";
  const H = "33cqw";

  return (
    <div className="relative mx-auto w-full" style={{ containerType: "inline-size", maxWidth: "min(1080px, calc((75svh - 56px) * 1.6))" }}>
      <div className="relative w-full" style={{ height: "50cqw", perspective: 1400 }}>
        {/* Cánh hoa rơi chậm (phẳng, nằm sau cảnh) */}
        {!reduce && PETALS.map((pt, i) => <Petal key={i} p={p} {...pt} accent={accent} />)}

        {/* Camera: mọi lớp bên trong được sắp theo độ sâu thật (translateZ), không chồng phẳng bằng z-index */}
        <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d", rotateX: camX, rotateY: camY, scale: camScale }}>
          {/* Bóng đổ trên nền: của phong bì và của thiệp (nhạt đi khi thiệp bay cao, rộng ra khi mở) */}
          <motion.div aria-hidden className="absolute rounded-[50%]" style={{ left: envShadowLeft, top: "43.5cqw", width: "44cqw", height: "4cqw", background: "rgba(40,20,20,0.35)", filter: "blur(2.2cqw)", opacity: envShadowOp, scale: envShadowScale, z: -40 }} />
          <motion.div aria-hidden className="absolute rounded-[50%]" style={{ left: cardShadowLeft, top: "44.5cqw", width: "38cqw", height: "3.4cqw", background: "rgba(40,20,20,0.45)", filter: "blur(2.4cqw)", opacity: cardShadowOp, scale: cardShadowScale, scaleX: cardShadowSpread, z: -38 }} />

          {/* Hào quang vàng + bụi lấp lánh (sau thiệp) */}
          <motion.div
            aria-hidden
            className="absolute rounded-full"
            style={{
              left: haloLeft, top: haloTop, width: "60cqw", height: "45cqw", opacity: haloOpacity, scale: haloScale, z: -20,
              background: `radial-gradient(closest-side, ${mix("#e8c97a", 70, "#fff")}88, ${accent}22 55%, transparent 75%)`,
              filter: "blur(2cqw)",
            }}
          />
          {!reduce && SPARKS.map((s, i) => <Spark key={i} p={p} {...s} />)}

          {/* Phong bì đang lật: một tấm dày vài px, mặt trước (tên + tem) và mặt sau (nếp gấp + nắp đóng + dấu sáp) */}
          <motion.div
            aria-hidden
            className="absolute"
            style={{ left: envLeftCss, top: envTopCss, width: W, height: H, transformStyle: "preserve-3d", rotateY: flipEnv, rotateX: flipRotX, rotateZ: flipRotZ, z: flipZ, opacity: flipOpacity }}
          >
            <div className="absolute inset-0" style={{ background: "#d9c9a8", transform: "translateZ(-0.8px)" }} />
            <div className="absolute inset-0" style={{ background: "#d9c9a8", transform: "translateZ(0.8px)" }} />
            <EnvFront label={categoryLabel} title={title} accent={accent} shine={envShine} />
            <EnvBack accent={accent} shine={envShine} />
          </motion.div>

          {/* Mặt trong phong bì (cảnh chi tiết, hiện sau khi lật xong) */}
          <motion.div aria-hidden className="absolute" style={{ left: envLeftCss, top: envTopCss, width: W, height: H, background: liner, opacity: asmOpacity, z: 0, boxShadow: ENV_SHADOW }} />

          {/* Thiệp gấp đôi 4 mặt */}
          <motion.div
            className="absolute"
            style={{ left: cardLeftCss, top: cardTopCss, width: `${PW}cqw`, height: `${PH}cqw`, transformStyle: "preserve-3d", rotateZ: cardTilt, scale: cardScale, z: cardZ, rotateY: cardRotY, opacity: cardOpacity }}
          >
            <InviteCard coverDeg={coverDeg} shine={shine} accent={accent} coverSrc={hero.images[0]} />
          </motion.div>

          {/* Túi phía trước: ba mảnh gấp chéo hình chữ V, mỗi mảnh một sắc độ */}
          {POCKET.map((f, i) => (
            <motion.div key={i} aria-hidden className="absolute" style={{ left: envLeftCss, top: envTopCss, width: W, height: H, background: f.bg, clipPath: f.clip, opacity: asmOpacity, z: 20 }} />
          ))}
          <motion.svg aria-hidden viewBox="0 0 48 33" className="absolute" style={{ left: envLeftCss, top: envTopCss, width: W, height: H, opacity: asmOpacity, z: 20.5 }}>
            {FOLD}
          </motion.svg>

          {/* Nắp: hai mặt (ngoài kem, trong màu nhấn), bản lề ở mép trên. Độ mờ đặt lên từng mặt để không làm phẳng cảnh 3D */}
          <motion.div aria-hidden className="absolute" style={{ left: envLeftCss, top: envTopCss, width: W, height: "18cqw", transformOrigin: "50% 0%", transformStyle: "preserve-3d", rotateX: flapDeg, z: flapZ }}>
            <motion.div className="absolute inset-0" style={{ background: FLAP_BG, clipPath: "polygon(0 0, 100% 0, 50% 100%)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", opacity: asmOpacity }} />
            <motion.div className="absolute inset-0" style={{ background: mix(accent, 62, "#000"), clipPath: "polygon(0 100%, 100% 100%, 50% 0)", transform: "rotateX(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", opacity: asmOpacity }} />
          </motion.div>

          {/* Con dấu sáp ở đầu nắp: nảy lên rồi tan khi bắt đầu mở */}
          <motion.div
            aria-hidden
            className="absolute flex items-center justify-center rounded-full"
            style={{ ...sealStyle(accent), left: sealLeft, top: sealTop, z: 38, opacity: sealOpacity, scale: sealScale }}
          >
            &amp;
          </motion.div>
        </motion.div>

        {/* Gợi ý đầu cảnh, dòng giữa cảnh và dòng cuối cảnh: nằm ngoài camera để luôn rõ nét */}
        <Caption p={p} input={[0, 0.05]} output={[1, 0]}>
          Cuộn để mở thiệp <Bob accent={accent} />
        </Caption>
        <Caption p={p} input={[0.4, 0.46, 0.5, 0.54]} output={[0, 1, 1, 0]}>
          Mời bạn xem thiệp
        </Caption>
        <Caption p={p} input={[0.95, 0.99]} output={[0, 1]}>
          Khám phá mẫu thiệp <Bob accent={accent} />
        </Caption>

        {/* Chữ giới thiệu hai bên, trượt ngược nhẹ theo con trỏ cho có chiều sâu */}
        <motion.div className="absolute" style={{ right: "4cqw", top: "50%", width: "40cqw", y: rightY2, x: textShift, opacity: rightOpacity, zIndex: 6 }}>
          <Heading label={categoryLabel} title={title} subtitle={hero.subtitle} accent={accent} />
        </motion.div>
        <motion.div className="absolute" style={{ left: "4cqw", top: "50%", width: "40cqw", y: leftY2, x: textShift, opacity: leftOpacity, zIndex: 6 }}>
          <Heading label="Trân trọng kính mời" title={hero.subtitle || title} accent={accent} small />
        </motion.div>
      </div>
    </div>
  );
}

/** Dòng chữ nhỏ dưới cảnh, mờ vào/ra theo tiến độ cuộn. */
function Caption({ p, input, output, children }: { p: MotionValue<number>; input: number[]; output: number[]; children: ReactNode }) {
  const opacity = useTransform(p, input, output);
  return (
    <motion.p className="pointer-events-none absolute inset-x-0 text-center" style={{ top: "47.5cqw", opacity, color: "#5b4d50", fontSize: "2cqw", letterSpacing: "0.12em", zIndex: 6 }}>
      {children}
    </motion.p>
  );
}

function Bob({ accent }: { accent: string }) {
  const time = useTime();
  const y = useTransform(time, (t) => `${Math.sin(t / 380) * 0.5}cqw`);
  return (
    <motion.span aria-hidden style={{ y, color: accent, display: "inline-block" }}>
      ↓
    </motion.span>
  );
}

/** Khối chữ: nhãn nhỏ, tiêu đề serif, đường kẻ vàng mảnh và phụ đề. */
function Heading({ label, title, subtitle, accent, small = false }: { label?: string; title: string; subtitle?: string; accent: string; small?: boolean }) {
  return (
    <div>
      {label && (
        <p className="font-semibold uppercase" style={{ color: accent, fontSize: "1.9cqw", letterSpacing: "0.32em" }}>
          {label}
        </p>
      )}
      <h2 className="font-semibold" style={{ fontFamily: SERIF, color: "#2a2023", fontSize: small ? "4.4cqw" : "5.2cqw", lineHeight: 1.12, marginTop: label ? "1.2cqw" : 0 }}>
        {title}
      </h2>
      <div className="flex items-center" style={{ gap: "1cqw", margin: "1.6cqw 0" }} aria-hidden>
        <span style={{ height: 1, width: "7cqw", background: "linear-gradient(90deg, #c9a55c, transparent)" }} />
        <span style={{ color: "#c9a55c", fontSize: "1.6cqw" }}>♥</span>
      </div>
      {subtitle && <p style={{ color: "#5b4d50", fontSize: "2.3cqw", lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  );
}

/** Ánh sáng lướt nhẹ trên mặt giấy, chạy theo góc lật. */
function Sheen({ shine }: { shine: MotionValue<string> }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ background: "linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 65%)", backgroundSize: "300% 100%", backgroundPositionX: shine, mixBlendMode: "soft-light" }}
    />
  );
}

/** Mặt trước phong bì: giấy kem trơn, khung vàng mảnh, tên ở giữa, tem ở góc phải trên. */
function EnvFront({ label, title, accent, shine }: { label: string; title: string; accent: string; shine: MotionValue<string> }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: CREAM, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "translateZ(1.6px)", boxShadow: ENV_SHADOW }}
    >
      <div className="absolute flex flex-col items-center justify-center text-center" style={{ inset: "1.8cqw", border: "0.15cqw solid rgba(201,165,92,0.75)", padding: "2cqw 7cqw" }}>
        {label && <p className="font-semibold uppercase" style={{ color: accent, fontSize: "1.5cqw", letterSpacing: "0.36em" }}>{label}</p>}
        <p style={{ fontFamily: SCRIPT, color: "#3a2a2e", fontSize: "6cqw", lineHeight: 1.15, marginTop: label ? "1.2cqw" : 0 }}>{title}</p>
        <div className="flex items-center" style={{ gap: "1cqw", marginTop: "1.2cqw" }} aria-hidden>
          <span style={{ height: 1, width: "6cqw", background: "linear-gradient(90deg, transparent, #c9a55c)" }} />
          <span style={{ color: "#c9a55c", fontSize: "1.6cqw" }}>♥</span>
          <span style={{ height: 1, width: "6cqw", background: "linear-gradient(270deg, transparent, #c9a55c)" }} />
        </div>
      </div>
      {/* tem */}
      <div
        aria-hidden
        className="absolute flex items-center justify-center"
        style={{ right: "3.6cqw", top: "3.4cqw", width: "5cqw", height: "6cqw", background: `linear-gradient(150deg, ${mix(accent, 75, "#fff")}, ${accent})`, border: "0.35cqw dotted rgba(255,255,255,0.8)", color: "rgba(255,255,255,0.92)", fontSize: "2.2cqw" }}
      >
        ♥
      </div>
      <Sheen shine={shine} />
    </div>
  );
}

/** Mặt sau phong bì lúc đóng: giống hệt cảnh chi tiết (ba nếp gấp, nắp, dấu sáp). Xoay sẵn 180° để khi lật xong nhìn đúng chiều. */
function EnvBack({ accent, shine }: { accent: string; shine: MotionValue<string> }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "#efe3cb", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(1.6px)", boxShadow: ENV_SHADOW }}
    >
      {POCKET.map((f, i) => (
        <div key={i} className="absolute inset-0" style={{ background: f.bg, clipPath: f.clip }} />
      ))}
      <svg aria-hidden viewBox="0 0 48 33" className="absolute inset-0 size-full">{FOLD}</svg>
      <div className="absolute left-0 top-0 w-full" style={{ height: "18cqw", background: FLAP_BG, clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
      <div className="absolute flex items-center justify-center rounded-full" style={{ ...sealStyle(accent), left: "calc(50% - 3.2cqw)", top: "calc(18cqw - 3.2cqw)" }}>
        &amp;
      </div>
      <Sheen shine={shine} />
    </div>
  );
}


/* ---------- Thiệp cưới Việt Nam gấp đôi, 4 mặt ----------
   1 bìa ngoài (đỏ, chữ vàng, chữ Hỷ)  ·  2 mặt trong bìa, bên trái (nhà trai, nhà gái)
   3 mặt trong, bên phải (lời mời, tên cô dâu chú rể, giờ, ngày âm dương, địa điểm)  ·  4 bìa sau (lời cảm ơn)
   Cấu tạo: trang phải đứng yên (mặt 3 phía trước, mặt 4 phía sau); bìa là một tấm hai mặt (mặt 1 và mặt 2) lật quanh gáy bên trái. */
const PAPER = "linear-gradient(150deg, #fffdf8 0%, #f5ecda 100%)";
const INK = "#2a2023";
const MUTED = "#6b5b5e";
const goldFoil: CSSProperties = {
  background: "linear-gradient(135deg, #f7e7ae 0%, #c9a55c 45%, #f2dc96 70%, #b8923f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
};
const redBg = (accent: string, red: string) => `radial-gradient(120% 85% at 50% 32%, ${mix(accent, 85, "#000")} 0%, ${red} 100%)`;

/** Một mặt giấy của thiệp. Mặt "back" xoay sẵn 180° và ẩn khi quay ra sau; gutter là bóng mờ ở gáy sách. */
function Face({ children, bg, shine, back = false, gutter }: { children: ReactNode; bg: string; shine: MotionValue<string>; back?: boolean; gutter?: "left" | "right" }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: bg, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: back ? "rotateY(180deg) translateZ(0.4px)" : "translateZ(0.4px)", boxShadow: "0 0.4cqw 1.2cqw -0.4cqw rgba(0,0,0,0.35)" }}
    >
      {children}
      {gutter && <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(${gutter === "left" ? 90 : 270}deg, rgba(0,0,0,0.16), rgba(0,0,0,0) 14%)` }} />}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.06) 100%)" }} />
      <Sheen shine={shine} />
    </div>
  );
}

/** Khung vàng kép + bốn góc, đặc trưng của thiệp cưới Việt. */
function GoldFrame({ color = GOLD }: { color?: string }) {
  const corner = (pos: CSSProperties, b: CSSProperties): CSSProperties => ({ position: "absolute", width: "2.2cqw", height: "2.2cqw", borderStyle: "solid", borderColor: color, borderWidth: 0, ...pos, ...b });
  const w = "0.22cqw";
  return (
    <>
      <div aria-hidden className="absolute" style={{ inset: "1.9cqw", border: `0.1cqw solid ${color}`, opacity: 0.85 }} />
      <span aria-hidden style={corner({ left: "1.2cqw", top: "1.2cqw" }, { borderLeftWidth: w, borderTopWidth: w })} />
      <span aria-hidden style={corner({ right: "1.2cqw", top: "1.2cqw" }, { borderRightWidth: w, borderTopWidth: w })} />
      <span aria-hidden style={corner({ left: "1.2cqw", bottom: "1.2cqw" }, { borderLeftWidth: w, borderBottomWidth: w })} />
      <span aria-hidden style={corner({ right: "1.2cqw", bottom: "1.2cqw" }, { borderRightWidth: w, borderBottomWidth: w })} />
    </>
  );
}

function Divider({ color = GOLD, margin = "1cqw 0" }: { color?: string; margin?: string }) {
  return (
    <div className="flex items-center justify-center" style={{ gap: "0.8cqw", margin }} aria-hidden>
      <span style={{ height: 1, width: "5cqw", background: `linear-gradient(90deg, transparent, ${color})` }} />
      <span style={{ color, fontSize: "1.3cqw" }}>♥</span>
      <span style={{ height: 1, width: "5cqw", background: `linear-gradient(270deg, transparent, ${color})` }} />
    </div>
  );
}

const PATTERN = "repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0 0.25cqw, transparent 0.25cqw 1.1cqw)";

function InviteCard({ coverDeg, shine, accent, coverSrc }: { coverDeg: MotionValue<number>; shine: MotionValue<string>; accent: string; coverSrc?: string }) {
  const red = mix(accent, 62, "#000");
  const sh = shine;
  return (
    <>
      {/* Trang phải đứng yên: mặt 3 (trong, phải) và mặt 4 (bìa sau) */}
      <Face bg={PAPER} gutter="left" shine={sh}>
        <PaperFrame />
        <InnerRight red={red} />
      </Face>
      <Face back bg={redBg(accent, red)} shine={sh}>
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: PATTERN }} />
        <GoldFrame />
        <BackCover />
      </Face>

      {/* Bìa: lật quanh gáy bên trái. Mặt 1 (ngoài) và mặt 2 (trong bìa, bên trái) */}
      <div className="absolute inset-0" style={{ transform: "translateZ(1px)", transformStyle: "preserve-3d" }}>
        <motion.div className="absolute inset-0" style={{ transformOrigin: "0% 50%", transformStyle: "preserve-3d", rotateY: coverDeg }}>
          <Face bg={coverSrc ? "#2a1a1d" : redBg(accent, red)} shine={sh}>
            {coverSrc ? <img src={coverSrc} alt="" draggable={false} className="size-full object-cover" /> : <div aria-hidden className="absolute inset-0" style={{ backgroundImage: PATTERN }} />}
            <GoldFrame />
            <CoverContent withImage={!!coverSrc} />
          </Face>
          <Face back bg={PAPER} gutter="right" shine={sh}>
            <PaperFrame />
            <InnerLeft red={red} />
          </Face>
        </motion.div>
      </div>
    </>
  );
}

function PaperFrame() {
  return <GoldFrame color="rgba(201,165,92,0.9)" />;
}

/** Mặt 1: bìa ngoài. */
function CoverContent({ withImage }: { withImage: boolean }) {
  if (withImage) {
    return (
      <p className="absolute inset-x-0 text-center" style={{ ...goldFoil, bottom: "3.6cqw", fontSize: "1.25cqw", letterSpacing: "0.5em", fontWeight: 600 }}>
        THIỆP MỜI
      </p>
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ padding: "4cqw" }}>
      <p style={{ ...goldFoil, fontSize: "1.25cqw", letterSpacing: "0.5em", fontWeight: 600 }}>THIỆP MỜI</p>
      <p style={{ ...goldFoil, fontFamily: SERIF, fontSize: "11cqw", lineHeight: 1.05, margin: "1.6cqw 0 1.2cqw" }}>囍</p>
      <Divider />
      <p style={{ ...goldFoil, fontFamily: SERIF, fontStyle: "italic", fontSize: "1.8cqw" }}>Lễ Thành Hôn</p>
    </div>
  );
}

function Party({ title, lines, addr, red }: { title: string; lines: string[]; addr: string; red: string }) {
  return (
    <div className="text-center">
      <p style={{ color: red, fontSize: "1.1cqw", letterSpacing: "0.3em", fontWeight: 600 }}>{title}</p>
      <div style={{ marginTop: "0.5cqw" }}>
        {lines.map((l) => (
          <p key={l} style={{ fontFamily: SERIF, color: INK, fontSize: "1.65cqw", lineHeight: 1.45, fontWeight: 600 }}>
            {l}
          </p>
        ))}
      </div>
      <p style={{ color: MUTED, fontSize: "1.05cqw", marginTop: "0.4cqw" }}>{addr}</p>
    </div>
  );
}

/** Mặt 2: mặt trong bìa, hai họ. */
function InnerLeft({ red }: { red: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ padding: "2.6cqw 2.2cqw" }}>
      <Party title="NHÀ TRAI" lines={DEMO.groomHouse} addr={DEMO.groomAddr} red={red} />
      <Divider margin="1.4cqw 0" />
      <Party title="NHÀ GÁI" lines={DEMO.brideHouse} addr={DEMO.brideAddr} red={red} />
      <p style={{ fontFamily: SERIF, fontStyle: "italic", color: MUTED, fontSize: "1.15cqw", lineHeight: 1.45, marginTop: "1.8cqw" }}>
        Trân trọng báo tin Lễ Thành Hôn
        <br />
        của hai con chúng tôi
      </p>
    </div>
  );
}

/** Mặt 3: lời mời chính. */
function InnerRight({ red }: { red: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ padding: "2.6cqw 2.2cqw" }}>
      <p style={{ color: red, fontSize: "1.05cqw", letterSpacing: "0.2em", fontWeight: 600 }}>TRÂN TRỌNG KÍNH MỜI</p>
      <p style={{ color: MUTED, fontSize: "1.05cqw", marginTop: "0.4cqw" }}>đến dự Lễ Thành Hôn của hai con</p>
      <div style={{ margin: "1cqw 0 0.2cqw" }}>
        <p style={{ fontFamily: SCRIPT, color: INK, fontSize: "2.7cqw", lineHeight: 1.2 }}>{DEMO.groom}</p>
        <p style={{ ...goldFoil, fontFamily: SERIF, fontSize: "1.6cqw", lineHeight: 1.3 }}>&amp;</p>
        <p style={{ fontFamily: SCRIPT, color: INK, fontSize: "2.7cqw", lineHeight: 1.2 }}>{DEMO.bride}</p>
      </div>
      <Divider margin="0.9cqw 0" />
      <p style={{ fontFamily: SERIF, color: red, fontSize: "1.9cqw", fontWeight: 700, lineHeight: 1.3 }}>Vào lúc {DEMO.time}</p>
      <p style={{ fontFamily: SERIF, color: INK, fontSize: "1.45cqw", fontWeight: 600, marginTop: "0.3cqw" }}>{DEMO.date}</p>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", color: MUTED, fontSize: "1.05cqw", marginTop: "0.2cqw" }}>({DEMO.lunar})</p>
      <p style={{ color: INK, fontSize: "1.3cqw", fontWeight: 600, marginTop: "1cqw" }}>{DEMO.venue}</p>
      <p style={{ color: MUTED, fontSize: "1.05cqw" }}>{DEMO.venueAddr}</p>
    </div>
  );
}

/** Mặt 4: bìa sau. */
function BackCover() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ padding: "4cqw 3.2cqw" }}>
      <p style={{ ...goldFoil, fontFamily: SERIF, fontSize: "5cqw", lineHeight: 1.1 }}>囍</p>
      <p style={{ ...goldFoil, fontFamily: SERIF, fontStyle: "italic", fontSize: "2.6cqw", marginTop: "1cqw" }}>Trân trọng cảm ơn</p>
      <Divider margin="1.4cqw 0" />
      <p style={{ color: "#f3e6c4", fontSize: "1.2cqw", letterSpacing: "0.18em", textTransform: "uppercase" }}>
        {DEMO.groom} &amp; {DEMO.bride}
      </p>
      <p style={{ color: "rgba(243,230,196,0.8)", fontSize: "1.05cqw", lineHeight: 1.5, marginTop: "2.4cqw" }}>
        Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi
      </p>
    </div>
  );
}

const PETALS = [
  { x: 8, y0: 12, y1: 70, s: 1.6, r: 40 }, { x: 30, y0: 80, y1: 20, s: 1.1, r: -30 }, { x: 47, y0: 6, y1: 60, s: 1.3, r: 70 },
  { x: 63, y0: 85, y1: 30, s: 1.8, r: -60 }, { x: 80, y0: 10, y1: 75, s: 1.2, r: 20 }, { x: 93, y0: 70, y1: 15, s: 1.5, r: -45 },
];

function Petal({ p, x, y0, y1, s, r, accent }: { p: MotionValue<number>; x: number; y0: number; y1: number; s: number; r: number; accent: string }) {
  const top = useTransform(p, [0, 1], [`${y0}%`, `${y1}%`]);
  const rot = useTransform(p, [0, 1], [r, r + 140]);
  return (
    <motion.span
      aria-hidden
      className="absolute"
      style={{ left: `${x}%`, top, rotate: rot, width: `${s * 1.6}cqw`, height: `${s * 1.1}cqw`, borderRadius: "70% 0 70% 0", background: `linear-gradient(135deg, ${mix(accent, 35, "#fff")}, ${mix(accent, 70, "#fff")})`, opacity: 0.55, zIndex: 0 }}
    />
  );
}

/* ---------- Bụi vàng lấp lánh khi bìa thiệp mở ---------- */
const SPARKS = [
  { dx: -19, y: 16, s: 2.2, t: 0.86 }, { dx: 17, y: 20, s: 1.6, t: 0.87 }, { dx: -10, y: 38, s: 1.4, t: 0.87 },
  { dx: 20, y: 34, s: 2.0, t: 0.88 }, { dx: 2, y: 10, s: 1.2, t: 0.88 }, { dx: -23, y: 28, s: 1.5, t: 0.89 },
  { dx: 12, y: 42, s: 1.3, t: 0.89 }, { dx: -4, y: 40, s: 1.8, t: 0.9 },
];

function Spark({ p, dx, y, s, t }: { p: MotionValue<number>; dx: number; y: number; s: number; t: number }) {
  const opacity = useTransform(p, [t, t + 0.03, t + 0.1], [0, 1, 0]);
  const scale = useTransform(p, [t, t + 0.04, t + 0.1], [0, 1, 0.3]);
  const rotate = useTransform(p, [t, t + 0.1], [0, 90]);
  const rise = useTransform(p, [t, t + 0.1], [0, -4], { ease });
  const yCss = useTransform(rise, (v) => `${v}cqw`);
  return (
    <motion.span
      aria-hidden
      className="absolute"
      style={{
        left: `calc(50% + ${dx}cqw)`, top: `${y}cqw`, width: `${s}cqw`, height: `${s}cqw`,
        opacity, scale, rotate, y: yCss, z: 140,
        background: "linear-gradient(135deg, #fff3c9, #d9b45f)",
        clipPath: "polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%)",
      }}
    />
  );
}