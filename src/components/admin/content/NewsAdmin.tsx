"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import * as adminApi from "@/lib/api/admin";
import type { AdminPost, AdminPostBlock } from "@/lib/api/admin";
import { api } from "@/lib/api/http";
import { ErrorBox, PageTitle, btnCls, btnGhostCls, errorMessage, inputCls } from "@/components/admin/ui";
import { Field, Toggle, RowActions, moveItem, areaCls, linesToArray, arrayToLines, toSlug } from "./forms";
import { usePageCopy } from "./usePageCopy";

type Cat = { slug: string; label: string };
type Tab = "posts" | "categories" | "copy";

/* Tin tức: bài viết cho trang /blog, chuyên mục và chữ trang blog. */
export default function NewsAdmin() {
  const [tab, setTab] = useState<Tab>("posts");
  const tabs: { id: Tab; label: string }[] = [
    { id: "posts", label: "Bài viết" },
    { id: "categories", label: "Chuyên mục" },
    { id: "copy", label: "Chữ trang" },
  ];
  return (
    <>
      <PageTitle
        title="Tin tức"
        description="Bài viết, chuyên mục và nội dung hiển thị trên trang Tin tức (blog)."
        action={
          <a href="/blog" target="_blank" rel="noreferrer" className={btnGhostCls}>
            <ExternalLink className="mr-1.5 size-3.5" />
            Xem trang tin tức
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
      {tab === "posts" && <PostsTab />}
      {tab === "categories" && <CategoriesTab />}
      {tab === "copy" && <BlogCopyTab />}
    </>
  );
}

/* ---------------- Chuyên mục ---------------- */

function CategoriesTab() {
  const [cats, setCats] = useState<Cat[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Cat[]>("/public/content/blog.categories").then(({ data }) => setCats(Array.isArray(data) ? data : [])).catch(() => setCats([]));
  }, []);

  if (!cats) return <p className="text-sm text-[#5B6B7F]">Đang tải…</p>;

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const { data } = await adminApi.saveAdminBlogCategories(cats.filter((c) => c.label.trim()));
      setCats(data.categories);
      setMessage("Đã lưu chuyên mục.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 max-w-3xl">
      {error && <ErrorBox>{error}</ErrorBox>}
      {message && <p className="text-sm text-[#1E7A4C]">{message}</p>}
      <p className="text-sm text-[#5B6B7F]">Mỗi bài viết thuộc một chuyên mục. Đường dẫn được tạo tự động từ tên.</p>
      {cats.map((c, i) => (
        <div key={i} className="grid gap-2 border border-[#D9E1EC] bg-white p-3 md:grid-cols-[1fr_1fr_auto] md:items-center">
          <input className={inputCls} aria-label="Tên chuyên mục" value={c.label} onChange={(e) => setCats(cats.map((x, k) => (k === i ? { label: e.target.value, slug: toSlug(e.target.value) || x.slug } : x)))} />
          <span className="text-xs text-[#5B6B7F]">/blog?category={c.slug}</span>
          <RowActions index={i} count={cats.length} onMove={(d) => setCats(moveItem(cats, i, d))} onRemove={() => setCats(cats.filter((_, k) => k !== i))} />
        </div>
      ))}
      <div className="flex flex-wrap justify-between gap-3">
        <button type="button" className={btnGhostCls} onClick={() => setCats([...cats, { slug: "", label: "" }])}><Plus className="mr-1.5 size-3.5" />Thêm chuyên mục</button>
        <button type="button" className={btnCls} disabled={saving} onClick={save}>{saving ? "Đang lưu…" : "Lưu chuyên mục"}</button>
      </div>
    </div>
  );
}

/* ---------------- Bài viết ---------------- */

const emptyPost = (): Omit<AdminPost, "_id"> => ({
  slug: "", title: "", excerpt: "", category: "", publishedOn: new Date().toISOString().slice(0, 10), readMinutes: 5, author: "",
  tone: { bg: "#FFFFFF", ink: "#0E1B2C" }, content: [{ t: "p", text: "" }], isPublished: false,
});

function PostsTab() {
  const [list, setList] = useState<AdminPost[] | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [editing, setEditing] = useState<AdminPost | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => adminApi.getAdminPosts().then(({ data }) => setList(data)).catch((e) => setError(errorMessage(e)));
  useEffect(() => {
    load();
    api.get<Cat[]>("/public/content/blog.categories").then(({ data }) => setCats(Array.isArray(data) ? data : [])).catch(() => setCats([]));
  }, []);

  const remove = async (p: AdminPost) => {
    if (!window.confirm(`Xoá bài "${p.title}"?`)) return;
    try { await adminApi.deleteAdminPost(p._id); load(); } catch (e) { setError(errorMessage(e)); }
  };

  if (editing) return <PostForm initial={editing === "new" ? null : editing} cats={cats} onBack={() => { setEditing(null); load(); }} />;

  return (
    <div className="grid gap-4">
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="flex justify-end">
        <button type="button" className={btnCls} onClick={() => setEditing("new")}><Plus className="mr-1.5 size-4" />Viết bài mới</button>
      </div>
      {list === null ? <p className="text-sm text-[#5B6B7F]">Đang tải…</p> : list.length === 0 ? <p className="text-sm text-[#5B6B7F]">Chưa có bài viết nào.</p> : (
        <div className="overflow-x-auto border border-[#D9E1EC] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F3F6FA] text-left text-xs uppercase tracking-[0.08em] text-[#5B6B7F]">
              <tr><th className="p-3">Bài viết</th><th className="p-3">Chuyên mục</th><th className="p-3">Ngày đăng</th><th className="p-3">Trạng thái</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p._id} className="border-t border-[#E3E9F2]">
                  <td className="p-3"><p className="font-semibold">{p.title}</p><p className="text-xs text-[#5B6B7F]">/blog/{p.slug}</p></td>
                  <td className="p-3">{cats.find((c) => c.slug === p.category)?.label ?? p.category ?? "—"}</td>
                  <td className="p-3">{p.publishedOn || "—"}</td>
                  <td className="p-3">{p.isPublished ? "Đã đăng" : <span className="text-[#8A5A00]">Bản nháp</span>}</td>
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

const BLOCK_LABEL: Record<AdminPostBlock["t"], string> = { h2: "Tiêu đề mục", p: "Đoạn văn", tip: "Mẹo / lưu ý", ul: "Danh sách" };

function PostForm({ initial, cats, onBack }: { initial: AdminPost | null; cats: Cat[]; onBack: () => void }) {
  const [form, setForm] = useState<Omit<AdminPost, "_id">>(() => (initial ? { ...initial } : emptyPost()));
  const [autoSlug, setAutoSlug] = useState(!initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const setBlock = (i: number, b: AdminPostBlock) => set("content", form.content.map((x, k) => (k === i ? b : x)));
  const changeType = (i: number, t: AdminPostBlock["t"]) => {
    const old = form.content[i];
    const text = old.t === "ul" ? old.items.join(" ") : old.text;
    setBlock(i, t === "ul" ? { t, items: text ? [text] : [] } : { t, text });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      if (initial) await adminApi.updateAdminPost(initial._id, form);
      else await adminApi.createAdminPost(form);
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
        <button type="button" className={btnCls} disabled={saving} onClick={save}>{saving ? "Đang lưu…" : "Lưu bài viết"}</button>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}

      <section className="grid gap-4 border border-[#D9E1EC] bg-white p-5 md:grid-cols-2">
        <Field label="Tiêu đề">
          <input className={inputCls} value={form.title} onChange={(e) => {
            const title = e.target.value;
            setForm((f) => ({ ...f, title, slug: autoSlug ? toSlug(title) : f.slug }));
          }} />
        </Field>
        <Field label="Đường dẫn (slug)"><input className={inputCls} value={form.slug} onChange={(e) => { setAutoSlug(false); set("slug", toSlug(e.target.value) || e.target.value); }} /></Field>
        <Field label="Tóm tắt" className="md:col-span-2"><textarea rows={2} className={areaCls} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></Field>
        <Field label="Chuyên mục">
          <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
            <option value="">— Chưa chọn —</option>
            {cats.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Tác giả"><input className={inputCls} value={form.author} onChange={(e) => set("author", e.target.value)} /></Field>
        <Field label="Ngày đăng"><input type="date" className={inputCls} value={form.publishedOn} onChange={(e) => set("publishedOn", e.target.value)} /></Field>
        <Field label="Thời gian đọc (phút)"><input type="number" min={0} className={inputCls} value={form.readMinutes} onChange={(e) => set("readMinutes", Number(e.target.value))} /></Field>
        <div className="grid gap-2">
          <span className="text-sm font-medium">Màu nền / màu chữ</span>
          <div className="flex gap-3">
            <input type="color" aria-label="Màu nền" value={form.tone.bg} onChange={(e) => set("tone", { ...form.tone, bg: e.target.value })} className="size-10 cursor-pointer border border-[#C5D0DE]" />
            <input type="color" aria-label="Màu chữ" value={form.tone.ink} onChange={(e) => set("tone", { ...form.tone, ink: e.target.value })} className="size-10 cursor-pointer border border-[#C5D0DE]" />
          </div>
        </div>
        <div className="md:col-span-2"><Toggle checked={form.isPublished} onChange={(v) => set("isPublished", v)} label="Đăng bài (hiển thị trên web)" /></div>
      </section>

      <section className="grid gap-3 border border-[#D9E1EC] bg-white p-5">
        <h2 className="text-base font-bold">Nội dung bài</h2>
        {form.content.map((b, i) => (
          <div key={i} className="grid gap-2 border border-[#E3E9F2] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <select className={inputCls} aria-label="Loại khối" value={b.t} onChange={(e) => changeType(i, e.target.value as AdminPostBlock["t"])}>
                {(Object.keys(BLOCK_LABEL) as AdminPostBlock["t"][]).map((t) => <option key={t} value={t}>{BLOCK_LABEL[t]}</option>)}
              </select>
              <RowActions index={i} count={form.content.length} onMove={(d) => set("content", moveItem(form.content, i, d))} onRemove={() => set("content", form.content.filter((_, k) => k !== i))} />
            </div>
            {b.t === "ul" ? (
              <textarea rows={3} className={areaCls} aria-label="Các mục danh sách" placeholder="Mỗi dòng một mục" value={arrayToLines(b.items)} onChange={(e) => setBlock(i, { t: "ul", items: linesToArray(e.target.value) })} />
            ) : (
              <textarea rows={b.t === "h2" ? 1 : 3} className={areaCls} aria-label="Nội dung khối" value={b.text} onChange={(e) => setBlock(i, { t: b.t, text: e.target.value })} />
            )}
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(BLOCK_LABEL) as AdminPostBlock["t"][]).map((t) => (
            <button key={t} type="button" className={btnGhostCls} onClick={() => set("content", [...form.content, t === "ul" ? { t, items: [""] } : { t, text: "" }])}>
              <Plus className="mr-1.5 size-3.5" />{BLOCK_LABEL[t]}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Chữ trang blog ---------------- */

type KwGroup = { title: string; items: { keyword: string; blurb: string }[] };

function BlogCopyTab() {
  const { copy, setCopy, save, saving, error, message } = usePageCopy();
  if (!copy) return error ? <ErrorBox>{error}</ErrorBox> : <p className="text-sm text-[#5B6B7F]">Đang tải…</p>;

  const setBlog = (k: "eyebrow" | "title" | "description" | "searchPlaceholder" | "footerTagline", v: string) =>
    setCopy({ ...copy, blog: { ...copy.blog, [k]: v } });
  const groups = copy.blog.keywordGroups;
  const setGroups = (next: KwGroup[]) => setCopy({ ...copy, blog: { ...copy.blog, keywordGroups: next } });
  const setGroup = (gi: number, patch: Partial<KwGroup>) => setGroups(groups.map((g, k) => (k === gi ? { ...g, ...patch } : g)));
  const setItem = (gi: number, ii: number, patch: Partial<{ keyword: string; blurb: string }>) =>
    setGroup(gi, { items: groups[gi].items.map((it, k) => (k === ii ? { ...it, ...patch } : it)) });

  return (
    <div className="grid gap-6">
      {error && <ErrorBox>{error}</ErrorBox>}
      {message && <p className="text-sm text-[#1E7A4C]">{message}</p>}

      <section className="grid gap-4 border border-[#D9E1EC] bg-white p-5 md:grid-cols-2">
        <h2 className="text-base font-bold md:col-span-2">Đầu trang và chân trang</h2>
        <Field label="Nhãn nhỏ phía trên"><input className={inputCls} value={copy.blog.eyebrow} onChange={(e) => setBlog("eyebrow", e.target.value)} /></Field>
        <Field label="Tiêu đề đầu trang"><input className={inputCls} value={copy.blog.title} onChange={(e) => setBlog("title", e.target.value)} /></Field>
        <Field label="Mô tả đầu trang" className="md:col-span-2"><input className={inputCls} value={copy.blog.description} onChange={(e) => setBlog("description", e.target.value)} /></Field>
        <Field label="Gợi ý trong ô tìm kiếm"><input className={inputCls} value={copy.blog.searchPlaceholder} onChange={(e) => setBlog("searchPlaceholder", e.target.value)} /></Field>
        <Field label="Lời giới thiệu chân trang"><input className={inputCls} value={copy.blog.footerTagline} onChange={(e) => setBlog("footerTagline", e.target.value)} /></Field>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-base font-bold">Từ khoá thường gặp</h2>
          <p className="text-sm text-[#5B6B7F]">Mỗi nhóm có nhiều từ khoá. Bấm từ khoá trên trang sẽ lọc bài viết theo từ đó. Chân trang hiện 8 từ khoá đầu tiên.</p>
        </div>
        {groups.map((g, gi) => (
          <div key={gi} className="grid gap-3 border border-[#D9E1EC] bg-white p-5">
            <div className="flex flex-wrap items-center gap-3">
              <input className={`${inputCls} min-w-[220px] flex-1 font-semibold`} aria-label="Tên nhóm" value={g.title} onChange={(e) => setGroup(gi, { title: e.target.value })} />
              <RowActions index={gi} count={groups.length} onMove={(d) => setGroups(moveItem(groups, gi, d))} onRemove={() => { if (window.confirm(`Xoá nhóm "${g.title}"?`)) setGroups(groups.filter((_, k) => k !== gi)); }} />
            </div>
            {g.items.map((it, ii) => (
              <div key={ii} className="grid gap-2 border-t border-[#E3E9F2] pt-3 md:grid-cols-[220px_1fr_auto] md:items-start">
                <input className={inputCls} aria-label="Từ khoá" value={it.keyword} onChange={(e) => setItem(gi, ii, { keyword: e.target.value })} />
                <input className={inputCls} aria-label="Mô tả từ khoá" value={it.blurb} onChange={(e) => setItem(gi, ii, { blurb: e.target.value })} />
                <RowActions
                  index={ii}
                  count={g.items.length}
                  onMove={(d) => setGroup(gi, { items: moveItem(g.items, ii, d) })}
                  onRemove={() => setGroup(gi, { items: g.items.filter((_, k) => k !== ii) })}
                />
              </div>
            ))}
            <div><button type="button" className={btnGhostCls} onClick={() => setGroup(gi, { items: [...g.items, { keyword: "", blurb: "" }] })}><Plus className="mr-1.5 size-3.5" />Thêm từ khoá</button></div>
          </div>
        ))}
        <div><button type="button" className={btnGhostCls} onClick={() => setGroups([...groups, { title: "Nhóm mới", items: [] }])}><Plus className="mr-1.5 size-3.5" />Thêm nhóm</button></div>
      </section>

      <div className="flex justify-end">
        <button type="button" className={btnCls} disabled={saving} onClick={() => save(copy)}>{saving ? "Đang lưu…" : "Lưu chữ trang tin tức"}</button>
      </div>
    </div>
  );
}
