import type { Metadata } from "next";
import { getTemplateCategories, getTemplates } from "@/lib/catalog";
import { TemplatesView } from "@/components/templates/TemplatesView";

export const metadata: Metadata = {
  title: "Mẫu thiệp mời online",
  description:
    "Chọn mẫu thiệp cưới, sinh nhật, đầy tháng và sự kiện. Xem trước trên điện thoại, điền thông tin và gửi link cho khách mời.",
};

export default async function TemplatesPage() {
  const [templates, categories] = await Promise.all([getTemplates(), getTemplateCategories()]);
  return <TemplatesView templates={templates} categories={categories} />;
}
