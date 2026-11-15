"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import type { TemplateHero } from "@/lib/template-heroes";

type Props = { hero: TemplateHero; categoryLabel: string };

/** Phần đuôi của v*k theo vòng lặp 0..1: dùng để chạy băng chuyền liền mạch khi nội dung được nhân đôi. */
const loop01 = (v: number, k: number) => {
  const x = v * k;
  return x - Math.floor(x);
};

/**
 * Hero 3D cho trang danh mục mẫu thiệp. Bố cục do preset quyết định, nội dung do admin nhập.
 * Chạy theo cuộn trang bằng CSS 3D (perspective + preserve-3d). Người dùng bật "giảm chuyển động" thì đứng yên.
 */
export function CategoryHero3D({ hero, categoryLabel }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const k = reduce ? 0 : hero.speed;
  const accent = hero.accent;
  const title = hero.title || categoryLabel;

  return (
    <section
      ref={ref}
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
        {hero.preset === "cylinder" ? (
          <Cylinder p={scrollYProgress} k={k} hero={hero} />
        ) : hero.preset === "wall" ? (
          <Wall p={scrollYProgress} k={k} hero={hero} />
        ) : (
          <Ribbon p={scrollYProgress} k={k} hero={hero} />
        )}
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
  const base = hero.images.length ? hero.images : [];
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
