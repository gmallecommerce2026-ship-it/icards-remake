import Link from "next/link";
import { Metadata } from "next";
import { Plus } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { InvitationList } from "@/components/invitation-management/InvitationList";

export const metadata: Metadata = {
  title: "Quản lý thiệp mời | iCards",
  description: "Quản lý danh sách thiệp điện tử và sự kiện của bạn.",
};

export default function InvitationManagementPage() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Quản lý thiệp mời</h1>
          <p className="text-sm text-muted mt-1">Danh sách các sự kiện và thiệp bạn đã tạo.</p>
        </div>
        <Link
          href="/templates"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-lacquer px-5 text-sm font-medium text-white transition-colors hover:bg-lacquer-dark focus-visible:outline-none"
        >
          <Plus className="h-4 w-4" />
          Tạo thiệp mới
        </Link>
      </div>
      <InvitationList />
    </div>
  );
}
