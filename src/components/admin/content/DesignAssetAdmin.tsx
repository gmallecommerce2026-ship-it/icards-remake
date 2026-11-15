"use client";

// Tab "Tài nguyên thiết kế": phông chữ, bảng màu và hình nền bổ sung cho trình thiết kế (studio và admin).
// Các mục có sẵn trong mã nguồn vẫn hiển thị trong trình thiết kế; ở đây chỉ thêm mục mới.
import { useEffect, useState } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import {
  getAdminDesignAssets,
  saveAdminDesignAssets,
  uploadAdminDesignAsset,
  type DesignAssetsData,
  type DesignBackdropItem,
} from "@/lib/api/admin";
import { ErrorBox, PageTitle, btnCls, btnGhostCls, errorMessage, inputCls } from "@/components/admin/ui";
import { toSlug } from "./forms";

const TYPES: { value: DesignBackdropItem["type"]; label: string }[] = [
  { value: "color", label: "Màu" },
  { value: "gradient", label: "Gradient" },
  { value: "image", label: "Ảnh" },
];
const HEX = /^#[0-9a-fA-F]{6}$/;

/** Mã mục: lấy từ tên, thêm số nếu trùng. */
function nextId(base: string, taken: string[]) {
  const root = toSlug(base) || "muc";
  if (!taken.includes(root)) return root;
  let i = 2;
  while (taken.includes(`${root}-${i}`)) i++;
  return `${root}-${i}`;
}

export default function DesignAssetAdmin() {
  const [data, setData] = useState<DesignAssetsData>({ fonts: [], colors: [], backdrops: [] });
  const [saved, setSaved] = useState<DesignAssetsData>({ fonts: [], colors: [], backdrops: [] });
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
        setData(r.data);
        setSaved(r.data);
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

  return (
    <div>
      <PageTitle
        title="Tài nguyên thiết kế"
        description="Phông chữ, bảng màu và hình nền bổ sung cho trình thiết kế. Các mục này xuất hiện cùng mục có sẵn trong studio và trình thiết kế mẫu."
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
        </>
      )}
    </div>
  );
}
