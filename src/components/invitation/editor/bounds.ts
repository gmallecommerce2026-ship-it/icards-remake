// src/components/invitation/editor/bounds.ts
// Giữ mọi phần tử NẰM TRỌN trong trang thiệp (500×700), kể cả khi đã xoay.
// Mỗi trang (bìa / trang trái / trang phải / mặt sau) là một hệ toạ độ riêng nên phần tử không thể
// tràn ra ngoài viền hay vắt ngang qua nếp gấp giữa hai trang.
import { PAGE } from '../envelope/envelope.data';
import type { CardEl } from './useEditorStore';

type Box = Pick<CardEl, 'x' | 'y' | 'w' | 'h' | 'rot'> & { kind?: CardEl['kind']; size?: number };

/** Nửa kích thước hộp bao (axis-aligned) của một hình chữ nhật w×h đã xoay `rot` độ. */
export function halfExtent(w: number, h: number, rot: number) {
  const r = (rot * Math.PI) / 180;
  const c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r));
  return { hx: (w * c + h * s) / 2, hy: (w * s + h * c) / 2 };
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const EPS = 0.01;

/**
 * Trả về phần chỉnh (x, y, w, h, size) để phần tử nằm trọn trong trang, hoặc null nếu đã nằm trong.
 * - `hText`: chiều cao thực đo được của ô chữ (chữ tự co giãn chiều cao).
 * - Phần tử lớn hơn trang thì thu nhỏ theo tỉ lệ (giữ tâm) rồi mới dịch vào.
 */
export function fitInside(el: Box, hText?: number): Partial<CardEl> | null {
  const isText = el.kind === 'text';
  const h0 = isText ? (hText ?? el.h) : el.h;
  if (!(el.w > 0) || !(h0 > 0)) return null;

  const cx0 = el.x + el.w / 2, cy0 = el.y + h0 / 2;
  const { hx, hy } = halfExtent(el.w, h0, el.rot);

  // 1) quá to so với trang -> thu nhỏ
  const k = Math.min(1, PAGE.w / (hx * 2), PAGE.h / (hy * 2));
  const w = el.w * k, h = h0 * k;
  const ex = hx * k, ey = hy * k;

  // 2) dịch tâm để hộp bao nằm trong [0, PAGE]
  const cx = clamp(cx0, ex, PAGE.w - ex), cy = clamp(cy0, ey, PAGE.h - ey);

  const out: Partial<CardEl> = {};
  const nx = cx - w / 2, ny = cy - h / 2;
  if (Math.abs(nx - el.x) > EPS) out.x = nx;
  if (Math.abs(ny - el.y) > EPS) out.y = ny;
  if (k < 1 - 1e-6) {
    out.w = w;
    if (!isText) out.h = h;
    if (isText && el.size) out.size = Math.max(8, el.size * k);
  }
  return Object.keys(out).length ? out : null;
}

/** Áp dụng fitInside lên một phần tử và trả về bản đã chỉnh (dùng cho đường dẫn không có DOM, vd. nhân đôi / thêm lưới). */
export function fitted<T extends CardEl>(el: T): T {
  const p = fitInside(el);
  return p ? { ...el, ...p } : el;
}
