import type { Metadata } from "next";
import { BudgetPanel } from "@/components/invitation-management/BudgetPanel";

export const metadata: Metadata = { title: "Ngân sách | iCards" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BudgetPanel id={id} />;
}
