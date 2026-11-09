"use client";

import { useState } from "react";
import Link from "next/link";
import { invitationsApi } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { errorText, formatEventDate, publicLink } from "@/lib/invitation-flow";
import { useInvitation, btnGhost, btnPrimary, card } from "./useInvitation";

export function Overview({ id }: { id: string }) {
  const { inv, setInv, loading, error } = useInvitation(id);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (loading) return <p className="text-sm text-muted">Đang tải…</p>;
  if (error || !inv) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error || "Không tìm thấy thiệp."}</p>;

  const published = inv.status === "published";
  const link = publicLink(typeof window !== "undefined" ? window.location.origin : "", inv.slug);
  const editHref = `${ROUTES.newEvent}?invitation=${inv._id}${inv.templateSlug ? `&template=${inv.templateSlug}` : ""}`;

  async function togglePublish() {
    setBusy(true);
    setMsg("");
    try {
      const { data } = await invitationsApi.publishInvitation(id, !published);
      setInv({ ...inv!, status: data.status });
      setMsg(published ? "Đã huỷ công khai thiệp." : "Thiệp đã được công khai.");
    } catch (err) {
      setMsg(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setMsg("Đã sao chép link thiệp.");
    } catch {
      setMsg(link);
    }
  }

  const s = inv.stats;
  const stat = [
    { label: "Tổng khách", value: s.totalGuests },
    { label: "Tham dự", value: s.attending },
    { label: "Từ chối", value: s.declined },
    { label: "Chưa trả lời", value: s.pending },
    { label: "Tổng người tham dự", value: s.headcount },
    { label: "Đã gửi email", value: s.emailSent },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{inv.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {formatEventDate(inv.eventDate)} · <span className={published ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>{published ? "Đang công khai" : "Bản nháp"}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={editHref} className={btnGhost}>Chỉnh sửa thiệp</Link>
          <button type="button" onClick={togglePublish} disabled={busy} className={published ? btnGhost : btnPrimary}>
            {published ? "Huỷ công khai" : "Công khai thiệp"}
          </button>
        </div>
      </div>

      {msg && <p role="status" className="rounded-xl bg-porcelain p-3 text-sm text-ink">{msg}</p>}

      <div className={`${card} flex flex-wrap items-center gap-3`}>
        <span className="text-sm text-muted">Link thiệp:</span>
        <code className="min-w-0 flex-1 truncate rounded-lg bg-porcelain px-3 py-2 text-sm">{link}</code>
        <button type="button" onClick={copyLink} className={btnGhost}>Sao chép</button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stat.map((x) => (
          <div key={x.label} className={card}>
            <p className="text-xs uppercase text-muted">{x.label}</p>
            <p className="mt-1 text-2xl font-bold text-ink">{x.value}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted">Tiền mừng: {new Intl.NumberFormat("vi-VN").format(s.giftTotal)} ₫</p>
    </div>
  );
}
