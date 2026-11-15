// Cây danh mục mẫu thiệp nhiều cấp (dữ liệu từ GET /api/template-categories) và các hàm thuần để dùng trên menu + trang /templates.

export type TreeTemplate = { _id: string; slug: string; name: string; previewImage?: string | null };
export type TreeNode = {
  id: string;
  label: string;
  /** /templates?category=<gốc>[&group=<nút>] */
  path: string;
  count: number;
  templates: TreeTemplate[];
  children: TreeNode[];
};

/** Danh mục dự phòng khi API chưa có cây: giúp menu không bao giờ trống. Khớp với cột category của mẫu thiệp. */
export const FALLBACK_ROOTS: { id: string; label: string }[] = [
  { id: "wedding", label: "Thiệp cưới" },
  { id: "birthday", label: "Sinh nhật" },
  { id: "baby", label: "Đầy tháng, thôi nôi" },
  { id: "event", label: "Sự kiện" },
];

export const rootOf = (id: string, label: string): TreeNode => ({
  id, label, path: `/templates?category=${id}`, count: 0, templates: [], children: [],
});

/** Đường đi từ gốc tới nút có id cho trước (gồm cả hai đầu). Rỗng nếu không thấy. */
export function findPath(nodes: TreeNode[], id: string, trail: TreeNode[] = []): TreeNode[] {
  for (const n of nodes) {
    const here = [...trail, n];
    if (n.id === id) return here;
    const deeper = findPath(n.children, id, here);
    if (deeper.length) return deeper;
  }
  return [];
}

/** Slug mọi mẫu thuộc nút này và các nút con. */
export function collectSlugs(node: TreeNode, out = new Set<string>()): Set<string> {
  node.templates.forEach((t) => out.add(t.slug));
  node.children.forEach((c) => collectSlugs(c, out));
  return out;
}

/** Mẫu thiệp của nút và mọi nút con, theo thứ tự cây (nhóm con đầu tiên trước). */
export function flattenTemplates(node: TreeNode, out: TreeTemplate[] = []): TreeTemplate[] {
  node.templates.forEach((t) => out.push(t));
  node.children.forEach((c) => flattenTemplates(c, out));
  return out;
}
