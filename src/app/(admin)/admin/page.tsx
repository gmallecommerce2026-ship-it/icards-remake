"use client";

import { useEffect, useState } from "react";
import * as adminApi from "@/lib/api/admin";
import type { AdminStats } from "@/lib/api/admin";
import { ErrorBox, PageTitle, StatCard, errorMessage } from "@/components/admin/ui";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getAdminStats()
      .then((r) => setStats(r.data))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  return (
    <>
      <PageTitle title="Tổng quan" description="Số liệu hiện tại của hệ thống iCards." />
      {error && <ErrorBox>{error}</ErrorBox>}
      {!stats && !error && <p className="text-sm text-[#5B6B7F]">Đang tải…</p>}
      {stats && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Người dùng" value={stats.users} hint={`${stats.inactiveUsers} đang bị khoá`} />
          <StatCard label="Quản trị viên" value={stats.admins} />
          <StatCard label="Thiệp mời" value={stats.invitations} hint={`${stats.publishedInvitations} đã xuất bản`} />
          <StatCard label="Lời chúc chờ duyệt" value={stats.pendingWishes} />
          <StatCard label="Yêu cầu dịch vụ" value={stats.serviceRequests} />
        </div>
      )}
    </>
  );
}
