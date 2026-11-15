"use client";

import { useState } from "react";
import { uploadAdminImage } from "@/lib/api/admin";
import { errorMessage, inputCls, btnGhostCls } from "./ui";

/** Ô chọn ảnh: tải lên máy chủ rồi nhận URL. Có thể dán URL trực tiếp. */
export function ImageField({ value, onChange, label = "Ảnh" }: { value: string; onChange: (url: string) => void; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await uploadAdminImage(file);
      onChange(data.url);
    } catch (e) {
      setError(errorMessage(e, "Tải ảnh thất bại."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-28 w-full max-w-md border border-[#D9E1EC] object-cover" />
      ) : (
        <div className="grid h-28 w-full max-w-md place-items-center border border-dashed border-[#C5D0DE] text-xs text-[#5B6B7F]">Chưa có ảnh</div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label className={`${btnGhostCls} cursor-pointer`}>
          {busy ? "Đang tải…" : "Chọn ảnh"}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={busy} onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {value && (
          <button type="button" className={btnGhostCls} onClick={() => onChange("")}>Xoá ảnh</button>
        )}
      </div>
      <input className={`${inputCls} max-w-md`} placeholder="Hoặc dán đường dẫn ảnh (/… hoặc https://…)" value={value} onChange={(e) => onChange(e.target.value)} />
      {error && <p className="text-xs text-[#8E2B3B]">{error}</p>}
    </div>
  );
}
