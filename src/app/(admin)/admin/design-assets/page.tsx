"use client";

import dynamic from "next/dynamic";

// Trình quản lý dùng state và API phía trình duyệt, nên tải động để không chạy trên server.
const DesignAssetAdmin = dynamic(() => import("@/components/admin/content/DesignAssetAdmin"), {
  ssr: false,
  loading: () => <p className="text-sm text-[#5B6B7F]">Đang tải…</p>,
});

export default function AdminDesignAssetsPage() {
  return <DesignAssetAdmin />;
}
