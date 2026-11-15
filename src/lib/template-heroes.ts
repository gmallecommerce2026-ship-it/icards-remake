// Cấu hình hero 3D theo danh mục trên trang /templates. Kiểu dữ liệu dùng chung cho trang công khai và admin.

export const HERO_CATEGORIES = ["wedding", "birthday", "baby", "event"] as const;
export type HeroCategory = (typeof HERO_CATEGORIES)[number];

export const HERO_CATEGORY_LABELS: Record<HeroCategory, string> = {
  wedding: "Cưới hỏi",
  birthday: "Sinh nhật",
  baby: "Đầy tháng & em bé",
  event: "Sự kiện",
};

export const HERO_PRESETS = ["ribbon", "cylinder", "wall", "envelope"] as const;
export type HeroPreset = (typeof HERO_PRESETS)[number];

export const HERO_PRESET_LABELS: Record<HeroPreset, string> = {
  ribbon: "Dải nghiêng chạy ngang",
  cylinder: "Vòng trụ quay theo cuộn",
  wall: "Tường thẻ 3D",
  envelope: "Phong bì 3D: lấy thiệp ra và lật",
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
  preset: "ribbon",
  title: "",
  subtitle: "",
  accent: "#A3152F",
  speed: 1,
  images: [],
});
