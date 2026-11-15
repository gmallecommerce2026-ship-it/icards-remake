"use client";

import dynamic from "next/dynamic";

// Trình quản lý dùng form và trạng thái phía trình duyệt, nên tải động để không chạy trên server.
const ShopAdmin = dynamic(() => import("@/components/admin/content/ShopAdmin"), {
  ssr: false,
  loading: () => <p className="text-sm text-[#5B6B7F]">Đang tải…</p>,
});

export default function AdminShopPage() {
  return <ShopAdmin />;
}
