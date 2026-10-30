import Link from "next/link";
import { Metadata } from "next";
import { Plus, Users, Calendar, ArrowRight } from "lucide-react";
import { getUserInvitations } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Quản lý thiệp mời | iCards",
  description: "Quản lý danh sách thiệp điện tử và sự kiện của bạn.",
};

export default function InvitationManagementPage() {
  const invitations = getUserInvitations();

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Quản lý thiệp mời</h1>
          <p className="text-sm text-muted mt-1">Danh sách các sự kiện và thiệp bạn đã tạo.</p>
        </div>
        <Link
          href="/templates" // Chuyển đến trang mẫu để tạo mới
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-lacquer px-5 text-sm font-medium text-white transition-colors hover:bg-lacquer-dark focus-visible:outline-none"
        >
          <Plus className="h-4 w-4" />
          Tạo thiệp mới
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {invitations.map((inv) => (
          <Link
            key={inv.id}
            href={`/invitation-management/${inv.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lacquer"
          >
            {/* Ảnh bìa giả lập bằng CSS */}
            <div 
              className="h-32 w-full shrink-0 relative"
              style={{ backgroundColor: inv.coverTone.bg }}
            >
              <div 
                className="absolute inset-x-8 top-8 bottom-0 rounded-t-xl bg-white shadow-sm"
                style={{ borderTop: `4px solid ${inv.coverTone.ink}` }}
              />
              {inv.status === "draft" && (
                <span className="absolute top-3 right-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-ink backdrop-blur-sm">
                  Bản nháp
                </span>
              )}
            </div>
            
            <div className="flex flex-1 flex-col p-5">
              <h2 className="mb-1 truncate text-lg font-bold text-ink group-hover:text-lacquer transition-colors">
                {inv.title}
              </h2>
              <div className="mb-4 flex items-center gap-2 text-xs text-muted">
                <span className="rounded bg-porcelain px-2 py-0.5">{inv.eventType}</span>
              </div>
              
              <div className="mt-auto grid grid-cols-2 gap-4 border-t border-line pt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted uppercase">Ngày tổ chức</span>
                    <span className="text-sm font-medium text-ink">
                      {new Date(inv.eventDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted uppercase">Khách mời</span>
                    <span className="text-sm font-medium text-ink">
                      {inv.stats.attending} / {inv.stats.totalGuests}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}