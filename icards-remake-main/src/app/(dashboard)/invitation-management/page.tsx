import { Metadata } from "next";
import { InvitationManagementView } from "@/components/invitation-management/InvitationManagementView";

export const metadata: Metadata = {
  title: "Quản lý thiệp mời | iCards",
  description: "Quản lý danh sách thiệp điện tử và sự kiện của bạn.",
};

export default function InvitationManagementPage() {
  return <InvitationManagementView />;
}
