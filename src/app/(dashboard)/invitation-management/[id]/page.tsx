import type { Metadata } from "next";
import { Overview } from "@/components/invitation-management/Overview";

export const metadata: Metadata = { title: "Tổng quan thiệp | iCards" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Overview id={id} />;
}
