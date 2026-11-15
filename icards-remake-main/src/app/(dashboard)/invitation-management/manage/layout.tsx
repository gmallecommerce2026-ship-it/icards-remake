"use client";

import { ReactNode, use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Các tab quản lý thiệp dựa trên thiết kế mẫu
const INVITATION_TABS = [
  { path: "", label: "TỔNG QUAN" },
  { path: "/guests", label: "QUẢN LÝ KHÁCH MỜI" },
  { path: "/wishes", label: "QUẢN LÝ LỜI CHÚC" },
  { path: "/events", label: "QUẢN LÍ SỰ KIỆN" },
  { path: "/planner", label: "KẾ HOẠCH CƯỚI" },
  { path: "/budget", label: "NGÂN SÁCH" },
  { path: "/settings", label: "CÀI ĐẶT THIỆP MỜI" },
  { path: "/delete", label: "XÓA THIỆP MỜI" },
];

export default function InvitationDetailLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const pathname = usePathname();

  const basePath = `/invitation-management/${id}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Nút quay lại danh sách thiệp */}
      <div>
        <Link 
          href="/invitation-management" 
          className="text-sm font-medium text-[#27548A] hover:underline"
        >
          &larr; Quay lại danh sách thiệp
        </Link>
      </div>

      <div className="rounded-xl border border-line bg-white shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-line bg-white scrollbar-hide">
          {INVITATION_TABS.map((tab) => {
            const href = `${basePath}${tab.path}`;
            // So khớp đường dẫn hiện tại với href (ưu tiên khớp hoàn toàn cho tab Tổng quan)
            const isActive = tab.path === "" 
              ? pathname === basePath 
              : pathname.startsWith(href);

            return (
              <Link
                key={tab.path}
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
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}