"use client";

import dynamic from "next/dynamic";

// Trình quản lý banner dùng dnd-kit và chỉ chạy trên trình duyệt, nên tải động để không ảnh hưởng SSR.
const BannerAdmin = dynamic(() => import("@/components/admin/banners/BannerAdmin"), {
  ssr: false,
  loading: () => <p className="text-sm text-[#5B6B7F]">Đang tải…</p>,
});

export default function AdminBannersPage() {
  return <BannerAdmin />;
}
