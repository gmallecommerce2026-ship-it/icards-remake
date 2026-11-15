"use client";

import { useEffect, useRef } from "react";
import { animate, cubicBezier, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTime, useTransform, useVelocity, type AnimationPlaybackControls, type MotionValue } from "motion/react";
import type { TemplateHero } from "@/lib/template-heroes";

type Props = { hero: TemplateHero; categoryLabel: string };

/** Phần đuôi của v*k theo vòng lặp 0..1: dùng để chạy băng chuyền liền mạch khi nội dung được nhân đôi. */
const loop01 = (v: number, k: number) => {
  const x = v * k;
  return x - Math.floor(x);
};

/**
 * Hero 3D cho trang danh mục mẫu thiệp. Bố cục do preset quyết định, nội dung do admin nhập.
 * - envelope: cảnh "ghim" (sticky) dài vài màn hình như trang xem thiệp mời; cuộn trang điều khiển animation, có lò xo làm mượt.
 * - ribbon / cylinder / wall: chạy theo cuộn trang bằng CSS 3D.
 */
export function CategoryHero3D(props: Props) {
  return props.hero.preset === "envelope" ? <EnvelopeHero {...props} /> : <FlowHero {...props} />;
}

/* ====================== Phong bì: cảnh ghim + cuộn ====================== */

/** Chiều cao vùng ghim (svh). Quãng cuộn để chạy hết animation = (PIN_VH − 100) svh. Tăng để chậm hơn, giảm để nhanh hơn. */
const PIN_VH = 260;

function EnvelopeHero({ hero, categoryLabel }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Cùng thông số làm mượt với trang xem thiệp mời (PublicEnvelopeIntro)
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.7 });
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
      style={{ height: `${PIN_VH}svh`, background: `linear-gradient(180deg, ${hero.accent}1f 0%, #FEFDFD 85%)` }}
    >
      <div
        className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden px-5"
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

/* ====================== Ribbon / Cylinder / Wall ====================== */

function FlowHero({ hero, categoryLabel }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // p là nguồn chung cho các kiểu 3D. Mặc định lấy theo vị trí cuộn; khi đặt chuột lên thì lăn chuột điều khiển.
  const p = useMotionValue(0.8);
  const hovering = useRef(false);
  const run = useRef<AnimationPlaybackControls | null>(null);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!hovering.current && !reduce) p.set(v);
  });
  const onEnter = () => {
    hovering.current = true;
    run.current?.stop();
  };
  const onLeave = () => {
    hovering.current = false;
    run.current?.stop();
    if (reduce) return; // giữ nguyên vị trí vừa lăn tới
    run.current = animate(p, scrollYProgress.get(), { duration: 0.6, ease: "easeOut" });
  };

  // Khi chuột ở trên hero: lăn chuột điều khiển animation, chưa xong thì chặn cuộn trang; hết thì trả cuộn cho trang.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const WHEEL_PX = 1000;
    const onWheel = (e: WheelEvent) => {
      // wheel chỉ tới section khi con trỏ đang ở trên nó, nên không cần chờ pointerenter
      if (!hovering.current) {
        hovering.current = true;
        run.current?.stop();
      }
      if (e.ctrlKey || e.deltaY === 0) return;
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      const cur = p.get();
      const atEnd = (dy > 0 && cur >= 1) || (dy < 0 && cur <= 0);
      if (atEnd) return;
      e.preventDefault();
      p.set(Math.min(1, Math.max(0, cur + dy / WHEEL_PX)));
    };
    const onDocLeave = () => {
      if (!hovering.current) return;
      hovering.current = false;
      run.current?.stop();
      if (reduce) return;
      run.current = animate(p, scrollYProgress.get(), { duration: 0.6, ease: "easeOut" });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    document.documentElement.addEventListener("mouseleave", onDocLeave);
    return () => {
      el.removeEventListener("wheel", onWheel);
      document.documentElement.removeEventListener("mouseleave", onDocLeave);
    };
  }, [p, reduce, scrollYProgress]);

  const k = reduce ? 0 : hero.speed;
  const accent = hero.accent;
  const title = hero.title || categoryLabel;

  return (
    <section
      ref={ref}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      aria-label={`Giới thiệu danh mục ${categoryLabel}`}
      className="relative overflow-hidden border-b border-black/5"
      style={{ background: `linear-gradient(180deg, ${accent}1f 0%, #FEFDFD 85%)` }}
    >
      <div className="relative z-10 mx-auto max-w-[1520px] px-5 pb-2 pt-10 text-center md:pt-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>
          {categoryLabel}
        </p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-[#222] md:text-5xl">{title}</h2>
        {hero.subtitle && <p className="mx-auto mt-3 max-w-xl text-sm text-[#555] md:text-base">{hero.subtitle}</p>}
      </div>

      <div className="relative h-[340px] md:h-[420px]" style={{ perspective: 1400 }}>
        {hero.preset === "cylinder" ? <Cylinder p={p} k={k} hero={hero} /> : hero.preset === "wall" ? <Wall p={p} k={k} hero={hero} /> : <Ribbon p={p} k={k} hero={hero} />}
      </div>
    </section>
  );
}

type PresetProps = { p: MotionValue<number>; k: number; hero: TemplateHero };

/** Ảnh cho hero; chưa có ảnh thì dùng ô màu nhấn để bố cục vẫn hiện đẹp. */
function Tile({ src, accent, w, h }: { src?: string; accent: string; w: number; h: number }) {
  return (
    <div
      className="shrink-0 overflow-hidden rounded-[10px] shadow-[0_14px_30px_-12px_rgba(0,0,0,0.35)]"
      style={{ width: w, height: h, background: src ? "#eee" : `linear-gradient(135deg, ${accent}, #1a1a1a)` }}
    >
      {src && <img src={src} alt="" loading="lazy" draggable={false} className="size-full object-cover" />}
    </div>
  );
}

function Ribbon({ p, k, hero }: PresetProps) {
  // Hai dải nghiêng, chạy ngược chiều nhau. Mỗi dải nhân đôi nội dung để vòng lặp liền mạch.
  const rowA = hero.images.length ? [...hero.images, ...hero.images] : Array.from({ length: 12 }, () => "");
  const rowB = [...rowA].reverse();
  const xA = useTransform(p, (v) => `${-loop01(v, k * 2) * 50}%`);
  const xB = useTransform(p, (v) => `${-(1 - loop01(v, k * 2)) * 50}%`);
  const row = (items: string[], x: MotionValue<string>, key: string) => (
    <motion.div key={key} className="flex w-max gap-4" style={{ x }}>
      {items.map((src, i) => (
        <Tile key={`${key}-${i}`} src={src || undefined} accent={hero.accent} w={200} h={150} />
      ))}
    </motion.div>
  );
  return (
    <div
      className="absolute inset-0 flex flex-col justify-center gap-5"
      style={{ transform: "rotateX(16deg) rotateZ(-5deg) scale(1.2)", transformStyle: "preserve-3d" }}
    >
      {row(rowA, xA, "a")}
      {row(rowB, xB, "b")}
    </div>
  );
}

function Cylinder({ p, k, hero }: PresetProps) {
  const n = Math.max(hero.images.length, 8);
  const tiles = Array.from({ length: n }, (_, i) => hero.images[i % Math.max(hero.images.length, 1)] ?? "");
  const w = 170, h = 230;
  // bán kính sao cho các ô sát nhau trên vòng tròn
  const radius = Math.max(300, Math.round((w / 2 + 14) / Math.tan(Math.PI / n)));
  const rotY = useTransform(p, (v) => v * 360 * k * 1.5);
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "rotateX(-8deg)", transformStyle: "preserve-3d" }}>
      <motion.div className="relative" style={{ width: w, height: h, transformStyle: "preserve-3d", rotateY: rotY }}>
        {tiles.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{ transform: `rotateY(${(i * 360) / n}deg) translateZ(${radius}px)`, backfaceVisibility: "hidden" }}
          >
            <Tile src={src || undefined} accent={hero.accent} w={w} h={h} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function Wall({ p, k, hero }: PresetProps) {
  // Năm cột ảnh lệch độ sâu, cột chẵn chạy lên, cột lẻ chạy xuống.
  const cols = 5;
  const base = hero.images;
  const colItems = (c: number) => {
    const src = base.length ? base.filter((_, i) => i % cols === c) : [];
    const list = src.length ? src : Array.from({ length: 4 }, () => "");
    return [...list, ...list];
  };
  return (
    <div
      className="absolute inset-0 flex items-center justify-center gap-4"
      style={{ transform: "rotateX(22deg) rotateY(-14deg) scale(1.1)", transformStyle: "preserve-3d" }}
    >
      {Array.from({ length: cols }, (_, c) => (
        <WallColumn key={c} p={p} k={k} hero={hero} items={colItems(c)} up={c % 2 === 0} depth={c % 2 === 0 ? 0 : -90} />
      ))}
    </div>
  );
}

function WallColumn({ p, k, hero, items, up, depth }: PresetProps & { items: string[]; up: boolean; depth: number }) {
  const y = useTransform(p, (v) => {
    const f = loop01(v, k * 2);
    return `${(up ? -f : f - 1) * 50}%`;
  });
  return (
    <div className="relative h-full overflow-hidden" style={{ transform: `translateZ(${depth}px)`, transformStyle: "preserve-3d" }}>
      <motion.div className="flex w-max flex-col gap-4" style={{ y }}>
        {items.map((src, i) => (
          <Tile key={i} src={src || undefined} accent={hero.accent} w={150} h={190} />
        ))}
      </motion.div>
    </div>
  );
}

/* ---------- Phong bì 3D cho thiệp cưới ----------
   0.00–0.08  phong bì kem đóng kín, con dấu sáp ở giữa nắp, chữ ở bên PHẢI
   0.08–0.26  con dấu mờ đi, nắp lật mở (mặt trong nắp màu nhấn)
   0.24–0.42  thiệp trượt lên khỏi phong bì, hơi nghiêng rồi thẳng lại
   0.42–0.58  phong bì + thiệp lướt sang PHẢI theo đường cung, chữ chuyển sang TRÁI
   0.58–0.80  thiệp bay sang TRÁI, nhấc lên khỏi mặt phẳng và lật 180°, phong bì chìm xuống mờ đi
   0.78–0.92  chữ mặt sau hiện ở bên PHẢI
   Vị trí tính theo % chiều rộng sân khấu; kích thước dùng cqw để co giãn theo khung. */
const L = 22;
const R = 78;
const ease = cubicBezier(0.45, 0.05, 0.2, 1);
const SERIF = "var(--font-display-raw), 'Cormorant Garamond', Georgia, serif";
const SCRIPT = "var(--font-card-script), 'Great Vibes', cursive";
const mix = (a: string, pct: number, b: string) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;

type Look = { x: MotionValue<number>; y: MotionValue<number> };

function EnvelopeScene({ p, look, lean, reduce, hero, categoryLabel }: { p: MotionValue<number>; look: Look; lean: MotionValue<number>; reduce: boolean; hero: TemplateHero; categoryLabel: string }) {
  const accent = hero.accent;
  const tr = (input: number[], output: number[]) => useTransform(p, input, output, { ease });

  // Các chặng chồng lên nhau một phần để chuyển động liền mạch, không dừng–chạy–dừng
  const envLeft = tr([0, 0.36, 0.58], [L, L, R]);
  const envOpacity = useTransform(p, [0.62, 0.76], [1, 0]);
  const envZ = tr([0.46, 0.72], [0, -420]); // phong bì lùi ra sau trước khi mờ đi, nên không lộ các lớp khi trong suốt
  const envDrop = tr([0.56, 0.8], [0, 5]);
  const sealOpacity = useTransform(p, [0.04, 0.12], [1, 0]);
  const flapDeg = tr([0.07, 0.25], [0, -125]);
  const flapZ = useTransform([flapDeg, envZ], ([d, z]: number[]) => (d < -80 ? -6 : 34) + z); // nắp mở thì ra sau thiệp, đóng thì ở trước
  const zPocket = useTransform(envZ, (z) => z + 20);
  const zFold = useTransform(envZ, (z) => z + 20.5);
  const zSeal = useTransform(envZ, (z) => z + 38);

  const cardLeft = tr([0, 0.36, 0.58, 0.84], [L, L, R, L]);
  const cardTop = tr([0, 0.2, 0.4, 0.56, 0.84], [14.5, 14.5, 4, 4, 14.5]);
  const cardArc = useTransform(p, [0.36, 0.47, 0.58, 0.58, 0.7, 0.84], [0, -2.5, 0, 0, -3, 0]);
  const cardLeftCss = useTransform(cardLeft, (v) => `calc(${v}% - 21cqw)`);
  const time = useTime();
  const floatAmp = useTransform(p, [0.4, 0.5], [0, 1]);
  const floatY = useTransform([time, floatAmp], ([t, a]: number[]) => (reduce ? 0 : Math.sin(t / 1200) * 0.5 * a)); // thiệp lơ lửng nhẹ khi đã rút ra
  const cardTopCss = useTransform([cardTop, cardArc, floatY], ([t, a, f]: number[]) => `${t + a + f}cqw`);
  const cardTilt = useTransform(p, [0.2, 0.32, 0.4], [-2.5, -1, 0]);
  const cardScale = useTransform(p, [0.2, 0.4, 0.46, 0.58, 0.72, 0.84], [1, 1.03, 1.03, 0.82, 0.82, 1]); // bù lại phối cảnh khi thiệp nhấc gần camera
  const cardZ = useTransform(p, [0.44, 0.56, 0.72, 0.84], [10, 320, 320, 10]); // nhấc thiệp cao khỏi phong bì rồi mới lật, để hai mặt phẳng không cắt nhau
  const flipDeg = tr([0.56, 0.84], [0, 180]);
  const flipTilt = useTransform(p, [0.56, 0.7, 0.84], [0, -10, 0]);
  const cardShadow = useTransform(cardZ, [10, 320], [0.5, 0.2]);
  const shine = useTransform(flipDeg, [0, 90, 180], ["130%", "40%", "-30%"]);

  // Camera: dolly + xoay nhẹ theo tiến độ, cộng thêm nghiêng theo con trỏ
  const camY = useTransform([p, look.x], ([pv, x]: number[]) => -9 + pv * 14 + x * 9);
  const camX = useTransform([p, look.y, lean], ([pv, y, l]: number[]) => 7 - pv * 4 - y * 6 + l); // lean: ngả theo tốc độ cuộn
  const camScale = useTransform(p, [0, 0.5, 0.8, 1], [0.95, 1, 1.04, 1]);
  const textShift = useTransform(look.x, (x) => `${-x * 1.6}cqw`);

  const rightOpacity = useTransform(p, [0, 0.1, 0.34, 0.42], [1, 1, 1, 0]);
  const rightY = useTransform(p, [0.34, 0.42], [0, -2]);
  const leftOpacity = useTransform(p, [0.4, 0.5, 0.62, 0.7], [0, 1, 1, 0]);
  const leftY = useTransform(p, [0.4, 0.5, 0.62, 0.7], [2, 0, 0, -2]);
  const backOpacity = useTransform(p, [0.8, 0.92], [0, 1]);
  const backY = useTransform(p, [0.8, 0.92], [2, 0]);

  const envLeftCss = useTransform(envLeft, (v) => `calc(${v}% - 24cqw)`);
  const envTopCss = useTransform(envDrop, (d) => `${12.5 + d}cqw`);
  const sealLeft = useTransform(envLeft, (v) => `calc(${v}% - 3.2cqw)`);
  const sealTop = useTransform(envDrop, (d) => `${12.5 + 18 - 3.6 + d}cqw`);
  const envShadowLeft = useTransform(envLeft, (v) => `calc(${v}% - 22cqw)`);
  const envShadowOp = useTransform(envOpacity, (o) => o * 0.55);
  const cardShadowLeft = useTransform(cardLeft, (v) => `calc(${v}% - 19cqw)`);
  const cardShadowOp = useTransform(p, [0.4, 0.56, 0.72, 0.84], [0, 0.35, 0.18, 0.4]);
  const rightY2 = useTransform(rightY, (v) => `calc(-50% + ${v}cqw)`);
  const leftY2 = useTransform(leftY, (v) => `calc(-50% + ${v}cqw)`);
  const backY2 = useTransform(backY, (v) => `calc(-50% + ${v}cqw)`);

  const front = hero.images[0];
  const back = hero.images[1] ?? hero.images[0];
  const cream = "linear-gradient(160deg, #fbf6ec 0%, #f1e7d3 100%)";
  const creamShade = (a: number) => `linear-gradient(${a}deg, #f6eddc 0%, #e9dcc3 100%)`;
  const liner = `linear-gradient(170deg, ${mix(accent, 88, "#fff")} 0%, ${mix(accent, 70, "#000")} 100%)`;
  const W = "48cqw";
  const H = "33cqw";

  return (
    <div className="relative mx-auto w-full" style={{ containerType: "inline-size", maxWidth: "min(1080px, calc((100svh - 120px) * 2))" }}>
      <div className="relative w-full" style={{ height: "50cqw", perspective: 1400 }}>
        {/* Cánh hoa rơi chậm (phẳng, nằm sau cảnh) */}
        {!reduce && PETALS.map((pt, i) => <Petal key={i} p={p} {...pt} accent={accent} />)}

        {/* Camera: mọi lớp bên trong được sắp theo độ sâu thật (translateZ), không còn chồng phẳng bằng z-index */}
        <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d", rotateX: camX, rotateY: camY, scale: camScale }}>
          {/* Bóng đổ trên nền: của phong bì và của thiệp (nhạt đi khi thiệp bay cao) */}
          <motion.div aria-hidden className="absolute rounded-[50%]" style={{ left: envShadowLeft, top: "43.5cqw", width: "44cqw", height: "4cqw", background: "rgba(40,20,20,0.35)", filter: "blur(2.2cqw)", opacity: envShadowOp, z: -40 }} />
          <motion.div aria-hidden className="absolute rounded-[50%]" style={{ left: cardShadowLeft, top: "44cqw", width: "38cqw", height: "3.4cqw", background: "rgba(40,20,20,0.45)", filter: "blur(2.4cqw)", opacity: cardShadowOp, scale: useTransform(cardZ, [10, 320], [1, 0.75]), z: -38 }} />

          {/* Mặt trong phong bì */}
          <motion.div aria-hidden className="absolute" style={{ left: envLeftCss, top: envTopCss, width: W, height: H, background: liner, borderRadius: 4, opacity: envOpacity, z: envZ, boxShadow: "0 1.4cqw 3cqw -1cqw rgba(0,0,0,0.45)" }} />

          {/* Thiệp */}
          <motion.div
            className="absolute"
            style={{ left: cardLeftCss, top: cardTopCss, width: "42cqw", height: "29cqw", transformStyle: "preserve-3d", rotateZ: cardTilt, scale: cardScale, z: cardZ, rotateX: flipTilt, rotateY: flipDeg }}
          >
            <CardFace src={front} label={categoryLabel} text={hero.title || categoryLabel} accent={accent} shine={shine} />
            <CardFace src={back} label="" text={hero.subtitle || hero.title || categoryLabel} accent={accent} shine={shine} back />
          </motion.div>

          {/* Túi phía trước: ba mảnh gấp chéo hình chữ V, mỗi mảnh một sắc độ */}
          {[
            { clip: "polygon(0 0, 50% 54.5%, 0 100%)", bg: creamShade(100) },
            { clip: "polygon(100% 0, 50% 54.5%, 100% 100%)", bg: creamShade(80) },
            { clip: "polygon(0 100%, 50% 54.5%, 100% 100%)", bg: cream },
          ].map((f, i) => (
            <motion.div key={i} aria-hidden className="absolute" style={{ left: envLeftCss, top: envTopCss, width: W, height: H, background: f.bg, clipPath: f.clip, opacity: envOpacity, z: zPocket }} />
          ))}
          <motion.svg aria-hidden viewBox="0 0 48 33" className="absolute" style={{ left: envLeftCss, top: envTopCss, width: W, height: H, opacity: envOpacity, z: zFold }}>
            <path d="M0 0 L24 18 L48 0 M0 33 L24 18 L48 33" fill="none" stroke="rgba(120,90,50,0.22)" strokeWidth="0.12" />
          </motion.svg>

          {/* Nắp: hai mặt (ngoài kem, trong màu nhấn), bản lề ở mép trên. Độ mờ đặt lên từng mặt để không làm phẳng cảnh 3D */}
          <motion.div aria-hidden className="absolute" style={{ left: envLeftCss, top: envTopCss, width: W, height: "18cqw", transformOrigin: "50% 0%", transformStyle: "preserve-3d", rotateX: flapDeg, z: flapZ }}>
            <motion.div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fbf6ec 0%, #eadfc8 100%)", clipPath: "polygon(0 0, 100% 0, 50% 100%)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", opacity: envOpacity }} />
            <motion.div className="absolute inset-0" style={{ background: mix(accent, 62, "#000"), clipPath: "polygon(0 100%, 100% 100%, 50% 0)", transform: "rotateX(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", opacity: envOpacity }} />
          </motion.div>

          {/* Con dấu sáp ở đầu nắp */}
          <motion.div
            aria-hidden
            className="absolute flex items-center justify-center rounded-full"
            style={{
              left: sealLeft, top: sealTop, width: "6.4cqw", height: "6.4cqw", z: zSeal, opacity: sealOpacity,
              background: `radial-gradient(circle at 35% 30%, ${mix(accent, 75, "#fff")}, ${accent} 55%, ${mix(accent, 60, "#000")})`,
              boxShadow: "0 0.5cqw 1cqw rgba(0,0,0,0.4), inset 0 0 0 0.45cqw rgba(255,255,255,0.14), inset 0 -0.3cqw 0.6cqw rgba(0,0,0,0.3)",
              color: "rgba(255,255,255,0.9)", fontFamily: SCRIPT, fontSize: "3.6cqw", lineHeight: 1,
            }}
          >
            &amp;
          </motion.div>
        </motion.div>

        {/* Chữ: nằm ngoài camera để luôn rõ nét, trượt ngược nhẹ theo con trỏ cho có chiều sâu */}
        <motion.div className="absolute" style={{ right: "4cqw", top: "58%", width: "42cqw", y: rightY2, x: textShift, opacity: rightOpacity, zIndex: 6 }}>
          <Heading label={categoryLabel} title={hero.title || categoryLabel} subtitle={hero.subtitle} accent={accent} />
        </motion.div>
        <motion.div className="absolute" style={{ left: "4cqw", top: "58%", width: "40cqw", y: leftY2, x: textShift, opacity: leftOpacity, zIndex: 6 }}>
          <Heading label={categoryLabel} title={hero.title || categoryLabel} accent={accent} />
        </motion.div>
        <motion.div className="absolute" style={{ right: "4cqw", top: "58%", width: "42cqw", y: backY2, x: textShift, opacity: backOpacity, zIndex: 6 }}>
          <Heading title={hero.subtitle || hero.title || categoryLabel} accent={accent} small />
        </motion.div>
      </div>
    </div>
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

/** Một mặt của thiệp: ảnh nếu có, không thì giấy kem có khung vàng mảnh. Mặt sau xoay sẵn 180° và ẩn khi quay ra sau. */
function CardFace({ src, label, text, accent, shine, back = false }: { src?: string; label: string; text: string; accent: string; shine: MotionValue<string>; back?: boolean }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        borderRadius: 3,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
        background: src ? "#f6f1e6" : "linear-gradient(150deg, #fffdf8 0%, #f5ecda 100%)",
      }}
    >
      {src ? (
        <img src={src} alt="" draggable={false} className="size-full object-cover" />
      ) : (
        <div className="absolute flex flex-col items-center justify-center text-center" style={{ inset: "1.6cqw", border: `0.18cqw solid #c9a55c`, outline: "0.1cqw solid #c9a55c", outlineOffset: "0.5cqw", padding: "2cqw" }}>
          {label && <p className="uppercase" style={{ color: accent, fontSize: "1.5cqw", letterSpacing: "0.36em" }}>{label}</p>}
          <p style={{ fontFamily: SCRIPT, color: "#3a2a2e", fontSize: "5.2cqw", lineHeight: 1.15, marginTop: label ? "1cqw" : 0 }}>{text}</p>
          <span style={{ color: "#c9a55c", fontSize: "1.8cqw", marginTop: "1cqw" }} aria-hidden>♥</span>
        </div>
      )}
      {/* ánh sáng lướt nhẹ trên mặt giấy */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 65%)", backgroundSize: "300% 100%", backgroundPositionX: shine, mixBlendMode: "soft-light" }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.07) 100%)" }} />
    </div>
  );
}