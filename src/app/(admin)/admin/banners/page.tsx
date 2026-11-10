"use client";

import { useEffect, useState } from "react";
import * as adminApi from "@/lib/api/admin";
import type { SiteBanner } from "@/lib/api/admin";
import { ErrorBox, PageTitle, btnCls, btnGhostCls, errorMessage, inputCls } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";

const PAGES: { value: string; label: string }[] = [
  { value: "home", label: "Trang chủ" },
  { value: "templates", label: "Mẫu thiệp" },
  { value: "shop", label: "Cửa hàng" },
  { value: "services", label: "Dịch vụ" },
  { value: "blog", label: "Blog" },
  { value: "professional", label: "Chuyên nghiệp" },
  { value: "all", label: "Tất cả trang" },
];

const newBanner = (): SiteBanner => ({
  id: `b-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
  name: "Banner mới",
  displayPage: "home",
  isEnabled: false,
  imgSrc: null,
  link: "",
});

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<SiteBanner[] | null>(null);
  const [settings, setSettings] = useState<adminApi.AdminSiteSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .getAdminSettings()
      .then(({ data }) => {
        setSettings(data);
        setBanners(data.banners ?? []);
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const update = (i: number, patch: Partial<SiteBanner>) =>
    setBanners((list) => list!.map((b, k) => (k === i ? { ...b, ...patch } : b)));

  const move = (i: number, dir: -1 | 1) =>
    setBanners((list) => {
      const next = [...list!];
      const j = i + dir;
      if (j < 0 || j >= next.length) return list;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = async () => {
    if (!banners) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const { data } = await adminApi.saveAdminBanners(banners);
      setSettings(data);
      setBanners(data.banners ?? []);
      setMessage("Đã lưu banner.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (!banners) {
    return <>{error ? <ErrorBox>{error}</ErrorBox> : <p className="text-sm text-[#5B6B7F]">Đang tải…</p>}</>;
  }

  return (
    <>
      <PageTitle
        title="Banner"
        description="Banner hiển thị theo từng trang. Sắp xếp theo thứ tự từ trên xuống."
        action={
          <div className="flex gap-2">
            <button type="button" className={btnGhostCls} onClick={() => setBanners((l) => [...l!, newBanner()])}>+ Thêm banner</button>
            <button type="button" className={btnCls} disabled={saving} onClick={save}>{saving ? "Đang lưu…" : "Lưu thay đổi"}</button>
          </div>
        }
      />
      {error && <ErrorBox>{error}</ErrorBox>}
      {message && <p className="mb-4 text-sm text-[#1E7A4C]">{message}</p>}
      {settings && banners.length === 0 && <p className="text-sm text-[#5B6B7F]">Chưa có banner nào.</p>}

      <div className="grid gap-4">
        {banners.map((b, i) => (
          <section key={b.id} className="grid gap-4 border border-[#D9E1EC] bg-white p-5 md:grid-cols-[1fr_1.4fr]">
            <div className="grid content-start gap-3">
              <label className="grid gap-1.5 text-sm font-medium">
                Tên banner
                <input className={inputCls} value={b.name} onChange={(e) => update(i, { name: e.target.value })} />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Hiển thị ở trang
                <select className={inputCls} value={b.displayPage} onChange={(e) => update(i, { displayPage: e.target.value })}>
                  {PAGES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Liên kết khi bấm
                <input className={inputCls} placeholder="/templates hoặc https://…" value={b.link ?? ""} onChange={(e) => update(i, { link: e.target.value })} />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={b.isEnabled} onChange={(e) => update(i, { isEnabled: e.target.checked })} />
                Bật banner
              </label>
              <div className="mt-1 flex flex-wrap gap-2">
                <button type="button" className={btnGhostCls} disabled={i === 0} onClick={() => move(i, -1)}>Lên</button>
                <button type="button" className={btnGhostCls} disabled={i === banners.length - 1} onClick={() => move(i, 1)}>Xuống</button>
                <button type="button" className={btnGhostCls} onClick={() => setBanners((l) => l!.filter((_, k) => k !== i))}>Xoá</button>
              </div>
            </div>
            <ImageField label="Ảnh banner" value={b.imgSrc ?? ""} onChange={(url) => update(i, { imgSrc: url || null })} />
          </section>
        ))}
      </div>
    </>
  );
}
