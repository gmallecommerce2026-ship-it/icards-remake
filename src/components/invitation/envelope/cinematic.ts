// src/components/invitation/envelope/cinematic.ts
/* ------------------------------------------------------------------ */
/*  "Máy quay" cho cảnh gói thiệp.                                      */
/*  Mỗi mốc (key) là một góc máy: độ phóng (s), nghiêng lên/xuống (rx), */
/*  xoay quanh (ry), nghiêng ngang (rz) và điểm máy nhìn vào (fx, fy,   */
/*  px thiết kế, tính từ tâm cảnh). Giữa các mốc nội suy bằng spline    */
/*  Hermite (Catmull-Rom) nên vận tốc LIÊN TỤC - máy trôi như tay quay  */
/*  dolly thật, không "dừng - chạy" ở mỗi mốc như smoothstep.           */
/*  Đoạn nào hai mốc kề nhau bằng nhau thì giữ yên (tiếp tuyến = 0).     */
/* ------------------------------------------------------------------ */

export type CamKey = { p: number; s: number; rx: number; ry: number; rz: number; fx: number; fy: number };
type Field = 's' | 'rx' | 'ry' | 'rz' | 'fx' | 'fy';
const FIELDS: Field[] = ['s', 'rx', 'ry', 'rz', 'fx', 'fy'];

export function createCamera(keys: CamKey[]): (p: number) => CamKey {
  const n = keys.length;
  const tan: Record<Field, number[]> = { s: [], rx: [], ry: [], rz: [], fx: [], fy: [] };
  for (const f of FIELDS) {
    for (let i = 0; i < n; i++) {
      if (i === 0 || i === n - 1) { tan[f].push(0); continue; }
      const flat = keys[i][f] === keys[i - 1][f] || keys[i][f] === keys[i + 1][f];
      tan[f].push(flat ? 0 : (keys[i + 1][f] - keys[i - 1][f]) / (keys[i + 1].p - keys[i - 1].p));
    }
  }
  return (p: number) => {
    if (p <= keys[0].p) return keys[0];
    if (p >= keys[n - 1].p) return keys[n - 1];
    let i = 0;
    while (p > keys[i + 1].p) i++;
    const a = keys[i], b = keys[i + 1];
    const h = b.p - a.p, u = (p - a.p) / h, u2 = u * u, u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    const out = { p } as CamKey;
    for (const f of FIELDS) out[f] = h00 * a[f] + h10 * h * tan[f][i] + h01 * b[f] + h11 * h * tan[f][i + 1];
    return out;
  };
}
