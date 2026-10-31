// src/components/invitation/editor/useEditorStore.ts
import { create } from 'zustand';
import { PAGE } from '../envelope/envelope.data';
import type { InvitationTemplate } from '@/lib/templates';

export type PageId = 'cover' | 'insideLeft' | 'inside' | 'back';
export type Align = 'left' | 'center' | 'right';

export type CardEl = {
  id: string;
  kind: 'text' | 'sticker' | 'image' | 'shape' | 'threed' | 'frame' | 'draw';
  x: number; y: number; w: number; h: number; rot: number;
  text?: string; font?: string; size?: number; bold?: boolean; color?: string; align?: Align;
  art?: string;
  src?: string;
  flipX?: boolean; flipY?: boolean;
  op?: number;                       // độ đục 0..1
  path?: string;                     // nét vẽ tay: đường path trong hệ tọa độ 0..w × 0..h
  sw?: number;                       // độ dày nét (vẽ tay / hình viền)
  vw?: number; vh?: number;          // kích thước gốc của nét vẽ, để co giãn đúng
};

export type DrawTool = 'pen' | 'marker';
export type DrawCfg = { on: boolean; tool: DrawTool; color: string; size: number };

export type Snap = { pages: Record<PageId, CardEl[]>; backdrops: Record<PageId, string> };

type State = Snap & {
  page: PageId;                 // mặt đang chỉnh: bìa ngoài hoặc ruột thiệp
  selectedId: string | null;
  editingId: string | null;
  past: Snap[];
  future: Snap[];
  tplName: string | null;       // tên mẫu đang dùng (đổi được ngay trong editor)
  uploads: string[];            // ảnh người dùng đã tải lên trong phiên này
  draw: DrawCfg;

  select: (id: string | null) => void;
  edit: (id: string | null) => void;
  setPage: (p: PageId) => void;
  checkpoint: () => void;
  undo: () => void;
  redo: () => void;
  patch: (id: string, p: Partial<CardEl>) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => void;
  reorder: (id: string, dir: 1 | -1) => void;
  addText: (p?: Partial<CardEl>) => void;
  addSticker: (art: string) => void;
  addImage: (src: string, ratio: number) => void;
  addShape: (kind: 'shape' | 'sticker' | 'threed', art: string, color: string, stroke?: boolean) => void;
  addFrame: (art: string, ratio: number) => void;
  addGrid: (cells: [number, number, number, number][]) => void;
  setFrameImage: (id: string, src: string | undefined) => void;
  addUpload: (src: string) => void;
  setDraw: (p: Partial<DrawCfg>) => void;
  addStroke: (pts: [number, number][]) => void;
  clearStrokes: (last?: boolean) => void;
  setBackdrop: (bg: string, record?: boolean) => void;
  loadTemplate: (t: InvitationTemplate, record?: boolean) => void;
  hydrate: (d: Snap) => void;
};

const MAX_HISTORY = 60;
const uid = () => Math.random().toString(36).slice(2, 10);
const snap = (s: Snap): Snap => ({ pages: s.pages, backdrops: s.backdrops });
const push = (s: State) => ({ past: [...s.past.slice(-(MAX_HISTORY - 1)), snap(s)], future: [] as Snap[] });

// id cố định để tránh lệch hydration giữa server và client
const DEFAULT_PAGES: Record<PageId, CardEl[]> = {
  cover: [
    { id: 'c-title', kind: 'text', x: 50, y: 250, w: 400, h: 120, rot: 0, text: 'Bạn được mời!', font: 'Playfair Display', size: 64, bold: true, color: '#2b2b2e', align: 'center' },
  ],
  insideLeft: [],
  inside: [
    { id: 'i-title', kind: 'text', x: 50, y: 200, w: 400, h: 60, rot: 0, text: 'Thời gian & Địa điểm', font: 'Playfair Display', size: 40, bold: true, color: '#2b2b2e', align: 'center' },
    { id: 'i-body', kind: 'text', x: 50, y: 300, w: 400, h: 60, rot: 0, text: 'Thứ Bảy, 20:00\nĐịa chỉ của bạn ở đây', font: 'Be Vietnam Pro', size: 24, bold: false, color: '#4d4d4d', align: 'center' },
  ],
  back: [
    { id: 'b-thanks', kind: 'text', x: 50, y: 300, w: 400, h: 60, rot: 0, text: 'Hẹn gặp bạn!', font: 'Dancing Script', size: 48, bold: true, color: '#2b2b2e', align: 'center' },
  ],
};

/** Dựng nội dung 3 mặt thiệp từ một mẫu (màu + chữ mẫu). */
function fromTemplate(t: InvitationTemplate): Snap {
  const { palette: c, sample: m } = t;
  const text = (id: string, y: number, o: Partial<CardEl>): CardEl => ({
    id, kind: 'text', x: 50, y, w: 400, h: 60, rot: 0, font: 'Be Vietnam Pro', size: 24, bold: false, color: c.ink, align: 'center', ...o,
  });
  const names = m.titleLines.filter((l) => l.trim() !== '&');
  return {
    backdrops: { cover: c.bg, insideLeft: c.bg, inside: c.bg, back: c.soft },
    pages: {
      cover: [
        text('c-kicker', 150, { text: m.kicker, size: 22, color: c.accent }),
        text('c-n1', 230, { text: names[0] ?? '', font: 'Playfair Display', size: 64, bold: true }),
        text('c-amp', 330, { text: '&', font: 'Dancing Script', size: 56, color: c.accent }),
        text('c-n2', 410, { text: names[1] ?? '', font: 'Playfair Display', size: 64, bold: true }),
        text('c-date', 560, { text: m.date, size: 20, color: c.accent }),
      ],
      insideLeft: [],
      inside: [
        text('i-msg', 130, { text: m.message, size: 22 }),
        text('i-h', 290, { text: 'Thời gian & Địa điểm', font: 'Playfair Display', size: 34, bold: true }),
        text('i-time', 360, { text: `${m.date}\nLúc ${m.time}`, size: 22, color: c.accent, bold: true }),
        text('i-place', 450, { text: `${m.place}\n${m.address}`, size: 22 }),
      ],
      back: [
        text('b-thanks', 280, { text: 'Rất mong được đón bạn', font: 'Dancing Script', size: 48, bold: true, color: c.accent }),
        text('b-names', 400, { text: names.join('  &  '), font: 'Playfair Display', size: 28, bold: true }),
      ],
    },
  };
}

export const PAGES: PageId[] = ['cover', 'insideLeft', 'inside', 'back'];

const mapPages = (s: Snap, fn: (l: CardEl[]) => CardEl[]) =>
  Object.fromEntries(PAGES.map((p) => [p, fn(s.pages[p])])) as Record<PageId, CardEl[]>;

export const useEditorStore = create<State>((set, get) => {
  /** thêm phần tử vào mặt đang chỉnh và chọn luôn nó */
  const addEl = (el: Omit<CardEl, 'id'>) =>
    set((s) => {
      const id = uid();
      return { ...push(s), pages: { ...s.pages, [s.page]: [...s.pages[s.page], { ...el, id }] }, selectedId: id };
    });

  return {
    pages: DEFAULT_PAGES,
    backdrops: { cover: '#fffaf0', insideLeft: '#ffffff', inside: '#ffffff', back: '#fffaf0' },
    page: 'cover',
    selectedId: null,
    editingId: null,
    past: [],
    future: [],
    tplName: null,
    uploads: [],
    draw: { on: false, tool: 'pen', color: '#1a1a1a', size: 6 },

    select: (selectedId) => set({ selectedId }),
    edit: (editingId) => set({ editingId }),
    setPage: (page) => set({ page, selectedId: null, editingId: null }),

    checkpoint: () => set((s) => push(s)),
    undo: () => set((s) => {
      const prev = s.past[s.past.length - 1];
      if (!prev) return s;
      return { ...prev, past: s.past.slice(0, -1), future: [snap(s), ...s.future], selectedId: null, editingId: null };
    }),
    redo: () => set((s) => {
      const next = s.future[0];
      if (!next) return s;
      return { ...next, future: s.future.slice(1), past: [...s.past, snap(s)], selectedId: null, editingId: null };
    }),

    patch: (id, p) => set((s) => ({ pages: mapPages(s, (l) => l.map((e) => (e.id === id ? { ...e, ...p } : e))) })),

    remove: (id) => set((s) => ({
      ...push(s),
      pages: mapPages(s, (l) => l.filter((e) => e.id !== id)),
      selectedId: null, editingId: null,
    })),

    duplicate: (id) => set((s) => {
      for (const pg of PAGES) {
        const i = s.pages[pg].findIndex((e) => e.id === id);
        if (i < 0) continue;
        const src = s.pages[pg][i];
        const copy = { ...src, id: uid(), x: src.x + 20, y: src.y + 20 };
        const list = [...s.pages[pg]];
        list.splice(i + 1, 0, copy);
        return { ...push(s), pages: { ...s.pages, [pg]: list }, selectedId: copy.id };
      }
      return s;
    }),

    reorder: (id, dir) => set((s) => {
      for (const pg of PAGES) {
        const i = s.pages[pg].findIndex((e) => e.id === id);
        if (i < 0) continue;
        const j = i + dir;
        if (j < 0 || j >= s.pages[pg].length) return s;
        const list = [...s.pages[pg]];
        [list[i], list[j]] = [list[j], list[i]];
        return { ...push(s), pages: { ...s.pages, [pg]: list } };
      }
      return s;
    }),

    addText: (p) => addEl({
      kind: 'text', x: (PAGE.w - 360) / 2, y: 300, w: 360, h: 60, rot: 0,
      text: 'Nhấn đúp để sửa', font: 'Be Vietnam Pro', size: 40, bold: false, color: '#1a1a1a', align: 'center',
      ...p,
    }),
    addSticker: (art) => addEl({
      kind: 'sticker', x: (PAGE.w - 120) / 2, y: (PAGE.h - 120) / 2, w: 120, h: 120, rot: 0, art, color: '#e8506b',
    }),
    addImage: (src, ratio) => {
      const w = 300, h = w / (ratio || 1);
      addEl({ kind: 'image', x: (PAGE.w - w) / 2, y: (PAGE.h - h) / 2, w, h, rot: 0, src });
    },

    addShape: (kind, art, color, stroke) => addEl({
      kind, art, color, x: (PAGE.w - 160) / 2, y: (PAGE.h - 160) / 2, w: 160, h: art === 'line' || art === 'wave' || art === 'dash' ? 40 : 160, rot: 0,
      sw: stroke ? 6 : undefined,
    }),
    addFrame: (art, ratio) => {
      const w = 260, h = Math.round(w / (ratio || 1));
      addEl({ kind: 'frame', art, x: (PAGE.w - w) / 2, y: (PAGE.h - h) / 2, w, h, rot: 0 });
    },
    addGrid: (cells) => set((s) => {
      const M = 36, GAP = 10, W = PAGE.w - M * 2, H = PAGE.h - M * 2;
      const els: CardEl[] = cells.map(([cx, cy, cw, ch]) => ({
        id: uid(), kind: 'frame', art: 'f-sq', rot: 0,
        x: M + cx * W + (cx > 0.001 ? GAP / 2 : 0),
        y: M + cy * H + (cy > 0.001 ? GAP / 2 : 0),
        w: cw * W - (cx > 0.001 ? GAP / 2 : 0) - (cx + cw < 0.999 ? GAP / 2 : 0),
        h: ch * H - (cy > 0.001 ? GAP / 2 : 0) - (cy + ch < 0.999 ? GAP / 2 : 0),
      }));
      return { ...push(s), pages: { ...s.pages, [s.page]: [...s.pages[s.page], ...els] }, selectedId: els[0]?.id ?? null };
    }),
    setFrameImage: (id, src) => set((s) => ({ ...push(s), pages: mapPages(s, (l) => l.map((e) => (e.id === id ? { ...e, src } : e))) })),
    addUpload: (src) => set((s) => ({ uploads: [src, ...s.uploads].slice(0, 40) })),
    setDraw: (p) => set((s) => ({ draw: { ...s.draw, ...p } })),
    addStroke: (pts) => set((s) => {
      if (pts.length < 2) return s;
      const { color, size, tool } = s.draw;
      const pad = size / 2 + 1;
      const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
      const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad;
      const w = Math.max(...xs) + pad - x0, h = Math.max(...ys) + pad - y0;
      const L = pts.map(([x, y]) => [x - x0, y - y0] as const);
      // làm mượt bằng đường cong bậc 2 qua trung điểm
      let d = `M${L[0][0].toFixed(1)} ${L[0][1].toFixed(1)}`;
      for (let i = 1; i < L.length - 1; i++) {
        const mx = (L[i][0] + L[i + 1][0]) / 2, my = (L[i][1] + L[i + 1][1]) / 2;
        d += `Q${L[i][0].toFixed(1)} ${L[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
      }
      d += `L${L[L.length - 1][0].toFixed(1)} ${L[L.length - 1][1].toFixed(1)}`;
      const el: CardEl = {
        id: uid(), kind: 'draw', x: x0, y: y0, w, h, rot: 0, path: d, color,
        sw: tool === 'marker' ? size * 2.4 : size, op: tool === 'marker' ? 0.45 : 1, vw: w, vh: h,
      };
      return { ...push(s), pages: { ...s.pages, [s.page]: [...s.pages[s.page], el] } };
    }),
    clearStrokes: (last) => set((s) => {
      const list = s.pages[s.page];
      const idx = last ? list.map((e) => e.kind).lastIndexOf('draw') : -1;
      const next = last ? (idx < 0 ? list : list.filter((_, i) => i !== idx)) : list.filter((e) => e.kind !== 'draw');
      if (next.length === list.length) return s;
      return { ...push(s), pages: { ...s.pages, [s.page]: next }, selectedId: null };
    }),

    setBackdrop: (bg, record = true) => set((s) => ({
      ...(record ? push(s) : {}),
      backdrops: { ...s.backdrops, [get().page]: bg },
    })),

    loadTemplate: (t, record = false) => set((s) => ({
      ...(record ? push(s) : { past: [], future: [] }),
      ...fromTemplate(t), tplName: t.name, page: 'cover', selectedId: null, editingId: null,
    })),
    // bản nháp lưu từ trước khi có trang trái không có khoá insideLeft: bù khoá thiếu để PageEditor không bị crash
    hydrate: (d) => {
      const pg: Partial<Snap['pages']> = d.pages, bd: Partial<Snap['backdrops']> = d.backdrops;
      set({
        pages: { cover: [], insideLeft: [], inside: [], back: [], ...pg },
        backdrops: { cover: '#fffaf0', insideLeft: bd.inside ?? '#ffffff', inside: '#ffffff', back: '#fffaf0', ...bd },
        selectedId: null, editingId: null, past: [], future: [],
      });
    },
  };
});