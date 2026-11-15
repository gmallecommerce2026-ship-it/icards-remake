import { ReactNode } from "react";
import { InvitationDetailShell } from "@/components/invitation-management/InvitationDetailShell";

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
