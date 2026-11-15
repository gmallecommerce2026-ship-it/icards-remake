import { Suspense } from "react";
import { AppearanceTabs } from "@/components/admin/appearance/AppearanceTabs";

export default function AdminAppearancePage() {
  // useSearchParams (đọc ?tab=) cần Suspense khi build tĩnh
  return (
    <Suspense fallback={<p className="text-sm text-[#5B6B7F]">Đang tải…</p>}>
      <AppearanceTabs />
    </Suspense>
  );
}
