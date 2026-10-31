// src/components/invitation/envelope/paperGrain.ts
/* ------------------------------------------------------------------ */
/*  Vân sần giấy, sinh bằng canvas một lần, dùng lại cho mọi cảnh.      */
/*  - Ô gạch LIỀN MẠCH (mọi phép lấy mẫu đều quấn vòng) nên không lộ mối ghép.  */
/*  - Trung bình ĐÚNG 128 (xám trung tính): dùng với mix-blend-mode: overlay thì */
/*    nhìn xa các hạt triệt tiêu nhau, KHÔNG làm đổi màu thiệp; chỉ khi phóng gần */
/*    mới thấy rõ từng hạt (độ đậm do cha điều khiển bằng opacity theo độ zoom).  */
/* ------------------------------------------------------------------ */

const SIZE = 192;
let cached: string | null = null;

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getPaperGrain(): string | null {
  if (cached) return cached;
  if (typeof document === 'undefined') return null;
  const rnd = mulberry32(7);
  const N = SIZE * SIZE;
  const at = (x: number, y: number) => ((y + SIZE) % SIZE) * SIZE + ((x + SIZE) % SIZE);

  // bản đồ độ cao: nhiễu trắng làm mờ 2 lần (hạt nhỏ) + một lớp thớ giấy dài hơn
  let h = new Float32Array(N);
  for (let i = 0; i < N; i++) h[i] = rnd();
  const blur = (src: Float32Array) => {
    const out = new Float32Array(N);
    for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
      out[at(x, y)] = (src[at(x - 1, y)] + src[at(x + 1, y)] + src[at(x, y - 1)] + src[at(x, y + 1)] + 4 * src[at(x, y)]) / 8;
    }
    return out;
  };
  h = blur(blur(h));
  const fiber = new Float32Array(N);
  for (let i = 0; i < N; i++) fiber[i] = rnd();
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {   // thớ chạy chéo nhẹ
    h[at(x, y)] += 0.35 * (fiber[at(x, y)] + fiber[at(x + 1, y + 1)] + fiber[at(x + 2, y + 2)]) / 3;
  }

  // chiếu sáng nghiêng từ trên-trái: sáng = đạo hàm theo hướng sáng → trung bình ≈ 0
  const L = new Float32Array(N);
  let mean = 0;
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const v = (h[at(x - 1, y)] - h[at(x + 1, y)]) * 0.7 + (h[at(x, y - 1)] - h[at(x, y + 1)]) * 0.7;
    L[at(x, y)] = v; mean += v;
  }
  mean /= N;
  let varSum = 0;
  for (let i = 0; i < N; i++) { L[i] -= mean; varSum += L[i] * L[i]; }
  const k = 38 / Math.sqrt(varSum / N);

  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const img = ctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < N; i++) {
    const g = Math.max(0, Math.min(255, Math.round(128 + L[i] * k)));
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = g;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  cached = `url(${c.toDataURL('image/png')})`;
  return cached;
}
