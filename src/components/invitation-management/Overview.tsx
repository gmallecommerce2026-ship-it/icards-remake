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
  if (error || !inv) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
        {error || "Không tìm thấy thiệp."}
      </p>
    );
  }

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
  const stats = [
    { label: "Tổng khách", value: s.totalGuests },
    { label: "Tham dự", value: s.attending },
    { label: "Từ chối", value: s.declined },
    { label: "Chưa trả lời", value: s.pending },
    { label: "Tổng người tham dự", value: s.headcount },
    { label: "Đã gửi email", value: s.emailSent },
  ];

  return (
    <div className="space-y-8">
      {/* Tiêu đề, trạng thái và thao tác chính */}
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{inv.title}</h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              <span aria-hidden className={`size-1.5 rounded-full ${published ? "bg-emerald-500" : "bg-amber-500"}`} />
              {published ? "Đang công khai" : "Bản nháp"}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted">{formatEventDate(inv.eventDate)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={editHref} className={btnGhost}>
            Chỉnh sửa thiệp
          </Link>
          <button type="button" onClick={togglePublish} disabled={busy} className={published ? btnGhost : btnPrimary}>
            {published ? "Huỷ công khai" : "Công khai thiệp"}
          </button>
        </div>
      </header>

      {msg && (
        <p role="status" className="rounded-xl bg-porcelain px-4 py-3 text-sm text-ink">
          {msg}
        </p>
      )}

      {/* Link chia sẻ: nhãn và link tách hàng, nút sao chép nằm riêng */}
      <section aria-labelledby="overview-share-link" className={`${card} flex flex-col gap-4 sm:flex-row sm:items-center`}>
        <div className="min-w-0 flex-1">
          <p id="overview-share-link" className="text-sm font-semibold text-ink">
            Link thiệp
          </p>
          <p className="mt-1.5 truncate rounded-lg bg-porcelain px-3 py-2 text-sm text-muted">{link}</p>
        </div>
        <button type="button" onClick={copyLink} className={`${btnGhost} shrink-0`}>
          Sao chép link
        </button>
      </section>

      {/* Thống kê: một lưới liền, các ô ngăn bằng đường kẻ mảnh */}
      <section aria-label="Thống kê khách mời" className="overflow-hidden rounded-xl border border-line">
        <dl className="grid grid-cols-2 gap-px bg-line lg:grid-cols-3">
          {stats.map((x) => (
            <div key={x.label} className="bg-white p-5">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">{x.label}</dt>
              <dd className="mt-2 text-2xl font-bold tabular-nums text-ink">{x.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className={`${card} flex items-center justify-between gap-4`}>
        <p className="text-sm font-medium text-muted">Tổng tiền mừng</p>
        <p className="text-xl font-bold tabular-nums text-lacquer">
          {new Intl.NumberFormat("vi-VN").format(s.giftTotal)} ₫
        </p>
      </div>
    </div>
  );
}
