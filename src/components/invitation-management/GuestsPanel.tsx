"use client";

import { useCallback, useEffect, useState } from "react";
import { invitationsApi } from "@/lib/api";
import { errorText, type InvitationStats } from "@/lib/invitation-flow";
import { AddGuestModal } from "@/components/modals/AddGuestModal";
import { useInvitation, btnGhost, btnPrimary, btnDanger, card, input } from "./useInvitation";

type Guest = {
  _id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  group?: { _id: string; name: string; color?: string } | null;
  status: "pending" | "attending" | "declined";
  companions: number;
  giftAmount?: number | null;
  emailStatus: "not-sent" | "sent" | "failed";
  emailError?: string | null;
  token: string;
};

const STATUS_LABEL: Record<Guest["status"], string> = { pending: "Chưa trả lời", attending: "Tham dự", declined: "Từ chối" };
const EMAIL_LABEL: Record<Guest["emailStatus"], string> = { "not-sent": "Chưa gửi", sent: "Đã gửi", failed: "Lỗi" };

export function GuestsPanel({ id }: { id: string }) {
  const { inv, setInv } = useInvitation(id);
  const [items, setItems] = useState<Guest[]>([]);
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await invitationsApi.getGuests(id, { page, limit: 20, search: search || undefined, status: status || undefined, emailStatus: emailStatus || undefined });
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
      setStats(data.stats);
    } catch (err) {
      setMsg(errorText(err, "Không tải được danh sách khách."));
    } finally {
      setLoading(false);
    }
  }, [id, page, search, status, emailStatus]);

  useEffect(() => { load(); }, [load]);

  async function addGuest(g: { name: string; email: string; phone: string; group: string }) {
    try {
      await invitationsApi.addGuest(id, {
        name: g.name,
        email: g.email || undefined,
        phone: g.phone || undefined,
        group: g.group || undefined,
      });
      setAddOpen(false);
      setMsg("Đã thêm khách mời.");
      load();
    } catch (err) {
      setMsg(errorText(err));
    }
  }

  async function removeGuest(gid: string) {
    if (!confirm("Xoá khách mời này?")) return;
    try {
      await invitationsApi.deleteGuest(id, gid);
      load();
    } catch (err) {
      setMsg(errorText(err));
    }
  }

  async function sendOne(gid: string) {
    setMsg("Đang gửi…");
    try {
      await invitationsApi.sendGuestEmail(id, gid);
      setMsg("Đã gửi thiệp qua email.");
      load();
    } catch (err) {
      setMsg(errorText(err, "Gửi email thất bại."));
      load();
    }
  }

  async function sendMany(onlyUnsent: boolean) {
    const ids = selected.length ? selected : undefined;
    if (!confirm(`Gửi thiệp cho ${ids ? ids.length + " khách đã chọn" : onlyUnsent ? "tất cả khách chưa nhận" : "tất cả khách"}? Gửi email sẽ công khai thiệp.`)) return;
    setMsg("Đang gửi…");
    try {
      const { data } = await invitationsApi.bulkSendEmail(id, { ids, onlyUnsent });
      setMsg(`Đã gửi ${data.sent}, lỗi ${data.failed}, bỏ qua ${data.skipped}.`);
      setSelected([]);
      load();
      if (inv && inv.status !== "published") setInv({ ...inv, status: "published" });
    } catch (err) {
      setMsg(errorText(err, "Gửi thất bại."));
    }
  }

  async function removeSelected() {
    if (!selected.length || !confirm(`Xoá ${selected.length} khách đã chọn?`)) return;
    try {
      await Promise.all(selected.map((gid) => invitationsApi.deleteGuest(id, gid)));
      setSelected([]);
      load();
    } catch (err) {
      setMsg(errorText(err));
    }
  }

  const toggle = (gid: string) => setSelected((s) => (s.includes(gid) ? s.filter((x) => x !== gid) : [...s, gid]));

  return (
    <div className="space-y-5">
      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ["Tổng", stats.totalGuests],
            ["Tham dự", stats.attending],
            ["Từ chối", stats.declined],
            ["Chưa trả lời", stats.pending],
            ["Đã gửi email", stats.emailSent],
          ].map(([l, v]) => (
            <div key={String(l)} className={card}>
              <p className="text-xs uppercase text-muted">{l}</p>
              <p className="mt-1 text-xl font-bold text-ink">{v}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="Tìm theo tên, email, số điện thoại" className={`${input} max-w-xs`} />
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className={`${input} w-auto`}>
          <option value="">Mọi trạng thái</option>
          <option value="attending">Tham dự</option>
          <option value="declined">Từ chối</option>
          <option value="pending">Chưa trả lời</option>
        </select>
        <select value={emailStatus} onChange={(e) => { setPage(1); setEmailStatus(e.target.value); }} className={`${input} w-auto`}>
          <option value="">Mọi trạng thái email</option>
          <option value="sent">Đã gửi</option>
          <option value="failed">Gửi lỗi</option>
          <option value="not-sent">Chưa gửi</option>
        </select>
        <div className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={() => setAddOpen(true)} className={btnPrimary}>+ Thêm khách</button>
          <button type="button" onClick={() => sendMany(true)} className={btnGhost}>Gửi cho khách chưa nhận</button>
          {selected.length > 0 && (
            <>
              <button type="button" onClick={() => sendMany(false)} className={btnGhost}>Gửi cho {selected.length} khách đã chọn</button>
              <button type="button" onClick={removeSelected} className={btnDanger}>Xoá {selected.length} khách</button>
            </>
          )}
        </div>
      </div>

      {msg && <p role="status" className="rounded-xl bg-porcelain p-3 text-sm text-ink">{msg}</p>}

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-porcelain text-xs uppercase text-muted">
            <tr>
              <th className="p-3 w-8"><span className="sr-only">Chọn</span></th>
              <th className="p-3">Khách</th>
              <th className="p-3">Nhóm</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Đi kèm</th>
              <th className="p-3">Email</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-6 text-center text-muted">Đang tải…</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted">Chưa có khách mời nào.</td></tr>}
            {!loading && items.map((g) => (
              <tr key={g._id} className="border-t border-line">
                <td className="p-3"><input type="checkbox" checked={selected.includes(g._id)} onChange={() => toggle(g._id)} aria-label={`Chọn ${g.name}`} /></td>
                <td className="p-3">
                  <p className="font-medium text-ink">{g.name}</p>
                  <p className="text-xs text-muted">{g.email || g.phone || "—"}</p>
                </td>
                <td className="p-3">{g.group?.name ?? "—"}</td>
                <td className="p-3">{STATUS_LABEL[g.status]}</td>
                <td className="p-3">{g.companions}</td>
                <td className="p-3" title={g.emailError ?? undefined}>
                  <span className={g.emailStatus === "failed" ? "text-red-700" : g.emailStatus === "sent" ? "text-emerald-700" : "text-muted"}>{EMAIL_LABEL[g.emailStatus]}</span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => sendOne(g._id)} disabled={!g.email} className={btnGhost} title={g.email ? "" : "Khách chưa có email"}>Gửi</button>
                    <button type="button" onClick={() => removeGuest(g._id)} className={btnDanger}>Xoá</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-end gap-3 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={btnGhost}>Trước</button>
          <span>Trang {page} / {pages} · {total} khách</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className={btnGhost}>Sau</button>
        </div>
      )}

      <AddGuestModal isOpen={addOpen} onClose={() => setAddOpen(false)} onAdd={addGuest} />
    </div>
  );
}
