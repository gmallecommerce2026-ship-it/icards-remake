"use client";

import { useState } from "react";
import { invitationsApi } from "@/lib/api";
import { errorText } from "@/lib/invitation-flow";
import { asList, fmtDate, toDateInput } from "./shared";
import { useInvitation, btnGhost, btnPrimary, btnDanger, card, input } from "./useInvitation";

type Reminder = { id: string; daysBefore: number; isEnabled: boolean };

/** Quản lí sự kiện: thời gian diễn ra + lịch email nhắc nhở tự động. */
export function EventsPanel({ id }: { id: string }) {
  const { inv, loading, error, reload } = useInvitation(id);
  const [dateValue, setDateValue] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[] | null>(null);
  const [newDays, setNewDays] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  if (loading) return <p className="text-sm text-muted">Đang tải…</p>;
  if (error || !inv) return <p role="alert" className="text-sm text-red-700">{error || "Không tìm thấy thiệp."}</p>;

  const date = dateValue ?? toDateInput(inv.eventDate);
  const list: Reminder[] = reminders ?? asList<Reminder>((inv.settings as unknown as { emailReminders?: Reminder[] }).emailReminders);

  const sendDate = (days: number) => {
    if (!date) return null;
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return d;
  };

  function addReminder() {
    const days = Number(newDays);
    if (!Number.isInteger(days) || days <= 0) return setMsg("Số ngày phải là số nguyên dương.");
    if (list.some((r) => r.daysBefore === days)) return setMsg(`Đã có lịch nhắc trước ${days} ngày.`);
    const next = [...list, { id: Date.now().toString(), daysBefore: days, isEnabled: true }].sort((a, b) => b.daysBefore - a.daysBefore);
    setReminders(next);
    setNewDays("");
    setMsg("");
  }

  async function save() {
    if (!date) return setMsg("Vui lòng chọn thời gian diễn ra sự kiện.");
    setSaving(true);
    setMsg("");
    try {
      await invitationsApi.updateSettings(id, { eventDate: new Date(date).toISOString(), emailReminders: list });
      setDateValue(null);
      setReminders(null);
      await reload();
      setMsg("Đã lưu thiết lập sự kiện.");
    } catch (err) {
      setMsg(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  const eventDay = date ? new Date(date) : null;
  const active = list.filter((r) => r.isEnabled).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={card}><p className="text-xs uppercase text-muted">Ngày diễn ra</p><p className="mt-1 font-bold text-lacquer">{eventDay ? fmtDate(eventDay.toISOString()) : "Chưa đặt"}</p></div>
        <div className={card}><p className="text-xs uppercase text-muted">Lịch nhắc</p><p className="mt-1 font-bold text-lacquer">{list.length}</p></div>
        <div className={card}><p className="text-xs uppercase text-muted">Đang bật</p><p className="mt-1 font-bold text-lacquer">{active}</p></div>
      </div>

      <section className={`${card} flex flex-col gap-3`}>
        <h3 className="font-semibold text-ink">Thời gian diễn ra sự kiện <span className="text-red-600">*</span></h3>
        <p className="text-sm text-muted">Hệ thống dùng mốc này để tính ngày gửi email nhắc nhở cho khách mời.</p>
        <input type="datetime-local" value={date} onChange={(e) => setDateValue(e.target.value)} className={`${input} max-w-sm`} />
      </section>

      <section className={`${card} flex flex-col gap-4`}>
        <h3 className="font-semibold text-ink">Email nhắc nhở</h3>
        <div className="flex flex-wrap gap-2">
          <input type="number" min={1} value={newDays} onChange={(e) => setNewDays(e.target.value)} placeholder="Số ngày trước sự kiện (VD: 7)" className={`${input} max-w-xs`} />
          <button type="button" onClick={addReminder} className={btnPrimary}>Thêm lịch nhắc</button>
        </div>

        <ul className="divide-y divide-line rounded-lg border border-line">
          {list.map((r) => {
            const d = sendDate(r.daysBefore);
            const past = d ? d < new Date() : false;
            return (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className={`font-semibold ${r.isEnabled ? "text-emerald-700" : "text-muted"}`}>Nhắc trước {r.daysBefore} ngày</p>
                  <p className="text-sm text-muted">
                    Dự kiến gửi: {d ? <span className={past ? "text-red-600" : "text-ink"}>{fmtDate(d.toISOString())}{past ? " (đã qua)" : ""}</span> : "chọn ngày sự kiện trước"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className={btnGhost} onClick={() => setReminders(list.map((x) => (x.id === r.id ? { ...x, isEnabled: !x.isEnabled } : x)))}>
                    {r.isEnabled ? "Tắt" : "Bật"}
                  </button>
                  <button type="button" className={btnDanger} onClick={() => setReminders(list.filter((x) => x.id !== r.id))}>Xoá</button>
                </div>
              </li>
            );
          })}
          {list.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">Chưa có lịch nhắc. Khách mời sẽ không nhận email tự động.</li>}
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={save} disabled={saving} className={btnPrimary}>{saving ? "Đang lưu…" : "Lưu thiết lập sự kiện"}</button>
        {msg && <p role="status" className="text-sm text-muted">{msg}</p>}
      </div>
    </div>
  );
}
