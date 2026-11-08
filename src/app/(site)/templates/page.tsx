import type { Metadata } from "next";
import { getTemplateCategories, getTemplates, getTemplateTree } from "@/lib/catalog";
import { TemplatesListing } from "@/components/templates/TemplatesListing";

export const metadata: Metadata = {
  title: "Mẫu thiệp mời online",
  description:
    "Chọn mẫu thiệp cưới, sinh nhật, đầy tháng và sự kiện. Xem trước trên điện thoại, điền thông tin và gửi link cho khách mời.",
};

type Search = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function TemplatesPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const [templates, categories, tree] = await Promise.all([getTemplates(), getTemplateCategories(), getTemplateTree()]);
  return (
    <TemplatesListing
      templates={templates}
      categories={categories}
      tree={tree}
      category={first(sp.category) ?? "all"}
      group={first(sp.group)}
      initialSort={first(sp.sort)}
    />
  );
}
