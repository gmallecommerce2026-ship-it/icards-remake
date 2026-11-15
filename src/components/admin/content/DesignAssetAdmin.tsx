"use client";

// Tab "Tài nguyên thiết kế": phông chữ, bảng màu, hình nền, phần tử (hình khối / đồ hoạ / 3D), khung và lưới.
// Các mục có sẵn trong mã nguồn FE vẫn hiển thị trong trình thiết kế; dữ liệu ở đây được BỔ SUNG vào.
import { useEffect, useState } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import {
  getAdminDesignAssets,
  saveAdminDesignAssets,
  uploadAdminDesignAsset,
  type DesignAssetsData,
  type DesignBackdropItem,
  type DesignCategory,
  type DesignElementItem,
} from "@/lib/api/admin";
import { ErrorBox, PageTitle, btnCls, btnGhostCls, errorMessage, inputCls } from "@/components/admin/ui";
import { toSlug } from "./forms";

const TYPES: { value: DesignBackdropItem["type"]; label: string }[] = [
  { value: "color", label: "Màu" },
  { value: "gradient", label: "Gradient" },
  { value: "image", label: "Ảnh" },
];
const TONE_FILL: Record<string, string> = { main: "currentColor", light: "#ffffff", dark: "#000000", white: "#ffffff" };
const TONE_OPACITY: Record<string, number> = { light: 0.35, dark: 0.22 };
const HEX = /^#[0-9a-fA-F]{6}$/;
const EMPTY: DesignAssetsData = { fonts: [], colors: [], backdrops: [], elements: [], frames: [], grids: [] };

/** Mã mục: lấy từ tên, thêm số nếu trùng. */
function nextId(base: string, taken: string[]) {
  const root = toSlug(base) || "muc";
  if (!taken.includes(root)) return root;
  let i = 2;
  while (taken.includes(`${root}-${i}`)) i++;
  return `${root}-${i}`;
}

function ElementThumb({ e }: { e: DesignElementItem }) {
  return (
    <svg viewBox="0 0 100 100" width="40" height="40" aria-hidden style={{ color: e.color }} className="shrink-0 rounded bg-[#F4F6FA] ring-1 ring-black/10">
      {e.parts.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={e.stroke ? "none" : TONE_FILL[p.tone ?? "main"]}
          fillOpacity={e.stroke ? undefined : TONE_OPACITY[p.tone ?? "main"]}
          stroke={e.stroke ? "currentColor" : undefined}
          strokeWidth={e.stroke ? 6 : undefined}
          strokeLinecap={e.stroke ? "round" : undefined}
        />
      ))}
    </svg>
  );
}

export default function DesignAssetAdmin() {
  const [data, setData] = useState<DesignAssetsData>(EMPTY);
  const [saved, setSaved] = useState<DesignAssetsData>(EMPTY);
  const [categories, setCategories] = useState<DesignCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fontName, setFontName] = useState("");

  useEffect(() => {
    let alive = true;
    getAdminDesignAssets()
      .then((r) => {
        if (!alive) return;
        const { categories: cats, ...rest } = r.data;
        setData(rest);
        setSaved(rest);
        setCategories(cats ?? []);
      })
      .catch((e) => alive && setError(errorMessage(e, "Không tải được tài nguyên thiết kế.")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const dirty = JSON.stringify(data) !== JSON.stringify(saved);

  const save = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const r = await saveAdminDesignAssets(data);
      setData(r.data);
      setSaved(r.data);
      setMessage("Đã lưu tài nguyên thiết kế.");
    } catch (e) {
      setError(errorMessage(e, "Dữ liệu chưa hợp lệ, kiểm tra lại tên, mã, màu và hình nền."));
    } finally {
      setBusy(false);
    }
  };

  /* ----- Phông chữ ----- */
  const addFont = () => {
    const name = fontName.trim();
    if (!name) return;
    setData((d) => ({ ...d, fonts: [...d.fonts, { id: nextId(name, d.fonts.map((f) => f.id)), name }] }));
    setFontName("");
  };

  /* ----- Màu ----- */
  const addColor = () => setData((d) => ({ ...d, colors: [...d.colors, "#c9a24a"] }));
  const setColor = (i: number, v: string) => setData((d) => ({ ...d, colors: d.colors.map((c, k) => (k === i ? v : c)) }));

  /* ----- Hình nền ----- */
  const addBackdrop = () =>
    setData((d) => ({
      ...d,
      backdrops: [...d.backdrops, { id: nextId("nen", d.backdrops.map((b) => b.id)), name: "Hình nền mới", type: "color", value: "#fffaf0" }],
    }));
  const setBackdrop = (i: number, patch: Partial<DesignBackdropItem>) =>
    setData((d) => ({ ...d, backdrops: d.backdrops.map((b, k) => (k === i ? { ...b, ...patch } : b)) }));

  const uploadImage = async (i: number, file: File | undefined) => {
    if (!file) return;
    const id = data.backdrops[i]?.id ?? String(i);
    setUploadingId(id);
    setError("");
    try {
      const r = await uploadAdminDesignAsset(file);
      setBackdrop(i, { type: "image", value: r.data.url });
    } catch (e) {
      setError(errorMessage(e, "Chưa tải được ảnh nền lên."));
    } finally {
      setUploadingId(null);
    }
  };

  const valueCell = (b: DesignBackdropItem, i: number) => {
    if (b.type === "color") {
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={HEX.test(b.value) ? b.value : "#ffffff"}
            onChange={(ev) => setBackdrop(i, { value: ev.target.value })}
            className="h-10 w-12 cursor-pointer rounded border border-[#C5D0DE] bg-white p-1"
            aria-label="Chọn màu nền"
          />
          <input className={`${inputCls} w-full`} value={b.value} onChange={(ev) => setBackdrop(i, { value: ev.target.value })} aria-label="Mã màu nền" />
        </div>
      );
    }
    if (b.type === "gradient") {
      return <input className={`${inputCls} w-full`} placeholder="linear-gradient(135deg,#ffb347,#ff5e62)" value={b.value} onChange={(ev) => setBackdrop(i, { value: ev.target.value })} aria-label="Gradient CSS" />;
    }
    return (
      <div className="flex items-center gap-2">
        <span className="size-10 shrink-0 rounded-md ring-1 ring-black/10" style={{ background: b.type === "image" ? `url("${b.value}") center / cover` : b.value }} aria-hidden />
        <label className={`${btnGhostCls} cursor-pointer`}>
          <ImagePlus className="mr-1 size-3.5" aria-hidden />
          {uploadingId === b.id ? "Đang tải…" : b.value ? "Đổi ảnh" : "Tải ảnh"}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={uploadingId !== null} onChange={(ev) => uploadImage(i, ev.target.files?.[0])} />
        </label>
      </div>
    );
  };

  /* ----- Thống kê theo danh mục Canva ----- */
  const countOf = (id: string) => {
    if (id === "shape" || id === "graphic" || id === "3d") return data.elements.filter((e) => e.category === id).length;
    if (id === "frame") return data.frames.length;
    if (id === "grid") return data.grids.length;
    return 0;
  };

  return (
    <div>
      <PageTitle
        title="Tài nguyên thiết kế"
        description="Phông chữ, bảng màu, hình nền, phần tử, khung và lưới bổ sung cho trình thiết kế. Các mục này xuất hiện cùng mục có sẵn trong studio và trình thiết kế mẫu."
        action={
          <button type="button" className={btnCls} onClick={save} disabled={busy || loading || !dirty}>
            {busy ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        }
      />
      {error && <ErrorBox>{error}</ErrorBox>}
      {message && <p className="mb-4 rounded-md bg-[#E7F5EC] px-4 py-3 text-sm text-[#1F7A3D]">{message}</p>}
      {loading && <p className="text-sm text-[#5B6B7F]">Đang tải…</p>}

      {!loading && (
        <>
          {/* Danh mục */}
          {categories.length > 0 && (
            <section className="mb-8 rounded-md border border-[#D9E1EC] bg-white p-5">
              <h2 className="mb-1 text-base font-semibold">Danh mục</h2>
              <p className="mb-4 text-xs text-[#5B6B7F]">Các mục chưa có nội dung (Ảnh, Video, Âm thanh, Biểu đồ, Hiệu ứng động, Mockup) cần tải tài nguyên hoặc tính năng riêng.</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const n = countOf(c.id);
                  return (
                    <span key={c.id} className={`rounded-full px-3 py-1 text-xs font-medium ${n ? "bg-[#E7F5EC] text-[#1F7A3D]" : "bg-[#F1F3F7] text-[#5B6B7F]"}`}>
                      {c.label} · {n}
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {/* Phông chữ */}
          <section className="mb-8 rounded-md border border-[#D9E1EC] bg-white p-5">
            <h2 className="mb-1 text-base font-semibold">Phông chữ</h2>
            <p className="mb-4 text-xs text-[#5B6B7F]">Nhập đúng tên phông trên Google Fonts (vd: Cormorant Garamond). Tên này cũng là tên phông hiển thị trong thiệp.</p>
            <div className="mb-4 flex gap-2">
              <input className={`${inputCls} w-full max-w-sm`} placeholder="Tên phông trên Google Fonts" value={fontName} onChange={(ev) => setFontName(ev.target.value)} onKeyDown={(ev) => ev.key === "Enter" && addFont()} aria-label="Tên phông mới" />
              <button type="button" className={btnGhostCls} onClick={addFont} disabled={!fontName.trim()}>
                <Plus className="mr-1 size-3.5" aria-hidden /> Thêm phông
              </button>
            </div>
            {data.fonts.length === 0 && <p className="text-sm text-[#5B6B7F]">Chưa có phông bổ sung.</p>}
            <div className="space-y-2">
              {data.fonts.map((f, i) => (
                <div key={f.id} className="flex items-center gap-3">
                  <span className="w-56 truncate text-lg" style={{ fontFamily: `'${f.name}', sans-serif` }}>{f.name}</span>
                  <span className="text-xs text-[#5B6B7F]">{f.id}</span>
                  <button type="button" className="ml-auto grid size-9 place-items-center rounded-md text-[#A33B3B] hover:bg-[#FBEAEA]" aria-label={`Xóa phông ${f.name}`} onClick={() => setData((d) => ({ ...d, fonts: d.fonts.filter((_, k) => k !== i) }))}>
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Bảng màu */}
          <section className="mb-8 rounded-md border border-[#D9E1EC] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Bảng màu</h2>
                <p className="text-xs text-[#5B6B7F]">Màu bổ sung cho bảng chọn màu chữ và màu nền.</p>
              </div>
              <button type="button" className={btnGhostCls} onClick={addColor}>
                <Plus className="mr-1 size-3.5" aria-hidden /> Thêm màu
              </button>
            </div>
            {data.colors.length === 0 && <p className="text-sm text-[#5B6B7F]">Chưa có màu bổ sung.</p>}
            <div className="space-y-2">
              {data.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="color" value={HEX.test(c) ? c : "#ffffff"} onChange={(ev) => setColor(i, ev.target.value)} className="h-10 w-12 cursor-pointer rounded border border-[#C5D0DE] bg-white p-1" aria-label="Chọn màu" />
                  <input className={`${inputCls} w-40`} value={c} onChange={(ev) => setColor(i, ev.target.value)} aria-label="Mã màu" />
                  <button type="button" className="grid size-9 place-items-center rounded-md text-[#A33B3B] hover:bg-[#FBEAEA]" aria-label="Xóa màu" onClick={() => setData((d) => ({ ...d, colors: d.colors.filter((_, k) => k !== i) }))}>
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Hình nền */}
          <section className="mb-8 rounded-md border border-[#D9E1EC] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Hình nền</h2>
                <p className="text-xs text-[#5B6B7F]">Màu, gradient CSS hoặc ảnh tải lên.</p>
              </div>
              <button type="button" className={btnGhostCls} onClick={addBackdrop}>
                <Plus className="mr-1 size-3.5" aria-hidden /> Thêm hình nền
              </button>
            </div>
            {data.backdrops.length === 0 && <p className="text-sm text-[#5B6B7F]">Chưa có hình nền bổ sung.</p>}
            <div className="space-y-3">
              {data.backdrops.map((b, i) => (
                <div key={b.id} className="grid items-center gap-2 md:grid-cols-[1fr_120px_2fr_40px]">
                  <input className={inputCls} value={b.name} onChange={(ev) => setBackdrop(i, { name: ev.target.value })} placeholder="Tên hiển thị" aria-label="Tên hình nền" />
                  <select className={inputCls} value={b.type} onChange={(ev) => setBackdrop(i, { type: ev.target.value as DesignBackdropItem["type"], value: ev.target.value === "color" ? "#fffaf0" : "" })} aria-label="Loại hình nền">
                    {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  {valueCell(b, i)}
                  <button type="button" className="grid size-9 place-items-center rounded-md text-[#A33B3B] hover:bg-[#FBEAEA]" aria-label="Xóa hình nền" onClick={() => setData((d) => ({ ...d, backdrops: d.backdrops.filter((_, k) => k !== i) }))}>
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Phần tử */}
          <section className="mb-8 rounded-md border border-[#D9E1EC] bg-white p-5">
            <h2 className="mb-1 text-base font-semibold">Phần tử · Hình khối, Đồ họa, 3D</h2>
            <p className="mb-4 text-xs text-[#5B6B7F]">Sửa nội dung phần tử bằng cách cập nhật seed và chạy lại seed. Ở đây có thể xóa các mục không dùng nữa.</p>
            {data.elements.length === 0 && <p className="text-sm text-[#5B6B7F]">Chưa có phần tử bổ sung.</p>}
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {data.elements.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-md border border-[#EEF2F7] p-2">
                  <ElementThumb e={e} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.name}</p>
                    <p className="truncate text-xs text-[#5B6B7F]">{e.group}</p>
                  </div>
                  <button type="button" className="grid size-9 place-items-center rounded-md text-[#A33B3B] hover:bg-[#FBEAEA]" aria-label={`Xóa ${e.name}`} onClick={() => setData((d) => ({ ...d, elements: d.elements.filter((x) => x.id !== e.id) }))}>
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Khung */}
          <section className="mb-8 rounded-md border border-[#D9E1EC] bg-white p-5">
            <h2 className="mb-1 text-base font-semibold">Khung</h2>
            <p className="mb-4 text-xs text-[#5B6B7F]">Khung ảnh bổ sung cho trình thiết kế.</p>
            <div className="flex flex-wrap gap-2">
              {data.frames.map((f) => (
                <span key={f.id} className="inline-flex items-center gap-2 rounded-md border border-[#EEF2F7] py-1 pl-3 pr-1 text-sm">
                  {f.name} <span className="text-xs text-[#5B6B7F]">{f.ratio}</span>
                  <button type="button" className="grid size-7 place-items-center rounded text-[#A33B3B] hover:bg-[#FBEAEA]" aria-label={`Xóa khung ${f.name}`} onClick={() => setData((d) => ({ ...d, frames: d.frames.filter((x) => x.id !== f.id) }))}>
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </span>
              ))}
            </div>
          </section>

          {/* Lưới */}
          <section className="mb-8 rounded-md border border-[#D9E1EC] bg-white p-5">
            <h2 className="mb-1 text-base font-semibold">Lưới</h2>
            <p className="mb-4 text-xs text-[#5B6B7F]">Bố cục nhiều ô ảnh bổ sung cho trình thiết kế.</p>
            <div className="flex flex-wrap gap-2">
              {data.grids.map((g) => (
                <span key={g.id} className="inline-flex items-center gap-2 rounded-md border border-[#EEF2F7] py-1 pl-3 pr-1 text-sm">
                  {g.name} <span className="text-xs text-[#5B6B7F]">{g.cells.length} ô</span>
                  <button type="button" className="grid size-7 place-items-center rounded text-[#A33B3B] hover:bg-[#FBEAEA]" aria-label={`Xóa lưới ${g.name}`} onClick={() => setData((d) => ({ ...d, grids: d.grids.filter((x) => x.id !== g.id) }))}>
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </span>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
