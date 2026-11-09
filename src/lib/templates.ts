import { ROUTES } from "@/lib/routes";
// Kiểu và hàm thuần cho mẫu thiệp. Dữ liệu thật lấy từ API (xem lib/catalog.ts), không còn mock ở đây.

export type CategoryId = "wedding" | "birthday" | "event" | "baby";

export type Motif = "arch" | "circle" | "frame" | "stripe";

/** folding: thiệp gập 5:7 (bìa, ruột, mặt sau). card: thiệp 2 mặt phẳng, kích thước theo orientation. */
export type TemplateFormat = "folding" | "card";
/** landscape: ngang (rộng > cao). square: vuông. portrait: dọc (cao > rộng). */
export type TemplateOrientation = "landscape" | "square" | "portrait";

/** Một phần tử trên một mặt thiệp. x, w, sz tính theo chiều rộng thiệp; y, h tính theo chiều cao (tỉ lệ 0..1). */
export type FaceElement = {
  kind: "text" | "shape";
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  sz?: number;
  font?: "display" | "body" | "script";
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  color?: "ink" | "accent" | "soft" | "bg";
  shape?: "arch" | "circle" | "rect" | "frame" | "line";
  fill?: "ink" | "accent" | "soft" | "bg";
};

export type CardLayout = { front: FaceElement[]; back: FaceElement[] };

/** Kích thước thiết kế (px) của từng kiểu dáng, khớp TEMPLATE_CARD_SIZES ở backend. */
export const ORIENTATION_SIZE: Record<TemplateOrientation, { w: number; h: number }> = {
  landscape: { w: 700, h: 500 },
  square: { w: 600, h: 600 },
  portrait: { w: 500, h: 700 },
};

export const ORIENTATION_LABEL: Record<TemplateOrientation, string> = {
  landscape: "Khổ ngang",
  square: "Khổ vuông",
  portrait: "Khổ dọc",
};

/** Tỉ lệ khung (rộng / cao) của kiểu dáng, dùng cho aspect-ratio. */
export function orientationRatio(o: TemplateOrientation): string {
  const { w, h } = ORIENTATION_SIZE[o];
  return `${w} / ${h}`;
}

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
  /** Phong bì mặc định khi mở studio với mẫu này (id trong envelope.data.ts). Không có thì dùng mặc định chung. */
  envelope?: { envId?: string; linerId?: string };
  /** Kiểu thiệp. Không có thì coi là folding (mẫu cũ). */
  format?: TemplateFormat;
  /** Kiểu dáng. Không có thì coi là portrait (mẫu cũ 5:7 đứng). */
  orientation?: TemplateOrientation;
  /** Bố cục hai mặt, chỉ có với format = card. */
  layout?: CardLayout;
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
