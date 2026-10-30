"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
      {/* Nút quay lại danh sách thiệp */}
      <div>
        <Link
          href={ROUTES.invitationManagement}
          className="text-sm font-medium text-[#27548A] hover:underline"
        >
          &larr; Quay lại danh sách thiệp
        </Link>
      </div>

      <div className="rounded-xl border border-line bg-white shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-line bg-white scrollbar-hide">
          {INVITATION_TABS.map((tab) => {
            const href = tab.path ? ROUTES.invitationTab(id, tab.path) : basePath;
            // Tab "Tổng quan" khớp hoàn toàn; các tab khác khớp theo tiền tố
            const isActive =
              tab.path === "" ? pathname === basePath : pathname.startsWith(href);

            return (
              <Link
                key={tab.path || "overview"}
                href={href}
                className={`whitespace-nowrap px-6 py-4 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[#27548A] text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#27548A]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Nội dung chi tiết của từng Tab */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
