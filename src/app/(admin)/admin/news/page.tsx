"use client";

import dynamic from "next/dynamic";

// Trình quản lý bài viết dùng trạng thái phía trình duyệt, nên tải động để không chạy trên server.
const NewsAdmin = dynamic(() => import("@/components/admin/content/NewsAdmin"), {
  ssr: false,
  loading: () => <p className="text-sm text-[#5B6B7F]">Đang tải…</p>,
});

export default function AdminNewsPage() {
  return <NewsAdmin />;
}
