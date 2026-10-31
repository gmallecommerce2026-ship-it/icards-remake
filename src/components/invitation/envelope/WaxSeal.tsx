// src/components/invitation/envelope/WaxSeal.tsx
'use client';

import { useId } from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';

/* ------------------------------------------------------------------ */
/*  Niêm phong sáp, NHÌN TỪ TRÊN XUỐNG (máy quay thẳng góc với mặt nắp).  */
/*  "Chiều cao" được diễn bằng độ phóng + bóng đổ: vật càng gần camera    */
/*  càng to, bóng càng lệch / nhoè. Chuyển động bám theo `p` (0 → 1), nên  */
/*  cuộn ngược là con dấu nhấc lên rồi sáp rút lại đúng hành trình ngược:   */
/*    0   – .20 : sáp nóng chảy loang ra thành vũng tròn trên mũi nắp       */
/*    .20 – .50 : con dấu đồng (khắc ngược chữ iCards) hạ từ camera xuống    */
/*    .50 – .58 : ÉP - vũng sáp bị nén loe ra một nhịp rồi lắng lại           */
/*    .50 – .56 : dấu ấn iCards nổi lên trên sáp                          */
/*    .60 – .90 : con dấu đồng nhấc ngược về phía camera rồi mờ đi          */
/*    .82 – 1   : một vệt sáng lướt qua mặt sáp                            */
/* ------------------------------------------------------------------ */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
export const SEAL_PRESS_AT = 0.5;   // mốc ép (EnvelopeScene dùng để rung máy đúng lúc)

const hex = (h: string) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

/** mép sáp lượn sóng + vài giọt sáp tràn ra, cố định (không random) để SSR/CSR khớp nhau */
const BLOB = (() => {
  const N = 96;
  const drips = [{ a: 0.75, w: 0.1, h: 5 }, { a: 2.55, w: 0.07, h: 3.4 }, { a: 4.1, w: 0.11, h: 5.5 }, { a: 5.55, w: 0.06, h: 2.8 }];
  const pts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    let r = 44 + 2.2 * Math.sin(3 * t + 0.6) + 1.5 * Math.sin(5 * t + 2.1) + 1.0 * Math.sin(9 * t + 0.3);
    for (const d of drips) {
      let dt = Math.abs(t - d.a);
      dt = Math.min(dt, Math.PI * 2 - dt);
      r += d.h * Math.exp(-(dt * dt) / (2 * d.w * d.w));
    }
    pts.push([Math.cos(t) * r, Math.sin(t) * r]);
  }
  const mid = (a: [number, number], b: [number, number]) => `${((a[0] + b[0]) / 2).toFixed(2)} ${((a[1] + b[1]) / 2).toFixed(2)}`;
  let d = `M${mid(pts[N - 1], pts[0])}`;
  for (let i = 0; i < N; i++) d += `Q${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)} ${mid(pts[i], pts[(i + 1) % N])}`;
  return d + 'Z';
})();

const BEADS = Array.from({ length: 30 }, (_, i) => {
  const t = (i / 30) * Math.PI * 2;
  return [Math.cos(t) * 31, Math.sin(t) * 31] as const;
});

export function WaxSeal({ p, color = '#A3152F' }: { p: MotionValue<number>; color?: string }) {
  const uid = useId().replace(/:/g, '');
  const light = mix(color, '#ffffff', 0.38), mid = color, dark = mix(color, '#000000', 0.55), deep = mix(color, '#000000', 0.75);
  const BRASS = ['#f3dc9a', '#c99a3c', '#7d5614'];

  /* ----- vũng sáp ----- */
  const pour = useTransform(p, (u) => 1 - Math.pow(1 - ss(0, 0.2, u), 3));
  const squeeze = useTransform(p, (u) => 0.09 * ss(0.5, 0.56, u) * (1 - ss(0.56, 0.74, u)) * (1 + 0.25 * Math.cos(30 * Math.max(0, u - 0.56))));
  const poolScale = useTransform([pour, squeeze], ([a, b]: number[]) => (0.12 + 0.88 * a) * (1 + b));
  const poolOp = useTransform(p, (u) => ss(0, 0.04, u));
  const poolShadow = useTransform(p, (u) => 0.55 * ss(0, 0.2, u));
  const detail = useTransform(p, (u) => ss(SEAL_PRESS_AT, 0.56, u));
  const glintX = useTransform(p, (u) => -60 + 120 * ss(0.82, 1, u));
  const glintOp = useTransform(p, (u) => 0.9 * Math.sin(Math.PI * ss(0.82, 1, u)));

  /* ----- con dấu đồng: "cao" = gần camera = to hơn + bóng lệch xa ----- */
  const toolScale = useTransform(p, (u) => {
    const down = 1 - Math.pow(clamp01((u - 0.2) / 0.3), 2);   // rơi nhanh dần
    const up = ss(0.6, 0.9, u);                                // nhấc lên êm
    const press = 0.04 * ss(0.44, SEAL_PRESS_AT, u) * (1 - ss(SEAL_PRESS_AT, 0.6, u));
    return (1 + 1.5 * down) * (1 + 1.6 * up) * (1 - press);
  });
  const toolOp = useTransform(p, (u) => ss(0.2, 0.3, u) * (1 - ss(0.74, 0.9, u)));
  const toolRot = useTransform(p, (u) => -16 * (1 - ss(0.2, 0.5, u)) + 12 * ss(0.6, 0.9, u));
  const toolShadowOp = useTransform(toolOp, (o) => 0.5 * o);
  const toolShadowX = useTransform(toolScale, (s) => 9 * (s - 1));
  const toolShadowY = useTransform(toolScale, (s) => 14 * (s - 1));
  const toolShadowBlur = useTransform(toolScale, (s) => `blur(${2 + 7 * (s - 1)}px)`);

  const emblem = (
    <g id={`${uid}em`}>
      <text fontSize="6.4" fontWeight="700" letterSpacing="0.4" fontFamily="Georgia, 'Times New Roman', serif">
        <textPath href={`#${uid}ring`} textLength="148" lengthAdjust="spacing">iCARDS · INVITATION · iCARDS · </textPath>
      </text>
      <text x="0" y="8.5" textAnchor="middle" fontSize="25" fontWeight="700" fontStyle="italic" fontFamily="Georgia, 'Times New Roman', serif">iC</text>
      <path d="M-9 14.5h18" strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" fill="none" />
    </g>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden>
      {/* bóng của vũng sáp trên giấy */}
      <motion.div style={{ position: 'absolute', inset: '8% 6% 0', borderRadius: '50%', background: 'rgb(0 0 0 / .8)', filter: 'blur(6px)', opacity: poolShadow, scale: poolScale, y: 3 }} />

      {/* vũng sáp + dấu ấn */}
      <motion.div style={{ position: 'absolute', inset: 0, opacity: poolOp, scale: poolScale, rotate: -4 }}>
        <svg viewBox="-60 -60 120 120" width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${uid}b`} cx="0.36" cy="0.3" r="0.85">
              <stop offset="0" stopColor={light} /><stop offset="0.45" stopColor={mid} /><stop offset="1" stopColor={dark} />
            </radialGradient>
            <linearGradient id={`${uid}r`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={light} /><stop offset="0.5" stopColor={mid} /><stop offset="1" stopColor={deep} />
            </linearGradient>
            <linearGradient id={`${uid}ri`} x1="1" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor={light} stopOpacity=".9" /><stop offset="0.5" stopColor={mid} /><stop offset="1" stopColor={deep} />
            </linearGradient>
            <radialGradient id={`${uid}c`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={mid} /><stop offset="1" stopColor={dark} />
            </radialGradient>
            <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`${uid}t`} cx="0.35" cy="0.3" r="0.9">
              <stop offset="0" stopColor={BRASS[0]} /><stop offset="0.55" stopColor={BRASS[1]} /><stop offset="1" stopColor={BRASS[2]} />
            </radialGradient>
            <path id={`${uid}ring`} d="M-25 0a25 25 0 1 1 50 0a25 25 0 1 1-50 0" />
            <clipPath id={`${uid}k`}><path d={BLOB} /></clipPath>
            {emblem}
          </defs>

          <path d={BLOB} fill={`url(#${uid}b)`} />
          <path d={BLOB} fill="none" stroke={`url(#${uid}r)`} strokeWidth="2.4" />
          <ellipse cx="-14" cy="-22" rx="22" ry="11" fill="#fff" opacity=".16" transform="rotate(-28 -14 -22)" />

          {/* dấu ấn nổi (chữ thuận chiều vì con dấu khắc ngược) */}
          <motion.g style={{ opacity: detail }}>
            <circle r="37" fill={`url(#${uid}c)`} />
            <circle r="37" fill="none" stroke={`url(#${uid}ri)`} strokeWidth="2" />
            {BEADS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1" fill={light} opacity=".7" />)}
            <use href={`#${uid}em`} fill={deep} stroke={deep} opacity=".85" transform="translate(-0.9 -1)" />
            <use href={`#${uid}em`} fill={light} stroke={light} opacity=".55" transform="translate(1 1.1)" />
            <use href={`#${uid}em`} fill={mid} stroke={mid} style={{ color: mid }} />
          </motion.g>

          <g clipPath={`url(#${uid}k)`}>
            <g transform="rotate(22)">
              <motion.rect x="-14" y="-70" width="28" height="140" fill={`url(#${uid}g)`} style={{ x: glintX, opacity: glintOp }} />
            </g>
          </g>
        </svg>
      </motion.div>

      {/* bóng của con dấu đồng đổ lên sáp */}
      <motion.div style={{ position: 'absolute', inset: '10%', borderRadius: '50%', background: 'rgb(0 0 0 / .85)', opacity: toolShadowOp, scale: toolScale, x: toolShadowX, y: toolShadowY, filter: toolShadowBlur }} />

      {/* con dấu đồng nhìn từ trên xuống: mặt khắc ngược */}
      <motion.div style={{ position: 'absolute', inset: '9%', opacity: toolOp, scale: toolScale, rotate: toolRot }}>
        <svg viewBox="-44 -44 88 88" width="100%" height="100%" style={{ overflow: 'visible' }}>
          <circle r="42" fill="#5a3d0c" />
          <circle r="41" fill={`url(#${uid}t)`} />
          <circle r="35" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1" />
          <circle r="30.5" fill="#7d5614" opacity=".35" />
          <g transform="scale(-1 1)" fill="#4a3208" stroke="#4a3208" style={{ color: '#4a3208' }}>
            <use href={`#${uid}em`} />
          </g>
          <ellipse cx="-15" cy="-24" rx="20" ry="9" fill="#fff" opacity=".28" transform="rotate(-30 -15 -24)" />
        </svg>
      </motion.div>
    </div>
  );
}
