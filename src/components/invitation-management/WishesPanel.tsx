"use client";

import { useCallback, useEffect, useState } from "react";
import { wishesApi } from "@/lib/api";
import { errorText } from "@/lib/invitation-flow";
import { btnDanger, btnGhost, card } from "./useInvitation";

type Wish = { _id: string; name: string; message: string; isApproved: boolean; createdAt?: string };

export function WishesPanel({ id }: { id: string }) {
  const [items, setItems] = useState<Wish[]>([]);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await wishesApi.getWishesAdmin(id);
      setItems(data.items);
      setPending(data.pending ?? 0);
    } catch (err) {
      setMsg(errorText(err, "Không tải được lời chúc."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function approve(w: Wish) {
    try {
      await wishesApi.updateWish(w._id, { isApproved: !w.isApproved });
      load();
    } catch (err) { setMsg(errorText(err)); }
  }

  async function remove(w: Wish) {
    if (!confirm("Xoá lời chúc này?")) return;
    try {
      await wishesApi.deleteWish(w._id);
      load();
    } catch (err) { setMsg(errorText(err)); }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Chờ duyệt: <strong className="text-ink">{pending}</strong></p>
      {msg && <p role="alert" className="text-sm text-red-700">{msg}</p>}
      {loading && <p className="text-sm text-muted">Đang tải…</p>}
      {!loading && items.length === 0 && <p className="text-sm text-muted">Chưa có lời chúc nào.</p>}
      <ul className="space-y-3">
        {items.map((w) => (
          <li key={w._id} className={`${card} flex flex-wrap items-start justify-between gap-4`}>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{w.name} <span className={`ml-2 text-xs ${w.isApproved ? "text-emerald-700" : "text-amber-700"}`}>{w.isApproved ? "Đang hiện" : "Chờ duyệt"}</span></p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{w.message}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => approve(w)} className={btnGhost}>{w.isApproved ? "Ẩn" : "Duyệt"}</button>
              <button type="button" onClick={() => remove(w)} className={btnDanger}>Xoá</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
