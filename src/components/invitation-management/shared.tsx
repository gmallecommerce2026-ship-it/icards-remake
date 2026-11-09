"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

/** Chuẩn hoá phản hồi: nhận mảng trực tiếp hoặc { items } / { data }. */
export function asList<T>(d: unknown): T[] {
  if (Array.isArray(d)) return d as T[];
  const o = d as { items?: T[]; data?: T[] } | null;
  return o?.items ?? o?.data ?? [];
}

export const vnd = (n?: number | null) => new Intl.NumberFormat("vi-VN").format(n ?? 0) + " ₫";

/** ISO -> giá trị cho input datetime-local (giờ địa phương). */
export function toDateInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }) : "";

/** Hộp thoại dùng chung: nền mờ, tiêu đề xanh, nút đóng. */
export function Dialog({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white shadow-xl ${wide ? "max-w-4xl" : "max-w-lg"}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="text-lg font-bold text-lacquer">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-md p-1 text-muted hover:bg-porcelain">
            <X className="size-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/** Thẻ thống kê nhỏ dùng ở đầu các tab. */
export function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold text-lacquer">{value}</p>
    </div>
  );
}
