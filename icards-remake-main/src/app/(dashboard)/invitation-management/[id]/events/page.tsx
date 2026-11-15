import type { Metadata } from "next";
import { EventsPanel } from "@/components/invitation-management/EventsPanel";

export const metadata: Metadata = { title: "Quản lý sự kiện | iCards" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventsPanel id={id} />;
}
