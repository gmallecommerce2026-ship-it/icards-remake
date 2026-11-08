"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowDown } from "lucide-react";
import { EnvelopeScene } from "@/components/invitation/envelope/EnvelopeScene";
import { ENVELOPES, LINERS } from "@/components/invitation/envelope/envelope.data";
import { STAMPS } from "@/components/invitation/envelope/Stamp";
import { FoldingCard } from "@/components/invitation/editor/FoldingCard";
import { useCardMotion } from "@/components/invitation/editor/useCardMotion";
import { useEditorStore, type Snap } from "@/components/invitation/editor/useEditorStore";

/* ------------------------------------------------------------------ */
/*  Cảnh thiệp công khai = ĐÚNG bộ dựng của studio:                     */
/*   - EnvelopeScene: phong bì + thiệp rút ra (cùng màu, lớp lót, tem)   */
/*   - FoldingCard : bìa → hai trang giữa → mặt sau (cùng thiết kế)      */
/*  Cuộn trang điều khiển tiến độ; chữ chương bên cạnh lấy từ thông tin  */
/*  sự kiện. Nền cuối cảnh hoà vào phần nội dung bên dưới.               */
/* ------------------------------------------------------------------ */

const BG = "#FFFCF6";
const CRIMSON = "#A3152F";
const INK = "#1D1B2A";
const MUTED = "#6B7A99";
const SERIF = "var(--font-card-serif, 'Cormorant Garamond'), 'Times New Roman', serif";
const SANS = "var(--font-card-sans, 'Be Vietnam Pro'), system-ui, sans-serif";
const TRACK_VH = 520;
const STAGE_BG = "linear-gradient(to bottom, #454547 0%, #1c1c1c 55%, #000 100%)";

/** Thiết kế đã lưu của thiệp (lấy từ API công khai: `design`) */
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

/* tiến độ cuộn → vị trí bìa: 0 đóng · 1 mở hẳn · 2 mặt sau (theo STOPS của studio) */
const POS_STOPS = [0, 0.55, 0.72, 0.85, 0.98, 1];
const POS_VALS = [0, 0, 1, 1, 2, 2];
function toPos(v: number) {
  if (v <= POS_STOPS[0]) return POS_VALS[0];
  if (v >= POS_STOPS[POS_STOPS.length - 1]) return POS_VALS[POS_VALS.length - 1];
  let i = 0;
  while (v > POS_STOPS[i + 1]) i++;
  const t = (v - POS_STOPS[i]) / (POS_STOPS[i + 1] - POS_STOPS[i]);
  return POS_VALS[i] + (POS_VALS[i + 1] - POS_VALS[i]) * t;
}

type Chapter = {
  range: [number, number];
  side: "center" | "left" | "right";
  eyebrow: string;
  text: string;
  cta?: { label: string; href: string };
};

function buildChapters(info: IntroInfo): Chapter[] {
  const join = (...xs: string[]) => xs.filter((x) => x && x.trim()).join(" · ");
  return [
    { range: [0, 0.12], side: "center", eyebrow: info.host || "Trân trọng kính mời", text: info.title },
    { range: [0.14, 0.42], side: "left", eyebrow: "Một lời mời", text: info.description || "Rất mong được đón tiếp bạn." },
    { range: [0.46, 0.68], side: "right", eyebrow: "Thời gian", text: join(info.time, info.date) || "Đang cập nhật" },
    { range: [0.72, 0.9], side: "left", eyebrow: "Địa điểm", text: join(info.venue, info.address) || "Đang cập nhật" },
    { range: [0.92, 1], side: "right", eyebrow: "Đến lượt bạn", text: "Xác nhận tham dự ngay bên dưới.", cta: { label: "Xác nhận", href: "#rsvp-title" } },
  ];
}

export function PublicEnvelopeIntro({ info, design, guestName }: { info: IntroInfo; design?: PublicDesign; guestName?: string }) {
  const containerRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const chapters = buildChapters(info);

  // nạp đúng thiết kế thiệp đã lưu (cùng nguồn với trình chỉnh sửa trong studio)
  useEffect(() => {
    if (design?.pages && design?.backdrops) {
      useEditorStore.getState().hydrate({ pages: design.pages, backdrops: design.backdrops });
    }
  }, [design]);

  const env = design?.envelope ?? {};
  const envelopeColor = env.color ?? ENVELOPES[0].color;
  const liner = env.liner ?? LINERS[0].background;
  const stampId = env.stampId ?? STAMPS[0].id;
  const recipientName = guestName || env.recipientName || "Tên người nhận";

  // cùng cơ chế điều khiển bìa/lật trang của studio, nhưng vị trí do cuộn trang quyết định
  const cm = useCardMotion("cover");

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const { scrollYProgress: exit } = useScroll({ target: containerRef, offset: ["end end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.7, restDelta: 0.0003, restSpeed: 0.002 });
  const exitOpacity = useTransform(exit, [0, 0.7], [1, 0]);
  const exitY = useTransform(exit, [0, 1], ["0svh", "14svh"]);
  const blendOpacity = useTransform(p, [0.94, 1], [0, 1]);
  const hintOpacity = useTransform(p, [0, 0.04], [1, 0]);

  useEffect(() => { cm.pos.set(toPos(p.get())); }, [cm.pos, p]);
  useMotionValueEvent(p, "change", (v) => {
    cm.pos.set(toPos(v));
    let idx = 0;
    chapters.forEach((c, i) => { if (v >= c.range[0] - 0.005) idx = i; });
    setActive(idx);
  });

  const goTo = (i: number) => {
    const el = containerRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const distance = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * chapters[i].range[0], behavior: "smooth" });
  };

  return (
    <section ref={containerRef} className="relative" style={{ height: `${TRACK_VH}dvh`, background: BG }}>
      <motion.div className="sticky top-0 h-dvh w-full overflow-hidden" style={{ opacity: exitOpacity, y: exitY, background: STAGE_BG }}>
        <div className="absolute inset-0">
          <EnvelopeScene
            card={<FoldingCard cm={cm} view="cover" editable={false} />}
            envelopeColor={envelopeColor}
            liner={liner}
            stampId={stampId}
            recipientName={recipientName}
            side="back"
            flapOpen
            cardFront
            focus="card"
            openAmt={cm.open}
            send={p}
          />
        </div>

        <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[35svh]" style={{ opacity: blendOpacity, background: `linear-gradient(to bottom, rgba(255,252,246,0), ${BG} 90%)` }} />

        {chapters.map((c, i) => (
          <ChapterText key={i} chapter={c} progress={p} first={i === 0} last={i === chapters.length - 1} />
        ))}

        <motion.div style={{ opacity: hintOpacity, color: "#6B6880" }} className="absolute bottom-[5svh] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest">Cuộn để mở thiệp</span>
          <ArrowDown className="size-5 animate-bounce" style={{ color: CRIMSON }} />
        </motion.div>

        <nav aria-label="Các chương" className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 md:block">
          <div className="relative h-44 w-px" style={{ background: "rgba(255,255,255,.25)" }}>
            {chapters.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={c.eyebrow}
                aria-current={active === i ? "step" : undefined}
                className="absolute -left-[7px] grid size-[15px] -translate-y-1/2 place-items-center rounded-full"
                style={{ top: `${c.range[0] * 100}%` }}
              >
                <span className="block rounded-full transition-all duration-300" style={{ width: active === i ? 10 : 6, height: active === i ? 10 : 6, background: i <= active ? CRIMSON : "rgba(255,255,255,.5)" }} />
              </button>
            ))}
          </div>
        </nav>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Chữ chương: từng dòng hiện lên theo tiến độ cuộn                   */
/* ------------------------------------------------------------------ */
function ChapterText({ chapter, progress, first, last }: { chapter: Chapter; progress: MotionValue<number>; first: boolean; last: boolean }) {
  const [s, e] = chapter.range;
  const centered = chapter.side === "center";
  const opacity = useTransform(progress, [s, s + 0.04, e - 0.03, e], [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useTransform(progress, [s, s + 0.04], ["24px", "0px"]);
  const pos: Record<Chapter["side"], string> = {
    center: "inset-x-0 top-[8svh] items-center text-center",
    left: "inset-x-0 bottom-[6svh] items-center text-center md:inset-x-auto md:bottom-auto md:left-[6vw] md:top-0 md:h-full md:w-[40vw] md:items-start md:justify-center md:text-left",
    right: "inset-x-0 bottom-[6svh] items-center text-center md:inset-x-auto md:bottom-auto md:left-auto md:right-[8vw] md:top-0 md:h-full md:w-[36vw] md:items-start md:justify-center md:text-left",
  };
  return (
    <motion.div style={{ opacity, y }} className={`pointer-events-none absolute z-20 flex flex-col px-5 ${pos[chapter.side]}`}>
      <p className="mb-3 text-base italic md:text-lg" style={{ color: CRIMSON, fontFamily: SERIF }}>{chapter.eyebrow}</p>
      <h2 className={centered ? "max-w-3xl text-3xl font-bold leading-tight sm:text-5xl" : "max-w-xl text-xl font-semibold leading-snug sm:text-2xl md:text-4xl"} style={{ color: INK, fontFamily: SANS }}>
        {chapter.text}
      </h2>
      {chapter.cta && (
        <a href={chapter.cta.href} className="pointer-events-auto mt-6 rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ background: CRIMSON }}>
          {chapter.cta.label}
        </a>
      )}
    </motion.div>
  );
}

