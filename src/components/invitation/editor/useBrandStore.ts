// src/components/invitation/editor/useBrandStore.ts
// Bộ thương hiệu (kiểu Canva "Brand Kit"): màu, phông chữ, logo - lưu trong trình duyệt để dùng lại cho mọi thiệp.
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Brand = {
  colors: string[];
  fonts: string[];
  logos: string[];
  addColor: (c: string) => void;
  removeColor: (c: string) => void;
  toggleFont: (f: string) => void;
  addLogo: (src: string) => void;
  removeLogo: (i: number) => void;
};

export const useBrandStore = create<Brand>()(
  persist(
    (set) => ({
      colors: [],
      fonts: [],
      logos: [],
      addColor: (c) => set((s) => (s.colors.includes(c) ? s : { colors: [...s.colors, c].slice(0, 24) })),
      removeColor: (c) => set((s) => ({ colors: s.colors.filter((x) => x !== c) })),
      toggleFont: (f) => set((s) => ({ fonts: s.fonts.includes(f) ? s.fonts.filter((x) => x !== f) : [...s.fonts, f] })),
      addLogo: (src) => set((s) => ({ logos: [src, ...s.logos].slice(0, 12) })),
      removeLogo: (i) => set((s) => ({ logos: s.logos.filter((_, j) => j !== i) })),
    }),
    {
      name: 'icards:brand',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,          // nạp thủ công ở client để SSR không lệch hydration
    },
  ),
);
