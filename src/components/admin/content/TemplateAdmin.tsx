"use client";

// Tab "Thiết kế": tạo và chỉnh thông tin mẫu thiệp, bật/tắt đăng, mở trình thiết kế (studio dùng chung với website).
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, PenTool } from "lucide-react";
import {
  createAdminTemplate,
  getAdminTemplateCategories,
  getAdminTemplates,
  updateAdminTemplate,
  type AdminTemplate,
  type AdminTemplateCategory,
  type AdminTemplateInput,
} from "@/lib/api/admin";
import { ErrorBox, PageTitle, btnCls, btnGhostCls, errorMessage, inputCls } from "@/components/admin/ui";
import { Field, Toggle, areaCls, toSlug } from "./forms";

const CATEGORY_OPTIONS = [
  { value: "wedding", label: "Thiệp cưới" },
  { value: "birthday", label: "Sinh nhật" },
  { value: "baby", label: "Đầy tháng, thôi nôi" },
  { value: "event", label: "Sự kiện" },
];
const FORMAT_OPTIONS = [
  { value: "folding", label: "Thiệp gập" },
  { value: "card", label: "Thiệp 2 mặt" },
];
const ORIENTATION_OPTIONS = [
  { value: "portrait", label: "Dọc" },
  { value: "landscape", label: "Ngang" },
  { value: "square", label: "Vuông" },
];

type Form = {
  id: string | null;
  name: string;
  slug: string;
  slugTouched: boolean;
  category: string;
  categorySlug: string;
  tagline: string;
  description: string;
  price: number;
  format: "folding" | "card";
  orientation: "landscape" | "square" | "portrait";
  isPublished: boolean;
};

const emptyForm = (): Form => ({
  id: null, name: "", slug: "", slugTouched: false, category: "wedding", categorySlug: "",
  tagline: "", description: "", price: 0, format: "folding", orientation: "portrait", isPublished: false,
});

export default function TemplateAdmin() {
  const [list, setList] = useState<AdminTemplate[]>([]);
  const [categories, setCategories] = useState<AdminTemplateCategory[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [t, c] = await Promise.all([getAdminTemplates(), getAdminTemplateCategories()]);
      setList(t.data);
      setCategories(c.data);
    } catch (e) {
      setError(errorMessage(e, "Không tải được danh sách mẫu."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Tải dữ liệu từ API khi vào trang: đồng bộ với hệ thống bên ngoài, không phải cập nhật state dẫn xuất
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? list.filter((t) => `${t.name} ${t.slug} ${t.categoryPath ?? ""}`.toLowerCase().includes(s)) : list;
  }, [list, q]);

  const openEdit = (t: AdminTemplate) => {
    setForm({
      id: t._id, name: t.name, slug: t.slug, slugTouched: true, category: t.category,
      categorySlug: t.categorySlug ?? "", tagline: t.tagline, description: "", price: t.price,
      format: t.format, orientation: t.orientation, isPublished: t.isPublished,
    });
  };

  // Mô tả đầy đủ không có trong danh sách: lấy khi mở form sửa
  const openEditFull = async (t: AdminTemplate) => {
    openEdit(t);
    try {
      const { getAdminTemplate } = await import("@/lib/api/admin");
      const r = await getAdminTemplate(t._id);
      setForm((f) => (f && f.id === t._id ? { ...f, description: r.data.description ?? "" } : f));
    } catch {
      /* giữ form trống mô tả, người dùng vẫn sửa được phần còn lại */
    }
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setError("");
    const body: AdminTemplateInput = {
      name: form.name,
      slug: form.slug,
      category: form.category,
      categorySlug: form.categorySlug || null,
      tagline: form.tagline,
      description: form.description,
      price: Number(form.price) || 0,
      format: form.format,
      orientation: form.orientation,
      isPublished: form.isPublished,
    };
    try {
      if (form.id) await updateAdminTemplate(form.id, body);
      else await createAdminTemplate(body);
      setForm(null);
      await load();
    } catch (e) {
      setError(errorMessage(e, "Chưa lưu được mẫu."));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (t: AdminTemplate, value: boolean) => {
    setBusyId(t._id);
    try {
      await updateAdminTemplate(t._id, { isPublished: value });
      setList((rows) => rows.map((r) => (r._id === t._id ? { ...r, isPublished: value } : r)));
    } catch (e) {
      setError(errorMessage(e, "Không đổi được trạng thái đăng."));
    } finally {
      setBusyId(null);
    }
  };

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div>
      <PageTitle
        title="Thiết kế mẫu thiệp"
        description="Tạo mẫu, chỉnh thông tin và thiết kế trên cùng trình studio mà người dùng dùng. Mẫu chưa đăng thì không hiện trên website."
        action={
          <button type="button" className={btnCls} onClick={() => setForm(emptyForm())}>
            <Plus className="mr-1 size-4" aria-hidden /> Tạo mẫu mới
          </button>
        }
      />
      {error && <ErrorBox>{error}</ErrorBox>}

      {form && (
        <section className="mb-6 rounded-md border border-[#D9E1EC] bg-white p-5">
          <h2 className="mb-4 text-base font-semibold">{form.id ? "Sửa thông tin mẫu" : "Mẫu mới"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tên mẫu">
              <input className={inputCls} value={form.name} onChange={(e) => {
                const name = e.target.value;
                setForm((f) => (f ? { ...f, name, slug: f.slugTouched || f.id ? f.slug : toSlug(name) } : f));
              }} />
            </Field>
            <Field label="Mã (slug)" hint="Dùng trong địa chỉ /templates/<mã>. Chỉ chữ thường, số, gạch ngang.">
              <input className={inputCls} value={form.slug} onChange={(e) => setForm((f) => (f ? { ...f, slug: e.target.value, slugTouched: true } : f))} />
            </Field>
            <Field label="Loại thiệp">
              <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Nhóm trong danh mục" hint="Quyết định mẫu hiện ở nhóm nào trên trang Mẫu thiệp và menu.">
              <select className={inputCls} value={form.categorySlug} onChange={(e) => set("categorySlug", e.target.value)}>
                <option value="">— Chưa gán nhóm —</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.path}</option>)}
              </select>
            </Field>
            <Field label="Kiểu thiệp">
              <select className={inputCls} value={form.format} onChange={(e) => set("format", e.target.value as Form["format"])}>
                {FORMAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Kiểu dáng">
              <select className={inputCls} value={form.orientation} onChange={(e) => set("orientation", e.target.value as Form["orientation"])}>
                {ORIENTATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Giá (VND, 0 = miễn phí)">
              <input type="number" min={0} className={inputCls} value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
            </Field>
            <Field label="Đăng">
              <div className="flex h-10 items-center"><Toggle checked={form.isPublished} onChange={(v) => set("isPublished", v)} label={form.isPublished ? "Đang hiện trên web" : "Đang ẩn"} /></div>
            </Field>
            <Field label="Mô tả ngắn" className="md:col-span-2">
              <input className={inputCls} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </Field>
            <Field label="Mô tả" className="md:col-span-2">
              <textarea rows={3} className={areaCls} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="button" className={btnCls} onClick={save} disabled={saving || !form.name.trim() || !form.slug.trim()}>
              {saving ? "Đang lưu…" : "Lưu thông tin"}
            </button>
            <button type="button" className={btnGhostCls} onClick={() => setForm(null)}>Hủy</button>
          </div>
        </section>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input className={`${inputCls} w-full max-w-xs`} placeholder="Tìm theo tên, mã, nhóm…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm mẫu" />
        <span className="text-sm text-[#5B6B7F]">{shown.length} mẫu</span>
      </div>

      <div className="overflow-x-auto rounded-md border border-[#D9E1EC] bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-[#F1F5FA] text-left text-xs uppercase tracking-wide text-[#5B6B7F]">
            <tr>
              <th className="px-4 py-3">Mẫu</th>
              <th className="px-4 py-3">Nhóm</th>
              <th className="px-4 py-3">Kiểu</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Thiết kế</th>
              <th className="px-4 py-3">Hiện web</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-[#5B6B7F]">Đang tải…</td></tr>}
            {!loading && shown.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-[#5B6B7F]">Chưa có mẫu nào.</td></tr>}
            {shown.map((t) => (
              <tr key={t._id} className="border-t border-[#EEF2F7]">
                <td className="px-4 py-3">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-[#5B6B7F]">{t.slug}</p>
                </td>
                <td className="px-4 py-3 text-[#3B4A5C]">{t.categoryPath ?? <span className="text-[#B07A00]">Chưa gán nhóm</span>}</td>
                <td className="px-4 py-3 text-[#3B4A5C]">{t.format === "card" ? "2 mặt" : "Gập"} · {t.orientation === "landscape" ? "ngang" : t.orientation === "square" ? "vuông" : "dọc"}</td>
                <td className="px-4 py-3">{t.price === 0 ? "Miễn phí" : `${t.price.toLocaleString("vi-VN")}₫`}</td>
                <td className="px-4 py-3">
                  {t.hasDesign
                    ? <span className="rounded bg-[#E7F5EC] px-2 py-0.5 text-xs font-medium text-[#1F7A3D]">Đã thiết kế</span>
                    : <span className="rounded bg-[#FFF4DB] px-2 py-0.5 text-xs font-medium text-[#8A5A00]">Chưa thiết kế</span>}
                </td>
                <td className="px-4 py-3">
                  <Toggle checked={t.isPublished} onChange={(v) => togglePublish(t, v)} label={busyId === t._id ? "…" : t.isPublished ? "Hiện" : "Ẩn"} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button type="button" className={btnGhostCls} onClick={() => openEditFull(t)}>
                      <Pencil className="mr-1 size-3.5" aria-hidden /> Sửa
                    </button>
                    <Link href={`/template-designer?id=${t._id}`} className={`${btnCls} h-9 px-3 no-underline`}>
                      <PenTool className="mr-1 size-3.5" aria-hidden /> Thiết kế
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
