"use client";

import { useEffect, useRef, type ComponentType, type CSSProperties, type ReactNode, type RefObject } from "react";
import { animate, cubicBezier, motion, useMotionValue, useReducedMotion, useSpring, useTime, useTransform, useVelocity, type AnimationPlaybackControls, type MotionValue } from "motion/react";
import type { HeroPreset, TemplateHero } from "@/lib/template-heroes";
import { CubeScene, BookScene, FanScene, FlowerScene, type SceneProps } from "./CategoryHeroScenes";
import { Canvas, EndHint, GOLD, INK, MUTED, SCRIPT, SERIF, SideCopy, StartHint, copyFor, mix, useNarrow } from "./CategoryHeroStage";

type Props = { hero: TemplateHero; categoryLabel: string };

/**
 * Hero 3D cho trang danh mục mẫu thiệp. Kiểu do admin chọn, nội dung do admin nhập.
 * Banner cao khoảng 3/4 màn hình (không ghim) để group filter bên dưới luôn lộ ra. Animation chạy theo tiến trình cuộn
 * khi banner đi qua đầu màn hình. Speed do admin đặt: từ 1 trở lên thì animation chạy nhanh hơn (dưới 1 coi như 1).
 * - envelope: phong bì lật lấy thiệp (EnvelopeHero), thiệp bay sang trái/phải kèm chữ giới thiệu.
 * - fan / book / flower / cube: các cảnh 3D trong CategoryHeroScenes, cảnh trượt trái/phải kèm chữ (CategoryHeroStage).
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

/** Quãng lăn chuột (px) để đi hết animation của từng kiểu, khi speed = 1. Có thêm các chặng trượt trái/phải nên dài hơn trước. */
export const SCROLL_PX: Record<HeroPreset, number> = { envelope: 3600, fan: 2200, book: 2200, flower: 2200, cube: 2200 };
const SMOOTH = { stiffness: 70, damping: 24, mass: 0.7 }; // làm mượt tiến trình, cùng thông số với phong bì
const ALIGN_BOTTOM = 60; // banner coi như đã trôi qua khi mép dưới <= 60px

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Tiến trình animation của banner, từ 0 đến 1.
 * - Thiết bị có chuột: khi con trỏ đang nằm trên banner và animation chưa hết, lăn chuột xuống sẽ chạy animation tới,
 *   và sự kiện cuộn KHÔNG lan ra trang. Hết animation thì trang cuộn bình thường. Lăn lên thì animation chạy lùi;
 *   khi về đầu thì trang mới cuộn lên.
 * - Nếu banner đã trôi qua mà animation chưa hết (ví dụ kéo thanh cuộn), tự chạy nốt. Cuộn ngược lên đầu sẽ phát lại.
 * - Thiết bị cảm ứng (không có chuột): animation đi theo vị trí cuộn của trang.
 * - speed do admin đặt: lớn hơn 1 thì một lần lăn đi được nhiều tiến trình hơn.
 */
export function useHeroProgress(ref: RefObject<HTMLElement | null>, speed: number, px: number): MotionValue<number> {
  const prog = useMotionValue(0);
  const k = Math.max(1, Number.isFinite(speed) ? speed : 1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(pointer: coarse)").matches) {
      const sync = () => {
        const r = el.getBoundingClientRect();
        prog.set(clamp01(-r.top / Math.max(1, el.offsetHeight)));
      };
      sync();
      window.addEventListener("scroll", sync, { passive: true });
      window.addEventListener("resize", sync);
      return () => {
        window.removeEventListener("scroll", sync);
        window.removeEventListener("resize", sync);
      };
    }

    let ctl: AnimationPlaybackControls | null = null;
    // Chuột có thể đã nằm sẵn trên banner trước khi effect chạy (không có sự kiện pointerenter), nên kiểm tra ngay
    let hovering = el.matches(":hover");
    const glide = (to: number) => {
      ctl?.stop();
      ctl = animate(prog, to, { duration: 0.6, ease: "easeOut" });
    };
    const onEnter = () => {
      hovering = true;
    };
    const onLeave = () => {
      hovering = false;
    };
    const onWheel = (e: WheelEvent) => {
      if (!hovering || e.ctrlKey || e.deltaY === 0) return;
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      const cur = prog.get();
      if ((dy > 0 && cur >= 1) || (dy < 0 && cur <= 0)) return; // xong (hoặc về đầu) rồi: để trang cuộn
      e.preventDefault(); // đang trên banner và animation chưa hết: không cho trang cuộn
      ctl?.stop();
      prog.set(clamp01(cur + dy / (px / k)));
    };
    const onScroll = () => {
      if (hovering) return;
      const r = el.getBoundingClientRect();
      if (r.bottom <= ALIGN_BOTTOM && prog.get() < 1) glide(1);
      else if (r.top > 0 && prog.get() > 0) glide(0);
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ctl?.stop();
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ref, prog, k, px]);

  return prog;
}

/** Khung banner dùng chung cho các kiểu mới: một cảnh, cao 75svh, không ghim. */
function HeroSection({ hero, categoryLabel, Scene }: Props & { Scene: ComponentType<SceneProps> }) {
  const ref = useRef<HTMLElement>(null);
  const p = useSpring(useHeroProgress(ref, hero.speed, SCROLL_PX[hero.preset]), SMOOTH);
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

/* ====================== Phong bì: cảnh cuộn ====================== */

function EnvelopeHero({ hero, categoryLabel }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  // Cùng thông số làm mượt với trang xem thiệp mời (PublicEnvelopeIntro), và cùng cách tính tiến trình như các kiểu khác
  const p = useSpring(useHeroProgress(ref, hero.speed, SCROLL_PX[hero.preset]), SMOOTH);
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
   Mọi kích thước tính bằng cqw của canvas (rộng 100, cao 60). Thiệp có bốn mặt:
   1 bìa ngoài · 2 mặt trong bìa (trái) · 3 mặt trong (phải) · 4 bìa sau. */
const PW = 24; // chiều rộng một mặt thiệp (cqw)
const PH = 32.5; // chiều cao thiệp (cqw)
const ease = cubicBezier(0.45, 0.05, 0.2, 1);
const GOLD_LINE = GOLD;
const c01 = (x: number) => Math.min(1, Math.max(0, x));
const hidden: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

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
const FLAP_BG = "linear-gradient(180deg, #fbf6ec 0%, #eadfc8 100%)";
const ENV_SHADOW = "0 1.4cqw 3cqw -1cqw rgba(0,0,0,0.45)";
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

/* Hằng số phong bì (cqw). Thiệp nằm ngang trong phong bì lúc đầu: sau khi rút ra thì xoay dọc. */
const ENV_W = 50;
const ENV_H = 33;
const ENV_TOP = 21;
const ENV_CY = ENV_TOP + ENV_H / 2; // tâm phong bì theo chiều dọc
const APEX = 0.54; // đỉnh chữ V của nắp: 54% chiều cao phong bì
const FLAP_H = ENV_H * APEX;
/** Đa giác phần thân phong bì: bị KHUYẾT tam giác phía trên (giữa hai góc trên và đỉnh chữ V), để thấy thiệp và mặt trong. */
const POCKET_CLIP = `polygon(0 0, 50% ${APEX * 100}%, 100% 0, 100% 100%, 0 100%)`;
const FLAP_CLIP = "polygon(0 0, 100% 0, 50% 100%)";
const CARD_CY = 30; // tâm thiệp khi đã xoay dọc và đứng giữa khung
/** Tâm thiệp (nằm ngang) khi vừa ra khỏi phong bì: hai góc dưới của thiệp nằm trên đường chữ V nên không bị thân phong bì che. */
const CARD_OUT = ENV_TOP + FLAP_H * (1 - PH / 2 / (ENV_W / 2)) - PW / 2;
const SHIFT = 22; // thiệp lệch sang trái / phải (cqw)
const E_RISE = cubicBezier(0.6, 0, 0.3, 1); // rút thiệp: chậm, rồi nhanh, rồi chậm
const E_LAND = cubicBezier(0.2, 0.6, 0.3, 1); // xoay dọc và đi sang bên: nhanh rồi chậm
const E_OPEN = cubicBezier(0.4, 0, 0.2, 1.22); // mở bìa: có đà, vượt nhẹ rồi về chỗ
/** Mặt trong phong bì (cùng màu mặt trong nắp). */
const lining = (accent: string) => `linear-gradient(180deg, ${mix(accent, 55, "#000")} 0%, ${mix(accent, 72, "#fff")} 38%, ${mix(accent, 82, "#fff")} 100%)`;

/** Độ sâu (px) các lớp, tính theo thế giới SAU khi phong bì lật. Thiệp nằm ở z = 0 nên kẹp giữa mặt trong và thân phong bì. */
const Z_LINING = -3;
const Z_POCKET = 6;
const Z_FLAP = 7;

/**
 * Cảnh phong bì. Thứ tự (p = tiến trình cuộn, 0 → 1):
 *   0.00–0.05  phong bì nằm yên, mặt trước hướng ra, nhấp nhô nhẹ
 *   0.05–0.15  lật 180° để lộ mặt sau (nắp đóng, dấu sáp); khi lật phong bì nhô lên gần camera
 *   0.15–0.19  dấu sáp hiện rồi tan
 *   0.19–0.28  nắp mở ra phía sau; thân phong bì khuyết tam giác phía trên nên thấy thiệp và mặt trong
 *   0.28–0.40  thiệp NẰM NGANG trượt lên khỏi miệng phong bì (chậm, rồi nhanh, rồi chậm)
 *   0.43–0.53  thiệp nhấc lên trước phong bì, xoay dọc và bay sang TRÁI; phong bì mờ dần. Chữ A hiện ở bên PHẢI
 *   0.62–0.74  thiệp bay sang PHẢI, xoay trọn một vòng quanh trục dọc (lộ bìa sau). Chữ B hiện ở bên TRÁI
 *   0.84–0.89  thiệp về giữa khung
 *   0.89–1.00  bìa thiệp mở theo gáy bên trái; bụi vàng
 * Các mặt phẳng luôn song song nhau và khác độ sâu (không cắt nhau), nên không có mảnh hình nêm khi xoay.
 */
function EnvelopeScene({ p, look, lean, reduce, hero, categoryLabel }: { p: MotionValue<number>; look: Look; lean: MotionValue<number>; reduce: boolean; hero: TemplateHero; categoryLabel: string }) {
  const accent = hero.accent;
  const title = hero.title || categoryLabel;
  const time = useTime();
  const narrow = useNarrow();
  const copy = copyFor("envelope", categoryLabel);

  /* --- Phong bì: lật, nâng lên khi lật, nhấp nhô lúc nằm yên, mờ và chìm xuống khi thiệp đã ra --- */
  const FLAP_AT = 0.19;
  const envRot = useTransform(p, [0.05, 0.15], [0, 180], { ease });
  const envLift = useTransform(p, [0.05, 0.1, 0.15], [0, 70, 0]);
  const envFade = useTransform(p, [0.42, 0.52], [1, 0]);
  const envDrop = useTransform(p, [0.42, 0.52], [0, 4]);
  const bob = useTransform([time, p, envDrop], ([t, pv, d]: number[]) => (reduce ? 0 : Math.sin(t / 1100) * 0.4 * (1 - c01(pv / 0.05))) + d);
  const envTop = useTransform(bob, (b) => `${ENV_TOP + b}cqw`);
  const envTopN = useTransform(bob, (b) => ENV_TOP + b);
  const shine = useTransform(p, [0.05, 0.15], ["130%", "-30%"]);

  /* --- Nắp: bản đóng nằm trong nhóm lật; từ FLAP_AT thay bằng nắp riêng có bản lề ở mép trên phong bì --- */
  const flapDeg = useTransform(p, [FLAP_AT, 0.28], [0, -150], { ease: E_RISE });
  const flapZ = useTransform(flapDeg, (d) => (d < -75 ? -8 : Z_FLAP));
  const flapStaticOp = useTransform(p, [FLAP_AT - 0.002, FLAP_AT], [1, 0]);
  const flapOpenOp = useTransform([p, envFade], ([pv, f]: number[]) => (pv >= FLAP_AT - 0.001 ? f : 0));

  /* --- Dấu sáp: nằm trên đỉnh nắp sau khi lật xong, tan khi nắp bắt đầu mở --- */
  const sealOp = useTransform(p, [0.14, 0.155, 0.17, 0.2], [0, 1, 1, 0]);
  const sealScale = useTransform(p, [0.14, 0.155, 0.17, 0.2], [0.5, 1.12, 1, 0.25]);
  const sealTop = useTransform(envTopN, (t) => `${t + FLAP_H - 3.2}cqw`);

  /* --- Thiệp: nằm ngang trong phong bì, trượt lên, rồi xoay dọc, bay sang trái, sang phải (xoay vòng), về giữa, mở bìa --- */
  const cardVisible = useTransform(p, (v) => (v < 0.2 ? "hidden" : "visible"));
  const cyRise = useTransform(p, [0.28, 0.4], [ENV_CY, CARD_OUT], { ease: E_RISE });
  const go = useTransform(p, [0.43, 0.53], [0, 1], { ease: E_LAND });
  const cyArc = useTransform(p, [0.62, 0.68, 0.74], [0, -3, 0]);
  const cardCy = useTransform([cyRise, go, cyArc], ([a, g, c]: number[]) => a + (CARD_CY - CARD_OUT) * g + c);
  const cardTop = useTransform(cardCy, (c) => `${c - PH / 2}cqw`);
  const cardRot = useTransform(go, (g) => 90 * (1 - g));
  const cardZ = useTransform(p, [0.4, 0.43], [0, 60]);
  const xTravel = useTransform(p, [0.43, 0.53, 0.62, 0.74, 0.84, 0.89], [0, -SHIFT, -SHIFT, SHIFT, SHIFT, 0], { ease });
  const cardShift = useTransform(p, [0.89, 1], [0, PW / 2], { ease: E_OPEN });
  const cardLeft = useTransform([xTravel, cardShift], ([a, b]: number[]) => `calc(50% - ${PW / 2}cqw + ${a + b}cqw)`);
  const spin = useTransform(p, [0.62, 0.74], [0, 360], { ease });
  const coverDeg = useTransform(p, [0.89, 1], [0, -180], { ease: E_OPEN });
  const cardShine = useTransform(p, [0.89, 1], ["130%", "-30%"]);
  const glow = useTransform(p, [0.9, 1], [0, 0.9]);

  /* --- Camera: nghiêng nhẹ theo con trỏ và tốc độ cuộn --- */
  const camX = useTransform([look.y, lean], ([y, l]: number[]) => -y * 4 + l);
  const camY = useTransform(look.x, (x) => x * 6);

  return (
    <Canvas>
      {/* Cánh hoa rơi chậm (phẳng, nằm sau cảnh) */}
      {!reduce && PETALS.map((pt, i) => <Petal key={i} p={p} {...pt} accent={accent} />)}

      <motion.div aria-hidden className="pointer-events-none absolute" style={{ left: "50%", top: "52%", width: "70cqw", height: "46cqw", x: "-50%", y: "-50%", opacity: glow, background: `radial-gradient(closest-side, ${mix(GOLD, 38, "transparent")}, transparent)` }} />

      <div className="absolute inset-0" style={{ perspective: 1400 }}>
        {/* Mọi lớp được sắp theo độ sâu thật (translateZ) */}
        <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d", rotateX: camX, rotateY: camY }}>
          {/* Phong bì: lật quanh trục dọc giữa. Từ xa đến gần (sau khi lật): mặt trong → [thiệp] → thân phong bì → nắp đóng */}
          <motion.div
            aria-hidden
            className="absolute"
            style={{ left: `calc(50% - ${ENV_W / 2}cqw)`, top: envTop, width: `${ENV_W}cqw`, height: `${ENV_H}cqw`, transformStyle: "preserve-3d", rotateY: envRot, z: envLift }}
          >
            <EnvFront label={categoryLabel} title={title} accent={accent} shine={shine} opacity={envFade} />
            <EnvLining accent={accent} opacity={envFade} />
            <EnvPocket shine={shine} opacity={envFade} />
            <motion.div
              className="absolute inset-x-0 top-0"
              style={{ height: `${FLAP_H}cqw`, background: FLAP_BG, clipPath: FLAP_CLIP, transform: `rotateY(180deg) translateZ(${Z_FLAP}px)`, opacity: flapStaticOp, ...hidden }}
            />
          </motion.div>

          {/* Nắp mở: mép trên là bản lề. Đóng thì ở trước thân phong bì, mở thì lùi ra sau */}
          <motion.div
            aria-hidden
            className="absolute"
            style={{ left: `calc(50% - ${ENV_W / 2}cqw)`, top: envTop, width: `${ENV_W}cqw`, height: `${FLAP_H}cqw`, transformOrigin: "50% 0%", transformStyle: "preserve-3d", rotateX: flapDeg, z: flapZ, opacity: flapOpenOp }}
          >
            <div className="absolute inset-0" style={{ background: FLAP_BG, clipPath: FLAP_CLIP, ...hidden }} />
            <div className="absolute inset-0" style={{ background: lining(accent), clipPath: "polygon(0 100%, 100% 100%, 50% 0)", transform: "rotateX(180deg)", ...hidden }} />
          </motion.div>

          {/* Dấu sáp ở đầu nắp */}
          <motion.div
            aria-hidden
            className="absolute flex items-center justify-center rounded-full"
            style={{ ...sealStyle(accent), left: "calc(50% - 3.2cqw)", top: sealTop, z: 12, opacity: sealOp, scale: sealScale }}
          >
            &amp;
          </motion.div>

          {/* Thiệp: nằm ngang trong phong bì (xoay 90°), xoay dọc sau khi rút ra. Lớp ngoài di chuyển, lớp trong xoay vòng */}
          <motion.div
            className="absolute"
            style={{ left: cardLeft, top: cardTop, width: `${PW}cqw`, height: `${PH}cqw`, transformStyle: "preserve-3d", rotateZ: cardRot, z: cardZ, visibility: cardVisible }}
          >
            <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d", rotateY: spin }}>
              <InviteCard coverDeg={coverDeg} shine={cardShine} accent={accent} coverSrc={hero.images[0]} />
            </motion.div>
          </motion.div>

          {!reduce && SPARKS.map((s, i) => <Spark key={i} p={p} {...s} />)}
        </motion.div>
      </div>

      <SideCopy p={p} side="right" window={[0.49, 0.55, 0.6, 0.65]} block={copy.a} accent={accent} narrow={narrow} />
      <SideCopy p={p} side="left" window={[0.68, 0.74, 0.82, 0.86]} block={copy.b} accent={accent} narrow={narrow} />

      <StartHint p={p} accent={accent} text="Cuộn để mở thiệp" />
      <Caption p={p} input={[0.28, 0.32, 0.38, 0.43]} output={[0, 1, 1, 0]}>
        Thiệp đang được rút ra
      </Caption>
      <EndHint p={p} accent={accent} />
    </Canvas>
  );
}

/** Mặt trong phong bì (phần thấy được qua chỗ khuyết phía trên). Xoay sẵn 180° nên chỉ hiện sau khi lật; nằm SAU thiệp. */
function EnvLining({ accent, opacity }: { accent: string; opacity: MotionValue<number> }) {
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ background: lining(accent), opacity, transform: `rotateY(180deg) translateZ(${-Z_LINING}px)`, ...hidden }}>
      <div aria-hidden className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 0.3cqw, transparent 0.3cqw 1.3cqw)" }} />
      <div aria-hidden className="absolute inset-x-0 top-0" style={{ height: "10cqw", background: "linear-gradient(180deg, rgba(0,0,0,0.28), transparent)" }} />
    </motion.div>
  );
}

/**
 * Thân phong bì nhìn từ mặt sau: hai cánh bên và cánh đáy gặp nhau ở đỉnh chữ V, KHUYẾT tam giác phía trên
 * (nơi nắp mở ra) nên thấy được thiệp và mặt trong phong bì. Xoay sẵn 180° nên chỉ hiện sau khi lật.
 * Bóng đổ dùng drop-shadow vì clip-path cắt mất box-shadow.
 */
function EnvPocket({ shine, opacity }: { shine: MotionValue<string>; opacity: MotionValue<number> }) {
  return (
    <motion.div className="absolute inset-0" style={{ opacity, transform: `rotateY(180deg) translateZ(${Z_POCKET}px)`, filter: "drop-shadow(0 0.9cqw 1.1cqw rgba(0,0,0,0.3))", ...hidden }}>
      <div className="absolute inset-0 overflow-hidden" style={{ background: "#efe3cb", clipPath: POCKET_CLIP }}>
        <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
          {/* cánh đáy sáng hơn, hai cánh bên tối nhẹ để thấy độ chồng của các cánh giấy */}
          <polygon points={`0,100 50,${APEX * 100} 100,100`} fill="rgba(255,255,255,0.4)" />
          <polygon points={`0,0 50,${APEX * 100} 0,100`} fill="rgba(120,90,50,0.07)" />
          <polygon points={`100,0 50,${APEX * 100} 100,100`} fill="rgba(120,90,50,0.1)" />
          <path d={`M0 0 L50 ${APEX * 100} L100 0`} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
          <path d={`M0 100 L50 ${APEX * 100} L100 100`} fill="none" stroke="rgba(120,90,50,0.32)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <Sheen shine={shine} />
      </div>
    </motion.div>
  );
}

/** Dòng chữ nhỏ dưới cảnh, mờ vào/ra theo tiến độ cuộn. */
function Caption({ p, input, output, children }: { p: MotionValue<number>; input: number[]; output: number[]; children: ReactNode }) {
  const opacity = useTransform(p, input, output);
  return (
    <motion.p className="pointer-events-none absolute inset-x-0 text-center" style={{ bottom: "1.2cqw", opacity, color: MUTED, fontSize: "clamp(13px, 1.6cqw, 20px)", letterSpacing: "0.12em", zIndex: 6 }}>
      {children}
    </motion.p>
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
function EnvFront({ label, title, accent, shine, opacity }: { label: string; title: string; accent: string; shine: MotionValue<string>; opacity: MotionValue<number> }) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{ opacity, background: CREAM, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: `translateZ(${Z_POCKET}px)`, boxShadow: ENV_SHADOW }}
    >
      <div className="absolute flex flex-col items-center justify-center text-center" style={{ inset: "1.8cqw", border: "0.15cqw solid rgba(201,165,92,0.75)", padding: "2cqw 7cqw" }}>
        {label && <p className="font-semibold uppercase" style={{ color: accent, fontSize: "1.5cqw", letterSpacing: "0.36em" }}>{label}</p>}
        <p style={{ fontFamily: SCRIPT, color: "#3a2a2e", fontSize: "6cqw", lineHeight: 1.15, marginTop: label ? "1.2cqw" : 0 }}>{title}</p>
        <div className="flex items-center" style={{ gap: "1cqw", marginTop: "1.2cqw" }} aria-hidden>
          <span style={{ height: 1, width: "6cqw", background: `linear-gradient(90deg, transparent, ${GOLD_LINE})` }} />
          <span style={{ color: GOLD_LINE, fontSize: "1.6cqw" }}>♥</span>
          <span style={{ height: 1, width: "6cqw", background: `linear-gradient(270deg, transparent, ${GOLD_LINE})` }} />
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
    </motion.div>
  );
}

/* ---------- Thiệp cưới Việt Nam gấp đôi, 4 mặt ----------
   1 bìa ngoài (đỏ, chữ vàng, chữ Hỷ)  ·  2 mặt trong bìa, bên trái (nhà trai, nhà gái)
   3 mặt trong, bên phải (lời mời, tên cô dâu chú rể, giờ, ngày âm dương, địa điểm)  ·  4 bìa sau (lời cảm ơn)
   Cấu tạo: trang phải đứng yên (mặt 3 phía trước, mặt 4 phía sau); bìa là một tấm hai mặt (mặt 1 và mặt 2) lật quanh gáy bên trái. */
const PAPER = "linear-gradient(150deg, #fffdf8 0%, #f5ecda 100%)";
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
      style={{ background: bg, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: back ? "rotateY(180deg) translateZ(0.5px)" : "translateZ(0.5px)", boxShadow: "0 0.4cqw 1.2cqw -0.4cqw rgba(0,0,0,0.35)" }}
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
      <div className="absolute inset-0" style={{ transform: "translateZ(1px)", transformStyle: "preserve-3d" }}>
        <Face bg={PAPER} gutter="left" shine={sh}>
          <PaperFrame />
          <InnerRight red={red} />
        </Face>
      </div>
      <div className="absolute inset-0" style={{ transform: "translateZ(-1px)", transformStyle: "preserve-3d" }}>
      <Face back bg={redBg(accent, red)} shine={sh}>
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: PATTERN }} />
        <GoldFrame />
        <BackCover />
      </Face>
      </div>

      {/* Bìa: lật quanh gáy bên trái. Mặt 1 (ngoài) và mặt 2 (trong bìa, bên trái) */}
      <div className="absolute inset-0" style={{ transform: "translateZ(4px)", transformStyle: "preserve-3d" }}>
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
  { dx: -22, y: 16, s: 2.2, t: 0.9 }, { dx: 20, y: 20, s: 1.6, t: 0.91 }, { dx: -12, y: 40, s: 1.4, t: 0.91 },
  { dx: 24, y: 36, s: 2.0, t: 0.92 }, { dx: 2, y: 9, s: 1.2, t: 0.92 }, { dx: -27, y: 29, s: 1.5, t: 0.93 },
  { dx: 14, y: 45, s: 1.3, t: 0.93 }, { dx: -4, y: 44, s: 1.8, t: 0.94 },
];

function Spark({ p, dx, y, s, t }: { p: MotionValue<number>; dx: number; y: number; s: number; t: number }) {
  const opacity = useTransform(p, [t, t + 0.02, t + 0.06], [0, 1, 0]);
  const scale = useTransform(p, [t, t + 0.03, t + 0.06], [0, 1, 0.3]);
  const rotate = useTransform(p, [t, t + 0.06], [0, 90]);
  const rise = useTransform(p, [t, t + 0.06], [0, -4], { ease });
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