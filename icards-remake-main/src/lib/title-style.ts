// Kiểu chữ tên danh mục (khối dịp trên trang chủ). Backend (GET /api/template-blocks) trả `titleStyle` chỉ gồm khóa font + số + màu hex đã lọc;
// FE đổi sang CSS tại đây và kiểm tra lại một lần nữa nên dữ liệu lạ không thể chèn CSS tùy ý.
// Danh sách khóa phải khớp TITLE_FONT_KEYS ở backend (src/catalog/catalog.types.ts).
import type { CSSProperties } from "react";

export type TitleFontKey = "sans" | "serif" | "script" | "display" | "mono";

export type TemplateTitleStyle = {
  font?: TitleFontKey;
  weight?: number;
  size?: number;
  color?: string;
  align?: "left" | "center" | "right";
  uppercase?: boolean;
  letterSpacing?: number;
};

/** Khóa -> font. Tên font đã được nạp toàn trang bởi src/styles/local-fonts.css (xem scripts/build-local-fonts.mjs). */
export const TITLE_FONTS: Record<TitleFontKey, string> = {
  sans: "'Be Vietnam Pro', ui-sans-serif, system-ui, sans-serif",
  serif: "'Cormorant Garamond', Georgia, serif",
  script: "'Great Vibes', 'Brush Script MT', cursive",
  display: "'Oswald', Impact, sans-serif",
  mono: "'Space Mono', ui-monospace, monospace",
};

/** Kiểu mặc định khi mẫu chưa cài gì. */
export const DEFAULT_TITLE_STYLE: Required<Pick<TemplateTitleStyle, "font" | "weight" | "size" | "color" | "align">> = {
  font: "sans",
  weight: 600,
  size: 18,
  color: "#ffffff",
  align: "center",
};

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const inRange = (v: unknown, min: number, max: number): v is number => typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;

export function titleStyleToCss(style?: TemplateTitleStyle | null): CSSProperties {
  const s = style ?? {};
  const font: TitleFontKey = s.font && s.font in TITLE_FONTS ? s.font : DEFAULT_TITLE_STYLE.font;
  const css: CSSProperties = {
    fontFamily: TITLE_FONTS[font],
    fontWeight: inRange(s.weight, 100, 900) ? s.weight : DEFAULT_TITLE_STYLE.weight,
    fontSize: `${inRange(s.size, 12, 40) ? s.size : DEFAULT_TITLE_STYLE.size}px`,
    color: typeof s.color === "string" && HEX.test(s.color) ? s.color : DEFAULT_TITLE_STYLE.color,
    textAlign: s.align === "left" || s.align === "right" || s.align === "center" ? s.align : DEFAULT_TITLE_STYLE.align,
  };
  if (s.uppercase) css.textTransform = "uppercase";
  if (inRange(s.letterSpacing, -0.05, 0.3)) css.letterSpacing = `${s.letterSpacing}em`;
  return css;
}
