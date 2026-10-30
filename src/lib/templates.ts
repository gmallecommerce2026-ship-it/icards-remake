import { ROUTES } from "@/lib/routes";
// Dữ liệu mẫu thiệp. Sau này thay bằng API / DB: chỉ cần giữ nguyên kiểu InvitationTemplate
// và 3 hàm getTemplates, getTemplateBySlug, getRelatedTemplates.

export type CategoryId = "wedding" | "birthday" | "event" | "baby";

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "wedding", label: "Thiệp cưới" },
  { id: "birthday", label: "Sinh nhật" },
  { id: "baby", label: "Đầy tháng, thôi nôi" },
  { id: "event", label: "Sự kiện" },
];

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
  createdAt: string; // ISO
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

export const TEMPLATES: InvitationTemplate[] = [
  {
    slug: "som-mai",
    name: "Sớm Mai",
    category: "wedding",
    tagline: "Xanh dương nhẹ, bố cục thoáng, hợp đám cưới buổi sáng",
    description:
      "Nền xanh nhạt với khung vòm ở trang bìa. Tên cô dâu chú rể là phần nổi bật nhất, các thông tin còn lại xếp gọn để khách mời xem nhanh trên điện thoại.",
    price: 0,
    popularity: 4820,
    createdAt: "2026-03-02",
    features: ["Ảnh bìa và lời mời", "Đếm ngược đến ngày cưới", "Album ảnh", "Bản đồ chỉ đường", "Xác nhận tham dự", "Sổ lưu bút"],
    motif: "arch",
    palette: { bg: "#E8EEF6", ink: "#17263F", accent: "#27548A", soft: "#CBD8EA" },
    sample: {
      kicker: "Trân trọng kính mời",
      titleLines: ["Minh Anh", "&", "Quốc Bảo"],
      date: "Chủ nhật, 14.12.2026",
      time: "10:30",
      place: "Trung tâm tiệc cưới Hương Giang",
      address: "12 Lê Lợi, Huế",
      message: "Sự hiện diện của bạn là niềm vui lớn nhất của chúng mình trong ngày trọng đại này.",
    },
  },
  {
    slug: "nu-hong",
    name: "Nụ Hồng",
    category: "wedding",
    tagline: "Hồng phấn dịu, chữ nghiêng mềm",
    description:
      "Tông hồng phấn với vòng tròn trang trí ở bìa. Phù hợp lễ vu quy hoặc tiệc cưới ấm cúng với khách mời thân thiết.",
    price: 79000,
    popularity: 3110,
    createdAt: "2026-05-18",
    features: ["Ảnh bìa và lời mời", "Album ảnh", "Bản đồ chỉ đường", "Xác nhận tham dự", "Nhạc nền"],
    motif: "circle",
    palette: { bg: "#FBF3F1", ink: "#3B1F26", accent: "#B5485D", soft: "#F2D5D9" },
    sample: {
      kicker: "Lễ vu quy của",
      titleLines: ["Thảo Nguyên", "&", "Đức Huy"],
      date: "Thứ bảy, 20.12.2026",
      time: "11:00",
      place: "Tư gia nhà gái",
      address: "45 Nguyễn Huệ, Đà Nẵng",
      message: "Gia đình chúng mình rất mong được đón bạn đến chung vui và chúc phúc cho hai đứa.",
    },
  },
  {
    slug: "rung-thong",
    name: "Rừng Thông",
    category: "wedding",
    tagline: "Xanh rêu đậm, viền vàng, cảm giác trang trọng",
    description:
      "Nền tối với khung viền vàng nhạt, dành cho tiệc cưới buổi tối hoặc tổ chức ngoài trời. Có đủ các phần nâng cao như hẹn giờ gửi thiệp và phân nhóm khách mời.",
    price: 199000,
    popularity: 1290,
    createdAt: "2026-08-09",
    features: ["Ảnh bìa và lời mời", "Đếm ngược đến ngày cưới", "Album ảnh", "Bản đồ chỉ đường", "Xác nhận tham dự", "Sổ lưu bút", "Phân nhóm khách mời", "Nhạc nền"],
    motif: "frame",
    palette: { bg: "#1F3A33", ink: "#EEF3EC", accent: "#C9B47A", soft: "#2E5248" },
    sample: {
      kicker: "Cùng chung vui",
      titleLines: ["Hải Yến", "&", "Gia Khánh"],
      date: "Thứ sáu, 26.12.2026",
      time: "18:00",
      place: "Nhà hàng Vườn Thông",
      address: "88 Hùng Vương, Huế",
      message: "Một buổi tối nhỏ giữa những người thân yêu. Rất mong bạn đến dự.",
    },
  },
  {
    slug: "gio-bien",
    name: "Gió Biển",
    category: "wedding",
    tagline: "Xanh ngọc, các sọc đứng gợi sóng",
    description:
      "Mẫu miễn phí gọn nhẹ cho đám cưới ở vùng biển hoặc tiệc cưới mùa hè. Đủ phần cần thiết, tải nhanh trên mạng yếu.",
    price: 0,
    popularity: 2670,
    createdAt: "2026-04-21",
    features: ["Ảnh bìa và lời mời", "Bản đồ chỉ đường", "Xác nhận tham dự"],
    motif: "stripe",
    palette: { bg: "#F2F7F6", ink: "#12343A", accent: "#2A8C8C", soft: "#CFE6E4" },
    sample: {
      kicker: "Thư mời cưới",
      titleLines: ["Ngọc Hân", "&", "Tuấn Kiệt"],
      date: "Thứ bảy, 03.01.2027",
      time: "16:00",
      place: "Resort Lăng Cô",
      address: "Lăng Cô, Phú Lộc, Huế",
      message: "Hẹn gặp bạn bên bờ biển để cùng chúng mình mở đầu năm mới.",
    },
  },
  {
    slug: "be-cuoi",
    name: "Bé Cười",
    category: "birthday",
    tagline: "Vàng nắng, tròn trịa, vui mắt",
    description:
      "Thiệp sinh nhật cho bé từ 1 đến 10 tuổi. Màu vàng cam ấm, chữ lớn dễ đọc để phụ huynh nhìn là biết giờ giấc và địa điểm.",
    price: 0,
    popularity: 3540,
    createdAt: "2026-02-11",
    features: ["Ảnh bìa và lời mời", "Bản đồ chỉ đường", "Xác nhận tham dự", "Danh sách quà gợi ý"],
    motif: "circle",
    palette: { bg: "#FFF4D6", ink: "#3A2A00", accent: "#F08A24", soft: "#FFE0A3" },
    sample: {
      kicker: "Mời bạn đến dự tiệc sinh nhật",
      titleLines: ["Bé Bi", "tròn 5 tuổi"],
      date: "Thứ bảy, 08.11.2026",
      time: "15:00",
      place: "Nhà hàng Sao Mai, tầng 2",
      address: "30 Trần Phú, Huế",
      message: "Bi mời các bạn đến chơi, ăn bánh và thổi nến cùng Bi nhé.",
    },
  },
  {
    slug: "tiec-dem",
    name: "Tiệc Đêm",
    category: "birthday",
    tagline: "Tím than, vạch sáng, cho tiệc người lớn",
    description:
      "Mẫu tối màu cho sinh nhật tuổi đôi mươi trở lên. Có thể ghi dress code và hạn chót xác nhận để chủ tiệc chốt số người sớm.",
    price: 99000,
    popularity: 980,
    createdAt: "2026-09-14",
    features: ["Ảnh bìa và lời mời", "Dress code", "Bản đồ chỉ đường", "Xác nhận tham dự", "Nhạc nền"],
    motif: "stripe",
    palette: { bg: "#161327", ink: "#F3F0FF", accent: "#9B7BFF", soft: "#2A2447" },
    sample: {
      kicker: "Bạn được mời đến tiệc của",
      titleLines: ["Khánh Vy", "25"],
      date: "Thứ sáu, 21.11.2026",
      time: "20:00",
      place: "Rooftop Lamp Bar",
      address: "7 Võ Thị Sáu, Huế",
      message: "Mặc đồ tông tím hoặc đen. Xác nhận trước ngày 15.11 để mình đặt chỗ.",
    },
  },
  {
    slug: "mam-nho",
    name: "Mầm Nhỏ",
    category: "baby",
    tagline: "Xanh lá non, khung vòm mềm cho lễ đầy tháng",
    description:
      "Dùng cho tiệc đầy tháng, thôi nôi. Có chỗ ghi tên bé, ngày giờ âm lịch và lời nhắn của ba mẹ.",
    price: 49000,
    popularity: 1530,
    createdAt: "2026-06-30",
    features: ["Ảnh bìa và lời mời", "Ngày âm lịch", "Album ảnh", "Xác nhận tham dự", "Sổ lưu bút"],
    motif: "arch",
    palette: { bg: "#EEF6EC", ink: "#213A27", accent: "#5E9C61", soft: "#D3E8CF" },
    sample: {
      kicker: "Lễ đầy tháng của",
      titleLines: ["Bé Na"],
      date: "Chủ nhật, 30.11.2026",
      time: "11:00",
      place: "Tư gia, nhà ông bà nội",
      address: "15 Phan Bội Châu, Huế",
      message: "Ba mẹ và gia đình mời bạn đến dự bữa cơm thân mật mừng bé tròn một tháng.",
    },
  },
  {
    slug: "hop-lop",
    name: "Hội Ngộ",
    category: "event",
    tagline: "Gọn, rõ giờ giấc, dành cho họp lớp và họp mặt",
    description:
      "Mẫu miễn phí cho họp lớp, họp mặt đồng nghiệp, hội nhóm. Nhấn vào thời gian, địa điểm và nút xác nhận để mọi người trả lời nhanh.",
    price: 0,
    popularity: 2210,
    createdAt: "2026-07-05",
    features: ["Ảnh bìa và lời mời", "Bản đồ chỉ đường", "Xác nhận tham dự", "Danh sách người tham dự"],
    motif: "frame",
    palette: { bg: "#F4F6F8", ink: "#101820", accent: "#1D6FA5", soft: "#D9E4EE" },
    sample: {
      kicker: "Thư mời họp lớp",
      titleLines: ["12A1", "tròn 20 năm"],
      date: "Thứ bảy, 27.12.2026",
      time: "18:30",
      place: "Quán Nhà Vườn",
      address: "102 Điện Biên Phủ, Huế",
      message: "Hai mươi năm rồi. Về gặp lại thầy cô và bạn bè nhé.",
    },
  },
];

export function getTemplates(): InvitationTemplate[] {
  return TEMPLATES;
}

export function getTemplateBySlug(slug: string): InvitationTemplate | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

export function getRelatedTemplates(slug: string, limit = 3): InvitationTemplate[] {
  const current = getTemplateBySlug(slug);
  if (!current) return [];
  const same = TEMPLATES.filter((t) => t.slug !== slug && t.category === current.category);
  const others = TEMPLATES.filter((t) => t.slug !== slug && t.category !== current.category);
  return [...same, ...others].slice(0, limit);
}

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? "";
}

export function formatPrice(price: number): string {
  if (price === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(price);
}