"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type AnimationPlaybackControls, type MotionValue } from "motion/react";
import type { TemplateHero } from "@/lib/template-heroes";

type Props = { hero: TemplateHero; categoryLabel: string };

/** Phần đuôi của v*k theo vòng lặp 0..1: dùng để chạy băng chuyền liền mạch khi nội dung được nhân đôi. */
const loop01 = (v: number, k: number) => {
  const x = v * k;
  return x - Math.floor(x);
};

/**
 * Hero 3D cho trang danh mục mẫu thiệp. Bố cục do preset quyết định, nội dung do admin nhập.
 * Chạy theo cuộn trang bằng CSS 3D (perspective + preserve-3d). Người dùng bật "giảm chuyển động" thì đứng yên ở trạng thái cuối.
 */
export function CategoryHero3D({ hero, categoryLabel }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // p là nguồn chung cho mọi kiểu 3D. Mặc định lấy theo vị trí cuộn; khi đặt chuột lên thì tự chạy.
  const p = useMotionValue(0.8);
  const hovering = useRef(false);
  const run = useRef<AnimationPlaybackControls | null>(null);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!hovering.current && !reduce) p.set(v);
  });
  // Khi chuột ở trên hero: lăn chuột điều khiển animation, chưa xong thì chặn cuộn trang.
  // Hết animation theo chiều đang lăn thì trả lại cuộn trang bình thường.
  const onEnter = () => {
    if (reduce) return;
    hovering.current = true;
    run.current?.stop();
  };
  const onLeave = () => {
    if (reduce) return;
    hovering.current = false;
    run.current?.stop();
    // rời chuột thì đưa animation về đúng vị trí cuộn trang hiện tại
    run.current = animate(p, scrollYProgress.get(), { duration: 0.6, ease: "easeOut" });
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const WHEEL_PX = 1000; // số px lăn chuột để chạy hết animation
    const onWheel = (e: WheelEvent) => {
      // Sự kiện wheel chỉ tới section khi con trỏ đang ở trên nó, nên không cần chờ pointerenter
      // (pointerenter có thể đến trễ hoặc không đến khi trang cuộn dưới con trỏ đứng yên).
      if (!hovering.current) {
        hovering.current = true;
        run.current?.stop();
      }
      if (e.ctrlKey || e.deltaY === 0) return; // ctrl+lăn = zoom của trình duyệt; lăn ngang thì bỏ qua
      // Chuẩn hóa về px: Firefox/chuột cũ báo theo dòng (deltaMode 1) hoặc trang (2)
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      const cur = p.get();
      const atEnd = (dy > 0 && cur >= 1) || (dy < 0 && cur <= 0);
      if (atEnd) return; // đã hết animation theo chiều này: để trang cuộn bình thường
      e.preventDefault();
      p.set(Math.min(1, Math.max(0, cur + dy / WHEEL_PX)));
    };
    // Con trỏ rời cửa sổ mà section không nhận pointerleave: vẫn phải trả p về theo cuộn trang
    const onDocLeave = () => {
      if (!hovering.current) return;
      hovering.current = false;
      run.current?.stop();
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
      {hero.preset === "envelope" ? (
        <div className="relative z-10 px-5 pb-6 pt-10 md:pt-14">
          <EnvelopeScene p={p} hero={hero} categoryLabel={categoryLabel} />
        </div>
      ) : (
        <>
          <div className="relative z-10 mx-auto max-w-[1520px] px-5 pb-2 pt-10 text-center md:pt-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>
              {categoryLabel}
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#222] md:text-5xl">{title}</h2>
            {hero.subtitle && <p className="mx-auto mt-3 max-w-xl text-sm text-[#555] md:text-base">{hero.subtitle}</p>}
          </div>

          <div className="relative h-[340px] md:h-[420px]" style={{ perspective: 1400 }}>
            {hero.preset === "cylinder" ? (
              <Cylinder p={p} k={k} hero={hero} />
            ) : hero.preset === "wall" ? (
              <Wall p={p} k={k} hero={hero} />
            ) : (
              <Ribbon p={p} k={k} hero={hero} />
            )}
          </div>
        </>
      )}
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

/* ---------- Phong bì 3D: kịch bản theo cuộn ----------
   0.00–0.12  phong bì ở bên TRÁI, chữ tiêu đề ở bên PHẢI
   0.12–0.24  nắp mở ra
   0.20–0.36  thiệp được rút lên khỏi phong bì
   0.36–0.50  phong bì + thiệp chuyển sang PHẢI, chữ chuyển sang TRÁI
   0.50–0.66  thiệp chuyển sang TRÁI và lật 3D (phong bì mờ đi)
   0.60–0.72  chữ mặt sau hiện ở bên PHẢI
   Vị trí tính theo % chiều rộng sân khấu; kích thước dùng cqw để co giãn theo khung. */
const L = 22;
const R = 78;

function EnvelopeScene({ p, hero, categoryLabel }: { p: MotionValue<number>; hero: TemplateHero; categoryLabel: string }) {
  const accent = hero.accent;
  const envLeft = useTransform(p, [0, 0.36, 0.5], [L, L, R]);
  const envOpacity = useTransform(p, [0.5, 0.66], [1, 0]);
  const flapDeg = useTransform(p, [0.12, 0.24], [0, -170]);
  const flapZ = useTransform(flapDeg, (d) => (d < -90 ? 0 : 4));
  const cardLeft = useTransform(p, [0, 0.36, 0.5, 0.66], [L, L, R, L]);
  const cardTop = useTransform(p, [0, 0.2, 0.36], [50, 50, 26]);
  const flipDeg = useTransform(p, [0.5, 0.66], [0, 180]);

  const envLeftCss = useTransform(envLeft, (v) => `calc(${v}% - 24cqw)`);
  const cardLeftCss = useTransform(cardLeft, (v) => `calc(${v}% - 21cqw)`);
  const cardTopCss = useTransform(cardTop, (v) => `calc(${v}% - 14.5cqw)`);

  const rightOpacity = useTransform(p, [0, 0.1, 0.36, 0.44], [1, 1, 1, 0]);
  const leftOpacity = useTransform(p, [0.36, 0.46, 0.54, 0.6], [0, 1, 1, 0]);
  const backOpacity = useTransform(p, [0.6, 0.72], [0, 1]);

  const front = hero.images[0];
  const back = hero.images[1] ?? hero.images[0];
  const envTop = "calc(50% - 16.5cqw)";

  return (
    <div className="relative mx-auto w-full max-w-[960px]" style={{ containerType: "inline-size" }}>
      <div className="relative w-full" style={{ height: "45cqw", perspective: 1600 }}>
        {/* Thân phong bì (sau) */}
        <motion.div
          aria-hidden
          className="absolute rounded-[4px] shadow-[0_18px_34px_-14px_rgba(0,0,0,0.5)]"
          style={{ left: envLeftCss, top: envTop, width: "48cqw", height: "33cqw", background: accent, opacity: envOpacity, zIndex: 1 }}
        />

        {/* Thiệp: nằm giữa thân và phần trước của túi, lật 3D quanh trục giữa */}
        <motion.div
          className="absolute"
          style={{
            left: cardLeftCss,
            top: cardTopCss,
            width: "42cqw",
            height: "29cqw",
            zIndex: 2,
            transformStyle: "preserve-3d",
            rotateY: flipDeg,
          }}
        >
          <CardFace src={front} text={hero.title || categoryLabel} accent={accent} />
          <CardFace src={back} text={hero.subtitle || hero.title || categoryLabel} accent={accent} back />
        </motion.div>

        {/* Phần trước của túi: che phần dưới của thiệp khi còn trong phong bì */}
        <motion.div
          aria-hidden
          className="absolute"
          style={{
            left: envLeftCss,
            top: envTop,
            width: "48cqw",
            height: "33cqw",
            background: accent,
            clipPath: "polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%)",
            opacity: envOpacity,
            zIndex: 3,
            filter: "brightness(0.92)",
          }}
        />

        {/* Nắp: bản lề ở mép trên, mở ra phía sau */}
        <motion.div
          aria-hidden
          className="absolute"
          style={{
            left: envLeftCss,
            top: envTop,
            width: "48cqw",
            height: "18cqw",
            background: accent,
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            transformOrigin: "50% 0%",
            rotateX: flapDeg,
            opacity: envOpacity,
            zIndex: flapZ,
            filter: "brightness(1.08)",
          }}
        />

        {/* Chữ: đổi bên theo từng cảnh */}
        <motion.div
          className="absolute"
          style={{ right: "4cqw", top: "50%", width: "42cqw", transform: "translateY(-50%)", opacity: rightOpacity, zIndex: 6 }}
        >
          <p className="font-semibold uppercase tracking-[0.18em]" style={{ color: accent, fontSize: "2.2cqw" }}>{categoryLabel}</p>
          <h2 className="mt-[1cqw] font-serif font-semibold text-[#222]" style={{ fontSize: "5cqw", lineHeight: 1.1 }}>{hero.title || categoryLabel}</h2>
          {hero.subtitle && <p className="mt-[1.5cqw] text-[#555]" style={{ fontSize: "2.4cqw", lineHeight: 1.4 }}>{hero.subtitle}</p>}
        </motion.div>
        <motion.div
          className="absolute"
          style={{ left: "4cqw", top: "50%", width: "40cqw", transform: "translateY(-50%)", opacity: leftOpacity, zIndex: 6 }}
        >
          <p className="font-semibold uppercase tracking-[0.18em]" style={{ color: accent, fontSize: "2.2cqw" }}>{categoryLabel}</p>
          <h2 className="mt-[1cqw] font-serif font-semibold text-[#222]" style={{ fontSize: "5cqw", lineHeight: 1.1 }}>{hero.title || categoryLabel}</h2>
        </motion.div>
        <motion.div
          className="absolute"
          style={{ right: "4cqw", top: "50%", width: "42cqw", transform: "translateY(-50%)", opacity: backOpacity, zIndex: 6 }}
        >
          <h2 className="font-serif font-semibold text-[#222]" style={{ fontSize: "4.6cqw", lineHeight: 1.15 }}>{hero.subtitle || hero.title || categoryLabel}</h2>
        </motion.div>
      </div>
    </div>
  );
}

/** Một mặt của thiệp: ảnh nếu có, không thì ô màu nhấn. Mặt sau xoay sẵn 180° và ẩn khi quay ra sau. */
function CardFace({ src, text, accent, back = false }: { src?: string; text: string; accent: string; back?: boolean }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[4px] shadow-[0_10px_24px_-10px_rgba(0,0,0,0.45)]"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
        background: src ? "#f6f1e6" : `linear-gradient(135deg, ${accent}, #1a1a1a)`,
      }}
    >
      {src ? (
        <img src={src} alt="" draggable={false} className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center p-[3cqw] text-center font-serif text-white" style={{ fontSize: "3.4cqw", lineHeight: 1.2 }}>
          {text}
        </div>
      )}
    </div>
  );
}