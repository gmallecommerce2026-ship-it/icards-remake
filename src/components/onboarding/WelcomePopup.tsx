"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { UI_THEMES } from "@/components/ui/UiThemeSwitcher";
import { setUiTheme, useUiTheme } from "@/components/ui/useUiTheme";
import { THEME_SWATCH } from "@/components/ui/themeSwatches";

const SEEN_KEY = "icards:welcome-seen";

/** Popup chào mừng: chỉ hiện một lần cho mỗi trình duyệt, sau 1 giây kể từ khi vào trang. */
export function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const current = useUiTheme();

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* không đọc được bộ nhớ: coi như chưa xem để vẫn hiện một lần */
    }
    if (seen) return;
    const t = window.setTimeout(() => setOpen(true), 1000);
    return () => window.clearTimeout(t);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* bỏ qua */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/50 p-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden bg-white shadow-2xl"
      >
        <div aria-hidden className="h-1.5 bg-[#27548A]" />
        <button type="button" onClick={close} aria-label="Đóng" className="absolute right-4 top-5 grid size-9 place-items-center text-muted hover:bg-porcelain hover:text-ink">
          <X className="size-5" />
        </button>

        <div className="p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#27548A]">Chào mừng đến iCards</p>
          <h2 id="welcome-title" className="mt-3 pr-8 text-2xl font-bold leading-tight tracking-tight text-ink">
            Thiệp mời online đẹp, gửi trong vài phút
          </h2>
          <p className="mt-3 leading-relaxed text-muted">
            Chọn phong cách bạn thích, điền thông tin và gửi link cho khách mời. Bạn có thể đổi giao diện bất cứ lúc nào.
          </p>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Chọn phong cách</p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {UI_THEMES.map((t) => {
              const s = THEME_SWATCH[t.id];
              const on = current === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setUiTheme(t.id)}
                  aria-pressed={on}
                  aria-label={t.name}
                  title={t.name}
                  className={`flex h-16 flex-col overflow-hidden border-2 transition-colors ${on ? "border-[#27548A]" : "border-line hover:border-[#27548A]/50"}`}
                  style={{ backgroundColor: s.bg }}
                >
                  <span className="h-2.5 w-full" style={{ backgroundColor: s.accent }} aria-hidden />
                  <span className="m-auto h-1.5 w-8 opacity-70" style={{ backgroundColor: s.ink }} aria-hidden />
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/templates" onClick={close} className="inline-flex h-12 flex-1 items-center justify-center bg-[#27548A] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1b3d66]">
              Xem mẫu thiệp
            </Link>
            <button type="button" onClick={close} className="inline-flex h-12 items-center justify-center border border-line px-6 text-sm font-semibold text-ink transition-colors hover:border-[#27548A] hover:text-[#27548A]">
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
