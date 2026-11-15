"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  getAdminTemplateHeroes,
  saveAdminTemplateHeroes,
  uploadAdminTemplateHeroImage,
  type AdminTemplateHeroes,
} from "@/lib/api/admin";
import {
  HERO_CATEGORIES,
  HERO_CATEGORY_LABELS,
  HERO_PRESETS,
  HERO_PRESET_LABELS,
  MAX_HERO_IMAGES,
  emptyHero,
  type HeroCategory,
  type TemplateHero,
} from "@/lib/template-heroes";
import { ErrorBox, PageTitle, btnCls, btnGhostCls, errorMessage, inputCls } from "@/components/admin/ui";

/** Admin chọn kiểu 3D và nhập nội dung cho hero từng danh mục. Không nhập code tùy ý. */
export default function TemplateHeroAdmin() {
  const [data, setData] = useState<AdminTemplateHeroes>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<HeroCategory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getAdminTemplateHeroes()
      .then((r) => alive && setData(r.data ?? {}))
      .catch((e) => alive && setError(errorMessage(e, "Không tải được cấu hình hero.")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const patch = (id: HeroCategory, p: Partial<TemplateHero>) =>
    setData((d) => ({ ...d, [id]: { ...(d[id] ?? emptyHero()), ...p } }));

  const enable = (id: HeroCategory, on: boolean) =>
    setData((d) => {
      const next = { ...d };
      if (on) next[id] = d[id] ?? emptyHero();
      else delete next[id];
      return next;
    });

  const setImage = (id: HeroCategory, i: number, url: string) => {
    const list = [...(data[id]?.images ?? [])];
    list[i] = url;
    patch(id, { images: list });
  };

  const removeImage = (id: HeroCategory, i: number) =>
    patch(id, { images: (data[id]?.images ?? []).filter((_, k) => k !== i) });

  const addImageUrl = (id: HeroCategory) => {
    const list = data[id]?.images ?? [];
    if (list.length >= MAX_HERO_IMAGES) return;
    patch(id, { images: [...list, ""] });
  };

  const upload = async (id: HeroCategory, file: File) => {
    setBusy(id);
    setError(null);
    try {
      const r = await uploadAdminTemplateHeroImage(file);
      const list = data[id]?.images ?? [];
      if (list.length < MAX_HERO_IMAGES) patch(id, { images: [...list, r.data.url] });
    } catch (e) {
      setError(errorMessage(e, "Tải ảnh lên thất bại."));
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const r = await saveAdminTemplateHeroes(data);
      setData(r.data ?? {});
      setNotice("Đã lưu. Trang danh mục sẽ cập nhật sau khi tải lại.");
    } catch (e) {
      setError(errorMessage(e, "Lưu thất bại, vui lòng thử lại."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-[#5B6B7F]">Đang tải…</p>;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Hero 3D theo danh mục"
        description="Phần giới thiệu 3D ở đầu trang danh mục mẫu thiệp. Chọn kiểu có sẵn, nhập tiêu đề và ảnh. Tắt một danh mục thì trang đó không hiện hero. Ảnh nên dùng cho hero: đặt link https hoặc tải lên ở mỗi danh mục."
        action={<button type="button" className={btnCls} onClick={save} disabled={saving}>{saving ? "Đang lưu…" : "Lưu thay đổi"}</button>}
      />
      {error && <ErrorBox>{error}</ErrorBox>}
      {notice && <p className="rounded-md bg-[#EAF4EC] px-4 py-3 text-sm text-[#1E5B2E]">{notice}</p>}

      {HERO_CATEGORIES.map((id) => {
        const h = data[id];
        return (
          <section key={id} className="rounded-lg border border-[#DDE4EE] bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold">{HERO_CATEGORY_LABELS[id]}</h3>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!h} onChange={(e) => enable(id, e.target.checked)} /> Hiện hero
              </label>
            </div>

            {h && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Kiểu 3D">
                  <select className={inputCls} value={h.preset} onChange={(e) => patch(id, { preset: e.target.value as TemplateHero["preset"] })}>
                    {HERO_PRESETS.map((p) => (
                      <option key={p} value={p}>{HERO_PRESET_LABELS[p]}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Tốc độ chạy theo cuộn (1 – 3, 1 là bình thường)">
                  <input
                    type="number" min={1} max={3} step={0.1} className={inputCls}
                    value={h.speed}
                    onChange={(e) => patch(id, { speed: Math.min(3, Math.max(1, Number(e.target.value) || 1)) })}
                  />
                </Field>
                <Field label="Tiêu đề (để trống = tên danh mục)">
                  <input className={inputCls} maxLength={120} value={h.title} onChange={(e) => patch(id, { title: e.target.value })} />
                </Field>
                <Field label="Mô tả ngắn">
                  <input className={inputCls} maxLength={240} value={h.subtitle} onChange={(e) => patch(id, { subtitle: e.target.value })} />
                </Field>
                <Field label="Màu nhấn">
                  <div className="flex items-center gap-2">
                    <input type="color" aria-label="Chọn màu nhấn" value={h.accent} onChange={(e) => patch(id, { accent: e.target.value.toUpperCase() })} className="h-10 w-14 cursor-pointer rounded border border-[#C5D0DE]" />
                    <input className={inputCls} value={h.accent} onChange={(e) => patch(id, { accent: e.target.value })} aria-label="Mã màu" />
                  </div>
                </Field>
                <div className="md:col-span-2">
                  <p className="mb-2 text-sm font-medium">Ảnh minh họa ({h.images.length}/{MAX_HERO_IMAGES}) — chỉ nhận link https://</p>
                  <div className="space-y-2">
                    {h.images.map((url, i) => (
                      <div key={i} className="flex gap-2">
                        <input className={`${inputCls} flex-1`} placeholder="https://…" value={url} onChange={(e) => setImage(id, i, e.target.value)} aria-label={`Ảnh ${i + 1}`} />
                        <button type="button" className={btnGhostCls} onClick={() => removeImage(id, i)}>Xóa</button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className={btnGhostCls} onClick={() => addImageUrl(id)} disabled={h.images.length >= MAX_HERO_IMAGES}>+ Thêm link ảnh</button>
                    <label className={`${btnGhostCls} cursor-pointer`}>
                      {busy === id ? "Đang tải…" : "Tải ảnh lên"}
                      <input type="file" accept="image/*" className="sr-only" disabled={busy === id || h.images.length >= MAX_HERO_IMAGES}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(id, f); e.target.value = ""; }} />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[#333]">{label}</span>
      {children}
    </label>
  );
}
