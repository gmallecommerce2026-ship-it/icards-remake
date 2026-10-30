import { ReactNode } from "react";
import { InvitationDetailShell } from "@/components/invitation-management/InvitationDetailShell";
import { getUserInvitations } from "@/lib/dashboard";

// Bắt buộc vì next.config đang dùng output: 'export' (xuất tĩnh).
// Khi nối API thật, thay bằng danh sách id lấy từ API.
export function generateStaticParams() {
  return getUserInvitations().map((inv) => ({ id: inv.id }));
}

export default async function InvitationDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvitationDetailShell id={id}>{children}</InvitationDetailShell>;
}
