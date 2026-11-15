import type { Metadata } from "next";
import { GuestsPanel } from "@/components/invitation-management/GuestsPanel";

export const metadata: Metadata = { title: "Quản lý khách mời | iCards" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GuestsPanel id={id} />;
}
