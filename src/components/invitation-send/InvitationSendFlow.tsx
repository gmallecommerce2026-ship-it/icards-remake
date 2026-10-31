"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  animate,
  cubicBezier,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
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
/*   .05-.26 : thiệp TIẾN SÁT CAMERA, nghiêng nhiều góc khoe mặt bìa ngoài */
/*   .26-.50 : thiệp xoay ngang, trượt xuống, đút vào phong bì          */
/*   .50-.74 : thiệp nằm gọn trong túi (không mờ), nắp phong bì gập xuống */
/*   .75-.89 : sáp loang trên mép niêm phong, CON DẤU ĐỒNG đóng xuống     */
/*             (nhìn thẳng từ trên xuống), nhấc lên để lại dấu iCards     */
/*   .91-.98 : phong bì xoay ra MẶT TRƯỚC (tem + tên người nhận)        */
/*   sau đó  : phần cấu hình thiệp online trượt lên                     */
/*  Suốt hành trình "máy quay" trong EnvelopeScene (CAM_KEYS) dolly / orbit: */
/*  toàn cảnh → áp sát miệng phong bì → nhìn từ trên xuống → macro vào dấu sáp */
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
const TRACK_VH = 640;
/** thời gian tự cuộn qua phần hiệu ứng, và qua đoạn chuyển sang nội dung (giây) */
const AUTO_SECONDS = 11;
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
  /** khung của vùng canvas (nền tối) trong editor: nền của lớp phủ bắt đầu ĐÚNG khung này rồi mới nở ra toàn màn hình (không còn vệt sáng/tối lướt qua) */
  getStageRect?: () => DOMRect | null;
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
  card, getSceneRect, getStageRect, envelopeColor, liner, stampId, recipientName, onSceneReady,
  initial, guests, onSave, onAddGuests, onClose,
}: Omit<InvitationSendFlowProps, "open">) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLElement>(null);
  const auto = useRef<AnimationPlaybackControls | null>(null);
  const armed = useRef(false);      // đã cuộn rời vị trí 0 → mới cho phép tự đóng khi cuộn ngược về 0
  const holdOpen = useRef(false);   // đang tua lại để xem lại hiệu ứng: đừng đóng
  const closed = useRef(false);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);   // cảnh của lớp phủ đã vẽ xong ≥ 1 khung → mới hiện + mới ẩn bản dưới (chống chớp)

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

  /* khung canvas của editor → nền lớp phủ khớp từng pixel lúc p = 0 */
  const stage = useMemo(() => {
    const r = getStageRect?.();
    if (!r || r.width < 1 || r.height < 1) return null;
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    return { l: r.left, t: r.top, r: vw - r.right, b: vh - r.bottom };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // luôn bắt đầu ở p = 0 (đúng tư thế editor), kể cả khi trình duyệt khôi phục vị trí cuộn cũ
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
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
  /* Lò xo làm mượt tiến độ. Hai điểm quan trọng để cuộn NGƯỢC NHANH không bị giật:
       1) lò xo gần tới hạn (ζ ≈ 1.1) → không văng quá 0, đuôi tắt dần ngắn;
       2) KHÔNG đóng lớp phủ ngay khi scrollTop về 0 (lúc đó p còn ở xa, cảnh đang ở giữa chừng nên đóng là
          "nhảy" thẳng về cảnh editor) - mà đợi p thực sự chạy về ~0, khi cảnh trùng khớp editor mới đóng. */
  const pSpring = useSpring(scrollYProgress, { stiffness: 150, damping: 27, mass: 0.7, restDelta: 0.0004, restSpeed: 0.002 });
  const p = useTransform(pSpring, (v) => Math.min(1, Math.max(0, v)));

  // lướt cảnh từ khung canvas về giữa màn hình + phủ nền tối lên giao diện editor
  const settle = useTransform(p, [0, 0.1], [0, 1], { ease: SMOOTH });
  const wx = useTransform(settle, [0, 1], [from.x, 0]);
  const wy = useTransform(settle, [0, 1], [from.y, 0]);
  const wScale = useTransform(settle, [0, 1], [from.s, 1]);
  const bgL = useTransform(settle, (v) => (stage ? stage.l * (1 - v) : 0));
  const bgT = useTransform(settle, (v) => (stage ? stage.t * (1 - v) : 0));
  const bgR = useTransform(settle, (v) => (stage ? stage.r * (1 - v) : 0));
  const bgB = useTransform(settle, (v) => (stage ? stage.b * (1 - v) : 0));
  const hintWrapping = useTransform(p, [0.1, 0.16, 0.93, 0.97], [0, 1, 1, 0]);
  const hintDone = useTransform(p, [0.985, 0.999], [0, 1]);
  // điện ảnh: viền tối + dải đen trên/dưới, đậm nhất khi máy áp sát dấu sáp
  const vignette = useTransform(p, [0, 0.1, 0.3, 0.7, 0.8, 0.92, 1], [0, 0.35, 0.5, 0.75, 1, 0.5, 0.25]);
  const bars = useTransform(p, [0.06, 0.16, 0.93, 0.99], [0, 1, 1, 0]);

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

  /** chỉ đóng khi người dùng đã ở đầu trang VÀ cảnh đã về sát p = 0 (khớp editor) - tránh nhảy cảnh */
  const tryClose = useCallback(() => {
    if (!armed.current || holdOpen.current) return;
    if ((scrollRef.current?.scrollTop ?? 0) >= 4) return;
    if (p.get() <= 0.006) close();
  }, [p, close]);

  /* BÀN GIAO CẢNH không chớp: cảnh lớp phủ được đo + vẽ ở trạng thái ẩn (opacity 0, cảnh editor vẫn đang hiện).
     Chờ 2 khung hình để chắc chắn nó đã lên màn hình, rồi trong CÙNG một khung: lớp phủ hiện, editor ẩn. Hai cảnh
     giống hệt nhau ở p = 0 nên mắt không thấy gì thay đổi. */
  useEffect(() => {
    if (!ready) return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        setShown(true);
        onSceneReady?.();
      });
    });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // đã bàn giao xong thì chờ một nhịp rồi tự cuộn
  useEffect(() => {
    if (!shown) return;
    const id = setTimeout(play, 450);
    return () => clearTimeout(id);
  }, [shown, play]);

  // người dùng chạm vào thì nhường quyền điều khiển
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const interrupt = () => { if (!holdOpen.current) stopAuto(); };
    const onWheel = (e: WheelEvent) => {
      interrupt();
      if (e.deltaY < 0 && sc.scrollTop <= 0) tryClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)) interrupt();
      if (e.key === "Escape") back();
    };
    sc.addEventListener("wheel", onWheel, { passive: true });
    sc.addEventListener("touchstart", interrupt, { passive: true });
    sc.addEventListener("pointerdown", interrupt, { passive: true });
    sc.addEventListener("touchmove", tryClose, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      sc.removeEventListener("wheel", onWheel);
      sc.removeEventListener("touchstart", interrupt);
      sc.removeEventListener("pointerdown", interrupt);
      sc.removeEventListener("touchmove", tryClose);
      window.removeEventListener("keydown", onKey);
    };
  }, [stopAuto, back, tryClose]);

  /* ---------- CUỘN NGƯỢC VỀ 0 → trả lại editor ---------- */
  useMotionValueEvent(scrollY, "change", (v) => {
    if (v > 40) armed.current = true;
  });
  useMotionValueEvent(p, "change", () => tryClose());
  // đã ở đầu trang nhưng p còn đang chạy về: khi cuộn dừng hẳn mà p đã tới nơi thì đóng
  useMotionValueEvent(scrollY, "change", () => tryClose());

  return (
    <div
      ref={scrollRef}
      className={`fixed inset-0 z-[100] overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${EVENT_FONT_VARS}`}
    >
      {/* VÙNG GHIM: cảnh đứng yên trong khung hình, tiến độ chạy theo cuộn */}
      <section ref={trackRef} className="relative" style={{ height: `${TRACK_VH}dvh` }}>
        <div className="sticky top-0 h-dvh w-full overflow-hidden">
          <motion.div aria-hidden className="absolute" style={{ left: bgL, top: bgT, right: bgR, bottom: bgB, opacity: stage ? (shown ? 1 : 0) : settle, background: STAGE_BG }} />

          <motion.div className="absolute inset-0" style={{ x: wx, y: wy, scale: wScale, transformOrigin: "50% 50%", opacity: shown ? 1 : 0 }}>
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
          </motion.div>

          {/* viền tối (vignette) phủ lên cảnh, dưới các nút */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
            style={{ opacity: vignette, background: "radial-gradient(ellipse at 50% 48%, transparent 38%, rgba(0,0,0,.72) 100%)" }}
          />
          <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[4.5dvh] origin-top bg-black" style={{ scaleY: bars }} />
          <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[4.5dvh] origin-bottom bg-black" style={{ scaleY: bars }} />

          <motion.button
            type="button"
            onClick={back}
            className="absolute left-4 top-4 z-20 flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ opacity: settle, outlineColor: CRIMSON }}
          >
            <ChevronLeft className="size-4" /> Quay lại thiết kế
          </motion.button>

          <div className="pointer-events-none absolute inset-x-0 bottom-[8dvh] z-20 flex flex-col items-center text-center" style={{ color: INK }}>
            <motion.div style={{ opacity: hintWrapping }} className="absolute bottom-0 flex flex-col items-center gap-1">
<Captions p={p} />
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


/* Chú thích từng bước: kicker nhỏ + tiêu đề serif nghiêng + vạch đỏ mảnh, trượt nhẹ vào/ra theo tiến độ */
const CAPTIONS = [
  { a: 0.06, b: 0.27, k: "Bước 1 / 4", t: "Mặt bìa thiệp của bạn", d: "Xem lần cuối trước khi gửi" },
  { a: 0.28, b: 0.5, k: "Bước 2 / 4", t: "Đưa thiệp vào phong bì", d: "Thiệp nằm gọn, không bị nhàu" },
  { a: 0.5, b: 0.74, k: "Bước 3 / 4", t: "Gập nắp phong bì", d: "Khép lại thật cẩn thận" },
  { a: 0.75, b: 0.93, k: "Bước 4 / 4", t: "Niêm phong bằng dấu sáp iCards", d: "Dấu ấn dành riêng cho thiệp của bạn" },
];

function Caption({ p, c }: { p: MotionValue<number>; c: (typeof CAPTIONS)[number] }) {
  const opacity = useTransform(p, [c.a, c.a + 0.03, c.b - 0.03, c.b], [0, 1, 1, 0]);
  const y = useTransform(p, [c.a, c.a + 0.04, c.b - 0.04, c.b], [14, 0, 0, -10]);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">{c.k}</span>
      <p className="text-xl italic leading-tight" style={{ fontFamily: "var(--ev-serif), 'Cormorant Garamond', serif" }} aria-live="polite">{c.t}</p>
      <span className="h-px w-10" style={{ background: CRIMSON }} />
      <span className="text-xs text-white/60">{c.d}</span>
    </motion.div>
  );
}

function Captions({ p }: { p: MotionValue<number> }) {
  return (
    <div className="relative mb-1 h-[78px] w-[min(90vw,440px)]">
      {CAPTIONS.map((c) => <Caption key={c.k} p={p} c={c} />)}
    </div>
  );
}
