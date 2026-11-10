import type { Metadata } from "next";
import { getTemplateCategories, getTemplates, getTemplateTree } from "@/lib/catalog";
import { TemplatesListing } from "@/components/templates/TemplatesListing";

export const metadata: Metadata = {
  title: "Mẫu thiệp mời online",
  description:
    "Chọn mẫu thiệp cưới, sinh nhật, đầy tháng và sự kiện. Xem trước trên điện thoại, điền thông tin và gửi link cho khách mời.",
};

type Search = Promise<Record<string, string | string[] | undefined>>;
const SORT_VALUES = ["popular", "newest", "price-asc"];
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function TemplatesPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  // Lọc theo nhóm (hoặc danh mục gốc) ngay trên backend; trang chỉ nhận danh sách đã lọc.
  const category = first(sp.category) ?? "all";
  const group = first(sp.group);
  const sort = first(sp.sort);
  const categoryId = group ?? (category !== "all" ? category : undefined);
  const [templates, categories, tree] = await Promise.all([
    getTemplates({ categoryId, sort: SORT_VALUES.includes(sort ?? "") ? sort : undefined }),
    getTemplateCategories(),
    getTemplateTree(),
  ]);
  return (
    <TemplatesListing
      templates={templates}
      categories={categories}
      tree={tree}
      category={category}
      group={group}
      initialSort={sort}
    />
  );
}
