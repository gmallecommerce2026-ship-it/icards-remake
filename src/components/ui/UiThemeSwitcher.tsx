"use client";

import { useEffect, useState } from "react";

/** Năm giao diện. Thứ tự và tên dùng cho phím 1–5 và thông báo. */
export const UI_THEMES = [
  { id: "1", name: "Thiệp giấy" },
  { id: "2", name: "Tối giản" },
  { id: "3", name: "Hiện đại" },
  { id: "4", name: "Boho ấm" },
  { id: "5", name: "Cổ điển" },
];

const STORAGE_KEY = "icards:ui-theme";

/**
 * Bấm 1–5 để đổi giao diện trên toàn web (bỏ qua khi đang gõ trong ô nhập).
 * Lựa chọn được lưu lại trên trình duyệt. Có thể mở trang kèm ?ui=3 để chọn sẵn.
 */
export function UiThemeSwitcher() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const apply = (id: string, notify: boolean) => {
      document.documentElement.dataset.theme = id;
      try { localStorage.setItem(STORAGE_KEY, id); } catch { /* bộ nhớ bị chặn: vẫn đổi trong phiên này */ }
      if (notify) {
        const t = UI_THEMES.find((x) => x.id === id);
        setToast(`${id}  ·  ${t?.name ?? ""}`);
      }
    };

    // ?ui=<1-5> để chọn giao diện khi chia sẻ link demo
    const fromUrl = new URLSearchParams(window.location.search).get("ui");
    if (fromUrl && /^[1-5]$/.test(fromUrl)) apply(fromUrl, false);

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      if (!/^[1-5]$/.test(e.key)) return;
      apply(e.key, true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-5 left-5 z-[200] bg-ink px-4 py-2.5 text-sm text-white shadow-lg transition-all duration-300 ${
        toast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {toast ?? ""}
    </div>
  );
}
