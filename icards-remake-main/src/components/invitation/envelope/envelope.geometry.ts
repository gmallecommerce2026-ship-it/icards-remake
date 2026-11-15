// src/components/invitation/envelope/envelope.geometry.ts
// Hình học cụm "thiệp + phong bì" dùng cho trang mẫu. Mọi số đo là % của khung vuông chứa cụm.
// Thiệp 2 mặt (ngang / vuông / dọc): phong bì có cùng hướng với thiệp, bao vừa khít thiệp + lề.
// Thiệp gập 5:7 không dùng hàm này (giữ hình học riêng trong TemplateShowcase).
import { ORIENTATION_SIZE, type TemplateOrientation } from '@/lib/templates';

/** Cạnh dài nhất của thiệp, % khung. Thiệp ngang / vuông / dọc đều vừa trong khung này. */
const MAX_SIDE = 54;
/** Lề quanh thiệp bên trong phong bì, % khung. */
const MARGIN = 3;
/** Tỉ lệ chiều cao thiệp nhô lên khỏi miệng phong bì (để thấy thiệp đang được rút ra). */
const STICK_OUT = 0.12;
/** Nắp mở cao bằng tỉ lệ này so với chiều cao thân phong bì. */
const FLAP_RATIO = 0.6;

export type CardCluster = {
  /** Vị trí góc trên-trái của thân phong bì trong khung vuông. */
  originX: number;
  originY: number;
  /** Kích thước thân phong bì. */
  envW: number;
  envH: number;
  /** Chiều cao nắp mở (tính từ miệng phong bì lên). */
  flapH: number;
  /** Vị trí thiệp so với góc trên-trái của thân phong bì. */
  cardX: number;
  cardY: number;
  /** Kích thước thiệp. */
  cardW: number;
  cardH: number;
};

/** Kích thước thiệp theo % khung, giữ đúng tỉ lệ của kiểu dáng. */
export function cardPercentSize(orientation: TemplateOrientation): { cw: number; ch: number } {
  const { w, h } = ORIENTATION_SIZE[orientation];
  if (w >= h) return { cw: MAX_SIDE, ch: (MAX_SIDE * h) / w };
  return { cw: (MAX_SIDE * w) / h, ch: MAX_SIDE };
}

/** Tính toàn bộ cụm phong bì + thiệp cho một kiểu dáng, căn giữa trong khung vuông. */
export function cardCluster(orientation: TemplateOrientation = 'portrait'): CardCluster {
  const { cw, ch } = cardPercentSize(orientation);
  const envW = cw + 2 * MARGIN;
  const cardY = -STICK_OUT * ch;                 // thiệp nhô lên trên miệng phong bì
  const envH = ch * (1 - STICK_OUT) + MARGIN;    // đáy thiệp cách đáy phong bì MARGIN
  const cardX = MARGIN;
  const flapH = FLAP_RATIO * envH;

  // Hộp bao gồm cả nắp, căn giữa trong khung vuông
  const boxTop = Math.min(cardY, -flapH);
  const boxH = envH - boxTop;
  const originX = (100 - envW) / 2;
  const originY = (100 - boxH) / 2 - boxTop;

  return { originX, originY, envW, envH, flapH, cardX, cardY, cardW: cw, cardH: ch };
}
