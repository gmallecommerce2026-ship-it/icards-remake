// src/lib/blog.ts
// Kiểu và hàm thuần cho blog. Dữ liệu thật lấy từ API (xem lib/catalog.ts).

export type BlogCategory = { slug: string; label: string };

export type Block =
  | { t: "h2"; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "tip"; text: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string; // slug của BlogCategory
  date: string; // ISO yyyy-mm-dd
  readMinutes: number;
  author: string;
  tone: { bg: string; ink: string };
  /** Có khi lấy chi tiết một bài; danh sách không kèm nội dung */
  content?: Block[];
};

export function getCategory(categories: BlogCategory[], slug?: string) {
  return categories.find((c) => c.slug === slug);
}

export function filterPosts(list: Post[], category?: string) {
  const filtered = category ? list.filter((p) => p.category === category) : list;
  return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
}

export function getRelated(list: Post[], post: Post, limit = 3) {
  const same = list.filter((p) => p.slug !== post.slug && p.category === post.category);
  const rest = list.filter((p) => p.slug !== post.slug && p.category !== post.category);
  return [...same, ...rest].slice(0, limit);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Bỏ dấu + hạ chữ thường để tìm kiếm tiếng Việt không phân biệt dấu. */
export function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function searchPosts(list: Post[], query?: string) {
  const q = normalizeText(query ?? "").trim();
  if (!q) return list;
  return list.filter((p) => normalizeText(`${p.title} ${p.excerpt}`).includes(q));
}

export function countByCategory(list: Post[]) {
  const counts: Record<string, number> = {};
  for (const p of list) counts[p.category] = (counts[p.category] ?? 0) + 1;
  return counts;
}

/** Nhóm từ khoá thường gặp ở cuối trang blog. Bấm một từ khoá sẽ tìm bài viết theo từ đó. */
export const BLOG_KEYWORD_GROUPS: { title: string; keywords: string[] }[] = [
  { title: "Thiệp mời", keywords: ["lời mời", "mẫu thiệp", "thiệp điện tử", "thiệp đám cưới"] },
  { title: "Chuẩn bị sự kiện", keywords: ["ngân sách", "danh sách khách mời", "lời chúc", "xác nhận tham dự"] },
  { title: "Chia sẻ", keywords: ["gửi thiệp online", "link thiệp", "phong bì", "QR code"] },
];
