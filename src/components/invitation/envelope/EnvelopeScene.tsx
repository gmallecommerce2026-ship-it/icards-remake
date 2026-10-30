// src/components/invitation/envelope/EnvelopeScene.tsx
'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { Stamp } from './Stamp';
import s from './envelope.module.css';

/* ------------------------------------------------------------------ */
/*  Hệ tọa độ thiết kế (px). Cả scene được scale vừa KHUNG CHỨA (cả rộng lẫn cao)  */
/*  và luôn đặt chính giữa. Mọi kích thước phong bì đều suy ra từ kích thước thiệp. */
/* ------------------------------------------------------------------ */
const DW = 720, DH = 700;
const CX = DW / 2, CY = DH / 2;
const CARD_W = 360, CARD_H = 504;                       // thiệp dọc 5:7
const CARD = { x: CX - CARD_W / 2, y: CY - CARD_H / 2, w: CARD_W, h: CARD_H };
const CARD_CX = CX, CARD_CY = CY;

// Phong bì FIT thiệp: thiệp nằm ngang (xoay -90°) với độ phóng S_IN vừa khít miệng phong bì
const S_IN = 0.88;
const ENV_W = Math.round(CARD_H * S_IN + 76);           // cạnh dài thiệp + lề 2 bên
const ENV_H = Math.round(CARD_W * S_IN + 64);           // cạnh ngắn thiệp + lề trên/dưới
const ENV = { x: Math.round(CX - ENV_W / 2), y: Math.round(CY - ENV_H / 2), w: ENV_W, h: ENV_H };
const IN_HALF_H = (CARD_W * S_IN) / 2;                  // nửa chiều cao thiệp khi nằm ngang
const FLAP_H = ENV.h * 0.58;

/* Các tư thế của thiệp, tính theo TÂM thiệp (cx, cy) và độ phóng s.
     sealed : cất kín (nắp đóng)
     peek   : nắp mở, thiệp thò lên khỏi miệng phong bì
     slid   : đã trượt hẳn ra khỏi miệng phong bì (vẫn nằm ngang)
     outClosed / outOpen : đã ra ngoài, đứng dọc trước phong bì (bìa đóng / bìa mở trải hai trang) */
const POSE = {
  sealed: { cx: CX, cy: CY + 6, s: S_IN },
  peek: { cx: CX, cy: ENV.y - 100 + IN_HALF_H, s: S_IN },
  slid: { cx: CX, cy: ENV.y + 20 - IN_HALF_H, s: S_IN },
  outClosed: { cx: 270, cy: 352, s: 1.0 },          // thiệp ở TRƯỚC: lệch trái, phong bì lùi chéo phía sau bên phải
  behind: { cx: 548, cy: 292, s: 0.78 },            // thiệp ở SAU phong bì: chéo phải-trên
  outOpen: { cx: CX + (CARD_W * 0.84) / 2, cy: 340, s: 0.84 },   // bìa mở: cả hai trang cân giữa khung
};

// Phong bì khi thiệp đã rút ra: [thiệp ở trước, phong bì ở trước]
const ENV_LAYOUT = { x: [130, -60], y: [70, 110], s: [0.86, 1] };
const ENV_PUSH = 150;    // phong bì lùi ra sau theo trục z (thiệp luôn ở phía trước)
const T_SLIDE = 0.4;     // mốc của t: thiệp (đang nằm ngang) đã trượt hết khỏi miệng phong bì
const T_TURN = 0.34;     // từ mốc này thiệp bắt đầu xoay dọc + bay vòng cung ra trước
const BOW = -60;         // độ phình của quỹ đạo vòng cung (px, sang trái)
const Z_BUMP = 170;
const SWAP_ARC = 70;     // khi đổi chỗ: thiệp nhấc lên, phong bì hạ xuống từng ấy px để hai vật lướt qua nhau không chồng lên nhau

/* "Máy quay" đi theo nội dung: nắp mở / thiệp trượt lên làm cụm cao hơn nên cả cảnh được kéo xuống
   đúng bằng phần lòi ra phía trên, để cụm luôn nằm giữa khung (và không bao giờ bị cắt). */
const PAN_FLAP = CY - (ENV.y - FLAP_H + ENV.y + ENV.h) / 2;
const PAN_SLID = CY - (POSE.slid.cy - IN_HALF_H + ENV.y + ENV.h) / 2;

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
  cardFront?: boolean;
  focus?: 'card' | 'envelope';              // thiệp đã rút ra: vật nào đứng TRƯỚC (vật còn lại lùi chéo ra sau)                      // true: thiệp đã rút ra, đứng trước phong bì
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
function Rotor({ flip, children, innerRef }: { flip: MotionValue<number>; children: ReactNode; innerRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div className={s.stage3d} style={{ perspectiveOrigin: `${ENV.x + ENV.w / 2}px ${ENV.y + ENV.h / 2}px` }}>
      <motion.div ref={innerRef} className={s.envelope} style={{ left: ENV.x, top: ENV.y, width: ENV.w, height: ENV.h, rotateY: flip }}>
        {children}
      </motion.div>
    </div>
  );
}

export function EnvelopeScene({
  card, envelopeColor, liner, stampId, recipientName = 'Tên người nhận',
  side, flapOpen, cardFront = false, focus = 'card', openAmt, onEnvClick, onCardClick,
}: Props) {
  const reduce = useReducedMotion();
  const pmId = useId().replace(/:/g, '');
  const box = useRef<HTMLDivElement>(null);
  const envRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState<{ k: number; w: number; h: number } | null>(null);

  const flip = useMotionValue(side === 'front' ? 0 : 180);
  const flapRot = useMotionValue(flapOpen ? 180 : 0);
  const t = useMotionValue(cardFront ? 1 : 0);      // 0 = thiệp trong phong bì · 1 = thiệp rút ra phía trước
  const rise = useMotionValue(flapOpen ? 1 : 0);    // 0 = thiệp cất kín · 1 = thiệp thò lên khỏi miệng phong bì
  const fv = useMotionValue(focus === 'envelope' ? 1 : 0);   // 0 = thiệp ở trước · 1 = phong bì ở trước
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
    const ro = new ResizeObserver(([e]) => {
      const { width: w, height: h } = e.contentRect;
      if (w < 1 || h < 1) return;
      // fit theo CẢ chiều rộng lẫn chiều cao khung chứa -> không bao giờ tràn / bị cắt cạnh dưới
      setDim({ k: Math.min(1.3, w / DW, h / DH), w, h });
    });
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
    const c = animate(t, cardFront ? 1 : 0, { duration: reduce ? 0 : 2.6, ease: 'linear' });
    return () => c.stop();
  }, [cardFront, reduce, t]);

  // Đảo vị trí thiệp <-> phong bì (hai vật đổi chỗ, bay vòng cung quanh nhau)
  useEffect(() => {
    const c = animate(fv, focus === 'envelope' ? 1 : 0, { duration: reduce ? 0 : 1.6, ease: [0.45, 0, 0.2, 1] });
    return () => c.stop();
  }, [focus, reduce, fv]);

  /* ---------- THIỆP ----------
     RÚT RA  (t 0 → 1):
       1) thiệp NẰM NGANG trượt thẳng LÊN khỏi miệng phong bì
       2) sau đó mới xoay DỌC, đồng thời bay vòng cung (phình sang trái, nhô về phía người xem) hạ về giữa cảnh
     ĐÚT VÀO (t 1 → 0): đúng hành trình ngược lại - xoay ngang trước, rồi mới trượt xuống vào phong bì. */
  const slide = useTransform(t, (v) => ss(0, T_SLIDE, v));       // 0 → 1: trượt lên khỏi miệng
  const swing = useTransform(t, (v) => ss(T_TURN, 1, v));         // 0 → 1: xoay dọc + bay vòng cung
  const cardX = useTransform([swing, open, fv], ([u, op, f]: number[]) => {
    const closed = lerp(POSE.outClosed.cx, POSE.behind.cx, f);
    const outX = lerp(closed, POSE.outOpen.cx, op * (1 - f));
    return lerp(POSE.sealed.cx, outX, u) + BOW * Math.sin(Math.PI * u) * (1 - f) - CARD_CX;
  });
  const cardY = useTransform([slide, swing, rise, open, fv], ([sl, u, r, op, f]: number[]) => {
    const inY = lerp(POSE.sealed.cy, POSE.peek.cy, r);
    const y0 = lerp(inY, POSE.slid.cy, sl);
    const closed = lerp(POSE.outClosed.cy, POSE.behind.cy, f);
    const outY = lerp(closed, POSE.outOpen.cy, op * (1 - f));
    return lerp(y0, outY, u) - CARD_CY - SWAP_ARC * Math.sin(Math.PI * f) * u;   // nhấc lên khi đổi chỗ
  });
  const cardScale = useTransform([swing, open, fv], ([u, op, f]: number[]) => {
    const closed = lerp(POSE.outClosed.s, POSE.behind.s, f);
    return lerp(POSE.sealed.s, lerp(closed, POSE.outOpen.s, op * (1 - f)), u);
  });
  const cardRotZ = useTransform(swing, (u) => -90 * (1 - u));      // -90° = nằm ngang · 0° = đứng thẳng
  const cardRotX = useTransform(swing, (u) => -16 * Math.sin(Math.PI * u));
  const cardRotY = useTransform(swing, (u) => 38 * Math.sin(Math.PI * u));
  // z = 1 nằm GIỮA lưng phong bì (z 0) và mặt trước (z 2); ra ngoài thì lên trước (z 100) hoặc lùi hẳn ra sau phong bì (z -160)
  const cardZ = useTransform([t, fv], ([v, f]: number[]) => {
    const u = ss(T_SLIDE, 1, v);
    return 1 + 99 * u + Z_BUMP * Math.sin(Math.PI * u) * (1 - f) - 260 * ss(0.35, 0.65, f) * u;
  });
  // z-index: lưng phong bì = 1 · thiệp (đang trong) = 2 · mặt trước phong bì = 3
  const cardLayer = useTransform([t, fv], ([v, f]: number[]) => (ss(T_SLIDE, 1, v) < 0.001 ? 2 : f < 0.5 ? 4 : 0));
  const cardOpacity = useTransform([t, rise], ([tt, r]: number[]) => Math.min(1, r * 3 + tt * 6));

  // máy quay: chỉ cần kéo xuống khi nắp đang mở (nhìn từ mặt nắp) và thiệp còn nằm trong phong bì
  const backAmt = useTransform(flip, (v) => (1 - Math.cos(v * rad)) / 2);   // 0 = mặt địa chỉ · 1 = mặt nắp
  const pan = useTransform([flapRot, slide, swing, backAmt], ([fr, sl, sw, ba]: number[]) => {
    const f = clamp01(fr / 180) * ba;
    return (PAN_FLAP * f + (PAN_SLID - PAN_FLAP) * sl * f) * (1 - sw);
  });

  /* ---------- PHONG BÌ: tụt xuống + lùi ra sau để nhường chỗ cho thiệp, nhưng vẫn thấy được (chạm để cất thiệp) ---------- */
  const uOut = useTransform(t, (v) => ss(T_SLIDE, 1, v));
  const flapAmt = useTransform([flapRot, backAmt], ([fr, ba]: number[]) => clamp01(fr / 180) * ba);
  const envX = useTransform([uOut, fv], ([u, f]: number[]) => u * lerp(ENV_LAYOUT.x[0], ENV_LAYOUT.x[1], f));
  const envY = useTransform([uOut, fv, flapAmt], ([u, f, fa]: number[]) =>
    u * (lerp(ENV_LAYOUT.y[0], ENV_LAYOUT.y[1], f) * fa + SWAP_ARC * Math.sin(Math.PI * f)));
  const envS = useTransform([uOut, fv], ([u, f]: number[]) => 1 + u * (lerp(ENV_LAYOUT.s[0], ENV_LAYOUT.s[1], f) - 1));
  const backZ = useTransform([t, fv], ([v, f]: number[]) => -ENV_PUSH * ss(T_SLIDE, 0.9, v) * (1 - ss(0.35, 0.65, f)));
  const frontZ = useTransform(backZ, (v) => v + 2);
  // hai vật nghiêng ngược chiều nhau trong lúc bay -> cảm giác xoay quanh nhau trong không gian
  const arc = useTransform(t, (v) => Math.sin(Math.PI * ss(T_TURN - 0.05, 1, v)) * 0.6);   // chỉ nghiêng thoáng qua khi rút/cất thiệp
  const envRotY = useTransform(arc, (a) => -22 * a);
  const envRotX = useTransform(arc, (a) => 8 * a);

  const vars = { '--env': envelopeColor, '--ink': isLight(envelopeColor) ? '#17171a' : '#ffffff' } as CSSProperties;
  const envClick = (face: 'front' | 'back') => (e?: { stopPropagation: () => void }) => { e?.stopPropagation(); onEnvClick?.(face); };
  // Thiệp đang ở phía trước: bấm vào BẤT KỲ chỗ nào thuộc phong bì (kể cả phần bị hit-test 3D bỏ sót) -> đảo phong bì lên trước
  const hit = (r: DOMRect | undefined, e: React.MouseEvent) =>
    !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  // hình bao của phong bì, cộng thêm phần nắp đang dựng lên phía trên
  const envRect = () => {
    const r = envRef.current?.getBoundingClientRect();
    if (!r) return undefined;
    const ext = flapOpen && side === 'back' ? (r.height / ENV.h) * FLAP_H : 0;
    return new DOMRect(r.left, r.top - ext, r.width, r.height + ext);
  };
  // Hai vật chồng nhau: bấm vật nằm SAU (phần lộ ra) -> đảo nó lên trước
  const onSceneClick = (e: React.MouseEvent) => {
    if (!cardFront) return;
    if (focus === 'card') {
      if (cardRef.current?.contains(e.target as Node)) return;
      if (hit(envRect(), e)) onEnvClick?.('front');
    } else if (!hit(envRect(), e) && hit(cardRef.current?.getBoundingClientRect(), e)) {
      onCardClick?.();
    }
  };

  const cardPeeking = !cardFront && flapOpen;
  const flapLabel = cardFront ? 'Cất thiệp vào phong bì' : flapOpen ? 'Đóng nắp phong bì' : 'Mở nắp phong bì';

  return (
    <div ref={box} className={s.fit} onClick={onSceneClick}>
      <div
        className={s.scene}
        style={{
          ...vars, width: DW, height: DH,
          left: dim ? (dim.w - DW * dim.k) / 2 : 0,
          top: dim ? (dim.h - DH * dim.k) / 2 : 0,
          transform: `scale(${dim?.k ?? 1})`,
          visibility: dim ? 'visible' : 'hidden',
        }}
      >
        <motion.div className={s.world} style={{ y: pan, perspectiveOrigin: `${CX}px ${CY}px` }}>
          {/* ===== TẤM LƯNG: giấy phong bì, lớp lót, nắp ĐÃ MỞ (nằm sau thiệp) ===== */}
          <motion.div className={s.plane} style={{ x: envX, y: envY, scale: envS, z: backZ, zIndex: 1, rotateY: envRotY, rotateX: envRotX }}>
            <motion.div className={s.ground} style={{ left: ENV.x, top: ENV.y, width: ENV.w, height: ENV.h, scaleX: groundX }} />
            <Rotor flip={flip} innerRef={envRef}>
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
            ref={cardRef}
            className={s.cardPlane}
            style={{
              left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h,
              x: cardX, y: cardY, z: cardZ, zIndex: cardLayer, scale: cardScale,
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
          <motion.div className={s.plane} style={{ x: envX, y: envY, scale: envS, z: frontZ, zIndex: 3, rotateY: envRotY, rotateX: envRotX }}>
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
        </motion.div>
      </div>
    </div>
  );
}