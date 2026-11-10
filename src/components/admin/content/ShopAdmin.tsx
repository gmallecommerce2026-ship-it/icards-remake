"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Plus, Pencil, Trash2 } from "lucide-react";
import * as adminApi from "@/lib/api/admin";
import type { AdminProduct, AdminService, ProductVariantInput } from "@/lib/api/admin";
import { api } from "@/lib/api/http";
import { ErrorBox, PageTitle, btnCls, btnGhostCls, errorMessage, inputCls } from "@/components/admin/ui";
import { Field, Toggle, RowActions, moveItem, areaCls, linesToArray, arrayToLines, toSlug } from "./forms";
import { usePageCopy } from "./usePageCopy";

type Tab = "products" | "services" | "copy";
type Opt = { id: string; label: string };

const THUMBS: [string, string][] = [
  ["paper", "Giấy in"], ["qr", "Mã QR"], ["standee", "Standee"], ["envelope", "Phong bì"], ["message", "Lời nhắn"], ["gift", "Quà tặng"],
];

/* Cửa hàng & Dịch vụ: quản lý sản phẩm, dịch vụ và chữ hiển thị trên hai trang. */
export default function ShopAdmin() {
  const [tab, setTab] = useState<Tab>("products");
  const tabs: { id: Tab; label: string }[] = [
    { id: "products", label: "Sản phẩm" },
    { id: "services", label: "Dịch vụ" },
    { id: "copy", label: "Chữ trang" },
  ];
  return (
    <>
      <PageTitle
        title="Cửa hàng & Dịch vụ"
        description="Sản phẩm, dịch vụ và nội dung hiển thị trên trang Cửa hàng và trang Dịch vụ."
        action={
          <a href="/shop" target="_blank" rel="noreferrer" className={btnGhostCls}>
            <ExternalLink className="mr-1.5 size-3.5" />
            Xem trang cửa hàng
          </a>
        }
      />
      <div role="tablist" className="mb-6 flex flex-wrap gap-2 border-b border-[#D9E1EC]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === t.id ? "border-[#27548A] text-[#27548A]" : "border-transparent text-[#5B6B7F] hover:text-[#222]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "products" && <ProductsTab />}
      {tab === "services" && <ServicesTab />}
      {tab === "copy" && <CopyTab />}
    </>
  );
}

/* ---------------- Sản phẩm ---------------- */

const emptyProduct = (): Omit<AdminProduct, "_id"> => ({
  slug: "", name: "", category: "print", summary: "", description: "", thumb: "paper", tone: { bg: "#FFFFFF", ink: "#0E1B2C" },
  variants: [{ id: "std", label: "Tiêu chuẩn", price: 0 }], shipping: "ship", leadTime: "", highlights: [], specs: [], sortOrder: 0, isPublished: true,
});

function ProductsTab() {
  const [list, setList] = useState<AdminProduct[] | null>(null);
  const [cats, setCats] = useState<Opt[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminProduct | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    adminApi.getAdminProducts(search).then(({ data }) => setList(data)).catch((e) => setError(errorMessage(e)));

  useEffect(() => {
    api.get<Opt[]>("/public/content/shop.categories").then(({ data }) => setCats(Array.isArray(data) ? data : [])).catch(() => setCats([]));
  }, []);
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [search]);

  const remove = async (p: AdminProduct) => {
    if (!window.confirm(`Xoá sản phẩm "${p.name}"? Thao tác này không hoàn tác.`)) return;
    try { await adminApi.deleteAdminProduct(p._id); load(); } catch (e) { setError(errorMessage(e)); }
  };

  if (editing) {
    return (
      <ProductForm
        initial={editing === "new" ? null : editing}
        cats={cats}
        onBack={() => { setEditing(null); load(); }}
      />
    );
  }

  return (
    <div className="grid gap-4">
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input className={`${inputCls} w-72`} placeholder="Tìm theo tên hoặc đường dẫn…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="button" className={btnCls} onClick={() => setEditing("new")}>
          <Plus className="mr-1.5 size-4" />
          Thêm sản phẩm
        </button>
      </div>
      {list === null ? <p className="text-sm text-[#5B6B7F]">Đang tải…</p> : list.length === 0 ? <p className="text-sm text-[#5B6B7F]">Chưa có sản phẩm nào.</p> : (
        <div className="overflow-x-auto border border-[#D9E1EC] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F3F6FA] text-left text-xs uppercase tracking-[0.08em] text-[#5B6B7F]">
              <tr><th className="p-3">Sản phẩm</th><th className="p-3">Danh mục</th><th className="p-3">Giá từ</th><th className="p-3">Hiển thị</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p._id} className="border-t border-[#E3E9F2]">
                  <td className="p-3"><p className="font-semibold">{p.name}</p><p className="text-xs text-[#5B6B7F]">/{p.slug}</p></td>
                  <td className="p-3">{cats.find((c) => c.id === p.category)?.label ?? p.category}</td>
                  <td className="p-3 tabular-nums">{p.variants.length ? Math.min(...p.variants.map((v) => v.price)).toLocaleString("vi-VN") + "₫" : "—"}</td>
                  <td className="p-3">{p.isPublished ? "Đang bán" : <span className="text-[#8E2B3B]">Ẩn</span>}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" className={btnGhostCls} onClick={() => setEditing(p)}><Pencil className="mr-1.5 size-3.5" />Sửa</button>
                      <button type="button" className={`${btnGhostCls} text-[#8E2B3B]`} onClick={() => remove(p)}><Trash2 className="mr-1.5 size-3.5" />Xoá</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProductForm({ initial, cats, onBack }: { initial: AdminProduct | null; cats: Opt[]; onBack: () => void }) {
  const [form, setForm] = useState<Omit<AdminProduct, "_id">>(() => (initial ? { ...initial } : emptyProduct()));
  const [autoSlug, setAutoSlug] = useState(!initial);
  const [highlights, setHighlights] = useState(arrayToLines(initial?.highlights ?? []));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    setError(null);
    const body = { ...form, highlights: linesToArray(highlights) };
    try {
      if (initial) await adminApi.updateAdminProduct(initial._id, body);
      else await adminApi.createAdminProduct(body);
      onBack();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const setVariant = (i: number, patch: Partial<ProductVariantInput>) =>
    set("variants", form.variants.map((v, k) => (k === i ? { ...v, ...patch } : v)));
  const addVariant = () => set("variants", [...form.variants, { id: `v${form.variants.length + 1}`, label: "Mẫu mới", price: 0 }]);
  const setSpec = (i: number, patch: Partial<{ label: string; value: string }>) =>
    set("specs", form.specs.map((s, k) => (k === i ? { ...s, ...patch } : s)));

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <button type="button" className={btnGhostCls} onClick={onBack}>← Quay lại danh sách</button>
        <div className="flex gap-2">
          <button type="button" className={btnCls} disabled={saving} onClick={save}>{saving ? "Đang lưu…" : "Lưu sản phẩm"}</button>
        </div>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}

      <section className="grid gap-4 border border-[#D9E1EC] bg-white p-5 md:grid-cols-2">
        <h2 className="text-base font-bold md:col-span-2">Thông tin chung</h2>
        <Field label="Tên sản phẩm">
          <input className={inputCls} value={form.name} onChange={(e) => {
            const name = e.target.value;
            setForm((f) => ({ ...f, name, slug: autoSlug ? toSlug(name) : f.slug }));
          }} />
        </Field>
        <Field label="Đường dẫn (slug)" hint="Dùng trong địa chỉ trang. Chỉ chữ thường, số và dấu gạch ngang.">
          <input className={inputCls} value={form.slug} onChange={(e) => { setAutoSlug(false); set("slug", toSlug(e.target.value) || e.target.value); }} />
        </Field>
        <Field label="Danh mục">
          <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Hình minh hoạ">
          <select className={inputCls} value={form.thumb} onChange={(e) => set("thumb", e.target.value)}>
            {THUMBS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Mô tả ngắn" className="md:col-span-2">
          <input className={inputCls} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
        </Field>
        <Field label="Mô tả chi tiết" className="md:col-span-2">
          <textarea rows={4} className={areaCls} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <Field label="Điểm nổi bật" hint="Mỗi dòng một điểm." className="md:col-span-2">
          <textarea rows={3} className={areaCls} value={highlights} onChange={(e) => setHighlights(e.target.value)} />
        </Field>
      </section>

      <section className="grid gap-4 border border-[#D9E1EC] bg-white p-5 md:grid-cols-3">
        <h2 className="text-base font-bold md:col-span-3">Giá, giao hàng, hiển thị</h2>
        <div className="grid gap-2 md:col-span-3">
          <span className="text-sm font-medium">Biến thể và giá</span>
          {form.variants.map((v, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-[1fr_180px_auto] md:items-center">
              <input className={inputCls} aria-label="Tên biến thể" value={v.label} onChange={(e) => setVariant(i, { label: e.target.value })} />
              <input className={inputCls} aria-label="Giá (VND)" type="number" min={0} value={v.price} onChange={(e) => setVariant(i, { price: Number(e.target.value) })} />
              <RowActions index={i} count={form.variants.length} onMove={(d) => set("variants", moveItem(form.variants, i, d))} onRemove={() => set("variants", form.variants.filter((_, k) => k !== i))} />
            </div>
          ))}
          <div><button type="button" className={btnGhostCls} onClick={addVariant}><Plus className="mr-1.5 size-3.5" />Thêm biến thể</button></div>
        </div>
        <Field label="Hình thức giao">
          <select className={inputCls} value={form.shipping} onChange={(e) => set("shipping", e.target.value as "ship" | "digital")}>
            <option value="ship">Giao hàng</option>
            <option value="digital">Kỹ thuật số</option>
          </select>
        </Field>
        <Field label="Thời gian chuẩn bị"><input className={inputCls} placeholder="VD: 7–10 ngày" value={form.leadTime} onChange={(e) => set("leadTime", e.target.value)} /></Field>
        <Field label="Thứ tự hiển thị" hint="Số nhỏ hiện trước."><input className={inputCls} type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} /></Field>
        <div className="grid gap-2">
          <span className="text-sm font-medium">Màu nền / màu chữ</span>
          <div className="flex gap-3">
            <input type="color" aria-label="Màu nền" value={form.tone.bg} onChange={(e) => set("tone", { ...form.tone, bg: e.target.value })} className="size-10 cursor-pointer border border-[#C5D0DE]" />
            <input type="color" aria-label="Màu chữ" value={form.tone.ink} onChange={(e) => set("tone", { ...form.tone, ink: e.target.value })} className="size-10 cursor-pointer border border-[#C5D0DE]" />
          </div>
        </div>
        <div className="md:col-span-3"><Toggle checked={form.isPublished} onChange={(v) => set("isPublished", v)} label="Hiển thị trên trang cửa hàng" /></div>
      </section>

      <section className="grid gap-3 border border-[#D9E1EC] bg-white p-5">
        <h2 className="text-base font-bold">Thông số kỹ thuật</h2>
        {form.specs.map((s, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-[1fr_1.4fr_auto] md:items-center">
            <input className={inputCls} aria-label="Tên thông số" value={s.label} onChange={(e) => setSpec(i, { label: e.target.value })} />
            <input className={inputCls} aria-label="Giá trị" value={s.value} onChange={(e) => setSpec(i, { value: e.target.value })} />
            <RowActions index={i} count={form.specs.length} onMove={(d) => set("specs", moveItem(form.specs, i, d))} onRemove={() => set("specs", form.specs.filter((_, k) => k !== i))} />
          </div>
        ))}
        <div><button type="button" className={btnGhostCls} onClick={() => set("specs", [...form.specs, { label: "", value: "" }])}><Plus className="mr-1.5 size-3.5" />Thêm thông số</button></div>
      </section>
    </div>
  );
}

/* ---------------- Dịch vụ ---------------- */

const emptyService = (): Omit<AdminService, "_id"> => ({
  slug: "", name: "", summary: "", description: "", priceFrom: 0, duration: "", audience: "", includes: [], sortOrder: 0, isPublished: true,
});

function ServicesTab() {
  const [list, setList] = useState<AdminService[] | null>(null);
  const [editing, setEditing] = useState<AdminService | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => adminApi.getAdminServices().then(({ data }) => setList(data)).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const remove = async (s: AdminService) => {
    if (!window.confirm(`Xoá dịch vụ "${s.name}"?`)) return;
    try { await adminApi.deleteAdminService(s._id); load(); } catch (e) { setError(errorMessage(e)); }
  };

  if (editing) return <ServiceForm initial={editing === "new" ? null : editing} onBack={() => { setEditing(null); load(); }} />;

  return (
    <div className="grid gap-4">
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="flex justify-end">
        <button type="button" className={btnCls} onClick={() => setEditing("new")}><Plus className="mr-1.5 size-4" />Thêm dịch vụ</button>
      </div>
      {list === null ? <p className="text-sm text-[#5B6B7F]">Đang tải…</p> : list.length === 0 ? <p className="text-sm text-[#5B6B7F]">Chưa có dịch vụ nào.</p> : (
        <div className="grid gap-3">
          {list.map((s) => (
            <div key={s._id} className="flex flex-wrap items-center justify-between gap-3 border border-[#D9E1EC] bg-white p-4">
              <div>
                <p className="font-semibold">{s.name} {!s.isPublished && <span className="ml-2 text-xs font-medium text-[#8E2B3B]">Ẩn</span>}</p>
                <p className="text-xs text-[#5B6B7F]">/services/{s.slug} · Từ {s.priceFrom.toLocaleString("vi-VN")}₫ · {s.duration}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className={btnGhostCls} onClick={() => setEditing(s)}><Pencil className="mr-1.5 size-3.5" />Sửa</button>
                <button type="button" className={`${btnGhostCls} text-[#8E2B3B]`} onClick={() => remove(s)}><Trash2 className="mr-1.5 size-3.5" />Xoá</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceForm({ initial, onBack }: { initial: AdminService | null; onBack: () => void }) {
  const [form, setForm] = useState<Omit<AdminService, "_id">>(() => (initial ? { ...initial } : emptyService()));
  const [includes, setIncludes] = useState(arrayToLines(initial?.includes ?? []));
  const [autoSlug, setAutoSlug] = useState(!initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    setError(null);
    const body = { ...form, includes: linesToArray(includes) };
    try {
      if (initial) await adminApi.updateAdminService(initial._id, body);
      else await adminApi.createAdminService(body);
      onBack();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <button type="button" className={btnGhostCls} onClick={onBack}>← Quay lại danh sách</button>
        <button type="button" className={btnCls} disabled={saving} onClick={save}>{saving ? "Đang lưu…" : "Lưu dịch vụ"}</button>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      <section className="grid gap-4 border border-[#D9E1EC] bg-white p-5 md:grid-cols-2">
        <Field label="Tên dịch vụ">
          <input className={inputCls} value={form.name} onChange={(e) => {
            const name = e.target.value;
            setForm((f) => ({ ...f, name, slug: autoSlug ? toSlug(name) : f.slug }));
          }} />
        </Field>
        <Field label="Đường dẫn (slug)" hint="Dùng trong địa chỉ /services/…">
          <input className={inputCls} value={form.slug} onChange={(e) => { setAutoSlug(false); set("slug", toSlug(e.target.value) || e.target.value); }} />
        </Field>
        <Field label="Mô tả ngắn" className="md:col-span-2"><input className={inputCls} value={form.summary} onChange={(e) => set("summary", e.target.value)} /></Field>
        <Field label="Mô tả chi tiết" className="md:col-span-2"><textarea rows={4} className={areaCls} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
        <Field label="Giá từ (VND)"><input className={inputCls} type="number" min={0} value={form.priceFrom} onChange={(e) => set("priceFrom", Number(e.target.value))} /></Field>
        <Field label="Thời lượng"><input className={inputCls} placeholder="VD: 2–3 tuần" value={form.duration} onChange={(e) => set("duration", e.target.value)} /></Field>
        <Field label="Đối tượng"><input className={inputCls} value={form.audience} onChange={(e) => set("audience", e.target.value)} /></Field>
        <Field label="Thứ tự hiển thị" hint="Số nhỏ hiện trước."><input className={inputCls} type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} /></Field>
        <Field label="Bao gồm" hint="Mỗi dòng một mục." className="md:col-span-2"><textarea rows={4} className={areaCls} value={includes} onChange={(e) => setIncludes(e.target.value)} /></Field>
        <div className="md:col-span-2"><Toggle checked={form.isPublished} onChange={(v) => set("isPublished", v)} label="Hiển thị trên trang dịch vụ" /></div>
      </section>
    </div>
  );
}

/* ---------------- Chữ trang ---------------- */

function CopyTab() {
  const { copy, setCopy, save, saving, error, message } = usePageCopy();
  if (!copy) return error ? <ErrorBox>{error}</ErrorBox> : <p className="text-sm text-[#5B6B7F]">Đang tải…</p>;

  const setShop = (k: keyof typeof copy.shop, v: string) => setCopy({ ...copy, shop: { ...copy.shop, [k]: v } });
  const setSvc = (k: keyof typeof copy.services, v: string) => setCopy({ ...copy, services: { ...copy.services, [k]: v } });

  return (
    <div className="grid gap-8">
      {error && <ErrorBox>{error}</ErrorBox>}
      {message && <p className="text-sm text-[#1E7A4C]">{message}</p>}

      <section className="grid gap-4 border border-[#D9E1EC] bg-white p-5 md:grid-cols-2">
        <h2 className="text-base font-bold md:col-span-2">Trang cửa hàng</h2>
        <Field label="Tiêu đề banner quảng cáo"><input className={inputCls} value={copy.shop.adTitle} onChange={(e) => setShop("adTitle", e.target.value)} /></Field>
        <Field label="Chữ trên nút"><input className={inputCls} value={copy.shop.adCta} onChange={(e) => setShop("adCta", e.target.value)} /></Field>
        <Field label="Mô tả banner quảng cáo" className="md:col-span-2"><input className={inputCls} value={copy.shop.adText} onChange={(e) => setShop("adText", e.target.value)} /></Field>
        <Field label="Tiêu đề mục dịch vụ" hint="Để trống thì ẩn tiêu đề mục."><input className={inputCls} value={copy.shop.servicesHeading} onChange={(e) => setShop("servicesHeading", e.target.value)} /></Field>
      </section>

      <section className="grid gap-4 border border-[#D9E1EC] bg-white p-5 md:grid-cols-2">
        <h2 className="text-base font-bold md:col-span-2">Trang dịch vụ</h2>
        <Field label="Tiêu đề đầu trang"><input className={inputCls} value={copy.services.heroTitle} onChange={(e) => setSvc("heroTitle", e.target.value)} /></Field>
        <Field label="Mô tả đầu trang"><input className={inputCls} value={copy.services.heroDescription} onChange={(e) => setSvc("heroDescription", e.target.value)} /></Field>
        <Field label="Banner tư vấn — tiêu đề"><input className={inputCls} value={copy.services.adTitle} onChange={(e) => setSvc("adTitle", e.target.value)} /></Field>
        <Field label="Banner tư vấn — chữ nút"><input className={inputCls} value={copy.services.adCta} onChange={(e) => setSvc("adCta", e.target.value)} /></Field>
        <Field label="Banner tư vấn — mô tả" className="md:col-span-2"><input className={inputCls} value={copy.services.adText} onChange={(e) => setSvc("adText", e.target.value)} /></Field>
        <Field label="Khối cuối trang — tiêu đề"><input className={inputCls} value={copy.services.ctaTitle} onChange={(e) => setSvc("ctaTitle", e.target.value)} /></Field>
        <Field label="Khối cuối trang — nút"><input className={inputCls} value={copy.services.ctaButton} onChange={(e) => setSvc("ctaButton", e.target.value)} /></Field>
        <Field label="Khối cuối trang — mô tả" className="md:col-span-2"><input className={inputCls} value={copy.services.ctaText} onChange={(e) => setSvc("ctaText", e.target.value)} /></Field>
      </section>

      <div className="flex justify-end">
        <button type="button" className={btnCls} disabled={saving} onClick={() => save(copy)}>{saving ? "Đang lưu…" : "Lưu chữ trang"}</button>
      </div>
    </div>
  );
}
