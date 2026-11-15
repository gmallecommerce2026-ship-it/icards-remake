"use client";

import { useEffect, useState } from "react";
import { Check, Palette, X } from "lucide-react";
import { UI_THEMES } from "@/components/ui/UiThemeSwitcher";
import { setUiTheme, useUiTheme } from "@/components/ui/useUiTheme";
import { THEME_SWATCH } from "@/components/ui/themeSwatches";

/** Tab bên phải mở sidebar cá nhân hoá: chọn giao diện 1–5 cho toàn web. */
export function PersonalizePanel() {
  const [open, setOpen] = useState(false);
  const current = useUiTheme();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="personalize-panel"
        className="fixed right-0 top-1/2 z-[60] flex -translate-y-1/2 items-center gap-2 bg-[#27548A] py-5 pl-3 pr-2.5 text-white shadow-lg transition-colors hover:bg-[#1b3d66]"
      >
        <Palette className="size-4 shrink-0" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-[0.18em] [writing-mode:vertical-rl]">Cá nhân hoá</span>
      </button>

      {open && <div aria-hidden onClick={() => setOpen(false)} className="fixed inset-0 z-[70] bg-ink/30" />}

      <aside
        id="personalize-panel"
        role="dialog"
        aria-label="Cá nhân hoá giao diện"
        className={`fixed right-0 top-0 z-[80] flex h-full w-[min(380px,100vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <p className="text-lg font-bold text-ink">Cá nhân hoá giao diện</p>
            <p className="mt-0.5 text-xs text-muted">Áp dụng cho toàn bộ website</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Đóng" className="grid size-9 place-items-center text-muted hover:bg-porcelain hover:text-ink">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <p className="text-sm leading-relaxed text-muted">Chọn phong cách bạn thích. Lựa chọn được lưu trên trình duyệt này.</p>

          <ul className="mt-6 space-y-3">
            {UI_THEMES.map((t) => {
              const s = THEME_SWATCH[t.id];
              const on = current === t.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setUiTheme(t.id)}
                    aria-pressed={on}
                    className={`flex w-full items-center gap-4 border p-4 text-left transition-colors ${
                      on ? "border-[#27548A] bg-[#E8EEF6]" : "border-line hover:border-[#27548A]/50"
                    }`}
                  >
                    <span className="flex h-14 w-20 shrink-0 flex-col overflow-hidden border border-black/10" style={{ backgroundColor: s.bg }} aria-hidden>
                      <span className="h-2.5 w-full" style={{ backgroundColor: s.accent }} />
                      <span className="m-auto h-1.5 w-10 opacity-70" style={{ backgroundColor: s.ink }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">
                        {t.id}. {t.name}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted">{s.desc}</span>
                    </span>
                    {on && <Check className="size-5 shrink-0 text-[#27548A]" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-line px-6 py-4 text-xs text-muted">Mẹo: bấm phím 1–5 để đổi nhanh giao diện.</div>
      </aside>
    </>
  );
}
