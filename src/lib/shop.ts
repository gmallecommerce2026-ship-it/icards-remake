// Kiểu và hàm thuần cho cửa hàng. Dữ liệu thật lấy từ API (xem lib/catalog.ts).

export type ThumbKind = "paper" | "qr" | "standee" | "envelope" | "message" | "gift";
export type ShopCategoryId = "print" | "onsite" | "digital";

export const CHECKOUT_HREF = "/checkout"; // trang thanh toán làm ở bước sau
export const MAX_QTY = 99;

export type Variant = { id: string; label: string; price: number };

export type Product = {
  slug: string;
  name: string;
  category: ShopCategoryId;
  summary: string;
  description: string;
  thumb: ThumbKind;
  tone: { bg: string; ink: string };
  variants: Variant[];
  shipping: "ship" | "digital";
  leadTime: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  /* Tuỳ chọn: ảnh thật và giá gốc (nếu API trả về) để hiển thị ở menu/thẻ sản phẩm */
  image?: string;
  compareAtPrice?: number;
};

export function getProductsByCategory(list: Product[], category?: ShopCategoryId): Product[] {
  return category ? list.filter((p) => p.category === category) : list;
}

export function findProduct(list: Product[], slug: string): Product | undefined {
  return list.find((p) => p.slug === slug);
}

export function getVariant(product: Product, variantId: string): Variant | undefined {
  return product.variants.find((v) => v.id === variantId);
}

export function priceFrom(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}

/* % giảm so với giá gốc; 0 nếu không có giá gốc hợp lệ */
export function discountPercent(product: Product): number {
  const from = priceFrom(product);
  const base = product.compareAtPrice ?? 0;
  return base > from ? Math.round((1 - from / base) * 100) : 0;
}

export function getRelatedProducts(list: Product[], slug: string, limit = 3): Product[] {
  const current = findProduct(list, slug);
  if (!current) return [];
  const same = list.filter((p) => p.slug !== slug && p.category === current.category);
  const rest = list.filter((p) => p.slug !== slug && p.category !== current.category);
  return [...same, ...rest].slice(0, limit);
}

export function isShopCategory(value: string | undefined, categories: { id: string }[]): value is ShopCategoryId {
  return categories.some((c) => c.id === value);
}