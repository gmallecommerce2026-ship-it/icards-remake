"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Plus, Users } from "lucide-react";
import { invitationsApi } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { errorText, formatEventDate, type ApiInvitation } from "@/lib/invitation-flow";

type Inv = ApiInvitation;

/* Ảnh bìa nếu có; nếu chưa có thì hiện nền chấm nhẹ đồng bộ với lưới sản phẩm */
function Cover({ inv }: { inv: Inv }) {
  if (inv.cover) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={inv.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />;
  }
  return (
    <div
      aria-hidden
      className="h-full w-full bg-paper-deep"
      style={{ backgroundImage: "radial-gradient(var(--color-lacquer) 1.5px, transparent 1.5px)", backgroundSize: "22px 22px", opacity: 0.9 }}
    />
  );
}

function Head() {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Quản lý thiệp mời</h1>
        <p className="mt-2 text-muted">Các sự kiện và thiệp bạn đã tạo.</p>
      </div>
      <Link
        href="/templates"
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-lacquer px-5 text-sm font-medium text-white transition-colors hover:bg-lacquer-dark"
      >
        <Plus className="size-4" />
        Tạo thiệp mới
      </Link>
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-24 text-center">
      <p className="text-lg font-semibold text-ink">Bạn chưa có thiệp nào</p>
      <p className="mt-1 text-sm text-muted">Chọn một mẫu thiệp và bắt đầu thiết kế.</p>
      <Link
        href="/templates"
        className="mt-6 inline-flex h-10 items-center rounded-xl bg-lacquer px-5 text-sm font-medium text-white hover:bg-lacquer-dark"
      >
        Xem mẫu thiệp
      </Link>
    </div>
  );
}

function Grid({ items }: { items: Inv[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((inv) => {
        const published = inv.status === "published";
        return (
          <Link
            key={inv._id}
            href={ROUTES.invitation(inv._id)}
            className="group block overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Cover inv={inv} />
              <span
                className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${
                  published ? "bg-emerald-600 text-white" : "bg-white/90 text-ink"
                }`}
              >
                {published ? "Đang công khai" : "Bản nháp"}
              </span>
            </div>
            <div className="p-5">
              <h2 className="truncate text-lg font-semibold text-ink group-hover:text-lacquer">{inv.title}</h2>
              <div className="mt-3 flex items-center justify-between text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  {formatEventDate(inv.eventDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="size-4" />
                  {inv.stats.attending} / {inv.stats.totalGuests}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function InvitationManagementView() {
  const [items, setItems] = useState<Inv[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    invitationsApi
      .getInvitations()
      .then((r) => {
        if (alive) setItems(r.data as Inv[]);
      })
      .catch((err) => {
        if (alive) setError(errorText(err, "Không tải được danh sách thiệp."));
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <Head />
      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : !items ? (
        <p className="text-sm text-muted">Đang tải…</p>
      ) : items.length === 0 ? (
        <Empty />
      ) : (
        <Grid items={items} />
      )}
    </div>
  );
}
