"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Users } from "lucide-react";
import { invitationsApi } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { errorText, formatEventDate, type ApiInvitation } from "@/lib/invitation-flow";
import { card } from "./useInvitation";

export function InvitationList() {
  const [items, setItems] = useState<ApiInvitation[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    invitationsApi.getInvitations()
      .then((r) => { if (alive) setItems(r.data as ApiInvitation[]); })
      .catch((err) => { if (alive) setError(errorText(err, "Không tải được danh sách thiệp.")); });
    return () => { alive = false; };
  }, []);

  if (error) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!items) return <p className="text-sm text-muted">Đang tải…</p>;

  return (
    <div>
      {items.length === 0 ? (
        <div className={`${card} text-center`}>
          <p className="font-semibold text-ink">Bạn chưa có thiệp nào</p>
          <p className="mt-1 text-sm text-muted">Chọn một mẫu thiệp và bắt đầu thiết kế.</p>
          <Link href="/templates" className="mt-4 inline-flex h-10 items-center rounded-xl bg-lacquer px-5 text-sm font-medium text-white">Xem mẫu thiệp</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((inv) => (
            <Link
              key={inv._id}
              href={ROUTES.invitation(inv._id)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-md"
            >
              <div className="relative h-32 bg-porcelain">
                {inv.status === "draft" && (
                  <span className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-ink">Bản nháp</span>
                )}
                {inv.status === "published" && (
                  <span className="absolute right-3 top-3 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">Đang công khai</span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="mb-1 truncate text-lg font-bold text-ink group-hover:text-lacquer">{inv.title}</h2>
                <p className="mb-4 text-xs text-muted">{inv.eventType}</p>
                <div className="mt-auto grid grid-cols-2 gap-4 border-t border-line pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted" />
                    <span className="text-sm font-medium text-ink">{formatEventDate(inv.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted" />
                    <span className="text-sm font-medium text-ink">{inv.stats.attending} / {inv.stats.totalGuests}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
