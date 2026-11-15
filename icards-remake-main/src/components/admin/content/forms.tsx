"use client";

import type { ReactNode } from "react";
import { inputCls, btnGhostCls } from "@/components/admin/ui";

export const areaCls = "rounded-md border border-[#C5D0DE] bg-white px-3 py-2 text-sm outline-none focus:border-[#27548A]";

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`grid gap-1.5 text-sm font-medium ${className}`}>
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-[#5B6B7F]">{hint}</span>}
    </label>
  );
}

/** Danh sách dòng ↔ mảng chuỗi (bỏ dòng trống). */
export const linesToArray = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
export const arrayToLines = (a: string[]) => a.join("\n");

/** Chuyển tiếng Việt có dấu thành đường dẫn: "Thiệp cưới" → "thiep-cuoi". */
export function toSlug(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Hàng có nút xoá và di chuyển, dùng cho danh sách biến thể, thông số, khối nội dung. */
export function RowActions({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (d: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex gap-1.5">
      <button type="button" className={btnGhostCls} disabled={index === 0} onClick={() => onMove(-1)} aria-label="Lên">↑</button>
      <button type="button" className={btnGhostCls} disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Xuống">↓</button>
      <button type="button" className={`${btnGhostCls} text-[#8E2B3B]`} onClick={onRemove}>Xoá</button>
    </div>
  );
}

export function moveItem<T>(list: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input type="checkbox" className="size-4" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export { inputCls };
