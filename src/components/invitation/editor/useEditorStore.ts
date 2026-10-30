// src/components/invitation/editor/useEditorStore.ts
import { create } from 'zustand';

export type CardElement = {
  id: string;
  type: 'text' | 'image';
  x: number; y: number; rotation: number;
  text?: string; fontSize?: number; fill?: string; fontFamily?: string;
  src?: string; width?: number; height?: number;
};

type State = {
  elements: CardElement[];
  selectedId: string | null;
  previewUrl: string | null; // ảnh PNG export từ canvas, dùng cho trang xem thử
  add: (e: Omit<CardElement, 'id'>) => void;
  update: (id: string, patch: Partial<CardElement>) => void;
  remove: (id: string) => void;
  select: (id: string | null) => void;
  setPreview: (url: string) => void;
};

export const useEditorStore = create<State>((set) => ({
  elements: [],
  selectedId: null,
  previewUrl: null,
  add: (e) => { const id = crypto.randomUUID(); set((s) => ({ elements: [...s.elements, { ...e, id }], selectedId: id })); },
  update: (id, patch) => set((s) => ({ elements: s.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)) })),
  remove: (id) => set((s) => ({ elements: s.elements.filter((el) => el.id !== id), selectedId: null })),
  select: (selectedId) => set({ selectedId }),
  setPreview: (previewUrl) => set({ previewUrl }),
}));