"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Calendar, CheckCircle2, Globe2, LayoutGrid, Plus, Users, FilePen, type LucideIcon } from "lucide-react";
import { invitationsApi } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { errorText, formatEventDate, type ApiInvitation } from "@/lib/invitation-flow";

type Inv = ApiInvitation;
type Filter = "all" | "published" | "draft";

const EVENT_LABEL: Record<string, string> = {
  wedding: "Thiệp cưới",
  birthday: "Sinh nhật",
  baby: "Đầy tháng",
  event: "Sự kiện",
};

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

/* Ảnh bìa nếu có; nếu chưa có thì nền chấm nhẹ đồng bộ với thương hiệu */
function Cover({ inv }: { inv: Inv }) {
  if (inv.cover) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={inv.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />;
  }
  return (
    <div
      aria-hidden
      className="flex h-full w-full items-center justify-center bg-[#EEF3F9]"
      style={{ backgroundImage: "radial-gradient(#27548A 1.2px, transparent 1.2px)", backgroundSize: "20px 20px" }}
    >
      <span className="grid size-14 place-items-center rounded-full bg-white/90 text-xl font-semibold text-lacquer shadow-sm">
        {(inv.title || "T").trim().charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-lacquer-soft text-lacquer">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-0.5 text-2xl font-bold tabular-nums text-ink">{value}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
}

function Head({ total }: { total: number }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lacquer">Bảng điều khiển</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Quản lý thiệp mời</h1>
        <p className="mt-2 text-muted">{total > 0 ? `Bạn có ${total} thiệp. Chọn một thiệp để quản lý khách và sự kiện.` : "Các sự kiện và thiệp bạn đã tạo."}</p>
      </div>
      <Link
        href="/templates"
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-lacquer px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-lacquer-dark"
      >
        <Plus className="size-4" aria-hidden />
        Tạo thiệp mới
      </Link>
    </div>
  );
}

function Summary({ items }: { items: Inv[] }) {
  const published = items.filter((i) => i.status === "published").length;
  const attending = items.reduce((s, i) => s + (i.stats?.attending ?? 0), 0);
  const guests = items.reduce((s, i) => s + (i.stats?.totalGuests ?? 0), 0);
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      <StatCard icon={LayoutGrid} label="Tổng thiệp" value={items.length} />
      <StatCard icon={Globe2} label="Đang công khai" value={published} hint={`${items.length - published} bản nháp`} />
      <StatCard icon={CheckCircle2} label="Khách xác nhận" value={`${attending}/${guests}`} hint={guests ? `${pct(attending, guests)}% đã xác nhận` : "Chưa có khách mời"} />
    </div>
  );
}

function Tabs({ value, onChange, counts }: { value: Filter; onChange: (f: Filter) => void; counts: Record<Filter, number> }) {
  const opts: { id: Filter; label: string }[] = [
    { id: "all", label: "Tất cả" },
    { id: "published", label: "Đang công khai" },
    { id: "draft", label: "Bản nháp" },
  ];
  return (
    <div role="tablist" aria-label="Lọc thiệp" className="mb-6 inline-flex rounded-xl border border-line bg-white p-1">
      {opts.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={on}
            type="button"
            onClick={() => onChange(o.id)}
            className={`inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors ${on ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
          >
            {o.label}
            <span className={`rounded-md px-1.5 text-xs tabular-nums ${on ? "bg-white/20" : "bg-porcelain"}`}>{counts[o.id]}</span>
          </button>
        );
      })}
    </div>
  );
}

function Grid({ items }: { items: Inv[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((inv) => {
        const published = inv.status === "published";
        const attending = inv.stats?.attending ?? 0;
        const total = inv.stats?.totalGuests ?? 0;
        const rate = pct(attending, total);
        return (
          <Link
            key={inv._id}
            href={ROUTES.invitation(inv._id)}
            className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-lacquer/30 hover:shadow-lg"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-porcelain">
              <Cover inv={inv} />
              <span
                className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
                  published ? "bg-emerald-600 text-white" : "bg-white text-ink"
                }`}
              >
                <span className={`size-1.5 rounded-full ${published ? "bg-white" : "bg-amber-500"}`} aria-hidden />
                {published ? "Đang công khai" : "Bản nháp"}
              </span>
              <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink">
                {EVENT_LABEL[inv.eventType] ?? inv.eventType}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h2 className="truncate text-lg font-semibold text-ink transition-colors group-hover:text-lacquer">{inv.title}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <Calendar className="size-4" aria-hidden />
                {formatEventDate(inv.eventDate)}
              </p>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" aria-hidden />
                    {attending}/{total} khách xác nhận
                  </span>
                  <span className="font-semibold tabular-nums text-ink">{rate}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-porcelain" role="progressbar" aria-valuenow={rate} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-lacquer transition-all duration-500" style={{ width: `${rate}%` }} />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm font-medium text-lacquer">
                <span className="flex items-center gap-1.5 text-muted">
                  <FilePen className="size-3.5" aria-hidden />
                  {published ? "Đã gửi cho khách" : "Chưa công khai"}
                </span>
                <span className="transition-transform group-hover:translate-x-0.5">Quản lý →</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Đang tải">
      {[0, 1, 2].map((i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="aspect-[16/10] animate-pulse bg-porcelain" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded bg-porcelain" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-porcelain" />
            <div className="h-1.5 w-full animate-pulse rounded bg-porcelain" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-lacquer-soft text-lacquer">
        <Plus className="size-6" aria-hidden />
      </span>
      <p className="mt-5 text-lg font-semibold text-ink">Bạn chưa có thiệp nào</p>
      <p className="mt-1 max-w-sm text-sm text-muted">Chọn một mẫu thiệp có sẵn và chỉnh sửa theo ý bạn. Bạn có thể gửi cho khách chỉ trong vài phút.</p>
      <Link href="/templates" className="mt-6 inline-flex h-11 items-center rounded-xl bg-lacquer px-6 text-sm font-semibold text-white hover:bg-lacquer-dark">
        Xem mẫu thiệp
      </Link>
    </div>
  );
}

export function InvitationManagementView() {
  const [items, setItems] = useState<Inv[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let alive = true;
    invitationsApi
      .getInvitations()
      .then((r) => { if (alive) setItems(r.data as Inv[]); })
      .catch((err) => { if (alive) setError(errorText(err, "Không tải được danh sách thiệp.")); });
    return () => { alive = false; };
  }, []);

  const counts = useMemo<Record<Filter, number>>(() => {
    const list = items ?? [];
    return {
      all: list.length,
      published: list.filter((i) => i.status === "published").length,
      draft: list.filter((i) => i.status !== "published").length,
    };
  }, [items]);

  const shown = useMemo(() => {
    if (!items) return [];
    if (filter === "published") return items.filter((i) => i.status === "published");
    if (filter === "draft") return items.filter((i) => i.status !== "published");
    return items;
  }, [items, filter]);

  return (
    <div>
      <Head total={items?.length ?? 0} />
      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : !items ? (
        <Skeleton />
      ) : items.length === 0 ? (
        <Empty />
      ) : (
        <>
          <Summary items={items} />
          <Tabs value={filter} onChange={setFilter} counts={counts} />
          {shown.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">Không có thiệp nào trong mục này.</p>
          ) : (
            <Grid items={shown} />
          )}
        </>
      )}
    </div>
  );
}
