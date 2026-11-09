"use client";

import { useState, type FormEvent } from "react";
import { invitationsApi } from "@/lib/api";
import { errorText, type ApiInvitation } from "@/lib/invitation-flow";
import { toDateInput } from "./shared";
import { useInvitation, btnPrimary, card, input } from "./useInvitation";

type Form = {
  title: string; description: string; salutationStyle: string; useGlobalSalutation: boolean;
  wishesTitle: string; wishesSubtitle: string; allowRsvp: boolean; allowWishes: boolean;
  moderateWishes: boolean; showGuestList: boolean; maxCompanions: number; rsvpDeadline: string;
};

function fromInvitation(inv: ApiInvitation): Form {
  const s = inv.settings as unknown as Record<string, unknown>;
  return {
    title: String(s.title ?? inv.title ?? ""),
    description: String(s.description ?? ""),
    salutationStyle: String(s.salutationStyle ?? "Thân gửi"),
    useGlobalSalutation: Boolean(s.useGlobalSalutation),
    wishesTitle: String(s.wishesTitle ?? "Sổ Lưu Bút"),
    wishesSubtitle: String(s.wishesSubtitle ?? "Hãy để lại những lời chúc tốt đẹp nhất dành cho chúng tôi nhé!"),
    allowRsvp: inv.settings.allowRsvp,
    allowWishes: inv.settings.allowWishes,
    moderateWishes: inv.settings.moderateWishes,
    showGuestList: inv.settings.showGuestList,
    maxCompanions: inv.settings.maxCompanions ?? 0,
    rsvpDeadline: toDateInput(inv.settings.rsvpDeadline),
  };
}

/** Cài đặt thiệp: email gửi khách, lời xưng hô, khu vực lời chúc, RSVP. */
export function SettingsForm({ id }: { id: string }) {
  const { inv, loading, error, reload } = useInvitation(id);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  if (loading) return <p className="text-sm text-muted">Đang tải…</p>;
  if (error || !inv) return <p role="alert" className="text-sm text-red-700">{error || "Không tìm thấy thiệp."}</p>;

  const f = form ?? fromInvitation(inv);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm({ ...f, [k]: v });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await invitationsApi.updateSettings(id, {
        ...f,
        maxCompanions: Number(f.maxCompanions),
        rsvpDeadline: f.rsvpDeadline ? new Date(f.rsvpDeadline).toISOString() : undefined,
      });
      setForm(null);
      await reload();
      setMsg("Đã lưu cài đặt.");
    } catch (err) {
      setMsg(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  const salutationHint = f.useGlobalSalutation
    ? `Áp dụng cho tất cả khách: “${f.salutationStyle} {TênKháchMời}”.`
    : `Ưu tiên lời xưng hô theo nhóm khách; nếu không có nhóm sẽ dùng “${f.salutationStyle} {TênKháchMời}”.`;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <section className={`${card} flex flex-col gap-4`}>
        <h3 className="font-semibold text-ink">Email gửi khách mời</h3>
        <p className="text-xs text-muted">Biến tự thay: {"{TênKháchMời}"}, {"{LờiXưngHô}"}, {"{EmailKháchMời}"}</p>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Chủ đề email<input className={input} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Tiêu đề thiệp (cũng là chủ đề email)" /></label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Nội dung<textarea className={`${input} h-auto py-2`} rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} /></label>
      </section>

      <section className={`${card} flex flex-col gap-4`}>
        <h3 className="font-semibold text-ink">Lời xưng hô</h3>
        <label className="flex flex-col gap-1.5 text-sm font-medium max-w-sm">Kiểu hiển thị
          <select className={input} value={f.salutationStyle} onChange={(e) => set("salutationStyle", e.target.value)}>
            <option>Thân gửi</option><option>Kính mời</option><option>Trân trọng kính mời</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.useGlobalSalutation} onChange={(e) => set("useGlobalSalutation", e.target.checked)} className="size-4" /> Dùng cài đặt này cho tất cả khách (ghi đè theo nhóm)</label>
        <p className="rounded-lg bg-porcelain p-3 text-sm text-muted">{salutationHint}</p>
      </section>

      <section className={`${card} flex flex-col gap-4`}>
        <h3 className="font-semibold text-ink">Khu vực lời chúc</h3>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Tiêu đề<input className={input} value={f.wishesTitle} onChange={(e) => set("wishesTitle", e.target.value)} /></label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Mô tả phụ<textarea className={`${input} h-auto py-2`} rows={2} value={f.wishesSubtitle} onChange={(e) => set("wishesSubtitle", e.target.value)} /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.allowWishes} onChange={(e) => set("allowWishes", e.target.checked)} className="size-4" /> Cho phép gửi lời chúc</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.moderateWishes} onChange={(e) => set("moderateWishes", e.target.checked)} className="size-4" /> Duyệt lời chúc trước khi hiện</label>
        </div>
      </section>

      <section className={`${card} flex flex-col gap-4`}>
        <h3 className="font-semibold text-ink">Xác nhận tham dự (RSVP)</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.allowRsvp} onChange={(e) => set("allowRsvp", e.target.checked)} className="size-4" /> Cho phép khách xác nhận</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.showGuestList} onChange={(e) => set("showGuestList", e.target.checked)} className="size-4" /> Hiện danh sách khách</label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">Số người đi cùng tối đa<input type="number" min={0} max={10} className={input} value={f.maxCompanions} onChange={(e) => set("maxCompanions", Number(e.target.value))} /></label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">Hạn xác nhận<input type="datetime-local" className={input} value={f.rsvpDeadline} onChange={(e) => set("rsvpDeadline", e.target.value)} /></label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Đang lưu…" : "Lưu thông tin"}</button>
        {msg && <p role="status" className="text-sm text-muted">{msg}</p>}
      </div>
    </form>
  );
}
