"use client";

import dynamic from "next/dynamic";

// Trình quản lý dùng state và API phía trình duyệt, nên tải động để không chạy trên server.
const TemplateAdmin = dynamic(() => import("@/components/admin/content/TemplateAdmin"), {
  ssr: false,
  loading: () => <p className="text-sm text-[#5B6B7F]">Đang tải…</p>,
});

export default function AdminTemplatesPage() {
  return <TemplateAdmin />;
}
