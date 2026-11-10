"use client";

import { useEffect, useState } from "react";
import * as adminApi from "@/lib/api/admin";
import type { NavItem } from "@/lib/api/admin";
import { ErrorBox, PageTitle, btnCls, btnGhostCls, errorMessage, inputCls } from "@/components/admin/ui";

const MAX_DEPTH = 3;

const newItem = (): NavItem => ({
  id: `m-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
  title: "Mục mới",
  path: "",
  order: 0,
  isVisible: true,
  children: [],
});

/** Sửa cây menu nhiều cấp (tối đa 3 cấp). Mỗi cấp là một danh sách có thể lên/xuống, thêm, xoá. */
function NavEditor({ items, onChange, depth }: { items: NavItem[]; onChange: (next: NavItem[]) => void; depth: number }) {
  const setAt = (i: number, patch: Partial<NavItem>) => onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className={depth > 1 ? "ml-5 grid gap-3 border-l-2 border-[#EEF2F7] pl-4" : "grid gap-3"}>
      {items.map((it, i) => (
        <div key={it.id} className="grid gap-3 border border-[#D9E1EC] bg-white p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="grid gap-1.5 text-sm font-medium">
              Tên mục
              <input className={inputCls} value={it.title} onChange={(e) => setAt(i, { title: e.target.value })} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Đường dẫn
              <input className={inputCls} placeholder="/templates hoặc https://…" value={it.path ?? ""} onChange={(e) => setAt(i, { path: e.target.value })} />
            </label>
            <label className="flex h-10 items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={it.isVisible} onChange={(e) => setAt(i, { isVisible: e.target.checked })} />
              Hiện
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnGhostCls} disabled={i === 0} onClick={() => move(i, -1)}>Lên</button>
            <button type="button" className={btnGhostCls} disabled={i === items.length - 1} onClick={() => move(i, 1)}>Xuống</button>
            {depth < MAX_DEPTH && (
              <button type="button" className={btnGhostCls} onClick={() => setAt(i, { children: [...it.children, newItem()] })}>+ Mục con</button>
            )}
            <button type="button" className={btnGhostCls} onClick={() => onChange(items.filter((_, k) => k !== i))}>Xoá</button>
          </div>
          {it.children.length > 0 && (
            <NavEditor items={it.children} depth={depth + 1} onChange={(children) => setAt(i, { children })} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminMenuPage() {
  const [nav, setNav] = useState<NavItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .getAdminSettings()
      .then(({ data }) => setNav(data.headerNav ?? []))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const save = async () => {
    if (!nav) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const { data } = await adminApi.saveAdminHeaderNav(nav);
      setNav(data.headerNav ?? []);
      setMessage("Đã lưu menu.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (!nav) {
    return <>{error ? <ErrorBox>{error}</ErrorBox> : <p className="text-sm text-[#5B6B7F]">Đang tải…</p>}</>;
  }

  return (
    <>
      <PageTitle
        title="Menu"
        description="Đây là menu thật trên thanh điều hướng của web. Mục cấp 1 là mục chính, mục con là cột trong menu thả xuống, mục cấp 3 là liên kết trong cột."
        action={
          <div className="flex gap-2">
            <button type="button" className={btnGhostCls} onClick={() => setNav((n) => [...n!, newItem()])}>+ Thêm mục</button>
            <button type="button" className={btnCls} disabled={saving} onClick={save}>{saving ? "Đang lưu…" : "Lưu thay đổi"}</button>
          </div>
        }
      />
      {error && <ErrorBox>{error}</ErrorBox>}
      {message && <p className="mb-4 text-sm text-[#1E7A4C]">{message}</p>}
      {nav.length === 0 && <p className="text-sm text-[#5B6B7F]">Chưa có mục menu nào.</p>}
      <NavEditor items={nav} depth={1} onChange={setNav} />
    </>
  );
}
