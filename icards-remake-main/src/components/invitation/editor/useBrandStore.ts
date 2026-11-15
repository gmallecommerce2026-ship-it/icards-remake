// src/components/invitation/editor/useBrandStore.ts
// Bộ thương hiệu (kiểu Canva "Brand Kit"): màu, phông chữ, logo - lưu trong trình duyệt để dùng lại cho mọi thiệp.
// Phông chữ đầu tiên là phông TIÊU ĐỀ, phông thứ hai là phông NỘI DUNG (dùng cho nút "Áp dụng cho toàn thiệp").
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

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

// localStorage có thể bị chặn (chế độ riêng tư) hoặc đầy vì logo: không để lỗi này làm hỏng cả editor.
const safeStorage: StateStorage = {
  getItem: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { /* đầy bộ nhớ: bỏ qua, dữ liệu vẫn còn trong phiên */ } },
  removeItem: (k) => { try { localStorage.removeItem(k); } catch { /* bỏ qua */ } },
};

export const useBrandStore = create<Brand>()(
  persist(
    (set) => ({
      colors: [],
      fonts: [],
      logos: [],
      addColor: (c) => set((s) => (s.colors.includes(c) ? s : { colors: [...s.colors, c].slice(0, 24) })),
      removeColor: (c) => set((s) => ({ colors: s.colors.filter((x) => x !== c) })),
      toggleFont: (f) => set((s) => ({ fonts: s.fonts.includes(f) ? s.fonts.filter((x) => x !== f) : [...s.fonts, f].slice(0, 6) })),
      addLogo: (src) => set((s) => ({ logos: [src, ...s.logos].slice(0, 8) })),
      removeLogo: (i) => set((s) => ({ logos: s.logos.filter((_, j) => j !== i) })),
    }),
    {
      name: 'icards:brand',
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,          // nạp thủ công ở client để SSR không lệch hydration
    },
  ),
);
