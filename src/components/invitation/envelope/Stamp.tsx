// src/components/invitation/envelope/Stamp.tsx
import { useId, type ReactNode } from 'react';
import type { Tone } from './envelope.data';

const W = 120, H = 140, R = 3.2, STEP = 10;

// Khung tem có răng cưa: dùng SVG mask, đục lỗ tròn dọc 4 cạnh
function Frame({ children }: { children: ReactNode }) {
  const id = useId().replace(/:/g, '');
  const holes: [number, number][] = [];
  for (let x = STEP / 2; x < W; x += STEP) holes.push([x, 0], [x, H]);
  for (let y = STEP / 2; y < H; y += STEP) holes.push([0, y], [W, y]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden>
      <defs>
        <mask id={id}>
          <rect width={W} height={H} fill="#fff" />
          {holes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={R} fill="#000" />)}
        </mask>
      </defs>
      <g mask={`url(#${id})`}>
        <rect width={W} height={H} fill="#fbf9f3" />
        <g transform="translate(10 10)">{children}</g>
      </g>
    </svg>
  );
}

// Hình tem tự vẽ, vùng vẽ 100 x 120
export const STAMPS: { id: string; name: string; tone: Tone; art: ReactNode }[] = [
  { id: 'sun', name: 'Sunny', tone: 'yellow', art: (<>
    <rect width="100" height="120" fill="#ffe4a3" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1="50" y1="22" x2="50" y2="10" stroke="#ff9f1c" strokeWidth="5" strokeLinecap="round" transform={`rotate(${a} 50 52)`} />)}
    <circle cx="50" cy="52" r="22" fill="#ff9f1c" />
  </>) },
  { id: 'balloon', name: 'Balloon', tone: 'pink', art: (<>
    <rect width="100" height="120" fill="#bfe8e4" />
    <ellipse cx="50" cy="48" rx="24" ry="30" fill="#f0527a" />
    <ellipse cx="42" cy="38" rx="5" ry="9" fill="#fff" opacity=".35" />
    <path d="M50 78l-6 8h12z" fill="#f0527a" />
    <path d="M50 86c-10 10 10 18-2 30" stroke="#555" strokeWidth="1.5" fill="none" />
  </>) },
  { id: 'heart', name: 'Heart', tone: 'red', art: (<>
    <rect width="100" height="120" fill="#2a2d6b" />
    <path d="M50 88C8 58 22 20 50 40c28-20 42 18 0 48z" fill="#ff6b81" />
  </>) },
  { id: 'star', name: 'Star', tone: 'blue', art: (<>
    <rect width="100" height="120" fill="#17325c" />
    <polygon points="50,24 59,48 85,48 64,63 72,88 50,73 28,88 36,63 15,48 41,48" fill="#ffd23f" />
  </>) },
  { id: 'flower', name: 'Flower', tone: 'pink', art: (<>
    <rect width="100" height="120" fill="#ffe9ef" />
    <path d="M50 62v48" stroke="#2f9e5b" strokeWidth="3" />
    {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="50" cy="34" rx="11" ry="18" fill="#ff8fab" transform={`rotate(${a} 50 52)`} />)}
    <circle cx="50" cy="52" r="9" fill="#ffd23f" />
  </>) },
];

export function Stamp({ id }: { id: string }) {
  const s = STAMPS.find((x) => x.id === id) ?? STAMPS[0];
  return <Frame>{s.art}</Frame>;
}