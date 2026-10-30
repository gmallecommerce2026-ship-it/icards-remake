// src/components/invitation/editor/useEditorStore.ts
import { create } from 'zustand';
import { PAGE } from '../envelope/envelope.data';

export type PageId = 'cover' | 'inside';
export type Align = 'left' | 'center' | 'right';

export type CardEl = {
  id: string;
  kind: 'text' | 'sticker' | 'image';
  x: number; y: number; w: number; h: number; rot: number;
  text?: string; font?: string; size?: number; bold?: boolean; color?: string; align?: Align;
  art?: string;
  src?: string;
  flipX?: boolean; flipY?: boolean;
};

type Snap = { pages: Record<PageId, CardEl[]>; backdrops: Record<PageId, string> };

type State = Snap & {
  page: PageId;                 // mặt đang chỉnh: bìa ngoài hoặc ruột thiệp
  selectedId: string | null;
  editingId: string | null;
  past: Snap[];
  future: Snap[];

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
  setBackdrop: (bg: string, record?: boolean) => void;
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
  inside: [
    { id: 'i-title', kind: 'text', x: 50, y: 200, w: 400, h: 60, rot: 0, text: 'Thời gian & Địa điểm', font: 'Playfair Display', size: 40, bold: true, color: '#2b2b2e', align: 'center' },
    { id: 'i-body', kind: 'text', x: 50, y: 300, w: 400, h: 60, rot: 0, text: 'Thứ Bảy, 20:00\nĐịa chỉ của bạn ở đây', font: 'Be Vietnam Pro', size: 24, bold: false, color: '#4d4d4d', align: 'center' },
  ],
};

export const PAGES: PageId[] = ['cover', 'inside'];

export const useEditorStore = create<State>((set, get) => {
  /** thêm phần tử vào mặt đang chỉnh và chọn luôn nó */
  const addEl = (el: Omit<CardEl, 'id'>) =>
    set((s) => {
      const id = uid();
      return { ...push(s), pages: { ...s.pages, [s.page]: [...s.pages[s.page], { ...el, id }] }, selectedId: id };
    });

  return {
    pages: DEFAULT_PAGES,
    backdrops: { cover: '#fffaf0', inside: '#ffffff' },
    page: 'cover',
    selectedId: null,
    editingId: null,
    past: [],
    future: [],

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

    patch: (id, p) => set((s) => ({
      pages: {
        cover: s.pages.cover.map((e) => (e.id === id ? { ...e, ...p } : e)),
        inside: s.pages.inside.map((e) => (e.id === id ? { ...e, ...p } : e)),
      },
    })),

    remove: (id) => set((s) => ({
      ...push(s),
      pages: { cover: s.pages.cover.filter((e) => e.id !== id), inside: s.pages.inside.filter((e) => e.id !== id) },
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

    setBackdrop: (bg, record = true) => set((s) => ({
      ...(record ? push(s) : {}),
      backdrops: { ...s.backdrops, [get().page]: bg },
    })),
  };
});