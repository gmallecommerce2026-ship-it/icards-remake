"use client";

import { useState } from "react";
import { invitationsApi } from "@/lib/api";
import { errorText, type BudgetItem } from "@/lib/invitation-flow";
import { StatCard, vnd } from "./shared";
import { useInvitation, btnDanger, btnGhost, btnPrimary, card, input } from "./useInvitation";

type Row = BudgetItem & { estimate: number; actual: number };

/** Ngân sách: tổng dự kiến, hạng mục dự kiến và thực tế, còn lại. */
export function BudgetPanel({ id }: { id: string }) {
  const { inv, loading, error, reload } = useInvitation(id);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [total, setTotal] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newEst, setNewEst] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  if (loading) return <p className="text-sm text-muted">Đang tải…</p>;
  if (error || !inv) return <p role="alert" className="text-sm text-red-700">{error || "Không tìm thấy thiệp."}</p>;

  const list: Row[] = rows ?? (inv.budget?.items ?? []).map((x) => ({ ...x, estimate: x.estimate ?? 0, actual: x.actual ?? 0 }));
  const budgetTotal = total !== null ? Number(total) || 0 : inv.budget?.total ?? 0;
  const estimated = list.reduce((s, x) => s + (Number(x.estimate) || 0), 0);
  const actual = list.reduce((s, x) => s + (Number(x.actual) || 0), 0);
  const remaining = budgetTotal - actual;

  const update = (i: number, p: Partial<Row>) => setRows(list.map((x, j) => (j === i ? { ...x, ...p } : x)));

  async function save(next: Row[] = list, nextTotal: number = budgetTotal) {
    setSaving(true);
    setMsg("");
    try {
      await invitationsApi.updateBudgetRequest(id, { total: nextTotal, items: next });
      setRows(null);
      setTotal(null);
      await reload();
      setMsg("Đã lưu ngân sách.");
    } catch (err) {
      setMsg(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  function addRow() {
    if (!newName.trim()) return;
    save([...list, { name: newName.trim(), estimate: Number(newEst) || 0, actual: 0, paid: false }]);
    setNewName("");
    setNewEst("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Ngân sách tổng" value={vnd(budgetTotal)} />
        <StatCard label="Dự kiến" value={vnd(estimated)} />
        <StatCard label="Thực tế" value={vnd(actual)} />
        <StatCard label={remaining >= 0 ? "Còn lại" : "Vượt ngân sách"} value={vnd(Math.abs(remaining))} />
      </div>

      <section className={`${card} flex flex-wrap items-end gap-3`}>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Tổng ngân sách (VND)
          <input type="number" min={0} className={`${input} max-w-xs`} value={total ?? budgetTotal} onChange={(e) => setTotal(e.target.value)} />
        </label>
        <button type="button" className={btnPrimary} onClick={() => save(list, Number(total ?? budgetTotal) || 0)} disabled={saving}>{saving ? "Đang lưu…" : "Lưu ngân sách"}</button>
        {msg && <p role="status" className="text-sm text-muted">{msg}</p>}
      </section>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-porcelain text-xs uppercase text-muted">
            <tr><th className="px-3 py-3">Hạng mục</th><th className="px-3 py-3 text-right">Dự kiến</th><th className="px-3 py-3 text-right">Thực tế</th><th className="px-3 py-3 text-center">Đã thanh toán</th><th className="px-3 py-3">Ghi chú</th><th /></tr>
          </thead>
          <tbody>
            {list.map((x, i) => (
              <tr key={`${x.name}-${i}`} className="border-t border-line">
                <td className="px-3 py-2"><input className={input} value={x.name} onChange={(e) => update(i, { name: e.target.value })} /></td>
                <td className="px-3 py-2"><input type="number" min={0} className={`${input} text-right`} value={x.estimate} onChange={(e) => update(i, { estimate: Number(e.target.value) })} /></td>
                <td className="px-3 py-2"><input type="number" min={0} className={`${input} text-right`} value={x.actual} onChange={(e) => update(i, { actual: Number(e.target.value) })} /></td>
                <td className="px-3 py-2 text-center"><input type="checkbox" checked={!!x.paid} onChange={(e) => update(i, { paid: e.target.checked })} className="size-4" aria-label={`Đã thanh toán ${x.name}`} /></td>
                <td className="px-3 py-2"><input className={input} value={x.note ?? ""} onChange={(e) => update(i, { note: e.target.value })} /></td>
                <td className="px-3 py-2 text-right"><button type="button" className={btnDanger} onClick={() => save(list.filter((_, j) => j !== i))}>Xoá</button></td>
              </tr>
            ))}
            <tr className="border-t border-line bg-porcelain/60">
              <td className="px-3 py-2"><input className={input} placeholder="+ Thêm hạng mục (VD: Thiệp cưới)" value={newName} onChange={(e) => setNewName(e.target.value)} /></td>
              <td className="px-3 py-2"><input type="number" min={0} className={`${input} text-right`} placeholder="0" value={newEst} onChange={(e) => setNewEst(e.target.value)} /></td>
              <td colSpan={3} /><td className="px-3 py-2 text-right"><button type="button" className={btnGhost} onClick={addRow} disabled={!newName.trim() || saving}>Thêm</button></td>
            </tr>
            {list.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-muted">Chưa có hạng mục ngân sách.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">Chỉnh sửa trực tiếp trong bảng, sau đó bấm “Lưu ngân sách” để lưu tất cả thay đổi.</p>
    </div>
  );
}
