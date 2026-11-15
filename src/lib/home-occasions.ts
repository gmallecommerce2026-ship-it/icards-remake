// Cấu hình khối "Những dịp lan tỏa niềm vui" trên trang chủ (khớp backend: src/templates/home-occasions.ts).
import { TITLE_FONTS, type TitleFontKey } from "@/lib/title-style";

export type HomeOccasionsConfig = {
  /** slug mẫu thiệp dùng làm hình nền của khối; null = không dùng nền */
  backgroundTemplateSlug: string | null;
  /** độ phủ lớp trắng mờ trên ảnh nền (%), 0 – 90 */
  overlay: number;
  /** font tên danh mục, khóa là slug danh mục gốc */
  fonts: Record<string, TitleFontKey>;
};

export type HomeOccasionsView = HomeOccasionsConfig & { backgroundImage: string | null };

export const DEFAULT_HOME_OCCASIONS: HomeOccasionsView = { backgroundTemplateSlug: null, overlay: 55, fonts: {}, backgroundImage: null };

/** Font mặc định của tên danh mục khi admin chưa chọn. */
export const DEFAULT_OCCASION_FONT = "var(--font-tpl-display), Georgia, serif";

export const OCCASION_FONT_LABELS: Record<TitleFontKey, string> = {
  sans: "Be Vietnam Pro (hiện đại)",
  serif: "Cormorant Garamond (thanh lịch)",
  script: "Great Vibes (chữ viết tay)",
  display: "Oswald (đậm, hẹp)",
  mono: "Space Mono (đánh máy)",
};

export const OCCASION_FONT_KEYS = Object.keys(TITLE_FONTS) as TitleFontKey[];

/** Font CSS cho tên danh mục: khóa lạ hoặc thiếu thì dùng font mặc định. */
export const occasionFontFamily = (key?: string): string =>
  key && key in TITLE_FONTS ? TITLE_FONTS[key as TitleFontKey] : DEFAULT_OCCASION_FONT;
