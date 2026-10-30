import Link from "next/link";
import { ROUTES } from "@/lib/routes";

// TODO: trang tạo sự kiện (nhận ?template=<slug> từ trang mẫu thiệp).
export default function NewEventPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-2">Tạo sự kiện mới</h1>
      <p className="text-sm text-muted mb-4">Giao diện tạo sự kiện đang được xây dựng.</p>
      <Link href={ROUTES.invitationManagement} className="text-sm font-medium text-[#27548A] hover:underline">
        &larr; Quay lại quản lý thiệp mời
      </Link>
    </div>
  );
}
