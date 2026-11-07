"use client";

import { useState } from "react";
import { invitationsApi } from "@/lib/api";
import { errorText, type BudgetItem } from "@/lib/invitation-flow";
import { useInvitation, btnDanger, btnGhost, btnPrimary, card, input } from "./useInvitation";

const vnd = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + " ₫";

export function BudgetPanel({ id }: { id: string }) {
  const { inv, setInv, loading, error } = useInvitation(id);
  const [items, setItems] = useState<BudgetItem[] | null>(null);
  const [total, setTotal] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  if (loading) return <p className="text-sm text-muted">Đang tải…</p>;
  if (error || !inv) return <p role="alert" className="text-sm text-red-700">{error || "Không tìm thấy thiệp."}</p>;

  const list = items ?? inv.budget?.items ?? [];
  const budgetTotal = total !== "" ? Number(total) : inv.budget?.total ?? 0;
  const spent = list.reduce((s, x) => s + (x.actual ?? x.estimate ?? 0), 0);
  const update = (i: number, patch: Partial<BudgetItem>) => setItems(list.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const body = {
        total: budgetTotal,
        items: list.map((x) => ({ name: x.name.trim() || "Khoản chi", estimate: x.estimate ?? 0, actual: x.actual ?? 0, paid: !!x.paid, note: x.note || undefined })),
      };
      const { data } = await invitationsApi.updateBudgetRequest(id, body);
      setInv({ ...inv!, budget: data });
      setItems(null);
      setTotal("");
      setMsg("Đã lưu ngân sách.");
    } catch (err) {
      setMsg(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className={card}>
          <p className="text-xs uppercase text-muted">Ngân sách</p>
          <input type="number" min={0} value={total !== "" ? total : inv.budget?.total ?? ""} onChange={(e) => setTotal(e.target.value)} className={`${input} mt-1`} />
        </div>
        <div className={card}><p className="text-xs uppercase text-muted">Đã chi / dự kiến</p><p className="mt-1 text-xl font-bold text-ink">{vnd(spent)}</p></div>
        <div className={card}><p className="text-xs uppercase text-muted">Còn lại</p><p className="mt-1 text-xl font-bold text-ink">{vnd(budgetTotal - spent)}</p></div>
      </div>

      <div className="space-y-2">
        {list.map((x, i) => (
          <div key={i} className="grid gap-2 rounded-xl border border-line bg-white p-3 md:grid-cols-[2fr_1fr_1fr_auto_auto]">
            <input value={x.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Khoản chi" className={input} />
            <input type="number" min={0} value={x.estimate ?? ""} onChange={(e) => update(i, { estimate: Number(e.target.value) })} placeholder="Dự kiến" className={input} />
            <input type="number" min={0} value={x.actual ?? ""} onChange={(e) => update(i, { actual: Number(e.target.value) })} placeholder="Thực chi" className={input} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!x.paid} onChange={(e) => update(i, { paid: e.target.checked })} /> Đã trả</label>
            <button type="button" onClick={() => setItems(list.filter((_, j) => j !== i))} className={btnDanger}>Xoá</button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setItems([...list, { name: "", estimate: 0, actual: 0, paid: false }])} className={btnGhost}>+ Thêm khoản chi</button>
        <button type="button" onClick={save} disabled={saving} className={btnPrimary}>{saving ? "Đang lưu…" : "Lưu ngân sách"}</button>
        {msg && <span role="status" className="text-sm text-muted">{msg}</span>}
      </div>
    </div>
  );
}
