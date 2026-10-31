"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  animate,
  cubicBezier,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import { ArrowDown, ChevronLeft } from "lucide-react";
import { EnvelopeScene } from "@/components/invitation/envelope/EnvelopeScene";
import { EVENT_FONT_VARS, EventDetailsEditor, type EventDetailsEditorProps } from "./EventDetailsEditor";

/* ------------------------------------------------------------------ */
/*  Bấm "Tiếp theo" ở editor → lớp phủ này NỐI TIẾP đúng cảnh thiệp +    */
/*  phong bì đang đứng trong canvas (không còn một cảnh khác chen vào): */
/*                                                                      */
/*   p = 0   : trùng khớp với khung chỉnh sửa (blend liền)              */
/*   0 → .1  : cảnh lướt về giữa màn hình, nền tối phủ dần lên giao diện */
/*   .06-.44 : thiệp xoay ngang, trượt xuống, đút vào phong bì          */
/*   .44-.74 : thiệp chìm hẳn, nắp phong bì gập xuống                   */
/*   .76-.95 : phong bì xoay ra MẶT TRƯỚC (tem + tên người nhận)        */
/*   sau đó  : phần cấu hình thiệp online trượt lên                     */
/*  (các mốc của cảnh nằm ở SEND_RANGE trong EnvelopeScene)             */
/*                                                                      */
/*  Cũng như ImmersiveScrollHero, hiệu ứng bám theo tiến độ CUỘN: lúc   */
/*  mở ra trang tự cuộn xuống để chạy; người dùng cuộn tay lúc nào cũng */
/*  được, cuộn ngược thì hiệu ứng chạy ngược đến khi về đúng vị trí     */
/*  chỉnh sửa ở canvas (lớp phủ tự đóng).                               */
/* ------------------------------------------------------------------ */

const CRIMSON = "#A3152F";
const INK = "#F5F1E8";
/** cùng nền với khung canvas trong editor (.stage) để chuyển cảnh không lộ đường nối */
const STAGE_BG = "linear-gradient(to bottom, #454547 0%, #1c1c1c 55%, #000 100%)";

/** vùng ghim cao TRACK_VH (% màn hình) → quãng cuộn để chạy hiệu ứng = TRACK_VH − 100 (% màn hình) */
const TRACK_VH = 400;
/** thời gian tự cuộn qua phần hiệu ứng, và qua đoạn chuyển sang nội dung (giây) */
const AUTO_SECONDS = 5.2;
const AUTO_TAIL_SECONDS = 1.1;
/** kích thước thiết kế của EnvelopeScene (khớp DW / DH trong EnvelopeScene) - dùng để suy ra độ phóng của khung canvas */
const DW = 720;
const DH = 700;
const fitK = (w: number, h: number) => Math.min(1.3, w / DW, h / DH);

const SMOOTH = cubicBezier(0.45, 0, 0.25, 1);
type Bezier = [number, number, number, number];
const IN_OUT: Bezier = [0.45, 0, 0.2, 1];
const AUTO_EASE: Bezier = [0.4, 0, 0.25, 1];

export type InvitationSendFlowProps = Pick<EventDetailsEditorProps, "initial" | "guests" | "onSave" | "onAddGuests"> & {
  open: boolean;
  /** mặt ngoài của thiệp (đặt sẵn `absolute inset-0`) - thường là <CardFaceStatic /> */
  card: ReactNode;
  /** trả về khung (getBoundingClientRect) của cảnh thiệp + phong bì đang nằm trong canvas editor */
  getSceneRect: () => DOMRect | null;
  /** màu + lớp lót + tem + tên người nhận người dùng đã chọn trong editor */
  envelopeColor: string;
  liner: string;
  stampId: string;
  recipientName?: string;
  /** cảnh của lớp phủ đã hiện hình → editor có thể ẩn bản đang đứng dưới (không bị chớp) */
  onSceneReady?: () => void;
  /** đã cuộn ngược về vị trí chỉnh sửa → trả lại editor */
  onClose: () => void;
};

export function InvitationSendFlow({ open, ...rest }: InvitationSendFlowProps) {
  return open ? <FlowBody {...rest} /> : null;
}

function FlowBody({
  card, getSceneRect, envelopeColor, liner, stampId, recipientName, onSceneReady,
  initial, guests, onSave, onAddGuests, onClose,
}: Omit<InvitationSendFlowProps, "open">) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLElement>(null);
  const auto = useRef<AnimationPlaybackControls | null>(null);
  const armed = useRef(false);      // đã cuộn rời vị trí 0 → mới cho phép tự đóng khi cuộn ngược về 0
  const holdOpen = useRef(false);   // đang tua lại để xem lại hiệu ứng: đừng đóng
  const closed = useRef(false);
  const [ready, setReady] = useState(false);

  /* ---------- khung của cảnh trong editor → phép biến đổi để cảnh của lớp phủ TRÙNG khít lúc p = 0 ---------- */
  const from = useMemo(() => {
    const r = getSceneRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    if (!r || r.width < 1 || r.height < 1) return { x: 0, y: 0, s: 1 };
    return {
      x: r.left + r.width / 2 - vw / 2,
      y: r.top + r.height / 2 - vh / 2,
      s: fitK(r.width, r.height) / fitK(vw, vh),
    };
    // chỉ đo MỘT lần lúc mở
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // khoá cuộn trang phía sau editor
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      auto.current?.stop();
    };
  }, []);

  /* ---------- TIẾN ĐỘ = vị trí cuộn trong vùng ghim (như ImmersiveScrollHero) ---------- */
  const { scrollYProgress } = useScroll({ container: scrollRef, target: trackRef, offset: ["start start", "end end"] });
  const { scrollY } = useScroll({ container: scrollRef });
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.7, restDelta: 0.0004 });

  // lướt cảnh từ khung canvas về giữa màn hình + phủ nền tối lên giao diện editor
  const settle = useTransform(p, [0, 0.1], [0, 1], { ease: SMOOTH });
  const wx = useTransform(settle, [0, 1], [from.x, 0]);
  const wy = useTransform(settle, [0, 1], [from.y, 0]);
  const wScale = useTransform(settle, [0, 1], [from.s, 1]);
  const hintWrapping = useTransform(p, [0.1, 0.16, 0.88, 0.94], [0, 1, 1, 0]);
  const hintDone = useTransform(p, [0.95, 0.99], [0, 1]);

  /* ---------- TỰ CUỘN ---------- */
  const stopAuto = useCallback(() => {
    auto.current?.stop();
    auto.current = null;
  }, []);

  const scrollTo = useCallback(
    (to: number, seconds: number, ease: Bezier | "easeOut", then?: () => void) => {
      const sc = scrollRef.current;
      if (!sc) return;
      stopAuto();
      auto.current = animate(sc.scrollTop, to, {
        duration: Math.max(0.05, seconds),
        ease,
        onUpdate: (v) => { sc.scrollTop = v; },
        onComplete: then,
      });
    },
    [stopAuto],
  );

  const geometry = useCallback(() => {
    const sc = scrollRef.current;
    const tr = trackRef.current;
    if (!sc || !tr) return null;
    return { effectEnd: tr.offsetHeight - sc.clientHeight, contentTop: tr.offsetHeight };
  }, []);

  /** chạy xuôi: hết phần hiệu ứng → cuộn nốt cho phần nội dung vào chỗ */
  const play = useCallback(() => {
    const g = geometry();
    if (!g) return;
    scrollTo(g.effectEnd, AUTO_SECONDS, AUTO_EASE, () => {
      const g2 = geometry();
      if (g2) scrollTo(g2.contentTop, AUTO_TAIL_SECONDS, "easeOut");
    });
  }, [scrollTo, geometry]);

  /** xem lại: tua ngược về đầu (không đóng lớp phủ) rồi chạy xuôi lại */
  const replay = useCallback(() => {
    holdOpen.current = true;
    scrollTo(0, 1.4, IN_OUT, () => {
      setTimeout(() => {
        holdOpen.current = false;
        play();
      }, 250);
    });
  }, [scrollTo, play]);

  /** quay lại thiết kế: tua ngược về 0, tới nơi thì lớp phủ tự đóng */
  const back = useCallback(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    armed.current = true;
    holdOpen.current = false;
    scrollTo(0, Math.min(1.8, 0.5 + (sc.scrollTop / sc.clientHeight) * 0.45), IN_OUT);
  }, [scrollTo]);

  const skip = useCallback(() => {
    const g = geometry();
    if (g) scrollTo(g.contentTop, 1.0, "easeOut");
  }, [scrollTo, geometry]);

  const close = useCallback(() => {
    if (closed.current) return;
    closed.current = true;
    stopAuto();
    onClose();
  }, [stopAuto, onClose]);

  // vừa hiện hình xong thì chờ một nhịp rồi tự cuộn
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(play, 350);
    return () => clearTimeout(id);
  }, [ready, play]);

  // người dùng chạm vào thì nhường quyền điều khiển
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const interrupt = () => { if (!holdOpen.current) stopAuto(); };
    const onWheel = (e: WheelEvent) => {
      interrupt();
      if (e.deltaY < 0 && sc.scrollTop <= 0 && !holdOpen.current) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)) interrupt();
      if (e.key === "Escape") back();
    };
    sc.addEventListener("wheel", onWheel, { passive: true });
    sc.addEventListener("touchstart", interrupt, { passive: true });
    sc.addEventListener("pointerdown", interrupt, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      sc.removeEventListener("wheel", onWheel);
      sc.removeEventListener("touchstart", interrupt);
      sc.removeEventListener("pointerdown", interrupt);
      window.removeEventListener("keydown", onKey);
    };
  }, [stopAuto, back, close]);

  /* ---------- CUỘN NGƯỢC VỀ 0 → trả lại editor ---------- */
  useMotionValueEvent(scrollY, "change", (v) => {
    if (v > 40) armed.current = true;
  });
  useMotionValueEvent(p, "change", (v) => {
    if (!armed.current || holdOpen.current || v > 0.004) return;
    if ((scrollRef.current?.scrollTop ?? 0) < 4) close();
  });

  return (
    <div
      ref={scrollRef}
      className={`fixed inset-0 z-[100] overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${EVENT_FONT_VARS}`}
    >
      {/* VÙNG GHIM: cảnh đứng yên trong khung hình, tiến độ chạy theo cuộn */}
      <section ref={trackRef} className="relative" style={{ height: `${TRACK_VH}dvh` }}>
        <div className="sticky top-0 h-dvh w-full overflow-hidden">
          <motion.div aria-hidden className="absolute inset-0" style={{ opacity: settle, background: STAGE_BG }} />

          <motion.div className="absolute inset-0" style={{ x: wx, y: wy, scale: wScale, transformOrigin: "50% 50%" }}>
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
              onReady={() => {
                setReady(true);
                onSceneReady?.();
              }}
            />
          </motion.div>

          <motion.button
            type="button"
            onClick={back}
            className="absolute left-4 top-4 z-20 flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ opacity: settle, outlineColor: CRIMSON }}
          >
            <ChevronLeft className="size-4" /> Quay lại thiết kế
          </motion.button>

          <div className="pointer-events-none absolute inset-x-0 bottom-[6dvh] z-20 flex flex-col items-center text-center" style={{ color: INK }}>
            <motion.div style={{ opacity: hintWrapping }} className="absolute bottom-0 flex flex-col items-center gap-1">
              <p className="text-base italic" style={{ fontFamily: "var(--ev-serif), 'Cormorant Garamond', serif" }} aria-live="polite">
                Đang gói thiệp của bạn…
              </p>
              <button
                type="button"
                onClick={skip}
                className="pointer-events-auto rounded-full px-3 py-1 text-xs font-semibold underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ outlineColor: CRIMSON }}
              >
                Bỏ qua
              </button>
            </motion.div>
            <motion.div style={{ opacity: hintDone }} className="flex flex-col items-center gap-1">
              <p className="text-base italic" style={{ fontFamily: "var(--ev-serif), 'Cormorant Garamond', serif" }}>
                Đã gói xong thiệp
              </p>
              <ArrowDown className="size-5 animate-bounce text-white" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* NỘI DUNG: cấu hình thiệp online, trượt lên ngay sau khi phong bì xoay ra mặt trước */}
      <section className="relative min-h-dvh bg-white">
        <EventDetailsEditor
          initial={initial}
          guests={guests}
          onSave={onSave}
          onAddGuests={onAddGuests}
          onClose={back}
          onReplay={replay}
        />
      </section>
    </div>
  );
}
