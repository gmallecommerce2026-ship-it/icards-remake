"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import * as XLSX from "xlsx";
import { invitationsApi } from "@/lib/api";
import { errorText, type InvitationStats } from "@/lib/invitation-flow";
import { AddGuestModal } from "@/components/modals/AddGuestModal";
import { asList, StatCard, vnd } from "./shared";
import { GuestEditDialog, GuestGroupsDialog, MasterGuestsDialog, type Group, type GuestRow } from "./GuestDialogs";
import { btnDanger, btnGhost, btnPrimary, card, input } from "./useInvitation";

const STATUS: Record<GuestRow["status"], string> = { pending: "Chưa trả lời", attending: "Tham dự", declined: "Từ chối" };
const EMAIL: Record<string, string> = { "not-sent": "Chưa gửi", sent: "Đã gửi", failed: "Lỗi" };
type Guest = GuestRow & { phone?: string | null; emailStatus: "not-sent" | "sent" | "failed"; token?: string };

const gid = (g: Guest["group"]) => (g && typeof g === "object" ? g._id : g ?? "");

/** Danh sách khách mời: lọc, chọn nhiều, gửi email, nhóm, nhập/xuất Excel, danh bạ. */
export function GuestsPanel({ id }: { id: string }) {
  const [items, setItems] = useState<Guest[]>([]);
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkGroup, setBulkGroup] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [masterOpen, setMasterOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await invitationsApi.getGuests(id, { page, limit: 20, search: search || undefined, status: status || undefined, emailStatus: emailStatus || undefined });
      const d = data as unknown as { items: Guest[]; pages: number; stats: InvitationStats };
      setItems(d.items ?? []);
      setPages(d.pages ?? 1);
      setStats(d.stats ?? null);
    } catch (err) {
      setMsg(errorText(err, "Không tải được danh sách khách."));
    } finally {
      setLoading(false);
    }
  }, [id, page, search, status, emailStatus]);

  const loadGroups = useCallback(async () => {
    try {
      const { data } = await invitationsApi.getGuestGroups(id);
      setGroups(asList<Group>(data));
    } catch { setGroups([]); }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadGroups(); }, [loadGroups]);
  useEffect(() => { setSelected([]); }, [search, status, emailStatus, page]);

  const groupName = (g: Guest["group"]) => groups.find((x) => x._id === gid(g))?.name ?? "Chưa chọn nhóm";
  const allChecked = items.length > 0 && items.every((g) => selected.includes(g._id));
  const toggle = (gid_: string) => setSelected((s) => (s.includes(gid_) ? s.filter((x) => x !== gid_) : [...s, gid_]));
  const toggleAll = () => setSelected(allChecked ? [] : items.map((g) => g._id));

  // Chạy một thao tác rồi tải lại danh sách
  async function run(p: Promise<unknown>, ok: string) {
    setBusy(true);
    setMsg("");
    try {
      await p;
      setMsg(ok);
      setSelected([]);
      await Promise.all([load(), loadGroups()]);
    } catch (err) {
      setMsg(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  const sendOne = (g: Guest) => (!g.email ? setMsg("Khách mời này chưa có email.") : run(invitationsApi.sendGuestEmail(id, g._id), `Đã gửi email tới ${g.name}.`));
  const removeOne = (g: Guest) => confirm(`Xoá khách mời "${g.name}"?`) && run(invitationsApi.deleteGuest(id, g._id), "Đã xoá khách mời.");
  const bulkSend = () => run(invitationsApi.bulkSendEmail(id, { ids: selected, onlyUnsent: false }), `Đã gửi email cho ${selected.length} khách.`);
  const bulkDelete = () => confirm(`Xoá ${selected.length} khách mời đã chọn?`) && run(invitationsApi.bulkDeleteGuests(id, { guestIds: selected }), "Đã xoá các khách mời đã chọn.");
  const bulkSetGroup = (group: string | null) => run(invitationsApi.bulkUpdateGuests(id, { guestIds: selected, updateData: { group } }), group ? "Đã thêm vào nhóm." : "Đã gỡ khỏi nhóm.");

  /* ----- Excel ----- */
  async function onImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      if (rows.length === 0) return setMsg("File Excel trống.");
      if (!("Tên Khách Mời" in rows[0])) return setMsg('File phải có cột "Tên Khách Mời". Tải file mẫu để xem đúng định dạng.');
      const byName = new Map(groups.map((g) => [g.name, g._id]));
      const guests = rows
        .map((r) => ({
          name: String(r["Tên Khách Mời"] ?? "").trim(),
          email: String(r["Email"] ?? "").trim() || undefined,
          phone: String(r["Số Điện Thoại"] ?? "").trim() || undefined,
          group: byName.get(String(r["Nhóm Khách Mời"] ?? "").trim()) || undefined,
        }))
        .filter((g) => g.name);
      if (guests.length === 0) return setMsg("Không có khách mời hợp lệ trong file.");
      await run(invitationsApi.bulkAddGuests(id, { guests }), `Đã nhập ${guests.length} khách mời.`);
    } catch {
      setMsg("Không đọc được file Excel. File có thể bị hỏng.");
    }
  }

  function exportExcel() {
    if (items.length === 0) return setMsg("Không có dữ liệu để xuất.");
    const ws = XLSX.utils.json_to_sheet(items.map((g, i) => ({
      STT: i + 1, "Tên Khách Mời": g.name, "Số Điện Thoại": g.phone || "", Email: g.email || "",
      "Nhóm Khách Mời": groupName(g.group), "Trạng Thái Tham Gia": STATUS[g.status],
      "Đi Cùng (người)": g.companions ?? 0, "Tiền Mừng (VND)": g.giftAmount ?? 0, "Trạng Thái Email": EMAIL[g.emailStatus] ?? "",
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh Sách Khách Mời");
    XLSX.writeFile(wb, "danh-sach-khach-moi.xlsx");
  }

  function downloadSample() {
    const ws = XLSX.utils.json_to_sheet([
      { "Tên Khách Mời": "Nguyễn Văn A", Email: "a@example.com", "Số Điện Thoại": "0987654321", "Nhóm Khách Mời": groups[0]?.name ?? "Bạn Chú Rể" },
      { "Tên Khách Mời": "Trần Thị B", Email: "b@example.com", "Số Điện Thoại": "0123456789", "Nhóm Khách Mời": "" },
    ]);
    ws["!cols"] = [{ wch: 25 }, { wch: 28 }, { wch: 15 }, { wch: 22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh Sách Mẫu");
    XLSX.writeFile(wb, "file-mau-nhap-khach-moi.xlsx");
  }

  const statCards = useMemo(() => stats ? [
    { label: "Tổng khách", value: stats.totalGuests },
    { label: "Tham dự", value: stats.attending },
    { label: "Từ chối", value: stats.declined },
    { label: "Chưa trả lời", value: stats.pending },
    { label: "Tổng người đi", value: stats.headcount },
    { label: "Tiền mừng", value: vnd(stats.giftTotal) },
  ] : [], [stats]);

  return (
    <div className="flex flex-col gap-6">
      {/* Thanh công cụ */}
      <section className={`${card} flex flex-col gap-3`}>
        <p className="text-sm font-semibold text-ink">Thêm & quản lí khách mời</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnPrimary} onClick={() => setAddOpen(true)}>+ Thêm khách mời</button>
          <button type="button" className={btnGhost} onClick={() => setMasterOpen(true)}>Thêm từ danh bạ</button>
          <button type="button" className={btnGhost} onClick={() => setGroupsOpen(true)}>Quản lí nhóm</button>
          <button type="button" className={btnGhost} onClick={() => fileRef.current?.click()} disabled={busy}>Nhập từ Excel</button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onImport} />
          <button type="button" className={btnGhost} onClick={exportExcel}>Xuất danh sách</button>
          <button type="button" className={btnGhost} onClick={downloadSample}>Tải file mẫu</button>
        </div>
      </section>

      {statCards.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {statCards.map((s) => <StatCard key={s.label} label={s.label} value={s.value} />)}
        </div>
      )}

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-3">
        <input className={`${input} max-w-xs flex-1`} placeholder="Tìm theo tên hoặc email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className={`${input} max-w-[180px]`} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Tất cả trạng thái</option><option value="pending">Chưa trả lời</option><option value="attending">Tham dự</option><option value="declined">Từ chối</option>
        </select>
        <select className={`${input} max-w-[180px]`} value={emailStatus} onChange={(e) => { setEmailStatus(e.target.value); setPage(1); }}>
          <option value="">Trạng thái email</option><option value="not-sent">Chưa gửi</option><option value="sent">Đã gửi</option><option value="failed">Lỗi</option>
        </select>
      </div>

      {/* Thao tác hàng loạt */}
      {selected.length > 0 && (
        <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-xl bg-ink px-4 py-3 text-white shadow-lg">
          <strong className="mr-2">Đã chọn {selected.length}</strong>
          <button type="button" className={btnGhost} onClick={bulkSend} disabled={busy}>Gửi email</button>
          <select className={`${input} h-9 max-w-[200px]`} value={bulkGroup} onChange={(e) => setBulkGroup(e.target.value)}>
            <option value="">Chọn nhóm…</option>
            {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
          <button type="button" className={btnGhost} disabled={!bulkGroup || busy} onClick={() => bulkSetGroup(bulkGroup)}>Thêm vào nhóm</button>
          <button type="button" className={btnGhost} disabled={busy} onClick={() => bulkSetGroup(null)}>Gỡ khỏi nhóm</button>
          <button type="button" className={btnDanger} disabled={busy} onClick={bulkDelete}>Xoá</button>
          <button type="button" className="ml-auto text-sm underline" onClick={() => setSelected([])}>Bỏ chọn</button>
        </div>
      )}

      {/* Bảng khách mời */}
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-porcelain text-xs uppercase text-muted">
            <tr>
              <th className="w-10 px-3 py-3"><input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Chọn tất cả" /></th>
              <th className="px-3 py-3">#</th><th className="px-3 py-3">Khách mời</th><th className="px-3 py-3">Liên hệ</th>
              <th className="px-3 py-3">Nhóm</th><th className="px-3 py-3">Tham dự</th><th className="px-3 py-3">Đi cùng</th>
              <th className="px-3 py-3">Mừng cưới</th><th className="px-3 py-3">Email</th><th className="px-3 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((g, i) => (
              <tr key={g._id} className="border-t border-line hover:bg-porcelain/60">
                <td className="px-3 py-3"><input type="checkbox" checked={selected.includes(g._id)} onChange={() => toggle(g._id)} aria-label={`Chọn ${g.name}`} /></td>
                <td className="px-3 py-3 text-muted">{(page - 1) * 20 + i + 1}</td>
                <td className="px-3 py-3 font-semibold text-lacquer">{g.name}</td>
                <td className="px-3 py-3"><span className="block">{g.email || "—"}</span><span className="block text-muted">{g.phone || ""}</span></td>
                <td className="px-3 py-3"><span className="rounded-full bg-lacquer-soft px-2.5 py-0.5 text-xs text-lacquer">{groupName(g.group)}</span></td>
                <td className="px-3 py-3">{STATUS[g.status]}</td>
                <td className="px-3 py-3">{g.companions ?? 0}</td>
                <td className="px-3 py-3">{vnd(g.giftAmount)}</td>
                <td className="px-3 py-3">{g.email ? EMAIL[g.emailStatus] : "Không có email"}</td>
                <td className="px-3 py-3"><div className="flex justify-end gap-1.5">
                  <button type="button" className={btnGhost} disabled={!g.email || busy} onClick={() => sendOne(g)}>Gửi</button>
                  <button type="button" className={btnGhost} onClick={() => setEditing(g)}>Sửa</button>
                  <button type="button" className={btnDanger} disabled={busy} onClick={() => removeOne(g)}>Xoá</button>
                </div></td>
              </tr>
            ))}
            {!loading && items.length === 0 && <tr><td colSpan={10} className="px-3 py-10 text-center text-muted">Chưa có khách mời nào khớp bộ lọc.</td></tr>}
            {loading && <tr><td colSpan={10} className="px-3 py-10 text-center text-muted">Đang tải…</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p role="status" className="text-muted">{msg}</p>
        <div className="flex items-center gap-2">
          <button type="button" className={btnGhost} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Trước</button>
          <span>Trang {page} / {pages}</span>
          <button type="button" className={btnGhost} disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Sau</button>
        </div>
      </div>

      {addOpen && (
        <AddGuestModal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          onAdd={(g) => { setAddOpen(false); run(invitationsApi.addGuest(id, { name: g.name, email: g.email || undefined, phone: g.phone || undefined, group: g.group || undefined }), "Đã thêm khách mời."); }}
        />
      )}
      {editing && <GuestEditDialog id={id} guest={editing} groups={groups} onClose={() => setEditing(null)} onSaved={() => { setMsg("Đã cập nhật khách mời."); load(); }} />}
      {groupsOpen && <GuestGroupsDialog id={id} groups={groups} onClose={() => setGroupsOpen(false)} onChanged={() => { loadGroups(); }} />}
      {masterOpen && <MasterGuestsDialog id={id} onClose={() => setMasterOpen(false)} onAdded={() => { setMsg("Đã thêm khách từ danh bạ."); load(); }} />}
    </div>
  );
}
