// src/components/invitation/editor/editor.data.tsx
import { useId, type ReactNode } from 'react';

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

/* ================================================================== */
/*  KHO PHẦN TỬ (kiểu Canva): hình khối · đồ họa · 3D · khung · lưới     */
/* ================================================================== */
export type ArtCat = 'shape' | 'graphic' | '3d';
export type Art = {
  id: string; name: string; cat: ArtCat; color: string;
  stroke?: boolean;                                   // vẽ bằng nét viền thay vì tô đặc
  render: (uid: string) => ReactNode;                 // uid để gradient không trùng id giữa các phần tử
};

// Màu tô: ánh sáng / bóng suy ra từ currentColor nên đổi màu được ở mọi phần tử
const lit = (p: number) => `color-mix(in srgb, currentColor ${100 - p}%, white)`;
const shade = (p: number) => `color-mix(in srgb, currentColor ${100 - p}%, black)`;
const Stop = ({ o, c }: { o: number; c: string }) => <stop offset={o} style={{ stopColor: c }} />;

const SHAPES: Art[] = [
  { id: 'sq', name: 'Hình vuông', cat: 'shape', color: '#3b82f6', render: () => <rect x="6" y="6" width="88" height="88" /> },
  { id: 'rsq', name: 'Vuông bo góc', cat: 'shape', color: '#8b5cf6', render: () => <rect x="6" y="6" width="88" height="88" rx="22" /> },
  { id: 'circle', name: 'Hình tròn', cat: 'shape', color: '#ec4899', render: () => <circle cx="50" cy="50" r="44" /> },
  { id: 'tri', name: 'Tam giác', cat: 'shape', color: '#f59e0b', render: () => <path d="M50 8L94 90H6z" /> },
  { id: 'diamond', name: 'Thoi', cat: 'shape', color: '#10b981', render: () => <path d="M50 4L96 50L50 96L4 50z" /> },
  { id: 'hex', name: 'Lục giác', cat: 'shape', color: '#06b6d4', render: () => <path d="M27 8H73L96 50L73 92H27L4 50z" /> },
  { id: 'pent', name: 'Ngũ giác', cat: 'shape', color: '#ef4444', render: () => <path d="M50 5L95 38L78 92H22L5 38z" /> },
  { id: 'star', name: 'Ngôi sao', cat: 'shape', color: '#f59e0b', render: () => <polygon points="50,6 62,38 96,38 69,58 79,92 50,72 21,92 31,58 4,38 38,38" /> },
  { id: 'heart', name: 'Trái tim', cat: 'shape', color: '#e8506b', render: () => <path d="M50 90C6 58 20 16 50 38c30-22 44 20 0 52z" /> },
  { id: 'arch', name: 'Vòm', cat: 'shape', color: '#84cc16', render: () => <path d="M10 94V50a40 40 0 0 1 80 0v44z" /> },
  { id: 'half', name: 'Bán nguyệt', cat: 'shape', color: '#14b8a6', render: () => <path d="M6 70a44 44 0 0 1 88 0z" /> },
  { id: 'blob', name: 'Giọt nước', cat: 'shape', color: '#6366f1', render: () => <path d="M50 6C78 24 90 44 90 62a40 40 0 0 1-80 0C10 44 22 24 50 6z" /> },
  { id: 'cross', name: 'Dấu cộng', cat: 'shape', color: '#f97316', render: () => <path d="M36 6h28v30h30v28H64v30H36V64H6V36h30z" /> },
  { id: 'arrow', name: 'Mũi tên', cat: 'shape', color: '#0ea5e9', render: () => <path d="M6 36h52V12l36 38-36 38V64H6z" /> },
  { id: 'bubble', name: 'Bong bóng chat', cat: 'shape', color: '#a855f7', render: () => <path d="M14 10h72a8 8 0 0 1 8 8v46a8 8 0 0 1-8 8H44L22 92V72h-8a8 8 0 0 1-8-8V18a8 8 0 0 1 8-8z" /> },
  { id: 'ring', name: 'Vòng tròn', cat: 'shape', color: '#111827', stroke: true, render: () => <circle cx="50" cy="50" r="40" /> },
  { id: 'line', name: 'Đường kẻ', cat: 'shape', color: '#111827', stroke: true, render: () => <path d="M6 50H94" /> },
  { id: 'wave', name: 'Nét lượn', cat: 'shape', color: '#111827', stroke: true, render: () => <path d="M6 55q11-34 22 0t22 0t22 0t22 0" /> },
  { id: 'dash', name: 'Nét đứt', cat: 'shape', color: '#111827', stroke: true, render: () => <path d="M6 50H94" strokeDasharray="10 9" /> },
  { id: 'sqring', name: 'Khung vuông', cat: 'shape', color: '#111827', stroke: true, render: () => <rect x="10" y="10" width="80" height="80" rx="4" /> },
];

const GRAPHICS: Art[] = [
  { id: 'sparkle', name: 'Lấp lánh', cat: 'graphic', color: '#f5b301', render: () => <path d="M50 4L59 41L96 50L59 59L50 96L41 59L4 50L41 41Z" /> },
  { id: 'balloon', name: 'Bóng bay', cat: 'graphic', color: '#ef4444', render: () => <><ellipse cx="50" cy="40" rx="26" ry="32" /><path d="M50 72l-7 10h14z" /></> },
  { id: 'crown', name: 'Vương miện', cat: 'graphic', color: '#f5b301', render: () => <path d="M10 82V32l25 24 15-36 15 36 25-24v50z" /> },
  { id: 'confetti', name: 'Confetti', cat: 'graphic', color: '#ec4899', render: () => <><circle cx="20" cy="24" r="7" /><circle cx="72" cy="16" r="5" /><circle cx="50" cy="52" r="8" /><circle cx="84" cy="62" r="7" /><circle cx="24" cy="80" r="6" /><circle cx="64" cy="88" r="4" /></> },
  { id: 'flower', name: 'Hoa', cat: 'graphic', color: '#f472b6', render: () => <>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="50" cy="26" rx="14" ry="22" transform={`rotate(${a} 50 50)`} />)}<circle cx="50" cy="50" r="10" style={{ fill: '#fde047' }} /></> },
  { id: 'sun', name: 'Mặt trời', cat: 'graphic', color: '#fbbf24', render: () => <><circle cx="50" cy="50" r="22" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <rect key={a} x="46" y="6" width="8" height="16" rx="4" transform={`rotate(${a} 50 50)`} />)}</> },
  { id: 'moon', name: 'Trăng khuyết', cat: 'graphic', color: '#6366f1', render: () => <path d="M66 8A44 44 0 1 0 92 66A36 36 0 0 1 66 8z" /> },
  { id: 'cloud', name: 'Đám mây', cat: 'graphic', color: '#60a5fa', render: () => <path d="M26 74a18 18 0 0 1-2-36a24 24 0 0 1 46-6a20 20 0 0 1 4 42z" /> },
  { id: 'leaf', name: 'Chiếc lá', cat: 'graphic', color: '#22c55e', render: () => <path d="M10 90C10 40 40 10 90 10C90 60 60 90 10 90zM10 90L56 44" style={{ stroke: '#fff', strokeWidth: 3 }} /> },
  { id: 'gift', name: 'Hộp quà', cat: 'graphic', color: '#ef4444', render: () => <><rect x="10" y="38" width="80" height="54" rx="4" /><rect x="6" y="26" width="88" height="16" rx="4" /><path d="M50 26v66" style={{ stroke: '#fde047', strokeWidth: 10 }} /><path d="M50 26C36 6 20 14 28 24zM50 26C64 6 80 14 72 24z" /></> },
  { id: 'cake', name: 'Bánh kem', cat: 'graphic', color: '#f9a8d4', render: () => <><rect x="12" y="48" width="76" height="40" rx="6" /><path d="M12 62q9 8 19 0t19 0t19 0t19 0" style={{ stroke: '#fff', strokeWidth: 4, fill: 'none' }} /><rect x="46" y="26" width="8" height="22" style={{ fill: '#60a5fa' }} /><path d="M50 8c6 6 6 12 0 14c-6-2-6-8 0-14z" style={{ fill: '#fbbf24' }} /></> },
  { id: 'bell', name: 'Chuông', cat: 'graphic', color: '#f59e0b', render: () => <><path d="M50 8a6 6 0 0 1 6 6v3c14 4 22 16 22 32v12l10 14H12l10-14V49c0-16 8-28 22-32v-3a6 6 0 0 1 6-6z" /><circle cx="50" cy="88" r="8" /></> },
  { id: 'rings', name: 'Nhẫn cưới', cat: 'graphic', color: '#f5b301', stroke: true, render: () => <><circle cx="36" cy="56" r="26" /><circle cx="64" cy="56" r="26" /><path d="M30 18l6-8 6 8-6 8z" /></> },
  { id: 'ribbon', name: 'Nơ', cat: 'graphic', color: '#ec4899', render: () => <><path d="M50 50L8 22v56zM50 50l42-28v56z" /><circle cx="50" cy="50" r="10" /></> },
  { id: 'music', name: 'Nốt nhạc', cat: 'graphic', color: '#8b5cf6', render: () => <path d="M36 14l50-10v66a14 12 0 1 1-8-11V30L44 38v50a14 12 0 1 1-8-11z" /> },
  { id: 'squiggle', name: 'Nét lượn', cat: 'graphic', color: '#f97316', stroke: true, render: () => <path d="M6 55q11-34 22 0t22 0t22 0t22 0" /> },
];

const THREED: Art[] = [
  { id: 'sphere', name: 'Quả cầu', cat: '3d', color: '#5b8cff', render: (u) => (<>
      <defs><radialGradient id={`${u}a`} cx=".35" cy=".3" r=".8"><Stop o={0} c={lit(70)} /><Stop o={0.45} c="currentColor" /><Stop o={1} c={shade(55)} /></radialGradient></defs>
      <circle cx="50" cy="50" r="44" style={{ fill: `url(#${u}a)` }} /><ellipse cx="36" cy="30" rx="11" ry="7" style={{ fill: '#fff', opacity: 0.45 }} transform="rotate(-30 36 30)" />
    </>) },
  { id: 'cube', name: 'Khối lập phương', cat: '3d', color: '#ff7a59', render: () => (<>
      <path d="M50 6L90 28L50 50L10 28z" style={{ fill: lit(45) }} /><path d="M10 28L50 50V94L10 72z" style={{ fill: 'currentColor' }} /><path d="M90 28L50 50V94L90 72z" style={{ fill: shade(40) }} />
    </>) },
  { id: 'cylinder', name: 'Hình trụ', cat: '3d', color: '#34d399', render: (u) => (<>
      <defs><linearGradient id={`${u}a`} x1="0" x2="1"><Stop o={0} c={shade(45)} /><Stop o={0.35} c={lit(35)} /><Stop o={1} c={shade(55)} /></linearGradient></defs>
      <path d="M12 24V76a38 14 0 0 0 76 0V24z" style={{ fill: `url(#${u}a)` }} /><ellipse cx="50" cy="24" rx="38" ry="14" style={{ fill: lit(55) }} />
    </>) },
  { id: 'cone', name: 'Hình nón', cat: '3d', color: '#f59e0b', render: (u) => (<>
      <defs><linearGradient id={`${u}a`} x1="0" x2="1"><Stop o={0} c={lit(25)} /><Stop o={0.5} c="currentColor" /><Stop o={1} c={shade(55)} /></linearGradient></defs>
      <path d="M50 6L90 76a40 14 0 0 1-80 0z" style={{ fill: `url(#${u}a)` }} />
    </>) },
  { id: 'pyramid', name: 'Kim tự tháp', cat: '3d', color: '#a78bfa', render: () => (<>
      <path d="M50 6L8 74L50 94z" style={{ fill: lit(25) }} /><path d="M50 6L92 74L50 94z" style={{ fill: shade(40) }} /><path d="M50 6L8 74L50 94" style={{ fill: 'none', stroke: lit(70), strokeWidth: 0.8 }} />
    </>) },
  { id: 'torus', name: 'Vòng xuyến', cat: '3d', color: '#f472b6', render: (u) => (<>
      <defs><linearGradient id={`${u}a`} x1="0" y1="0" x2="0" y2="1"><Stop o={0} c={lit(60)} /><Stop o={0.5} c="currentColor" /><Stop o={1} c={shade(60)} /></linearGradient></defs>
      <circle cx="50" cy="50" r="33" style={{ fill: 'none', stroke: `url(#${u}a)`, strokeWidth: 22 }} /><circle cx="50" cy="50" r="33" style={{ fill: 'none', stroke: '#fff', strokeWidth: 2, opacity: 0.25 }} />
    </>) },
  { id: 'heart3d', name: 'Tim phồng', cat: '3d', color: '#ff4d6d', render: (u) => (<>
      <defs><radialGradient id={`${u}a`} cx=".35" cy=".3" r=".85"><Stop o={0} c={lit(65)} /><Stop o={0.5} c="currentColor" /><Stop o={1} c={shade(55)} /></radialGradient></defs>
      <path d="M50 90C6 58 20 16 50 38c30-22 44 20 0 52z" style={{ fill: `url(#${u}a)` }} /><ellipse cx="32" cy="34" rx="9" ry="5" style={{ fill: '#fff', opacity: 0.5 }} transform="rotate(-35 32 34)" />
    </>) },
  { id: 'star3d', name: 'Sao nổi', cat: '3d', color: '#ffc531', render: (u) => (<>
      <defs><linearGradient id={`${u}a`} x1="0" y1="0" x2="1" y2="1"><Stop o={0} c={lit(60)} /><Stop o={0.55} c="currentColor" /><Stop o={1} c={shade(50)} /></linearGradient></defs>
      <polygon points="50,6 62,38 96,38 69,58 79,92 50,72 21,92 31,58 4,38 38,38" style={{ fill: `url(#${u}a)`, stroke: shade(40), strokeWidth: 2, strokeLinejoin: 'round' }} />
    </>) },
  { id: 'gem', name: 'Kim cương', cat: '3d', color: '#38bdf8', render: () => (<>
      <path d="M26 12H74L94 38L50 92L6 38z" style={{ fill: 'currentColor' }} /><path d="M26 12L38 38H62L74 12z" style={{ fill: lit(55) }} /><path d="M6 38H38L50 92z" style={{ fill: shade(25) }} /><path d="M94 38H62L50 92z" style={{ fill: shade(50) }} /><path d="M26 12L6 38M74 12L94 38M38 38L50 92M62 38L50 92" style={{ fill: 'none', stroke: lit(80), strokeWidth: 0.8 }} />
    </>) },
  { id: 'pill', name: 'Viên nang', cat: '3d', color: '#fb7185', render: (u) => (<>
      <defs><linearGradient id={`${u}a`} x1="0" y1="0" x2="0" y2="1"><Stop o={0} c={lit(55)} /><Stop o={0.5} c="currentColor" /><Stop o={1} c={shade(55)} /></linearGradient></defs>
      <rect x="30" y="4" width="40" height="92" rx="20" style={{ fill: `url(#${u}a)` }} /><rect x="38" y="12" width="7" height="42" rx="3.5" style={{ fill: '#fff', opacity: 0.4 }} />
    </>) },
];

export const ARTS: Art[] = [...SHAPES, ...GRAPHICS, ...THREED];
export const ART_BY_CAT: Record<ArtCat, Art[]> = { shape: SHAPES, graphic: GRAPHICS, '3d': THREED };
export const artOf = (id?: string) => ARTS.find((a) => a.id === id) ?? ARTS[0];

/** Vẽ một phần tử vector. `color` là màu chủ đạo (3D tự suy ra sáng/tối từ màu này). */
export function ArtSVG({ id, color, strokeWidth = 6 }: { id?: string; color: string; strokeWidth?: number }) {
  const a = artOf(id);
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" style={{ color, display: 'block', overflow: 'visible' }}
      fill={a.stroke ? 'none' : 'currentColor'} stroke={a.stroke ? 'currentColor' : 'none'}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {a.render(uid)}
    </svg>
  );
}

/* ---------------- Khung ảnh ---------------- */
export type FrameDef = { id: string; name: string; d?: string; radius?: string; polaroid?: boolean; ratio: number };
export const FRAMES: FrameDef[] = [
  { id: 'f-sq', name: 'Vuông', ratio: 1 },
  { id: 'f-round', name: 'Bo góc', radius: '12%', ratio: 1 },
  { id: 'f-circle', name: 'Tròn', radius: '50%', ratio: 1 },
  { id: 'f-arch', name: 'Vòm', radius: '50% 50% 0 0 / 34% 34% 0 0', ratio: 0.72 },
  { id: 'f-oval', name: 'Bầu dục', radius: '50%', ratio: 0.72 },
  { id: 'f-heart', name: 'Trái tim', d: 'M0.5 0.93C0.04 0.6 0.18 0.14 0.5 0.36C0.82 0.14 0.96 0.6 0.5 0.93Z', ratio: 1 },
  { id: 'f-hex', name: 'Lục giác', d: 'M0.25 0.04H0.75L1 0.5L0.75 0.96H0.25L0 0.5Z', ratio: 1 },
  { id: 'f-star', name: 'Ngôi sao', d: 'M0.5 0.04L0.62 0.37L0.97 0.38L0.7 0.59L0.8 0.93L0.5 0.73L0.2 0.93L0.3 0.59L0.03 0.38L0.38 0.37Z', ratio: 1 },
  { id: 'f-polaroid', name: 'Polaroid', polaroid: true, ratio: 0.84 },
];
export const frameOf = (id?: string) => FRAMES.find((f) => f.id === id) ?? FRAMES[0];

/* ---------------- Lưới ảnh: ô tính theo tỉ lệ (0..1) của vùng trang ---------------- */
export type GridDef = { id: string; name: string; cells: [number, number, number, number][] };
export const GRIDS: GridDef[] = [
  { id: 'g-2x1', name: '2 cột', cells: [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]] },
  { id: 'g-1x2', name: '2 hàng', cells: [[0, 0, 1, 0.5], [0, 0.5, 1, 0.5]] },
  { id: 'g-2x2', name: 'Lưới 2×2', cells: [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]] },
  { id: 'g-1p2', name: '1 lớn + 2 nhỏ', cells: [[0, 0, 1, 0.6], [0, 0.6, 0.5, 0.4], [0.5, 0.6, 0.5, 0.4]] },
  { id: 'g-3col', name: '3 cột', cells: [[0, 0, 1 / 3, 1], [1 / 3, 0, 1 / 3, 1], [2 / 3, 0, 1 / 3, 1]] },
  { id: 'g-l2r', name: 'Trái lớn', cells: [[0, 0, 0.6, 1], [0.6, 0, 0.4, 0.5], [0.6, 0.5, 0.4, 0.5]] },
  { id: 'g-3x3', name: 'Lưới 3×3', cells: Array.from({ length: 9 }, (_, i) => [(i % 3) / 3, Math.floor(i / 3) / 3, 1 / 3, 1 / 3] as [number, number, number, number]) },
  { id: 'g-film', name: 'Dải phim', cells: [[0, 0, 1, 1 / 3], [0, 1 / 3, 1, 1 / 3], [0, 2 / 3, 1, 1 / 3]] },
];
