// src/components/invitation/editor/editor.data.tsx
import type { ReactNode } from 'react';

// Tất cả đều có glyph tiếng Việt
export const FONTS = ['Be Vietnam Pro', 'Montserrat', 'Playfair Display', 'Oswald', 'Dancing Script', 'Pacifico', 'Lobster', 'Space Mono'];
export const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;700&family=Dancing+Script:wght@400;700&family=Lobster&family=Montserrat:wght@400;700&family=Oswald:wght@400;700&family=Pacifico&family=Playfair+Display:wght@400;700&family=Space+Mono:wght@400;700&display=swap';

const grays = ['#000000', '#262626', '#4d4d4d', '#737373', '#999999', '#bfbfbf', '#e5e5e5', '#ffffff'];
const hues = [0, 25, 48, 130, 175, 210, 265, 325];
export const PALETTE = [...grays, ...[34, 50, 66, 82].flatMap((l) => hues.map((h) => `hsl(${h} 80% ${l}%)`))];

export const BACKDROPS = [
  '#fffaf0', '#ffffff', '#000000', '#1b1f4b',
  'linear-gradient(180deg,#454547,#000)',
  'linear-gradient(135deg,#ffb347,#ff5e62)',
  'linear-gradient(135deg,#a8edea,#fed6e3)',
  'linear-gradient(135deg,#667eea,#764ba2)',
  'radial-gradient(circle at 30% 20%,#fff7d6,#f7c6d4)',
];

// Sticker tự vẽ bằng SVG, tô theo currentColor nên đổi màu được
export const STICKERS: { id: string; name: string; stroke?: boolean; art: ReactNode }[] = [
  { id: 'star', name: 'Ngôi sao', art: <polygon points="50,6 62,38 96,38 69,58 79,92 50,72 21,92 31,58 4,38 38,38" /> },
  { id: 'heart', name: 'Trái tim', art: <path d="M50 90C6 58 20 16 50 38c30-22 44 20 0 52z" /> },
  { id: 'sparkle', name: 'Lấp lánh', art: <path d="M50 4L59 41L96 50L59 59L50 96L41 59L4 50L41 41Z" /> },
  { id: 'ring', name: 'Vòng tròn', stroke: true, art: <circle cx="50" cy="50" r="38" /> },
  { id: 'squiggle', name: 'Nét lượn', stroke: true, art: <path d="M6 55q11-34 22 0t22 0t22 0t22 0" /> },
  { id: 'balloon', name: 'Bóng bay', art: <><ellipse cx="50" cy="40" rx="26" ry="32" /><path d="M50 72l-7 10h14z" /></> },
  { id: 'crown', name: 'Vương miện', art: <path d="M10 82V32l25 24 15-36 15 36 25-24v50z" /> },
  { id: 'confetti', name: 'Confetti', art: <><circle cx="20" cy="24" r="7" /><circle cx="72" cy="16" r="5" /><circle cx="50" cy="52" r="8" /><circle cx="84" cy="62" r="7" /><circle cx="24" cy="80" r="6" /><circle cx="64" cy="88" r="4" /></> },
];

export function StickerArt({ id, color }: { id: string; color: string }) {
  const s = STICKERS.find((x) => x.id === id) ?? STICKERS[0];
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ color, display: 'block' }}
      fill={s.stroke ? 'none' : 'currentColor'} stroke={s.stroke ? 'currentColor' : 'none'}
      strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {s.art}
    </svg>
  );
}