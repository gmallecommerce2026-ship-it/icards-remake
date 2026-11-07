"use client";

import { useState, type FormEvent } from "react";
import { invitationsApi } from "@/lib/api";
import { errorText } from "@/lib/invitation-flow";
import { useInvitation, btnPrimary, card, input } from "./useInvitation";

export function SettingsForm({ id }: { id: string }) {
  const { inv, setInv, loading, error } = useInvitation(id);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  if (loading) return <p className="text-sm text-muted">Đang tải…</p>;
  if (error || !inv) return <p role="alert" className="text-sm text-red-700">{error || "Không tìm thấy thiệp."}</p>;
  const st = inv.settings;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const deadline = String(f.get("rsvpDeadline") ?? "");
    const body = {
      allowRsvp: f.get("allowRsvp") === "on",
      allowWishes: f.get("allowWishes") === "on",
      moderateWishes: f.get("moderateWishes") === "on",
      showGuestList: f.get("showGuestList") === "on",
      maxCompanions: Number(f.get("maxCompanions") ?? 0),
      rsvpDeadline: deadline ? new Date(deadline).toISOString() : undefined,
    };
    setSaving(true);
    setMsg("");
    try {
      const { data } = await invitationsApi.updateSettings(id, body);
      setInv({ ...inv!, settings: data });
      setMsg("Đã lưu cài đặt.");
    } catch (err) {
      setMsg(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  const check = (name: string, label: string, checked: boolean, hint?: string) => (
    <label className="flex items-start gap-3 py-2">
      <input type="checkbox" name={name} defaultChecked={checked} className="mt-1 h-4 w-4 accent-lacquer" />
      <span><span className="block text-sm font-medium text-ink">{label}</span>{hint && <span className="text-xs text-muted">{hint}</span>}</span>
    </label>
  );

  return (
    <form onSubmit={onSubmit} className={`${card} max-w-2xl space-y-2`}>
      {check("allowRsvp", "Cho phép khách xác nhận tham dự", st.allowRsvp)}
      {check("allowWishes", "Cho phép gửi lời chúc", st.allowWishes)}
      {check("moderateWishes", "Duyệt lời chúc trước khi hiển thị", st.moderateWishes, "Lời chúc chỉ hiện sau khi bạn duyệt")}
      {check("showGuestList", "Hiện danh sách khách đã xác nhận", st.showGuestList)}
      <label className="block py-2 text-sm font-medium text-ink">
        Số người đi kèm tối đa
        <input name="maxCompanions" type="number" min={0} max={20} defaultValue={st.maxCompanions} className={`${input} mt-1 w-32`} />
      </label>
      <label className="block py-2 text-sm font-medium text-ink">
        Hạn xác nhận tham dự
        <input name="rsvpDeadline" type="datetime-local" defaultValue={st.rsvpDeadline ? st.rsvpDeadline.slice(0, 16) : ""} className={`${input} mt-1 w-64`} />
      </label>
      <div className="flex items-center gap-3 pt-3">
        <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Đang lưu…" : "Lưu cài đặt"}</button>
        {msg && <span role="status" className="text-sm text-muted">{msg}</span>}
      </div>
    </form>
  );
}

