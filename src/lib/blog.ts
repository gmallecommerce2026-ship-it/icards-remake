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

export type BlogKeyword = { keyword: string; blurb: string };
export type BlogKeywordGroup = { title: string; items: BlogKeyword[] };

/** Từ khoá thường gặp ở cuối trang blog. Bấm một từ khoá sẽ tìm bài viết theo từ đó. */
export const BLOG_KEYWORD_GROUPS: BlogKeywordGroup[] = [
  {
    title: "Thiệp mời",
    items: [
      { keyword: "lời mời", blurb: "Cách viết lời mời đám cưới, sinh nhật và sự kiện trang trọng hay thân mật." },
      { keyword: "mẫu thiệp", blurb: "Gợi ý phong cách thiệp theo chủ đề, màu sắc và bố cục dễ đọc." },
      { keyword: "thiệp điện tử", blurb: "Thiệp online có nhạc, ảnh và bản đồ, gửi qua link chỉ với một chạm." },
      { keyword: "thiệp đám cưới", blurb: "Mẫu thiệp cưới theo phong cách truyền thống, hiện đại và tối giản." },
      { keyword: "thiệp sinh nhật", blurb: "Thiệp mời sinh nhật trẻ em, người lớn và tiệc bất ngờ." },
    ],
  },
  {
    title: "Chuẩn bị sự kiện",
    items: [
      { keyword: "ngân sách", blurb: "Lập dự trù chi phí, phân bổ theo hạng mục và theo dõi chi thực tế." },
      { keyword: "danh sách khách mời", blurb: "Cách chia nhóm khách, ưu tiên người thân và tránh bỏ sót." },
      { keyword: "lời chúc", blurb: "Gợi ý câu chúc ngắn, ý nghĩa cho sổ lưu bút và thiệp cảm ơn." },
      { keyword: "xác nhận tham dự", blurb: "Thiết lập hạn RSVP và cách nhắc khách trả lời đúng hạn." },
      { keyword: "kế hoạch cưới", blurb: "Checklist từng mốc: đặt tiệc, chụp ảnh, trang trí và di chuyển." },
    ],
  },
  {
    title: "Gửi & chia sẻ",
    items: [
      { keyword: "gửi thiệp online", blurb: "Cách gửi thiệp qua email hoặc tin nhắn để khách mở được trên điện thoại." },
      { keyword: "link thiệp", blurb: "Đặt link dễ nhớ, chia sẻ đúng kênh và theo dõi lượt xem." },
      { keyword: "email nhắc nhở", blurb: "Lịch nhắc trước sự kiện giúp khách không quên đến dự." },
      { keyword: "QR code", blurb: "In mã QR lên thiệp giấy, standee để khách quét vào thiệp online." },
      { keyword: "phong bì", blurb: "Chọn phong bì, in tên và cách đóng gói thiệp in an toàn." },
    ],
  },
];
