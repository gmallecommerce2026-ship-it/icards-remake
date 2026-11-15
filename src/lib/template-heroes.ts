// Cấu hình hero 3D theo danh mục trên trang /templates. Kiểu dữ liệu dùng chung cho trang công khai và admin.
// Nhãn danh mục khớp với cây danh mục gốc trên site (backend: src/seed/data/template-tree.seed.ts).

export const HERO_CATEGORY_LABELS = {
  wedding: "Thiệp cưới",
  engagement: "Lễ hỏi - Đính hôn",
  birthday: "Sinh nhật",
  baby: "Đầy tháng, thôi nôi",
  event: "Sự kiện",
  opening: "Khai trương",
  housewarming: "Tân gia",
  graduation: "Tốt nghiệp",
  anniversary: "Kỷ niệm - Mừng thọ",
  festive: "Tết - Lễ hội",
} as const;

export type HeroCategory = keyof typeof HERO_CATEGORY_LABELS;
export const HERO_CATEGORIES = Object.keys(HERO_CATEGORY_LABELS) as HeroCategory[];

/** Chỉ còn các kiểu 3D này. Kiểu cũ (dải, trụ, tường) đã bỏ và tự chuyển sang phong bì. */
export const HERO_PRESETS = ["envelope", "fan", "book", "flower", "cube"] as const;
export type HeroPreset = (typeof HERO_PRESETS)[number];

export const HERO_PRESET_LABELS: Record<HeroPreset, string> = {
  envelope: "Phong bì 3D: lấy thiệp ra và lật",
  fan: "Xòe quạt 3D: các thiệp xòe ra theo cuộn",
  book: "Album lật trang 3D: ảnh lật từng trang",
  flower: "Hoa nở 3D: cánh thiệp xòe quanh tâm",
  cube: "Khối xoay 3D: sáu mặt ảnh xoay theo cuộn",
};

export type TemplateHero = {
  preset: HeroPreset;
  title: string;
  subtitle: string;
  /** màu nhấn #RRGGBB */
  accent: string;
  /** hệ số tốc độ chạy theo cuộn (0.2 – 3) */
  speed: number;
  /** URL https, tối đa 12 ảnh */
  images: string[];
};

export type TemplateHeroes = Partial<Record<HeroCategory, TemplateHero>>;

export const MAX_HERO_IMAGES = 12;

export const emptyHero = (): TemplateHero => ({
  preset: "envelope",
  title: "",
  subtitle: "",
  accent: "#A3152F",
  speed: 1,
  images: [],
});
