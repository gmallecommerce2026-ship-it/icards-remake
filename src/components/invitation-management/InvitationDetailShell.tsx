"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { INVITATION_TABS, ROUTES } from "@/lib/routes";

export function InvitationDetailShell({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const basePath = ROUTES.invitation(id);

  return (
    <div className="flex flex-col gap-6">
      {/* Đường dẫn quay lại danh sách: nhỏ, không chiếm chỗ */}
      <Link
        href={ROUTES.invitationManagement}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-lacquer"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Quản lý thiệp mời
      </Link>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        {/* Thanh tab: chữ câu thường, gạch chân cho mục đang chọn, cuộn ngang trên màn hình nhỏ */}
        <nav aria-label="Mục quản lý thiệp" className="border-b border-line">
          <ul className="flex gap-1 overflow-x-auto px-3 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {INVITATION_TABS.map((tab) => {
              const href = tab.path ? ROUTES.invitationTab(id, tab.path) : basePath;
              // Tab "Tổng quan" khớp hoàn toàn; các tab khác khớp theo tiền tố
              const isActive = tab.path === "" ? pathname === basePath : pathname.startsWith(href);
              const isDanger = tab.path === "delete";

              return (
                <li key={tab.path || "overview"} className="shrink-0">
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex h-12 items-center whitespace-nowrap px-3 text-sm font-medium transition-colors sm:px-4 ${
                      isActive
                        ? "text-lacquer"
                        : isDanger
                          ? "text-red-600 hover:text-red-700"
                          : "text-muted hover:text-ink"
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span aria-hidden className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-lacquer" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Nội dung từng tab: đệm rộng hơn để không bị chật */}
        <div className="p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
