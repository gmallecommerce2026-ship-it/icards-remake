"use client";

import { useState } from "react";
import Link from "next/link";
import { invitationsApi } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { errorText, publicLink } from "@/lib/invitation-flow";
import { useInvitation, btnGhost, btnPrimary, card } from "./useInvitation";

const vnd = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + " ₫";

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
  const total = s.totalGuests;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);
  const responded = s.attending + s.declined;
  const rate = total > 0 ? Math.round((responded / total) * 100) : 0;

  const main = [
    { label: "Tổng khách", value: s.totalGuests, dot: "bg-lacquer" },
    { label: "Tham dự", value: s.attending, dot: "bg-emerald-500" },
    { label: "Từ chối", value: s.declined, dot: "bg-red-400" },
    { label: "Chưa trả lời", value: s.pending, dot: "bg-amber-400" },
  ];
  const extra = [
    { label: "Tổng người tham dự", value: s.headcount },
    { label: "Đã gửi email", value: s.emailSent },
  ];

  return (
    <div className="space-y-8">
      {/* Trạng thái và thao tác */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
            published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          <span aria-hidden className={`size-2 rounded-full ${published ? "bg-emerald-500" : "bg-amber-500"}`} />
          {published ? "Đang công khai" : "Bản nháp"}
        </span>
        <div className="flex flex-wrap gap-2">
          <Link href={editHref} className={btnGhost}>Chỉnh sửa thiệp</Link>
          <button type="button" onClick={togglePublish} disabled={busy} className={published ? btnGhost : btnPrimary}>
            {published ? "Huỷ công khai" : "Công khai thiệp"}
          </button>
        </div>
      </div>

      {!published && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <span>Thiệp đang là bản nháp nên khách chưa mở được link.</span>
          <button type="button" onClick={togglePublish} disabled={busy} className="font-semibold underline underline-offset-4">
            Công khai ngay
          </button>
        </div>
      )}

      {msg && <p role="status" className="bg-porcelain px-4 py-3 text-sm text-ink">{msg}</p>}

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Tỷ lệ xác nhận tham dự */}
        <section aria-labelledby="rsvp-title" className={`${card} flex flex-col`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="rsvp-title" className="text-sm font-semibold text-ink">Xác nhận tham dự</h2>
              <p className="mt-1 text-sm text-muted">{responded} / {total} khách đã trả lời</p>
            </div>
            <p className="text-3xl font-bold tabular-nums text-lacquer">{rate}%</p>
          </div>

          <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-porcelain" role="img" aria-label={`Tham dự ${s.attending}, từ chối ${s.declined}, chưa trả lời ${s.pending}`}>
            <div className="bg-emerald-500 transition-all" style={{ width: `${pct(s.attending)}%` }} />
            <div className="bg-red-400 transition-all" style={{ width: `${pct(s.declined)}%` }} />
            <div className="bg-amber-300 transition-all" style={{ width: `${pct(s.pending)}%` }} />
          </div>

          <ul className="mt-5 grid grid-cols-3 gap-3 text-sm">
            <li>
              <p className="flex items-center gap-2 text-muted"><span aria-hidden className="size-2 rounded-full bg-emerald-500" />Tham dự</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{s.attending}</p>
            </li>
            <li>
              <p className="flex items-center gap-2 text-muted"><span aria-hidden className="size-2 rounded-full bg-red-400" />Từ chối</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{s.declined}</p>
            </li>
            <li>
              <p className="flex items-center gap-2 text-muted"><span aria-hidden className="size-2 rounded-full bg-amber-300" />Chờ phản hồi</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{s.pending}</p>
            </li>
          </ul>
        </section>

        {/* Link chia sẻ */}
        <section aria-labelledby="share-title" className={`${card} flex flex-col`}>
          <h2 id="share-title" className="text-sm font-semibold text-ink">Link gửi khách</h2>
          <p className="mt-1 text-sm text-muted">Gửi link này cho khách mời để họ mở thiệp.</p>
          <p className="mt-4 break-all rounded-lg bg-porcelain px-3 py-2.5 text-sm text-ink">{link}</p>
          <div className="mt-auto flex flex-wrap gap-2 pt-5">
            <button type="button" onClick={copyLink} className={btnPrimary}>Sao chép link</button>
            <a href={link} target="_blank" rel="noopener noreferrer" className={btnGhost}>Mở thiệp</a>
          </div>
        </section>
      </div>

      {/* Thống kê */}
      <section aria-label="Thống kê khách mời" className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line lg:grid-cols-4">
        {main.map((x) => (
          <div key={x.label} className="bg-white p-5">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <span aria-hidden className={`size-2 rounded-full ${x.dot}`} />
              {x.label}
            </p>
            <p className="mt-3 text-3xl font-bold tabular-nums text-ink">{x.value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {extra.map((x) => (
          <div key={x.label} className={card}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{x.label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-ink">{x.value}</p>
          </div>
        ))}
        <div className={`${card} border-lacquer/30 bg-lacquer-soft/50`}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Tổng tiền mừng</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-lacquer">{vnd(s.giftTotal)}</p>
        </div>
      </div>

      {/* Lối tắt */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Quản lý khách mời", href: ROUTES.invitationTab(id, "guests") },
          { label: "Xem lời chúc", href: ROUTES.invitationTab(id, "wishes") },
          { label: "Cài đặt thiệp", href: ROUTES.invitationTab(id, "settings") },
        ].map((x) => (
          <Link key={x.href} href={x.href} className="group flex items-center justify-between border border-line bg-white p-5 text-sm font-semibold text-ink transition-colors hover:border-lacquer hover:text-lacquer">
            {x.label}
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
