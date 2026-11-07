import type { Metadata } from "next";
import { SettingsForm } from "@/components/invitation-management/SettingsForm";

export const metadata: Metadata = { title: "Cài đặt thiệp mời | iCards" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SettingsForm id={id} />;
}
