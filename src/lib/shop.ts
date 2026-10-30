// =====================================================================
// DỮ LIỆU MẪU: thay danh mục, sản phẩm, giá, ảnh bằng dữ liệu thật của iCards.
// Sau này có API/CMS chỉ cần đổi nội dung các hàm get* bên dưới,
// các trang không phải sửa.
// =====================================================================

export type Tone = { bg: string; ink: string };

export type ShopCategory = { slug: string; label: string };

export type Product = {
  slug: string;
  name: string;
  excerpt: string;
  category: string; // slug của ShopCategory
  price: number;
  compareAt?: number; // giá gốc (nếu đang giảm)
  badge?: "Mới" | "Bán chạy";
  rating: number;
  sold: number;
  date: string; // ISO
  tone: Tone;
  image?: string; // ví dụ "/shop/thiep-cuoi-in.jpg" trong thư mục public
  features: string[];
};

export const ALL_LABEL = "Tất cả";

export const SHOP_CATEGORIES: ShopCategory[] = [
  { slug: "thiep-in", label: "Thiệp in" },
  { slug: "qua-tang", label: "Quà tặng" },
  { slug: "phu-kien", label: "Phụ kiện QR & NFC" },
  { slug: "combo", label: "Combo tiết kiệm" },
];

export const SORTS = [
  { value: "popular", label: "Phổ biến" },
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá thấp → cao" },
  { value: "price-desc", label: "Giá cao → thấp" },
] as const;

export type SortValue = (typeof SORTS)[number]["value"];

export const PRODUCTS: Product[] = [
  {
    slug: "thiep-cuoi-in-ep-kim",
    name: "Thiệp cưới in ép kim",
    excerpt: "Giấy mỹ thuật dày, ép kim vàng sang trọng, kèm QR mở thiệp online.",
    category: "thiep-in",
    price: 12000,
    compareAt: 15000,
    badge: "Bán chạy",
    rating: 4.9,
    sold: 1280,
    date: "2026-08-12",
    tone: { bg: "#E8EEF6", ink: "#27548A" },
    features: ["Giấy mỹ thuật 300gsm", "Ép kim vàng/bạc", "Tích hợp QR thiệp online", "Tối thiểu 50 thiệp"],
  },
  {
    slug: "thiep-moi-su-kien-toi-gian",
    name: "Thiệp mời sự kiện tối giản",
    excerpt: "Thiết kế gọn, hiện đại cho sinh nhật, khai trương, hội nghị.",
    category: "thiep-in",
    price: 6500,
    badge: "Mới",
    rating: 4.7,
    sold: 420,
    date: "2026-10-05",
    tone: { bg: "#FDECEC", ink: "#B42318" },
    features: ["In offset 2 mặt", "Cán màng mờ", "Giao nhanh 3–5 ngày", "Tối thiểu 30 thiệp"],
  },
  {
    slug: "bao-li-xi-thiep-cuoi",
    name: "Bao lì xì & phong bì thiệp cưới",
    excerpt: "Phong bì đồng bộ với mẫu thiệp, in logo đôi tân hôn.",
    category: "thiep-in",
    price: 3500,
    rating: 4.6,
    sold: 760,
    date: "2026-06-20",
    tone: { bg: "#FFF4E5", ink: "#B54708" },
    features: ["Đồng bộ thiết kế thiệp", "In tên cô dâu chú rể", "Nhiều khổ phong bì"],
  },
  {
    slug: "hop-qua-cam-on-khach-moi",
    name: "Hộp quà cảm ơn khách mời",
    excerpt: "Hộp quà nhỏ xinh kèm thẻ cảm ơn in tên riêng từng khách.",
    category: "qua-tang",
    price: 45000,
    compareAt: 55000,
    badge: "Bán chạy",
    rating: 4.8,
    sold: 310,
    date: "2026-09-02",
    tone: { bg: "#EAF6EE", ink: "#067647" },
    features: ["Hộp cứng cao cấp", "Thẻ cảm ơn cá nhân hoá", "Có thể thêm nến/kẹo"],
  },
  {
    slug: "khung-anh-qr-guest-book",
    name: "Khung ảnh QR Guest Book",
    excerpt: "Khách quét QR để gửi lời chúc và ảnh ngay tại tiệc.",
    category: "qua-tang",
    price: 180000,
    rating: 4.8,
    sold: 95,
    date: "2026-10-18",
    badge: "Mới",
    tone: { bg: "#F3EEFB", ink: "#6941C6" },
    features: ["Khung gỗ/acrylic", "QR tuỳ biến theo sự kiện", "Gom lời chúc về dashboard"],
  },
  {
    slug: "the-nfc-mo-thiep",
    name: "Thẻ NFC mở thiệp mời",
    excerpt: "Chạm điện thoại là mở thiệp online, không cần cài app.",
    category: "phu-kien",
    price: 35000,
    rating: 4.7,
    sold: 540,
    date: "2026-07-14",
    tone: { bg: "#E8EEF6", ink: "#27548A" },
    features: ["Chip NFC NTAG215", "Tương thích iPhone & Android", "Ghi sẵn link thiệp"],
  },
  {
    slug: "standee-qr-check-in",
    name: "Standee QR check-in",
    excerpt: "Standee để bàn/đứng sàn cho quầy đón khách và check-in nhanh.",
    category: "phu-kien",
    price: 220000,
    compareAt: 260000,
    rating: 4.9,
    sold: 188,
    date: "2026-05-30",
    tone: { bg: "#FDECEC", ink: "#B42318" },
    features: ["In UV chống bay màu", "Kèm QR check-in", "Khổ A4 – A2"],
  },
  {
    slug: "combo-cuoi-tron-goi",
    name: "Combo cưới trọn gói",
    excerpt: "Thiệp in + thiệp online + thẻ NFC + QR mừng cưới trong một gói.",
    category: "combo",
    price: 1490000,
    compareAt: 1890000,
    badge: "Bán chạy",
    rating: 5,
    sold: 142,
    date: "2026-09-25",
    tone: { bg: "#FFF4E5", ink: "#B54708" },
    features: ["100 thiệp in ép kim", "Thiệp online không giới hạn khách", "50 thẻ NFC", "Hỗ trợ thiết kế 1–1"],
  },
  {
    slug: "combo-su-kien-doanh-nghiep",
    name: "Combo sự kiện doanh nghiệp",
    excerpt: "Thiệp mời, standee check-in và báo cáo khách tham dự.",
    category: "combo",
    price: 2390000,
    rating: 4.8,
    sold: 64,
    date: "2026-10-10",
    badge: "Mới",
    tone: { bg: "#EAF6EE", ink: "#067647" },
    features: ["200 thiệp in", "2 standee QR", "Dashboard check-in realtime"],
  },
];

// ---------------------------------------------------------------- helpers

export function getShopCategory(param?: string): ShopCategory | undefined {
  if (!param) return undefined;
  const v = param.trim().toLowerCase();
  if (v === ALL_LABEL.toLowerCase()) return undefined;
  return SHOP_CATEGORIES.find((c) => c.slug === v || c.label.toLowerCase() === v);
}

export function getSort(param?: string): SortValue {
  return SORTS.find((s) => s.value === param)?.value ?? "popular";
}

export function getProducts(opts: { category?: string; sort?: SortValue; q?: string } = {}): Product[] {
  const { category, sort = "popular", q } = opts;
  const needle = q?.trim().toLowerCase();

  const list = PRODUCTS.filter(
    (p) =>
      (!category || p.category === category) &&
      (!needle || p.name.toLowerCase().includes(needle) || p.excerpt.toLowerCase().includes(needle)),
  );

  return [...list].sort((a, b) => {
    switch (sort) {
      case "newest":
        return b.date.localeCompare(a.date);
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      default:
        return b.sold - a.sold;
    }
  });
}

export function countByCategory(slug?: string): number {
  return slug ? PRODUCTS.filter((p) => p.category === slug).length : PRODUCTS.length;
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(p: Product, limit = 3): Product[] {
  return PRODUCTS.filter((x) => x.slug !== p.slug && x.category === p.category)
    .concat(PRODUCTS.filter((x) => x.slug !== p.slug && x.category !== p.category))
    .slice(0, limit);
}

export function formatVND(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export function discountPercent(p: Product): number | null {
  if (!p.compareAt || p.compareAt <= p.price) return null;
  return Math.round((1 - p.price / p.compareAt) * 100);
}