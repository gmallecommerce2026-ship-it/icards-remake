// src/components/invitation/envelope/EnvelopeScene.tsx
'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { Stamp } from './Stamp';
import s from './envelope.module.css';

/* ------------------------------------------------------------------ */
/*  Hệ tọa độ thiết kế (px). Cả scene được scale vừa khung chứa.        */
/* ------------------------------------------------------------------ */
const DW = 640, DH = 696;
const ENV = { x: 12, y: 240, w: 540, h: 390 };
const CARD = { x: 268, y: 183, w: 360, h: 504 };
const CARD_CX = CARD.x + CARD.w / 2;
const CARD_CY = CARD.y + CARD.h / 2;

/* Các tư thế của thiệp, tính theo TÂM thiệp (cx, cy) và độ phóng s.
   TRONG phong bì thiệp nằm NGANG (xoay -90°, như bản tham chiếu) để lọt vừa phong bì:
     sealed : cất kín (nắp đóng)
     peek   : nắp mở, thiệp thò lên khỏi miệng phong bì
     slid   : đã trượt hẳn ra khỏi miệng phong bì (vẫn nằm ngang)
   RA NGOÀI thiệp đứng DỌC trước phong bì: bìa đóng hoặc bìa mở (trải hai trang). */
const POSE = {
  sealed: { cx: ENV.x + ENV.w / 2, cy: ENV.y + ENV.h / 2 + 8, s: 0.82 },
  peek: { cx: ENV.x + ENV.w / 2, cy: 322, s: 0.82 },
  slid: { cx: ENV.x + ENV.w / 2, cy: 96, s: 0.82 },
  outClosed: { cx: 320, cy: 427, s: 1.04 },
  outOpen: { cx: 478, cy: 435, s: 0.88 },
};

const ENV_DROP = 110;    // phong bì tụt xuống khi thiệp ra
const ENV_PUSH = 150;    // phong bì lùi ra sau theo trục z (thiệp luôn ở phía trước)
const T_SLIDE = 0.4;     // mốc của t: thiệp (đang nằm ngang) đã trượt hết khỏi miệng phong bì
const T_TURN = 0.34;     // từ mốc này thiệp bắt đầu xoay dọc + bay vòng cung ra trước
const BOW = -60;         // độ phình của quỹ đạo vòng cung (px, sang trái)
const Z_BUMP = 80;       // thiệp nhô về phía người xem giữa hành trình (vòng cung theo trục z)

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

type Props = {
  card?: ReactNode;                         // nội dung thiệp (tỉ lệ 5:7)
  envelopeColor: string;                    // hex 6 ký tự
  liner: string;                            // giá trị CSS background
  stampId: string;
  recipientName?: string;
  side: 'front' | 'back';                   // front = mặt địa chỉ, back = mặt nắp
  flapOpen: boolean;
  cardFront?: boolean;                      // true: thiệp đã rút ra, đứng trước phong bì
  openAmt?: MotionValue<number>;            // 0..1: bìa thiệp mở bao nhiêu (để thiệp trượt sang phải nhường chỗ cho bìa)
  onEnvClick?: (face: 'front' | 'back') => void;  // chạm vào phong bì
  onCardClick?: () => void;                 // chạm vào thiệp đang nằm trong phong bì -> rút ra
};

function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150;
}
const onKey = (fn?: () => void) => (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn?.(); }
};

/** Một "tấm" phong bì lật quanh trục dọc. Cả hai tấm (lưng + mặt trước) dùng chung perspective và góc lật
 *  nên khớp tuyệt đối với nhau; thiệp chen vào GIỮA hai tấm theo trục z. */
function Rotor({ flip, children }: { flip: MotionValue<number>; children: ReactNode }) {
  return (
    <div className={s.stage3d} style={{ perspectiveOrigin: `${ENV.x + ENV.w / 2}px ${ENV.y + ENV.h / 2}px` }}>
      <motion.div className={s.envelope} style={{ left: ENV.x, top: ENV.y, width: ENV.w, height: ENV.h, rotateY: flip }}>
        {children}
      </motion.div>
    </div>
  );
}

export function EnvelopeScene({
  card, envelopeColor, liner, stampId, recipientName = 'Tên người nhận',
  side, flapOpen, cardFront = false, openAmt, onEnvClick, onCardClick,
}: Props) {
  const reduce = useReducedMotion();
  const pmId = useId().replace(/:/g, '');
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);

  const flip = useMotionValue(side === 'front' ? 0 : 180);
  const flapRot = useMotionValue(flapOpen ? 180 : 0);
  const t = useMotionValue(cardFront ? 1 : 0);      // 0 = thiệp trong phong bì · 1 = thiệp rút ra phía trước
  const rise = useMotionValue(flapOpen ? 1 : 0);    // 0 = thiệp cất kín · 1 = thiệp thò lên khỏi miệng phong bì
  const idleOpen = useMotionValue(0);
  const open = openAmt ?? idleOpen;

  const rad = Math.PI / 180;
  const groundX = useTransform(flip, (v) => 0.3 + 0.7 * Math.abs(Math.cos(v * rad)));
  const sheen = useTransform(flip, (v) => 0.5 * Math.abs(Math.sin(2 * v * rad)));
  const flapShadow = useTransform(flapRot, [0, 45], [1, 0]);
  // Nắp đóng nằm TRÊN thiệp (tấm trước), nắp mở nằm SAU thiệp (tấm lưng). Đổi tấm ở đúng 90° - lúc nắp dựng
  // thẳng đứng, chỉ còn là một đường mảnh - nên không thấy giật.
  const flapBackVis = useTransform(flapRot, (v) => (v > 90 ? 'visible' : 'hidden'));
  const flapFrontVis = useTransform(flapRot, (v) => (v > 90 ? 'hidden' : 'visible'));

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(Math.min(1.3, e.contentRect.width / DW)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Lật phong bì
  useEffect(() => {
    const c = animate(flip, side === 'front' ? 0 : 180, { duration: reduce ? 0 : 1.15, ease: [0.45, 0, 0.2, 1] });
    return () => c.stop();
  }, [side, reduce, flip]);

  // Nắp phong bì: đóng/mở chậm, như đang gập giấy thật trong không gian
  useEffect(() => {
    const c = animate(flapRot, flapOpen ? 180 : 0, { duration: reduce ? 0 : 1.35, ease: [0.4, 0, 0.2, 1] });
    return () => c.stop();
  }, [flapOpen, reduce, flapRot]);

  // Thiệp trồi lên khỏi miệng phong bì SAU khi nắp đã mở; khi đóng nắp thì thiệp chìm xuống TRƯỚC
  useEffect(() => {
    const c = animate(rise, flapOpen ? 1 : 0, {
      duration: reduce ? 0 : flapOpen ? 0.95 : 0.75,
      delay: reduce ? 0 : flapOpen ? 0.6 : 0,
      ease: [0.4, 0, 0.2, 1],
    });
    return () => c.stop();
  }, [flapOpen, reduce, rise]);

  // Rút thiệp ra / đút thiệp vào: cùng một hành trình, chạy xuôi hoặc ngược
  useEffect(() => {
    // t chạy tuyến tính; độ mềm do từng chặng (smoothstep) bên dưới đảm nhiệm
    const c = animate(t, cardFront ? 1 : 0, { duration: reduce ? 0 : 2.3, ease: 'linear' });
    return () => c.stop();
  }, [cardFront, reduce, t]);

  /* ---------- THIỆP ----------
     RÚT RA  (t 0 → 1):
       1) thiệp NẰM NGANG trượt thẳng LÊN khỏi miệng phong bì
       2) sau đó mới xoay DỌC, đồng thời bay vòng cung (phình sang trái, nhô về phía người xem) hạ về giữa cảnh
     ĐÚT VÀO (t 1 → 0): đúng hành trình ngược lại - xoay ngang trước, rồi mới trượt xuống vào phong bì. */
  const slide = useTransform(t, (v) => ss(0, T_SLIDE, v));       // 0 → 1: trượt lên khỏi miệng
  const swing = useTransform(t, (v) => ss(T_TURN, 1, v));         // 0 → 1: xoay dọc + bay vòng cung
  const cardX = useTransform([swing, open], ([u, op]: number[]) => {
    const outX = lerp(POSE.outClosed.cx, POSE.outOpen.cx, op);
    return lerp(POSE.sealed.cx, outX, u) + BOW * Math.sin(Math.PI * u) - CARD_CX;
  });
  const cardY = useTransform([slide, swing, rise, open], ([sl, u, r, op]: number[]) => {
    const inY = lerp(POSE.sealed.cy, POSE.peek.cy, r);
    const y0 = lerp(inY, POSE.slid.cy, sl);
    const outY = lerp(POSE.outClosed.cy, POSE.outOpen.cy, op);
    return lerp(y0, outY, u) - CARD_CY;
  });
  const cardScale = useTransform([swing, open], ([u, op]: number[]) =>
    lerp(POSE.sealed.s, lerp(POSE.outClosed.s, POSE.outOpen.s, op), u));
  const cardRotZ = useTransform(swing, (u) => -90 * (1 - u));      // -90° = nằm ngang · 0° = đứng dọc
  const cardRotX = useTransform(swing, (u) => -10 * Math.sin(Math.PI * u));
  const cardRotY = useTransform(swing, (u) => 18 * Math.sin(Math.PI * u));
  // z = 1 nằm GIỮA lưng phong bì (z 0) và mặt trước (z 2); chỉ vượt lên trước khi đã trượt hẳn ra khỏi miệng
  const cardZ = useTransform(t, (v) => {
    const u = ss(T_SLIDE, 1, v);
    return 1 + 99 * u + Z_BUMP * Math.sin(Math.PI * u);
  });
  const cardOpacity = useTransform([t, rise], ([tt, r]: number[]) => Math.min(1, r * 3 + tt * 6));

  /* ---------- PHONG BÌ: tụt xuống + lùi ra sau để nhường chỗ cho thiệp, nhưng vẫn thấy được (chạm để cất thiệp) ---------- */
  const envY = useTransform(t, (v) => ENV_DROP * ss(T_SLIDE, 1, v));
  const backZ = useTransform(t, (v) => -ENV_PUSH * ss(T_SLIDE, 0.9, v));
  const frontZ = useTransform(backZ, (v) => v + 2);

  const vars = { '--env': envelopeColor, '--ink': isLight(envelopeColor) ? '#17171a' : '#ffffff' } as CSSProperties;
  const envClick = (face: 'front' | 'back') => () => onEnvClick?.(face);
  const cardPeeking = !cardFront && flapOpen;
  const flapLabel = cardFront ? 'Cất thiệp vào phong bì' : flapOpen ? 'Đóng nắp phong bì' : 'Mở nắp phong bì';

  return (
    <div ref={box} className={s.fit} style={{ height: DH * k }}>
      <div className={s.scene} style={{ ...vars, width: DW, height: DH, transform: `scale(${k})` }}>
        <div className={s.world}>
          {/* ===== TẤM LƯNG: giấy phong bì, lớp lót, nắp ĐÃ MỞ (nằm sau thiệp) ===== */}
          <motion.div className={s.plane} style={{ y: envY, z: backZ }}>
            <motion.div className={s.ground} style={{ left: ENV.x, top: ENV.y, width: ENV.w, height: ENV.h, scaleX: groundX }} />
            <Rotor flip={flip}>
              <div className={`${s.face} ${s.back}`}>
                <div className={s.paper} />
                <div className={s.interior} style={{ background: liner }} />
                <motion.div
                  className={`${s.flap} ${s.hit}`}
                  style={{ rotateX: flapRot, z: 2, visibility: flapBackVis }}
                  onClick={envClick('back')}
                >
                  <div className={`${s.flapFace} ${s.flapIn}`}>
                    <div className={s.flapLiner} style={{ background: liner }} />
                  </div>
                </motion.div>
              </div>
            </Rotor>
          </motion.div>

          {/* ===== THIỆP: chen giữa hai tấm; luôn có thể chạm để rút ra khi đang nằm trong phong bì ===== */}
          <motion.div
            className={s.cardPlane}
            style={{
              left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h,
              x: cardX, y: cardY, z: cardZ, scale: cardScale,
              rotateX: cardRotX, rotateY: cardRotY, rotateZ: cardRotZ, opacity: cardOpacity,
            }}
          >
            {card ?? <div className={s.placeholder}>Thiệp của bạn</div>}
            {onCardClick && (
              <div
                className={s.cardHit}
                role="button"
                tabIndex={cardPeeking ? 0 : -1}
                aria-label="Lấy thiệp ra khỏi phong bì"
                style={{ pointerEvents: cardPeeking ? 'auto' : 'none' }}
                onClick={onCardClick}
                onKeyDown={onKey(onCardClick)}
              />
            )}
          </motion.div>

          {/* ===== TẤM TRƯỚC: mặt địa chỉ, hai cánh bên + cánh đáy (miệng túi), nắp ĐANG ĐÓNG ===== */}
          <motion.div className={s.plane} style={{ y: envY, z: frontZ }}>
            <Rotor flip={flip}>
              {/* Mặt trước: địa chỉ */}
              <div className={`${s.face} ${s.hit}`} onClick={envClick('front')}>
                <div className={s.paper} />
                <svg className={s.postmark} viewBox="0 0 100 100" aria-hidden>
                  <defs><path id={pmId} d="M50 50m-33 0a33 33 0 1 1 66 0a33 33 0 1 1-66 0" /></defs>
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.2" />
                  <circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <text fontSize="10.5" letterSpacing="2.4" fill="currentColor" fontWeight="700" fontFamily="system-ui, sans-serif">
                    <textPath href={`#${pmId}`}>INVITATION · POST · 2026 ·</textPath>
                  </text>
                </svg>
                <div className={s.stampBox}><Stamp id={stampId} /></div>
                <svg className={s.cancel} viewBox="0 0 160 44" aria-hidden>
                  {[4, 12, 20, 28, 36].map((y) => (
                    <path key={y} d={`M0 ${y}q10-5 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0`} fill="none" stroke="currentColor" strokeWidth="1.4" />
                  ))}
                </svg>
                <p className={s.name}>{recipientName}</p>
                <motion.div className={s.sheen} style={{ opacity: sheen }} />
              </div>

              {/* Mặt sau: chỉ những phần NẰM TRƯỚC thiệp */}
              <div
                className={`${s.face} ${s.back}`}
                role="button"
                tabIndex={0}
                aria-label={flapLabel}
                onClick={envClick('back')}
                onKeyDown={onKey(envClick('back'))}
              >
                <div className={s.sides}>
                  <div className={`${s.piece} ${s.pl}`} />
                  <div className={`${s.piece} ${s.pr}`} />
                </div>
                <div className={s.bottom}><div className={`${s.piece} ${s.pb}`} /></div>
                <motion.div className={s.flapShadow} style={{ opacity: flapShadow }}><i /></motion.div>
                <motion.div
                  className={`${s.flap} ${s.hit}`}
                  style={{ rotateX: flapRot, z: 2, visibility: flapFrontVis }}
                >
                  <div className={`${s.flapFace} ${s.flapOut}`} />
                </motion.div>
                <motion.div className={s.sheen} style={{ opacity: sheen }} />
              </div>
            </Rotor>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
