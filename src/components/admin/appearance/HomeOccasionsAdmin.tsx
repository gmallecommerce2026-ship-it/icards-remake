"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminHomeOccasions, saveAdminHomeOccasions } from "@/lib/api/admin";
import { getTemplateCategoryTree } from "@/lib/api/templates";
import { flattenTemplates, type TreeNode, type TreeTemplate } from "@/lib/templates-tree";
import {
  DEFAULT_HOME_OCCASIONS,
  OCCASION_FONT_KEYS,
  OCCASION_FONT_LABELS,
  occasionFontFamily,
  type HomeOccasionsConfig,
} from "@/lib/home-occasions";
import type { TitleFontKey } from "@/lib/title-style";
import { ErrorBox, btnCls, btnGhostCls, errorMessage, inputCls } from "@/components/admin/ui";

const PREVIEW_TEXT = "Thiệp cưới";

/** Tab "Dịp lan tỏa niềm vui": chọn mẫu thiệp làm ảnh nền của khối và font tên từng danh mục trên trang chủ. */
export default function HomeOccasionsAdmin() {
  const [cfg, setCfg] = useState<HomeOccasionsConfig>(DEFAULT_HOME_OCCASIONS);
  const [roots, setRoots] = useState<TreeNode[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([getAdminHomeOccasions(), getTemplateCategoryTree()])
      .then(([cur, tree]) => {
        if (!alive) return;
        const { backgroundTemplateSlug, overlay, fonts } = cur.data;
        setCfg({ backgroundTemplateSlug, overlay, fonts });
        const d = tree.data?.data ?? tree.data;
        setRoots(Array.isArray(d) ? (d as TreeNode[]) : []);
      })
      .catch((e) => alive && setError(errorMessage(e, "Không tải được cấu hình.")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // Mẫu để chọn làm nền: chỉ mẫu có ảnh xem trước, lọc theo danh mục gốc đang chọn
  const choices = useMemo<TreeTemplate[]>(() => {
    const src = filter ? roots.filter((r) => r.id === filter) : roots;
    const seen = new Set<string>();
    return src
      .flatMap((r) => flattenTemplates(r))
      .filter((t) => t.previewImage && !seen.has(t.slug) && !!seen.add(t.slug));
  }, [roots, filter]);

  const allTemplates = useMemo(() => roots.flatMap((r) => flattenTemplates(r)), [roots]);
  const selected = allTemplates.find((t) => t.slug === cfg.backgroundTemplateSlug) ?? null;
  const selectedMissing = !!cfg.backgroundTemplateSlug && !selected;

  const setFont = (id: string, font: TitleFontKey | "") =>
    setCfg((c) => {
      const fonts = { ...c.fonts };
      if (font) fonts[id] = font;
      else delete fonts[id];
      return { ...c, fonts };
    });

  const save = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const { data } = await saveAdminHomeOccasions(cfg);
      setCfg({ backgroundTemplateSlug: data.backgroundTemplateSlug, overlay: data.overlay, fonts: data.fonts });
      setNotice("Đã lưu. Trang chủ sẽ cập nhật ở lần tải tiếp theo.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-[#5B6B7F]">Đang tải…</p>;

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-[#5B6B7F]">
          Tuỳ chỉnh khối <strong>NHỮNG DỊP LAN TỎA NIỀM VUI</strong> ở trang chủ: chọn một mẫu thiệp làm hình nền và font chữ riêng cho tên từng danh mục.
        </p>
        <button type="button" className={btnCls} disabled={saving} onClick={save}>
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      {notice && <p className="text-sm text-[#1E7A4C]">{notice}</p>}

      {/* ---- Hình nền ---- */}
      <section className="grid gap-4 border border-[#D9E1EC] bg-white p-5">
        <h2 className="text-base font-bold">Hình nền của khối</h2>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                Danh mục
                <select className={inputCls} value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="">Tất cả</option>
                  {roots.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className={btnGhostCls}
                disabled={!cfg.backgroundTemplateSlug}
                onClick={() => setCfg((c) => ({ ...c, backgroundTemplateSlug: null }))}
              >
                Không dùng nền
              </button>
            </div>

            {selectedMissing && (
              <p className="text-xs text-[#8E2B3B]">Mẫu đang chọn ({cfg.backgroundTemplateSlug}) không còn được đăng, trang chủ sẽ không hiện nền. Hãy chọn mẫu khác.</p>
            )}

            {choices.length === 0 ? (
              <p className="text-sm text-[#5B6B7F]">Chưa có mẫu thiệp nào có ảnh xem trước.</p>
            ) : (
              <ul className="grid max-h-[420px] grid-cols-3 gap-3 overflow-y-auto pr-1 sm:grid-cols-4 xl:grid-cols-5">
                {choices.map((t) => {
                  const on = t.slug === cfg.backgroundTemplateSlug;
                  return (
                    <li key={t.slug}>
                      <button
                        type="button"
                        onClick={() => setCfg((c) => ({ ...c, backgroundTemplateSlug: t.slug }))}
                        aria-pressed={on}
                        title={t.name}
                        className={`group block w-full border-2 text-left transition-colors ${on ? "border-[#27548A]" : "border-transparent hover:border-[#C5D0DE]"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={t.previewImage!} alt={t.name} loading="lazy" className="aspect-[3/4] w-full object-cover" />
                        <span className={`block truncate px-1 py-1 text-xs ${on ? "font-semibold text-[#27548A]" : "text-[#5B6B7F]"}`}>{t.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="grid content-start gap-3">
            <p className="text-sm font-medium">Xem trước</p>
            <div className="relative grid h-44 place-items-center overflow-hidden border border-[#D9E1EC] bg-[#FEFDFD]">
              {selected?.previewImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.previewImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}
              <div className="absolute inset-0 bg-white" style={{ opacity: cfg.overlay / 100 }} />
              <span className="relative text-sm font-semibold text-[#1a1a1a]">NHỮNG DỊP LAN TỎA NIỀM VUI</span>
            </div>
            <label className="grid gap-1.5 text-sm font-medium">
              <span className="flex justify-between">
                Độ phủ lớp trắng mờ <span className="tabular-nums text-[#5B6B7F]">{cfg.overlay}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                value={cfg.overlay}
                onChange={(e) => setCfg((c) => ({ ...c, overlay: Number(e.target.value) }))}
              />
              <span className="text-xs font-normal text-[#5B6B7F]">Tăng lên nếu ảnh nền làm tiêu đề khó đọc.</span>
            </label>
          </div>
        </div>
      </section>

      {/* ---- Font từng danh mục ---- */}
      <section className="grid gap-4 border border-[#D9E1EC] bg-white p-5">
        <div>
          <h2 className="text-base font-bold">Font tên danh mục</h2>
          <p className="mt-1 text-sm text-[#5B6B7F]">Chọn font riêng cho từng danh mục. Để “Mặc định” thì dùng font chung của khối.</p>
        </div>
        {roots.length === 0 ? (
          <p className="text-sm text-[#5B6B7F]">Chưa có danh mục nào có mẫu thiệp đã đăng.</p>
        ) : (
          <ul className="grid gap-3">
            {roots.map((r) => (
              <li key={r.id} className="grid items-center gap-3 border border-[#EEF2F7] p-3 md:grid-cols-[200px_minmax(0,260px)_1fr]">
                <span className="text-sm font-semibold">{r.label}</span>
                <select
                  aria-label={`Font cho ${r.label}`}
                  className={inputCls}
                  value={cfg.fonts[r.id] ?? ""}
                  onChange={(e) => setFont(r.id, e.target.value as TitleFontKey | "")}
                >
                  <option value="">Mặc định</option>
                  {OCCASION_FONT_KEYS.map((k) => (
                    <option key={k} value={k}>{OCCASION_FONT_LABELS[k]}</option>
                  ))}
                </select>
                <span style={{ fontFamily: occasionFontFamily(cfg.fonts[r.id]) }} className="truncate text-[22px] font-semibold leading-tight text-[#0E1B2C]">
                  {r.label || PREVIEW_TEXT}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
