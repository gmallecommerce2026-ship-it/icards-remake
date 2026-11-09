"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { INVITATION_TABS, ROUTES } from "@/lib/routes";
import { formatEventDate } from "@/lib/invitation-flow";
import { useInvitation } from "./useInvitation";

export function InvitationDetailShell({ id, children }: { id: string; children: ReactNode }) {
  const pathname = usePathname();
  const basePath = ROUTES.invitation(id);
  const { inv, loading } = useInvitation(id);
  const title = inv?.title ?? (loading ? "Đang tải thiệp…" : "Thiệp mời");

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={ROUTES.invitationManagement}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-lacquer"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Quản lý thiệp mời
      </Link>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        {/* Thông tin thiệp: ảnh bìa, tên và ngày */}
        <div className="flex items-center gap-5 border-b border-line bg-gradient-to-br from-white to-lacquer-soft/60 p-5 sm:p-6">
          <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-lacquer-soft sm:size-20">
            {inv?.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={inv.cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <div aria-hidden className="grid h-full w-full place-items-center text-xl font-bold text-lacquer">
                {title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-tight text-ink sm:text-xl">{title}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted">
              <Calendar className="size-4" aria-hidden />
              {formatEventDate(inv?.eventDate)}
            </p>
          </div>
        </div>

        {/* Thanh tab: chữ câu thường, gạch chân cho mục đang chọn */}
        <nav aria-label="Mục quản lý thiệp" className="border-b border-line">
          <ul className="flex gap-1 overflow-x-auto px-3 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {INVITATION_TABS.map((tab) => {
              const href = tab.path ? ROUTES.invitationTab(id, tab.path) : basePath;
              const isActive = tab.path === "" ? pathname === basePath : pathname.startsWith(href);
              const isDanger = tab.path === "delete";
              return (
                <li key={tab.path || "overview"} className="shrink-0">
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex h-12 items-center whitespace-nowrap px-3 text-sm font-medium transition-colors sm:px-4 ${
                      isActive ? "text-lacquer" : isDanger ? "text-red-600 hover:text-red-700" : "text-muted hover:text-ink"
                    }`}
                  >
                    {tab.label}
                    {isActive && <span aria-hidden className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-lacquer" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
