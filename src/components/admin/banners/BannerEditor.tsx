"use client";

import type { ReactNode } from "react";
import type { BannerItemData } from "@/lib/banner-groups";
import { ImageField } from "@/components/admin/ImageField";
import { inputCls, btnGhostCls } from "@/components/admin/ui";
import { isValidLink } from "./helpers";

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
      {error ? <span className="text-xs font-normal text-[#8E2B3B]">{error}</span> : hint && <span className="text-xs font-normal text-[#5B6B7F]">{hint}</span>}
    </label>
  );
}

/** Form sửa một banner. Ảnh bên trái, nội dung bên phải. Mọi trường đều không bắt buộc, trừ khi banner cần bấm được thì nên có liên kết. */
export function BannerEditor({
  banner: b,
  onChange,
  onRemove,
  moveTargets,
  onMove,
}: {
  banner: BannerItemData;
  onChange: (patch: Partial<BannerItemData>) => void;
  onRemove: () => void;
  /** Các nhóm khác cùng trang, để chuyển banner sang đó. */
  moveTargets: { id: string; name: string }[];
  onMove: (groupId: string) => void;
}) {
  return (
    <div className="grid gap-5 border-t border-[#E3E9F2] bg-[#FAFBFD] p-4 md:grid-cols-[1fr_1.2fr]">
      <ImageField label="Ảnh nền banner" value={b.imgSrc ?? ""} onChange={(url) => onChange({ imgSrc: url || null })} />

      <div className="grid content-start gap-3">
        <Field label="Tên nội bộ" hint="Chỉ để bạn nhận biết trong dashboard, không hiển thị ra ngoài.">
          <input className={inputCls} value={b.name} onChange={(e) => onChange({ name: e.target.value })} />
        </Field>
        <Field label="Nhãn nhỏ phía trên tiêu đề" hint="Ví dụ: Thiệp cưới, Ưu đãi. Có thể để trống.">
          <input className={inputCls} value={b.eyebrow ?? ""} onChange={(e) => onChange({ eyebrow: e.target.value })} />
        </Field>
        <Field label="Tiêu đề">
          <input className={inputCls} value={b.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
        </Field>
        <Field label="Mô tả ngắn">
          <textarea
            rows={2}
            className="rounded-md border border-[#C5D0DE] bg-white px-3 py-2 text-sm outline-none focus:border-[#27548A]"
            value={b.text ?? ""}
            onChange={(e) => onChange({ text: e.target.value })}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Chữ trên nút">
            <input className={inputCls} value={b.ctaLabel ?? ""} onChange={(e) => onChange({ ctaLabel: e.target.value })} />
          </Field>
          <Field
            label="Liên kết khi bấm"
            hint={!b.link ? "Để trống thì banner không bấm được." : undefined}
            error={isValidLink(b.link) ? undefined : "Phải bắt đầu bằng / hoặc https://"}
          >
            <input className={inputCls} placeholder="/templates" value={b.link ?? ""} onChange={(e) => onChange({ link: e.target.value })} />
          </Field>
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-[#E3E9F2] pt-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" className="size-4" checked={b.isEnabled} onChange={(e) => onChange({ isEnabled: e.target.checked })} />
            Bật banner này
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {moveTargets.length > 0 && (
              <label className="flex items-center gap-2 text-sm font-medium">
                Chuyển sang nhóm
                <select className={inputCls} value="" onChange={(e) => e.target.value && onMove(e.target.value)}>
                  <option value="">Chọn nhóm…</option>
                  {moveTargets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button type="button" className={`${btnGhostCls} text-[#8E2B3B]`} onClick={onRemove}>
              Xoá banner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
