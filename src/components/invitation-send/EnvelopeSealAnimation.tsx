"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform, type AnimationPlaybackControls } from "motion/react";
import { EnvelopeScene } from "@/components/invitation/envelope/EnvelopeScene";
import { CardEnvelopeScene } from "@/components/invitation/envelope/CardEnvelopeScene";
import type { TemplateOrientation } from "@/lib/templates";
import { EVENT_FONT_VARS } from "./EventDetailsEditor";

/* ------------------------------------------------------------------ */
/*  Animation gói thiệp (thiệp tiến sát camera → đút vào phong bì →     */
/*  đóng nắp → đóng dấu sáp → phong bì xoay ra mặt trước).              */
/*                                                                      */
/*  Đã TÁCH khỏi bước thiết kế: không còn gắn với khung canvas hay      */
/*  cuộn trang. Component này tự chạy một lần khi được mount, xong thì  */
/*  gọi onDone (người dùng cũng có thể bấm "Bỏ qua" hoặc Esc).          */
/*  Dùng sau khi bấm Lưu / Thêm khách mời ở màn cài đặt sự kiện.        */
/* ------------------------------------------------------------------ */

const INK = "#F5F1E8";
const STAGE_BG = "linear-gradient(to bottom, #454547 0%, #1c1c1c 55%, #000 100%)";

/** thời gian chạy toàn bộ hiệu ứng (giây) - tăng/giảm tuỳ ý, các mốc camera tự co giãn theo */
const AUTO_SECONDS = 12;
/** dừng lại ở khung cuối (phong bì đã niêm phong) trước khi gọi onDone (ms) */
const HOLD_MS = 900;
const FADE_IN_SECONDS = 0.45;

/** tốc độ ĐỀU suốt hành trình, chỉ tăng/giảm tốc êm ở 7% đầu và cuối */
const AUTO_EASE = (t: number) => {
  const a = 0.07;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  if (t < a) return (t * t) / (2 * a * (1 - a));
  if (t > 1 - a) { const r = 1 - t; return 1 - (r * r) / (2 * a * (1 - a)); }
  return (t - a / 2) / (1 - a);
};

export type EnvelopeSealAnimationProps = {
  /** mặt ngoài của thiệp (đặt sẵn `absolute inset-0`) - thường là <CardFaceStatic /> */
  card: ReactNode;
  envelopeColor: string;
  liner: string;
  stampId: string;
  recipientName?: string;
  /** card: thiệp 2 mặt (phong bì cùng hướng thiệp); folding: thiệp gập 5:7 */
  format?: "card" | "folding";
  orientation?: TemplateOrientation;
  /** send: chạy xong sẽ chuyển trang · preview: chỉ xem lại rồi đóng */
  mode?: "send" | "preview";
  /** chạy xong, hoặc người dùng bấm Bỏ qua / Esc */
  onDone: () => void;
};

export function EnvelopeSealAnimation({
  card, envelopeColor, liner, stampId, recipientName, format = "folding", orientation = "portrait", mode = "send", onDone,
}: EnvelopeSealAnimationProps) {
  const p = useMotionValue(0);        // tiến độ hiệu ứng 0..1
  const fade = useMotionValue(0);     // lớp phủ hiện dần
  const sceneWrapRef = useRef<HTMLDivElement>(null);
  const play = useRef<AnimationPlaybackControls | null>(null);
  const finished = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const [ready, setReady] = useState(false);   // cảnh đã mount + đo xong
  const [shown, setShown] = useState(false);   // ảnh nền đã giải mã xong → mới hiện (chống chớp)

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    play.current?.stop();
    onDoneRef.current();
  }, []);

  // khoá cuộn trang phía sau
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Esc = bỏ qua
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") finish(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish]);

  // Cảnh có nhiều ảnh nền được giải mã bất đồng bộ: chờ giải mã xong (tối đa 700ms) rồi mới hiện để không bị nháy
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    let r1 = 0, r2 = 0;
    const settled = Promise.race([decodeSceneImages(sceneWrapRef.current), new Promise<void>((res) => setTimeout(res, 700))]);
    settled.then(() => {
      if (cancelled) return;
      r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => { if (!cancelled) setShown(true); }); });
    });
    return () => { cancelled = true; cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [ready]);

  // đã hiện: lớp phủ sáng dần rồi chạy hiệu ứng, xong thì giữ khung cuối một nhịp
  useEffect(() => {
    if (!shown) return;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    const fadeIn = animate(fade, 1, { duration: FADE_IN_SECONDS, ease: "easeOut" });
    const startTimer = setTimeout(() => {
      play.current = animate(0, 1, {
        duration: AUTO_SECONDS,
        ease: AUTO_EASE,
        onUpdate: (v) => p.set(v),
        onComplete: () => { holdTimer = setTimeout(finish, HOLD_MS); },
      });
    }, FADE_IN_SECONDS * 1000 + 100);
    return () => { fadeIn.stop(); clearTimeout(startTimer); clearTimeout(holdTimer); play.current?.stop(); };
  }, [shown, p, fade, finish]);

  const hintWrapping = useTransform(p, [0.04, 0.1, 0.93, 0.97], [0, 1, 1, 0]);
  const hintDone = useTransform(p, [0.992, 1], [0, 1]);
  // điện ảnh: viền tối + dải đen trên/dưới, đậm nhất khi máy áp sát dấu sáp
  const vignette = useTransform(p, [0, 0.1, 0.3, 0.7, 0.8, 0.92, 1], [0, 0.35, 0.5, 0.75, 1, 0.5, 0.25]);
  const bars = useTransform(p, [0.06, 0.16, 0.93, 0.99], [0, 1, 1, 0]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Đang gói thiệp"
      className={`fixed inset-0 z-[120] overflow-hidden ${EVENT_FONT_VARS}`}
      style={{ opacity: fade, background: STAGE_BG }}
    >
      <div ref={sceneWrapRef} className="absolute inset-0" style={{ opacity: shown ? 1 : 0 }}>
        {format === "card" ? (
          <CardEnvelopeScene card={card} orientation={orientation} envelopeColor={envelopeColor} liner={liner} send={p} onReady={() => setReady(true)} />
        ) : (
          <EnvelopeScene
            card={card}
            envelopeColor={envelopeColor}
            liner={liner}
            stampId={stampId}
            recipientName={recipientName}
            side="back"
            flapOpen
            cardFront
            focus="card"
            send={p}
            onReady={() => setReady(true)}
          />
        )}
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{ opacity: vignette, background: "radial-gradient(ellipse at 50% 48%, transparent 38%, rgba(0,0,0,.72) 100%)" }}
      />
      <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[4.5dvh] origin-top bg-black" style={{ scaleY: bars }} />
      <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[4.5dvh] origin-bottom bg-black" style={{ scaleY: bars }} />

      <div className="pointer-events-none absolute inset-x-0 bottom-[8dvh] z-20 flex flex-col items-center text-center" style={{ color: INK }}>
        <motion.div style={{ opacity: hintWrapping }} className="absolute bottom-0">
          <button
            type="button"
            onClick={finish}
            className="pointer-events-auto rounded-full px-3 py-1 text-xs font-semibold underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {mode === "send" ? "Bỏ qua" : "Đóng"}
          </button>
        </motion.div>
        <motion.p style={{ opacity: hintDone, fontFamily: "var(--ev-serif), 'Cormorant Garamond', serif" }} className="text-base italic">
          {mode === "send" ? "Đã gói xong thiệp · đang mở trang quản lý khách mời…" : "Đã gói xong thiệp"}
        </motion.p>
      </div>
    </motion.div>
  );
}

/** giải mã trước mọi ảnh nền / <img> trong cảnh để lúc hiện hình không bị chớp ảnh trống */
function decodeSceneImages(root: HTMLElement | null): Promise<void> {
  if (!root) return Promise.resolve();
  const urls = new Set<string>();
  root.querySelectorAll<HTMLElement>("*").forEach((n) => {
    if (n instanceof HTMLImageElement && n.currentSrc) urls.add(n.currentSrc);
    const bg = getComputedStyle(n).backgroundImage;
    if (bg && bg !== "none") for (const m of bg.matchAll(/url\((["']?)(.*?)\1\)/g)) urls.add(m[2]);
  });
  return Promise.all(
    [...urls].map((u) => {
      const img = new Image();
      img.src = u;
      return img.decode().catch(() => undefined);
    }),
  ).then(() => undefined);
}
