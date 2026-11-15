"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { wishesApi } from "@/lib/api";
import { errorText } from "@/lib/invitation-flow";
import { asList, StatCard } from "./shared";
import { btnDanger, btnGhost, btnPrimary, card, input } from "./useInvitation";

type Wish = { _id: string; name: string; message: string; isApproved: boolean; reply?: string; createdAt?: string };

/** Quản lí lời chúc: duyệt/ẩn, hồi đáp, xoá. */
export function WishesPanel({ id }: { id: string }) {
  const [items, setItems] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await wishesApi.getWishesAdmin(id);
      setItems(asList<Wish>(data));
    } catch (err) {
      setMsg(errorText(err, "Không tải được lời chúc."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const approved = items.filter((w) => w.isApproved).length;
  const shown = useMemo(
    () => items.filter((w) => filter === "all" || (filter === "approved" ? w.isApproved : !w.isApproved)),
    [items, filter],
  );

  async function act(p: Promise<unknown>, ok: string) {
    setMsg("");
    try { await p; setMsg(ok); await load(); } catch (err) { setMsg(errorText(err)); }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Tổng lời chúc" value={items.length} />
        <StatCard label="Đang hiển thị" value={approved} />
        <StatCard label="Chờ duyệt" value={items.length - approved} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f}
            className={filter === f ? btnPrimary : btnGhost}>
            {f === "all" ? "Tất cả" : f === "pending" ? "Chờ duyệt" : "Đang hiển thị"}
          </button>
        ))}
        <a href="https://icards.com.vn/invitations/category/thiep-cam-on" target="_blank" rel="noreferrer" className={`${btnGhost} ml-auto`}>Tạo thiệp cảm ơn</a>
      </div>

      {loading ? <p className="text-sm text-muted">Đang tải lời chúc…</p> : shown.length === 0 ? (
        <div className={`${card} text-center text-muted`}>Chưa có lời chúc nào.</div>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((w) => (
            <li key={w._id} className={card}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-lacquer">{w.name}</p>
                  <p className="text-xs text-muted">{w.createdAt ? new Date(w.createdAt).toLocaleString("vi-VN") : ""}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${w.isApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {w.isApproved ? "Đang hiển thị" : "Chờ duyệt"}
                </span>
              </div>
              <p className="mt-3 italic text-ink/85">“{w.message}”</p>

              {replyId === w._id ? (
                <div className="mt-4 flex flex-col gap-2">
                  <textarea className={`${input} h-auto py-2`} rows={3} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Viết lời cảm ơn…" />
                  <div className="flex gap-2">
                    <button type="button" className={btnPrimary} onClick={() => act(wishesApi.updateWish(w._id, { reply: replyText }), "Đã gửi hồi đáp.").then(() => setReplyId(null))}>Gửi hồi đáp</button>
                    <button type="button" className={btnGhost} onClick={() => setReplyId(null)}>Huỷ</button>
                  </div>
                </div>
              ) : w.reply ? (
                <div className="mt-4 rounded-lg border-l-4 border-lacquer bg-lacquer-soft p-3 text-sm">
                  <p className="mb-1 font-semibold text-lacquer">Phản hồi của bạn</p>
                  {w.reply}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className={btnGhost} onClick={() => { setReplyId(w._id); setReplyText(w.reply || ""); }}>{w.reply ? "Sửa hồi đáp" : "Hồi đáp"}</button>
                <button type="button" className={btnGhost} onClick={() => act(wishesApi.updateWish(w._id, { isApproved: !w.isApproved }), w.isApproved ? "Đã ẩn lời chúc." : "Đã duyệt lời chúc.")}>{w.isApproved ? "Ẩn" : "Duyệt"}</button>
                <button type="button" className={btnDanger} onClick={() => confirm("Xoá lời chúc này?") && act(wishesApi.deleteWish(w._id), "Đã xoá lời chúc.")}>Xoá</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {msg && <p role="status" className="text-sm text-muted">{msg}</p>}
    </div>
  );
}
