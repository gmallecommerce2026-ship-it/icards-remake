// src/components/invitation/editor/palette.ts
// Lấy bảng màu chủ đạo từ một ảnh (logo) ngay trên máy: thu nhỏ về 64px, gom màu theo ô 4-bit, bỏ nền trong suốt / trắng.
export function extractPalette(src: string, count = 4): Promise<string[]> {
  return new Promise((resolve) => {
    const im = new Image();
    im.onerror = () => resolve([]);
    im.onload = () => {
      const S = 64;
      const k = Math.min(S / im.naturalWidth, S / im.naturalHeight, 1);
      const w = Math.max(1, Math.round(im.naturalWidth * k)), h = Math.max(1, Math.round(im.naturalHeight * k));
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      if (!ctx) { resolve([]); return; }
      ctx.drawImage(im, 0, 0, w, h);
      let px: Uint8ClampedArray;
      try { px = ctx.getImageData(0, 0, w, h).data; } catch { resolve([]); return; }

      const bins = new Map<number, { n: number; r: number; g: number; b: number }>();
      for (let i = 0; i < px.length; i += 4) {
        const r = px[i], g = px[i + 1], b = px[i + 2];
        if (px[i + 3] < 128 || (r > 240 && g > 240 && b > 240)) continue;
        const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
        const e = bins.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
        e.n++; e.r += r; e.g += g; e.b += b;
        bins.set(key, e);
      }
      const ranked = [...bins.values()].sort((a, b) => b.n - a.n).map((e) => [e.r / e.n, e.g / e.n, e.b / e.n]);
      const out: number[][] = [];
      for (const rgb of ranked) {
        if (out.length >= count) break;
        if (out.every((o) => Math.hypot(o[0] - rgb[0], o[1] - rgb[1], o[2] - rgb[2]) > 56)) out.push(rgb);   // bỏ màu quá gần nhau
      }
      resolve(out.map(([r, g, b]) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')));
    };
    im.src = src;
  });
}
