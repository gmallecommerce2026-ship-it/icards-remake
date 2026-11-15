"use client";

import { useEffect, useState } from "react";
import { invitationsApi } from "@/lib/api";
import { errorText } from "@/lib/invitation-flow";
import { asList, Dialog } from "./shared";
import { btnDanger, btnGhost, btnPrimary, input } from "./useInvitation";

export type Group = { _id: string; name: string; salutation?: string };
export type GuestRow = {
  _id: string; name: string; email?: string | null; phone?: string | null;
  group?: string | { _id: string; name: string } | null;
  status: "pending" | "attending" | "declined"; companions: number; giftAmount?: number | null;
};
type MasterGuest = { _id: string; name: string; email?: string | null; phone?: string | null };

const SALUTATIONS = ["Lời xưng hô mặc định", "Thân gửi", "Kính mời", "Trân trọng kính mời"];

/* ---------- Sửa khách mời ---------- */
export function GuestEditDialog({ id, guest, groups, onClose, onSaved }: {
  id: string; guest: GuestRow; groups: Group[]; onClose: () => void; onSaved: () => void;
}) {
  const gid = (g: GuestRow["group"]) => (g && typeof g === "object" ? g._id : g ?? "");
  const [form, setForm] = useState({
    name: guest.name, email: guest.email ?? "", phone: guest.phone ?? "", group: gid(guest.group),
    status: guest.status, companions: guest.companions ?? 1, giftAmount: guest.giftAmount ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await invitationsApi.updateGuest(id, guest._id, { ...form, companions: Number(form.companions), giftAmount: form.giftAmount === "" ? null : Number(form.giftAmount), group: form.group || null });
      onSaved();
      onClose();
    } catch (err) {
      setMsg(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog title="Cập nhật khách mời" onClose={onClose} wide>
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">Tên khách mời<input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} required /></label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Email<input className={input} value={form.email} onChange={(e) => set("email", e.target.value)} /></label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Số điện thoại<input className={input} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Nhóm khách mời
          <select className={input} value={form.group} onChange={(e) => set("group", e.target.value)}>
            <option value="">Không có nhóm</option>
            {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Trạng thái tham dự
          <select className={input} value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="pending">Chưa trả lời</option><option value="attending">Tham dự</option><option value="declined">Từ chối</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Đi cùng (người)<input type="number" min={1} max={10} className={input} value={form.companions} onChange={(e) => set("companions", e.target.value)} /></label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Tiền mừng (VND)<input type="number" min={0} className={input} value={form.giftAmount} onChange={(e) => set("giftAmount", e.target.value)} /></label>
        <div className="flex items-end gap-3 md:col-span-2">
          <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Đang lưu…" : "Lưu thông tin"}</button>
          <button type="button" onClick={onClose} className={btnGhost}>Huỷ</button>
          {msg && <p role="alert" className="text-sm text-red-700">{msg}</p>}
        </div>
      </form>
    </Dialog>
  );
}

/* ---------- Danh bạ khách mời ---------- */
export function MasterGuestsDialog({ id, onClose, onAdded }: { id: string; onClose: () => void; onAdded: () => void }) {
  const [list, setList] = useState<MasterGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    invitationsApi.getMasterGuests()
      .then((r) => setList(asList<MasterGuest>(r.data)))
      .catch((err) => setMsg(errorText(err, "Không tải được danh bạ.")))
      .finally(() => setLoading(false));
  }, []);

  const shown = list.filter((g) => `${g.name} ${g.email ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  const toggle = (gid: string) => setSel((s) => (s.includes(gid) ? s.filter((x) => x !== gid) : [...s, gid]));

  async function add() {
    const guests = list.filter((g) => sel.includes(g._id)).map((g) => ({ name: g.name, email: g.email || undefined, phone: g.phone || undefined }));
    if (!guests.length) return setMsg("Vui lòng chọn ít nhất một khách mời.");
    try {
      await invitationsApi.bulkAddGuests(id, { guests });
      onAdded();
      onClose();
    } catch (err) {
      setMsg(errorText(err));
    }
  }

  return (
    <Dialog title="Thêm từ danh bạ" onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input className={`${input} max-w-xs`} placeholder="Tìm trong danh bạ…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="button" onClick={add} disabled={!sel.length} className={btnPrimary}>Thêm {sel.length} khách đã chọn</button>
          <button type="button" onClick={() => setSel(shown.map((g) => g._id))} className={btnGhost}>Chọn tất cả</button>
        </div>
        {loading ? <p className="text-sm text-muted">Đang tải danh bạ…</p> : (
          <ul className="max-h-[50vh] divide-y divide-line overflow-y-auto rounded-lg border border-line">
            {shown.map((g) => (
              <li key={g._id}>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-porcelain">
                  <input type="checkbox" checked={sel.includes(g._id)} onChange={() => toggle(g._id)} className="size-4" />
                  <span className="flex-1"><span className="block font-semibold">{g.name}</span><span className="block text-sm text-muted">{g.email || "Chưa có email"}</span></span>
                </label>
              </li>
            ))}
            {shown.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">Không tìm thấy khách mời nào.</li>}
          </ul>
        )}
        {msg && <p role="alert" className="text-sm text-red-700">{msg}</p>}
      </div>
    </Dialog>
  );
}

/* ---------- Quản lí nhóm ---------- */
export function GuestGroupsDialog({ id, groups, onClose, onChanged }: {
  id: string; groups: Group[]; onClose: () => void; onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [salutation, setSalutation] = useState(SALUTATIONS[0]);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", salutation: "" });
  const [msg, setMsg] = useState("");

  async function run(p: Promise<unknown>, ok: string) {
    setMsg("");
    try { await p; onChanged(); setMsg(ok); } catch (err) { setMsg(errorText(err)); }
  }

  return (
    <Dialog title="Quản lí nhóm khách mời" onClose={onClose} wide>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          <input className={`${input} max-w-xs flex-1`} placeholder="Tên nhóm mới (VD: Bạn chú rể)" value={name} onChange={(e) => setName(e.target.value)} />
          <select className={`${input} max-w-[220px]`} value={salutation} onChange={(e) => setSalutation(e.target.value)}>
            {SALUTATIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button type="button" className={btnPrimary} disabled={!name.trim()} onClick={() => run(invitationsApi.createGuestGroup(id, { name, salutation }), "Đã thêm nhóm.").then(() => setName(""))}>Thêm nhóm</button>
        </div>
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-line text-muted"><th className="py-2">Tên nhóm</th><th>Lời xưng hô</th><th /></tr></thead>
          <tbody>
            {groups.map((g) => editId === g._id ? (
              <tr key={g._id} className="border-b border-line">
                <td className="py-2 pr-2"><input className={input} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></td>
                <td className="pr-2"><select className={input} value={draft.salutation} onChange={(e) => setDraft({ ...draft, salutation: e.target.value })}>{SALUTATIONS.map((s) => <option key={s}>{s}</option>)}</select></td>
                <td className="flex gap-2 py-2">
                  <button type="button" className={btnPrimary} onClick={() => run(invitationsApi.updateGuestGroup(id, g._id, draft), "Đã cập nhật nhóm.").then(() => setEditId(null))}>Lưu</button>
                  <button type="button" className={btnGhost} onClick={() => setEditId(null)}>Huỷ</button>
                </td>
              </tr>
            ) : (
              <tr key={g._id} className="border-b border-line">
                <td className="py-3 font-semibold">{g.name}</td>
                <td className="text-muted">{g.salutation || SALUTATIONS[0]}</td>
                <td className="flex justify-end gap-2 py-2">
                  <button type="button" className={btnGhost} onClick={() => { setEditId(g._id); setDraft({ name: g.name, salutation: g.salutation || SALUTATIONS[0] }); }}>Sửa</button>
                  <button type="button" className={btnDanger} onClick={() => confirm("Xoá nhóm? Khách mời thuộc nhóm sẽ không còn nhóm.") && run(invitationsApi.deleteGuestGroup(id, g._id), "Đã xoá nhóm.")}>Xoá</button>
                </td>
              </tr>
            ))}
            {groups.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-muted">Chưa có nhóm nào.</td></tr>}
          </tbody>
        </table>
        {msg && <p role="status" className="text-sm text-muted">{msg}</p>}
      </div>
    </Dialog>
  );
}
