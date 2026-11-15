"use client";

import { useEffect, useRef, type ComponentType, type CSSProperties, type ReactNode, type RefObject } from "react";
import { animate, cubicBezier, motion, useMotionValue, useReducedMotion, useSpring, useTime, useTransform, useVelocity, type AnimationPlaybackControls, type MotionValue } from "motion/react";
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

/** Quãng lăn chuột (px) để đi hết animation của từng kiểu, khi speed = 1. Phong bì nhiều chuyển động nên cần quãng dài hơn. */
export const SCROLL_PX: Record<HeroPreset, number> = { envelope: 2400, fan: 1400, book: 1400, flower: 1400, cube: 1400 };
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
    let hovering = false;
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

/* ====================== Phong bì: cảnh ghim + cuộn ====================== */


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
const PW = 23; // chiều rộng một mặt thiệp (cqw)
const PH = 31; // chiều cao thiệp (cqw)
const ease = cubicBezier(0.45, 0.05, 0.2, 1);
const SERIF = "var(--font-display-raw), 'Cormorant Garamond', Georgia, serif";
const SCRIPT = "var(--font-card-script), 'Great Vibes', cursive";
const GOLD = "#c9a55c";
const mix = (a: string, pct: number, b: string) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;
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

/* Hằng số phong bì (cqw). Thiệp nằm ngang trong phong bì lúc đầu: sau khi rút ra thì xoay dọc. */
const ENV_W = 48;
const ENV_H = 33;
const ENV_TOP = 19.5;
const ENV_CY = ENV_TOP + ENV_H / 2; // tâm phong bì theo chiều dọc
const CARD_CY = 30; // tâm thiệp khi đã xoay dọc và đứng giữa khung
const CARD_OUT = 8; // tâm thiệp (nằm ngang) khi đã ra khỏi miệng phong bì
const E_RISE = cubicBezier(0.6, 0, 0.3, 1); // rút thiệp: chậm, rồi nhanh, rồi chậm
const E_LAND = cubicBezier(0.2, 0.6, 0.3, 1); // xoay dọc và hạ xuống: nhanh rồi chậm
const E_OPEN = cubicBezier(0.4, 0, 0.2, 1.22); // mở bìa: có đà, vượt nhẹ rồi về chỗ

/**
 * Cảnh phong bì. Thứ tự (p = tiến trình cuộn, 0 → 1):
 *   0.00–0.08  phong bì nằm yên, mặt trước hướng ra, nhấp nhô nhẹ
 *   0.08–0.24  lật 180° để lộ mặt sau (nắp đóng, dấu sáp); khi lật phong bì nhô lên gần camera
 *   0.24–0.36  dấu sáp tan, nắp mở ra phía sau (lớp Z thấp hơn thiệp nên không đè lên thiệp)
 *   0.36–0.56  thiệp vẫn NẰM NGANG, trượt lên khỏi miệng phong bì (chậm, rồi nhanh, rồi chậm)
 *   0.56–0.72  thiệp xoay dọc và đi lên giữa khung; thiệp nâng lên trước phong bì, phong bì mờ dần
 *   0.84–1.00  bìa thiệp mở ra theo gáy bên trái; bụi vàng và hào quang
 * Lớp Z (từ xa đến gần): phong bì nằm sau; nắp ở sau thiệp khi đã mở, trước khi đóng; thiệp đứng trước phong bì sau khi ra khỏi miệng.
 */
function EnvelopeScene({ p, look, lean, reduce, hero, categoryLabel }: { p: MotionValue<number>; look: Look; lean: MotionValue<number>; reduce: boolean; hero: TemplateHero; categoryLabel: string }) {
  const accent = hero.accent;
  const title = hero.title || categoryLabel;
  const time = useTime();

  /* --- Phong bì: lật, nâng lên khi lật, nhấp nhô lúc nằm yên, mờ dần ở cuối --- */
  const envRot = useTransform(p, [0.08, 0.24], [0, 180], { ease });
  const envLift = useTransform(p, [0.08, 0.16, 0.24], [0, 14, 0]);
  const envFade = useTransform(p, [0.72, 0.8], [1, 0]);
  const bob = useTransform([time, p], ([t, pv]: number[]) => (reduce ? 0 : Math.sin(t / 1100) * 0.4 * (1 - c01(pv / 0.06))));
  const envTop = useTransform(bob, (b) => `${ENV_TOP + b}cqw`);
  const envTopN = useTransform(bob, (b) => ENV_TOP + b);
  const shine = useTransform(p, [0.08, 0.24], ["130%", "-30%"]);

  /* --- Nắp: mở sau khi đã lật xong. Lúc đóng thì nằm trước thiệp, lúc mở thì lùi ra sau thiệp --- */
  const flapDeg = useTransform(p, [0.24, 0.36], [0, -150], { ease: E_RISE });
  const flapZ = useTransform(flapDeg, (d) => (d < -75 ? -2 : 2));
  const flapOp = useTransform(p, [0.2, 0.24], [0, 1]);

  /* --- Dấu sáp: nằm trên nắp lúc đóng, tan khi nắp bắt đầu mở --- */
  const sealOp = useTransform(p, [0.2, 0.24, 0.28], [0, 1, 0]);
  const sealScale = useTransform(p, [0.24, 0.27, 0.3], [1, 1.25, 0.2]);
  const sealTop = useTransform(envTopN, (t) => `${t + 18 - 3.2}cqw`);

  /* --- Thiệp: nằm ngang và trượt lên khỏi miệng phong bì, sau đó xoay dọc và đi xuống giữa khung --- */
  const cyRise = useTransform(p, [0.36, 0.56], [ENV_CY, CARD_OUT], { ease: E_RISE });
  const cyLand = useTransform(p, [0.56, 0.72], [0, CARD_CY - CARD_OUT], { ease: E_LAND });
  const cardTop = useTransform([cyRise, cyLand], ([a, b]: number[]) => `${a + b - PH / 2}cqw`);
  const cardRot = useTransform(p, [0.56, 0.72], [90, 0], { ease: E_LAND });
  const cardZ = useTransform(p, [0.56, 0.72], [0, 14]);
  const cardShift = useTransform(p, [0.84, 1], [0, PW / 2], { ease: E_OPEN });
  const cardLeft = useTransform(cardShift, (sh) => `calc(50% - ${PW / 2}cqw + ${sh}cqw)`);
  const coverDeg = useTransform(p, [0.84, 1], [0, -180], { ease: E_OPEN });
  const cardShine = useTransform(p, [0.84, 1], ["130%", "-30%"]);

  /* --- Camera: nghiêng nhẹ theo con trỏ và tốc độ cuộn --- */
  const camX = useTransform([look.y, lean], ([y, l]: number[]) => -y * 4 + l);
  const camY = useTransform(look.x, (x) => x * 6);

  return (
    <div className="relative mx-auto w-full" style={{ containerType: "inline-size", maxWidth: "min(1080px, calc((75svh - 56px) * 1.1))" }}>
      <div className="relative w-full" style={{ height: "60cqw", perspective: 1400 }}>
        {/* Cánh hoa rơi chậm (phẳng, nằm sau cảnh) */}
        {!reduce && PETALS.map((pt, i) => <Petal key={i} p={p} {...pt} accent={accent} />)}

        {/* Mọi lớp được sắp theo độ sâu thật (translateZ) */}
        <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d", rotateX: camX, rotateY: camY }}>
          {/* Phong bì: hai mặt, lật quanh trục dọc giữa */}
          <motion.div
            aria-hidden
            className="absolute"
            style={{ left: `calc(50% - ${ENV_W / 2}cqw)`, top: envTop, width: `${ENV_W}cqw`, height: `${ENV_H}cqw`, transformStyle: "preserve-3d", rotateY: envRot, z: envLift, opacity: envFade }}
          >
            <EnvFront label={categoryLabel} title={title} accent={accent} shine={shine} />
            <EnvPlateBack shine={shine} />
          </motion.div>

          {/* Nắp: nằm ngoài mặt lật, mép trên là bản lề. Đóng thì ở trước, mở thì ở sau */}
          <motion.div
            aria-hidden
            className="absolute"
            style={{ left: `calc(50% - ${ENV_W / 2}cqw)`, top: envTop, width: `${ENV_W}cqw`, height: "18cqw", transformOrigin: "50% 0%", transformStyle: "preserve-3d", rotateX: flapDeg, z: flapZ, opacity: flapOp }}
          >
            <div className="absolute inset-0" style={{ background: FLAP_BG, clipPath: "polygon(0 0, 100% 0, 50% 100%)", ...hidden }} />
            <div className="absolute inset-0" style={{ background: mix(accent, 62, "#000"), clipPath: "polygon(0 100%, 100% 100%, 50% 0)", transform: "rotateX(180deg)", ...hidden }} />
          </motion.div>

          {/* Dấu sáp ở đầu nắp */}
          <motion.div
            aria-hidden
            className="absolute flex items-center justify-center rounded-full"
            style={{ ...sealStyle(accent), left: "calc(50% - 3.2cqw)", top: sealTop, z: 4, opacity: sealOp, scale: sealScale }}
          >
            &amp;
          </motion.div>

          {/* Thiệp: nằm ngang trong phong bì lúc đầu (xoay 90°), xoay dọc sau khi rút ra */}
          <motion.div
            className="absolute"
            style={{ left: cardLeft, top: cardTop, width: `${PW}cqw`, height: `${PH}cqw`, transformStyle: "preserve-3d", rotateZ: cardRot, z: cardZ }}
          >
            <InviteCard coverDeg={coverDeg} shine={cardShine} accent={accent} coverSrc={hero.images[0]} />
          </motion.div>

          {!reduce && SPARKS.map((s, i) => <Spark key={i} p={p} {...s} />)}
        </motion.div>

        <Caption p={p} input={[0, 0.06]} output={[1, 0]} top="61cqw">
          Cuộn để mở thiệp <Bob accent={accent} />
        </Caption>
        <Caption p={p} input={[0.4, 0.46, 0.52, 0.58]} output={[0, 1, 1, 0]} top="61cqw">
          Thiệp đang được rút ra
        </Caption>
      </div>
    </div>
  );
}

/** Mặt sau của phong bì: giấy kem, ba nếp gấp. Xoay sẵn 180° để khi lật xong nhìn đúng chiều. */
function EnvPlateBack({ shine }: { shine: MotionValue<string> }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "#efe3cb", ...hidden, transform: "rotateY(180deg) translateZ(1.6px)", boxShadow: ENV_SHADOW }}
    >
      <svg aria-hidden viewBox="0 0 48 33" className="absolute inset-0 size-full">{FOLD}</svg>
      <Sheen shine={shine} />
    </div>
  );
}

/** Dòng chữ nhỏ dưới cảnh, mờ vào/ra theo tiến độ cuộn. */
function Caption({ p, input, output, children, top = "47.5cqw" }: { p: MotionValue<number>; input: number[]; output: number[]; children: ReactNode; top?: string }) {
  const opacity = useTransform(p, input, output);
  return (
    <motion.p className="pointer-events-none absolute inset-x-0 text-center" style={{ top, opacity, color: "#5b4d50", fontSize: "2cqw", letterSpacing: "0.12em", zIndex: 6 }}>
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