// src/components/invitation/envelope/CardEnvelopeScene.tsx
// Cảnh "gói thiệp" cho thiệp 2 mặt (format = card): phong bì cùng hướng với thiệp, hình học lấy từ
// envelope.geometry (cardCluster) để khớp với trang mẫu. Thiệp không xoay: lơ lửng → trượt thẳng vào túi
// → nắp gập xuống → dấu sáp đóng. Tiến độ `send` (0..1) do InvitationSendFlow điều khiển, như EnvelopeScene.
'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { cardCluster } from './envelope.geometry';
import { orientationRatio, type TemplateOrientation } from '@/lib/templates';

/** Hệ thiết kế giống EnvelopeScene để logic đo khung / chuyển cảnh dùng chung. */
const DW = 720, DH = 700;
/** Cạnh khối vuông chứa cụm thiệp + phong bì (px thiết kế). */
const SQUARE = 600;
/** Thiệp lơ lửng cao hơn vị trí cuối bao nhiêu lần chiều cao thiệp (đầu hành trình). */
const FLOAT_LIFT = 1.2;

// Cùng hình học clip với TemplateShowcase
const FLAP_CLIP = 'polygon(0% 100%, 100% 100%, 50% 0%)';
const BODY_LINER_CLIP = 'polygon(4% 0%, 96% 0%, 50% 36%)';
// Phần trước của túi: che phần dưới của thiệp khi đã cất vào
const POCKET_CLIP = 'polygon(0% 0%, 50% 58%, 100% 0%, 100% 100%, 0% 100%)';

// Mốc tiến độ 0..1
const R = {
  drop: [0.2, 0.5],    // thiệp trượt thẳng xuống túi
  flap: [0.55, 0.75],  // nắp gập xuống
  seal: [0.78, 0.92],  // dấu sáp đóng
} as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (u: number) => { const x = clamp01(u); return x * x * (3 - 2 * x); };
const seg = (p: number, [a, b]: readonly [number, number]) => smooth((p - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

const rect = (left: number, top: number, w: number, h: number): CSSProperties => ({
  position: 'absolute', left: `${left}%`, top: `${top}%`, width: `${w}%`, height: `${h}%`,
});

function sealColor(hex: string) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r > 140 && g < 100 && b < 120 ? '#B8862B' : '#A3152F';
}

type Props = {
  card: ReactNode;
  orientation: TemplateOrientation;
  envelopeColor: string;   // hex 6 ký tự
  liner: string;           // giá trị CSS background
  send: MotionValue<number>;
};

export function CardEnvelopeScene({ card, orientation, envelopeColor, liner, send }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setK(Math.min(e.contentRect.width / DW, e.contentRect.height / DH)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Hình học y hệt trang mẫu → phong bì trong cảnh gói khớp với trang mẫu
  const g = cardCluster(orientation);
  const ratio = orientationRatio(orientation);

  const cardRest = g.originY + g.cardY;                  // thiệp trong phong bì, nhô lên 12%
  const cardFloat = cardRest - FLOAT_LIFT * g.cardH;     // thiệp lơ lửng phía trên

  const p = send;
  const cardTop = useTransform(p, (v) => `${lerp(cardFloat, cardRest, seg(v, R.drop))}%`);
  const cardScale = useTransform(p, [0, 0.2, 0.5], [1.08, 1.12, 1]);
  const flapDeg = useTransform(p, (v) => 180 * seg(v, R.flap));  // 0 = mở (dựng lên), 180 = đóng
  const flapZ = useTransform(flapDeg, (d) => (d > 90 ? 10 : 2)); // mở: sau thiệp; đóng: trước thiệp
  const sealOpacity = useTransform(p, (v) => seg(v, R.seal));
  const sealScale = useTransform(p, (v) => 1.5 - 0.5 * seg(v, R.seal));

  // Máy quay: xoay nhẹ quanh hai trục + áp sát khi thiệp khoe và khi đóng dấu, như cảnh 4 mặt
  const camRX = useTransform(p, [0, 0.2, 0.5, 0.75, 0.92, 1], [-4, 4, 0, 7, 0, 0]);
  const camRY = useTransform(p, [0, 0.2, 0.5, 0.75, 0.92, 1], [-12, 9, 0, -6, 0, 0]);
  const camS = useTransform(p, [0, 0.2, 0.5, 0.75, 0.92, 1], [0.96, 1.08, 1, 1.12, 1, 1]);

  const sealSize = g.envW * 0.26;
  const seal = sealColor(envelopeColor);

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0 }}>
      <div
        style={{
          position: 'absolute', left: '50%', top: '50%', width: DW, height: DH,
          transform: `translate(-50%, -50%) scale(${k})`, transformOrigin: '50% 50%',
        }}
      >
        <div
          style={{
            position: 'absolute', left: (DW - SQUARE) / 2, top: (DH - SQUARE) / 2,
            width: SQUARE, height: SQUARE, perspective: 1400,
          }}
        >
          {/* Máy quay 3D: mọi lớp bên trong là phẳng và sắp theo z-index như cũ, chỉ cả khung được xoay / phóng */}
          <motion.div
            style={{
              position: 'absolute', inset: 0, perspective: 1400, transformOrigin: '50% 50%',
              rotateX: camRX, rotateY: camRY, scale: camS,
            }}
          >
          {/* 1. Thân phong bì (mặt sau) */}
          <div
            style={{
              ...rect(g.originX, g.originY, g.envW, g.envH), background: envelopeColor, borderRadius: 2,
              boxShadow: '0 12px 24px -12px rgba(0,0,0,0.5)', zIndex: 1,
            }}
          />
          {/* 2. Lớp lót nhìn qua miệng phong bì */}
          <div
            style={{ ...rect(g.originX, g.originY, g.envW, g.envH), background: liner, clipPath: BODY_LINER_CLIP, zIndex: 2 }}
          />

          {/* 3. Nắp: bản lề ở mép trên thân, xoay quanh đó */}
          <motion.div
            style={{
              ...rect(g.originX, g.originY - g.flapH, g.envW, g.flapH),
              background: envelopeColor, clipPath: FLAP_CLIP, transformOrigin: '50% 100%',
              rotateX: flapDeg, zIndex: flapZ, filter: 'brightness(1.08)',
            }}
          >
            <div
              style={{ position: 'absolute', left: '7%', right: '7%', bottom: 0, top: '16%', background: liner, clipPath: FLAP_CLIP }}
            />
          </motion.div>

          {/* 4. Thiệp (đúng hướng của nó, không xoay) */}
          <motion.div
            style={{
              position: 'absolute',
              left: `${g.originX + g.cardX}%`,
              top: cardTop,
              width: `${g.cardW}%`,
              aspectRatio: ratio,
              scale: cardScale,
              zIndex: 5,
              overflow: 'hidden',
              borderRadius: 3,
              boxShadow: '0 10px 24px -10px rgba(0,0,0,0.45)',
            }}
          >
            <div style={{ position: 'absolute', inset: 0 }}>{card}</div>
          </motion.div>

          {/* 5. Phần trước của túi: che phần dưới của thiệp khi đã cất vào */}
          <div
            style={{
              ...rect(g.originX, g.originY, g.envW, g.envH), background: envelopeColor,
              clipPath: POCKET_CLIP, zIndex: 8,
            }}
          />

          {/* 6. Dấu sáp ở mép nắp */}
          <motion.div
            style={{
              position: 'absolute',
              left: `${g.originX + g.envW / 2}%`,
              top: `${g.originY + g.flapH}%`,
              width: `${sealSize}%`,
              aspectRatio: '1 / 1',
              marginLeft: `-${sealSize / 2}%`,
              marginTop: `-${sealSize / 2}%`,
              borderRadius: '50%',
              background: seal,
              opacity: sealOpacity,
              scale: sealScale,
              zIndex: 12,
              boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
            }}
          />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
