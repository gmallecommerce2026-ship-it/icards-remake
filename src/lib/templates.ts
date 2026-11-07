import { ROUTES } from "@/lib/routes";
// Kiểu và hàm thuần cho mẫu thiệp. Dữ liệu thật lấy từ API (xem lib/catalog.ts), không còn mock ở đây.

export type CategoryId = "wedding" | "birthday" | "event" | "baby";

export type Motif = "arch" | "circle" | "frame" | "stripe";

export type InvitationTemplate = {
  slug: string;
  name: string;
  category: CategoryId;
  tagline: string;
  description: string;
  /** 0 = miễn phí. Đơn vị: VND */
  price: number;
  popularity: number; // số lượt dùng
  createdAt: string; // ISO yyyy-mm-dd (ngày phát hành)
  features: string[];
  /** Nếu có ảnh thật (vd: /templates/so-mai.jpg) thì card sẽ dùng ảnh thay cho bản xem trước dựng bằng CSS */
  previewImage?: string;
  motif: Motif;
  palette: { bg: string; ink: string; accent: string; soft: string };
  sample: {
    kicker: string;
    titleLines: string[];
    date: string;
    time: string;
    place: string;
    address: string;
    message: string;
  };
};

/** Trang tạo sự kiện (nhóm dashboard làm sau). Đổi đường dẫn ở đây nếu cần. */
export const CREATE_EVENT_HREF = ROUTES.newEvent;

export function getRelatedTemplates(list: InvitationTemplate[], slug: string, limit = 3): InvitationTemplate[] {
  const current = list.find((t) => t.slug === slug);
  if (!current) return [];
  const same = list.filter((t) => t.slug !== slug && t.category === current.category);
  const others = list.filter((t) => t.slug !== slug && t.category !== current.category);
  return [...same, ...others].slice(0, limit);
}

export function categoryLabel(id: string, categories: { id: string; label: string }[]): string {
  return categories.find((c) => c.id === id)?.label ?? "";
}

export function formatPrice(price: number): string {
  if (price === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(price);
}
