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

/* ------------------------------------------------------------------ */
/*  Nhiễu giấy cho phong bì: bitmap sinh sẵn bằng canvas MỘT lần.        */
/*  Trước đây dùng SVG feTurbulence làm background: trình duyệt phải       */
/*  raster lại bộ lọc đó mỗi khi máy quay đổi độ phóng (rất nặng ở đoạn    */
/*  zoom vào dấu sáp → giật). PNG thì chỉ giải mã một lần rồi được dùng lại.   */
/* ------------------------------------------------------------------ */
const NOISE = 240;
let cachedNoise: string | null = null;

export function getEnvelopeNoise(): string | null {
  if (cachedNoise) return cachedNoise;
  if (typeof document === 'undefined') return null;
  const rnd = mulberry32(19);
  const at = (x: number, y: number) => ((y + NOISE) % NOISE) * NOISE + ((x + NOISE) % NOISE);   // quấn vòng → ô gạch liền mạch
  let v = new Float32Array(NOISE * NOISE);
  for (let i = 0; i < v.length; i++) v[i] = rnd();
  // làm mờ 2 lần: hạt mịn, mềm như thớ giấy - KHÔNG còn những chấm đen sắc nét
  const blur = (src: Float32Array) => {
    const out = new Float32Array(src.length);
    for (let y = 0; y < NOISE; y++) for (let x = 0; x < NOISE; x++) {
      out[at(x, y)] = (src[at(x - 1, y)] + src[at(x + 1, y)] + src[at(x, y - 1)] + src[at(x, y + 1)] + 4 * src[at(x, y)]) / 8;
    }
    return out;
  };
  v = blur(blur(v));
  let mean = 0;
  for (let i = 0; i < v.length; i++) mean += v[i];
  mean /= v.length;
  let varSum = 0;
  for (let i = 0; i < v.length; i++) varSum += (v[i] - mean) ** 2;
  const sd = Math.sqrt(varSum / v.length) || 1;

  const c = document.createElement('canvas');
  c.width = c.height = NOISE;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const img = ctx.createImageData(NOISE, NOISE);
  for (let i = 0; i < v.length; i++) {
    const d = (v[i] - mean) / sd;                    // ~N(0,1)
    // hai tông: hạt sáng (trắng) và hạt tối (nâu thẫm, không phải đen) đều RẤT nhạt → giấy có vân nhưng sạch
    const light = d > 0;
    const a = Math.min(light ? 0.075 : 0.045, Math.abs(d) * (light ? 0.03 : 0.018));
    img.data[i * 4] = light ? 255 : 60;
    img.data[i * 4 + 1] = light ? 255 : 48;
    img.data[i * 4 + 2] = light ? 255 : 40;
    img.data[i * 4 + 3] = Math.round(a * 255);
  }
  ctx.putImageData(img, 0, 0);
  cachedNoise = `url(${c.toDataURL('image/png')})`;
  return cachedNoise;
}
