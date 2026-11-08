"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Users } from "lucide-react";
import { invitationsApi } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { errorText, formatEventDate, type ApiInvitation } from "@/lib/invitation-flow";
import { useUiTheme } from "@/components/ui/useUiTheme";

type Inv = ApiInvitation;

const statusText = (s: string) => (s === "published" ? "Đang công khai" : s === "draft" ? "Bản nháp" : s);

/* Đầu trang + nút tạo thiệp, mỗi theme một kiểu */
function Head({ theme }: { theme: string }) {
  const title = "Quản lý thiệp mời";
  const sub = "Danh sách các sự kiện và thiệp bạn đã tạo.";
  const create = "Tạo thiệp mới";
  if (theme === "1") return (
    <div className="mb-12 text-center">
      <h1 className="font-display text-4xl font-medium">{title}</h1>
      <p className="mt-3 text-muted">{sub}</p>
      <Link href="/templates" className="mt-6 inline-block border border-ink px-6 py-2.5 text-sm font-semibold hover:bg-ink hover:text-white">{create}</Link>
    </div>
  );
  if (theme === "2") return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-6">
      <div><h1 className="text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-1 text-sm text-muted">{sub}</p></div>
      <Link href="/templates" className="bg-ink px-5 py-2.5 text-sm font-semibold text-white">{create}</Link>
    </div>
  );
  if (theme === "3") return (
    <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
      <div><h1 className="font-display text-4xl font-bold tracking-tight">{title}</h1><p className="mt-2 text-muted">{sub}</p></div>
      <Link href="/templates" className="rounded-lg bg-lacquer px-5 py-3 text-sm font-semibold text-white">{create}</Link>
    </div>
  );
  if (theme === "4") return (
    <div className="mb-12 text-center">
      <h1 className="font-display text-4xl italic">{title}</h1>
      <p className="mt-3 text-muted">{sub}</p>
      <Link href="/templates" className="mt-6 inline-block rounded-sm bg-lacquer px-7 py-3 text-sm font-semibold text-white">{create}</Link>
    </div>
  );
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-gold/60 pb-8">
      <div><span className="block h-px w-12 bg-gold" aria-hidden /><h1 className="mt-6 font-display text-4xl">{title}</h1><p className="mt-2 text-muted">{sub}</p></div>
      <Link href="/templates" className="bg-lacquer px-6 py-3 text-sm font-semibold text-white">{create}</Link>
    </div>
  );
}

function Empty({ theme }: { theme: string }) {
  const box = theme === "4" ? "rounded-t-full bg-white px-10 pb-14 pt-20" : theme === "3" ? "rounded-xl bg-white p-12" : "border border-line bg-white p-12";
  return (
    <div className={`text-center ${box}`}>
      <p className="font-display text-2xl">Bạn chưa có thiệp nào</p>
      <p className="mt-2 text-muted">Chọn một mẫu thiệp và bắt đầu thiết kế.</p>
      <Link href="/templates" className="mt-6 inline-block bg-lacquer px-6 py-3 text-sm font-semibold text-white">Xem mẫu thiệp</Link>
    </div>
  );
}

/* ---------- Danh sách theo từng theme ---------- */
function ListView({ items, theme }: { items: Inv[]; theme: string }) {
  if (items.length === 0) return <Empty theme={theme} />;

  if (theme === "1") return (
    <ul className="divide-y divide-line border-y border-line bg-white">
      {items.map((inv) => (
        <li key={inv._id}>
          <Link href={ROUTES.invitation(inv._id)} className="group grid gap-3 px-6 py-6 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-10">
            <div><p className="font-display text-2xl group-hover:text-lacquer">{inv.title}</p><p className="mt-1 text-sm text-muted">{inv.eventType}</p></div>
            <p className="text-sm text-muted">{formatEventDate(inv.eventDate)}</p>
            <p className="text-sm"><span className="font-semibold">{inv.stats.attending}</span> / {inv.stats.totalGuests} khách · {statusText(inv.status)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );

  if (theme === "2") return (
    <table className="w-full border-collapse text-left text-sm">
      <thead><tr className="border-b border-ink text-muted">
        <th className="py-3 font-medium">Thiệp</th><th className="py-3 font-medium">Ngày</th><th className="py-3 font-medium">Khách</th><th className="py-3 font-medium">Trạng thái</th>
      </tr></thead>
      <tbody>
        {items.map((inv) => (
          <tr key={inv._id} className="border-b border-line hover:bg-porcelain">
            <td className="py-4"><Link href={ROUTES.invitation(inv._id)} className="font-semibold hover:underline">{inv.title}</Link></td>
            <td className="py-4">{formatEventDate(inv.eventDate)}</td>
            <td className="py-4">{inv.stats.attending} / {inv.stats.totalGuests}</td>
            <td className="py-4 text-muted">{statusText(inv.status)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (theme === "3") return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((inv) => (
        <Link key={inv._id} href={ROUTES.invitation(inv._id)} className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-xl">
          <div className={`flex h-24 items-end justify-between p-4 ${inv.status === "published" ? "bg-lacquer text-white" : "bg-paper text-ink"}`}>
            <span className="rounded-md bg-white/20 px-2.5 py-1 text-xs font-semibold">{statusText(inv.status)}</span>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h2 className="truncate text-lg font-bold group-hover:text-lacquer">{inv.title}</h2>
            <p className="mt-1 text-sm text-muted">{inv.eventType}</p>
            <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
              <span className="rounded-lg bg-porcelain p-3 text-sm"><Calendar className="mb-1 size-4 text-muted" />{formatEventDate(inv.eventDate)}</span>
              <span className="rounded-lg bg-porcelain p-3 text-sm"><Users className="mb-1 size-4 text-muted" />{inv.stats.attending} / {inv.stats.totalGuests}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  if (theme === "4") return (
    <div className="grid gap-10 sm:grid-cols-2">
      {items.map((inv) => (
        <Link key={inv._id} href={ROUTES.invitation(inv._id)} className="group block text-center">
          <div className="rounded-t-full border border-line bg-white px-8 pb-8 pt-14">
            <p className="font-display text-2xl italic group-hover:text-lacquer">{inv.title}</p>
            <p className="mt-2 text-sm text-muted">{formatEventDate(inv.eventDate)}</p>
            <p className="mt-5 text-sm"><span className="font-semibold text-lacquer">{inv.stats.attending}</span> / {inv.stats.totalGuests} khách · {statusText(inv.status)}</p>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <ul className="space-y-0">
      {items.map((inv) => (
        <li key={inv._id} className="border-t border-gold/50 last:border-b">
          <Link href={ROUTES.invitation(inv._id)} className="group flex flex-wrap items-baseline justify-between gap-4 py-6">
            <span className="font-display text-2xl group-hover:text-lacquer">{inv.title}</span>
            <span className="text-sm italic text-muted">{formatEventDate(inv.eventDate)} · {inv.stats.attending} / {inv.stats.totalGuests} khách · {statusText(inv.status)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function InvitationManagementView() {
  const theme = useUiTheme();
  const [items, setItems] = useState<Inv[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    invitationsApi.getInvitations()
      .then((r) => { if (alive) setItems(r.data as Inv[]); })
      .catch((err) => { if (alive) setError(errorText(err, "Không tải được danh sách thiệp.")); });
    return () => { alive = false; };
  }, []);

  return (
    <div>
      <Head theme={theme} />
      {error ? (
        <p role="alert" className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : !items ? (
        <p className="text-sm text-muted">Đang tải…</p>
      ) : (
        <ListView items={items} theme={theme} />
      )}
    </div>
  );
}
