import type { Metadata } from "next";
import { PlannerPanel } from "@/components/invitation-management/PlannerPanel";

export const metadata: Metadata = { title: "Kế hoạch cưới | iCards" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlannerPanel id={id} />;
}
