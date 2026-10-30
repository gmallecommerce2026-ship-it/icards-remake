// src/components/invitation/envelope/EnvelopeScene.tsx
'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { Stamp } from './Stamp';
import s from './envelope.module.css';

// Hệ tọa độ thiết kế (px). Cả scene được scale vừa khung chứa.
const DW = 640, DH = 696;
const ENV = { x: 12, y: 240, w: 540, h: 390 };
const CARD = { x: 268, y: 183, w: 360, h: 504 };

// Vị trí thiệp (gốc biến đổi ở mép trái, giữa chiều cao)
const POSE = {
  behind: { x: 0, y: 0, scale: 1 },
  front: { x: -135, y: -8, scale: 1.04 },   // thiệp đóng, ra trước, ở giữa cảnh
  frontOpen: { x: 52, y: 0, scale: 0.88 },  // thiệp mở: bìa lật sang trái nên dồn thiệp sang phải
};

type Props = {
  card?: ReactNode;          // nội dung thiệp (tỉ lệ 5:7)
  envelopeColor: string;     // hex 6 ký tự
  liner: string;             // giá trị CSS background
  stampId: string;
  recipientName?: string;
  side: 'front' | 'back';    // front = mặt địa chỉ, back = mặt nắp
  flapOpen: boolean;
  onFlapToggle?: () => void;
  cardFront?: boolean;       // true: thiệp nằm trước phong bì
  cardOpen?: boolean;        // true: bìa thiệp đã lật mở
  cardFlipped?: boolean;     // true: đang xem mặt sau thiệp
};

function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150;
}

export function EnvelopeScene({
  card, envelopeColor, liner, stampId, recipientName = 'Tên người nhận',
  side, flapOpen, onFlapToggle, cardFront = false, cardOpen = false, cardFlipped = false,
}: Props) {
  const reduce = useReducedMotion();
  const pmId = useId().replace(/:/g, '');
  const box = useRef<HTMLDivElement>(null);
  const firstLift = useRef(true);
  const [k, setK] = useState(1);
  const [layerFront, setLayerFront] = useState(cardFront);

  const flip = useMotionValue(side === 'front' ? 0 : 180);
  const flapRot = useMotionValue(flapOpen ? 180 : 0);
  const lift = useMotionValue(0);
  const dropY = useMotionValue(0);
  const dropA = useMotionValue(1);
  const rad = Math.PI / 180;
  const groundX = useTransform(flip, (v) => 0.3 + 0.7 * Math.abs(Math.cos(v * rad)));
  const sheen = useTransform(flip, (v) => 0.5 * Math.abs(Math.sin(2 * v * rad)));
  const flapShadow = useTransform(flapRot, [0, 45], [1, 0]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(Math.min(1.3, e.contentRect.width / DW)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const c = animate(flip, side === 'front' ? 0 : 180, { duration: reduce ? 0 : 1, ease: [0.45, 0, 0.2, 1] });
    return () => c.stop();
  }, [side, reduce, flip]);
  useEffect(() => {
    const c = animate(flapRot, flapOpen ? 180 : 0, { duration: reduce ? 0 : 0.8, ease: [0.4, 0, 0.2, 1] });
    return () => c.stop();
  }, [flapOpen, reduce, flapRot]);

  // Đổi thứ tự lớp ở giữa hành trình để thiệp "chui" qua mặt phong bì
  useEffect(() => {
    const t = setTimeout(() => setLayerFront(cardFront), reduce ? 0 : 300);
    return () => clearTimeout(t);
  }, [cardFront, reduce]);
  // Cú nảy lên khi thiệp đổi tầng
  useEffect(() => {
    if (firstLift.current) { firstLift.current = false; return; }
    if (reduce) return;
    const c = animate(lift, [0, -150, 0], { duration: 0.9, ease: [0.4, 0, 0.2, 1] });
    return () => c.stop();
  }, [cardFront, reduce, lift]);

  // Phong bì tụt xuống và mờ dần khi thiệp đã được lấy ra; trượt lên lại khi cho thiệp vào
  useEffect(() => {
    const t = reduce ? 0 : 0.8;
    const delay = reduce ? 0 : cardFront ? 0.25 : 0;
    const a = animate(dropY, cardFront ? 150 : 0, { duration: t, delay, ease: [0.4, 0, 0.2, 1] });
    const b = animate(dropA, cardFront ? 0.0 : 1, { duration: t, delay, ease: 'easeInOut' });
    return () => { a.stop(); b.stop(); };
  }, [cardFront, reduce, dropY, dropA]);

  const pose = !cardFront ? POSE.behind : cardFlipped ? POSE.front : cardOpen ? POSE.frontOpen : POSE.front;
  const vars = { '--env': envelopeColor, '--ink': isLight(envelopeColor) ? '#17171a' : '#ffffff' } as CSSProperties;

  return (
    <div ref={box} className={s.fit} style={{ height: DH * k }}>
      <div className={s.scene} style={{ ...vars, width: DW, height: DH, transform: `scale(${k})` }}>
        <motion.div
          className={s.card}
          style={{
            left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h,
            zIndex: layerFront ? 5 : 0, transformOrigin: '0% 50%',
            overflow: 'visible', background: 'transparent', boxShadow: 'none',
          }}
          initial={false}
          animate={pose}
          transition={{ duration: reduce ? 0 : 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div style={{ y: lift, position: 'absolute', inset: 0 }}>
            {card ?? <div className={s.placeholder}>Thiệp của bạn</div>}
          </motion.div>
        </motion.div>

        <motion.div className={s.drop} style={{ y: dropY, opacity: dropA, pointerEvents: cardFront ? 'none' : 'auto' }}>
        <motion.div className={s.ground} style={{ left: ENV.x, top: ENV.y, width: ENV.w, height: ENV.h, scaleX: groundX }} />

        <div className={s.stage3d} style={{ perspectiveOrigin: `${ENV.x + ENV.w / 2}px ${ENV.y + ENV.h / 2}px` }}>
          <motion.div className={s.envelope} style={{ left: ENV.x, top: ENV.y, width: ENV.w, height: ENV.h, rotateY: flip }}>
            {/* Mặt trước: địa chỉ */}
            <div className={s.face}>
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

            {/* Mặt sau: nắp + liner */}
            <div className={`${s.face} ${s.back}`} onClick={onFlapToggle} role="button" aria-label={flapOpen ? 'Đóng nắp phong bì' : 'Mở nắp phong bì'}>
              <div className={s.paper} />
              <div className={s.interior} style={{ background: liner }} />
              <div className={s.sides}><div className={`${s.piece} ${s.pl}`} /><div className={`${s.piece} ${s.pr}`} /></div>
              <div className={s.bottom}><div className={`${s.piece} ${s.pb}`} /></div>
              <motion.div className={s.flapShadow} style={{ opacity: flapShadow }}><i /></motion.div>
              <motion.div className={s.flap} style={{ rotateX: flapRot, z: 2 }}>
                <div className={`${s.flapFace} ${s.flapOut}`} />
                <div className={`${s.flapFace} ${s.flapIn}`}>
                  <div className={s.flapLiner} style={{ background: liner }} />
                </div>
              </motion.div>
              <motion.div className={s.sheen} style={{ opacity: sheen }} />
            </div>
          </motion.div>
        </div>
        </motion.div>
      </div>
    </div>
  );
}