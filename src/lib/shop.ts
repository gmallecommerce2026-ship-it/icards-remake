// Dữ liệu cửa hàng. Giá, thời gian là số liệu minh họa, thay bằng số liệu thật.

export type ThumbKind = "paper" | "qr" | "standee" | "envelope" | "message" | "gift";
export type ShopCategoryId = "print" | "onsite" | "digital";

export const SHOP_CATEGORIES: { id: ShopCategoryId; label: string }[] = [
  { id: "print", label: "In ấn" },
  { id: "onsite", label: "Đón khách tại sự kiện" },
  { id: "digital", label: "Gửi thiệp online" },
];

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
};

export const CHECKOUT_HREF = "/checkout"; // trang thanh toán làm ở bước sau
export const MAX_QTY = 99;

export const PRODUCTS: Product[] = [
  {
    slug: "in-thiep-giay",
    name: "Thiệp giấy in theo mẫu",
    category: "print",
    summary: "In thiệp giấy đúng mẫu online của bạn, có mã QR dẫn đến thiệp điện tử.",
    description:
      "Một số khách lớn tuổi vẫn muốn cầm thiệp giấy trên tay. Chúng tôi in lại đúng mẫu bạn đã chọn, thêm mã QR để khách quét là mở thiệp online, xem bản đồ và xác nhận tham dự.",
    thumb: "paper",
    tone: { bg: "#E8EEF6", ink: "#27548A" },
    variants: [
      { id: "50", label: "50 thiệp", price: 450000 },
      { id: "100", label: "100 thiệp", price: 790000 },
      { id: "200", label: "200 thiệp", price: 1390000 },
    ],
    shipping: "ship",
    leadTime: "5 đến 7 ngày làm việc",
    highlights: ["In offset trên giấy mỹ thuật", "Mã QR dẫn đến thiệp online", "Gửi bản chạy thử qua Zalo trước khi in"],
    specs: [
      { label: "Kích thước", value: "12 x 17 cm" },
      { label: "Chất liệu", value: "Giấy mỹ thuật 300 gsm" },
      { label: "Hoàn thiện", value: "Cán mờ, bo góc" },
    ],
  },
  {
    slug: "phong-bi-mung",
    name: "Phong bì kèm tên khách",
    category: "print",
    summary: "Phong bì in sẵn tên khách để gửi thiệp giấy gọn gàng.",
    description:
      "Phong bì in tên người nhận theo danh sách khách mời, nên bạn không phải viết tay từng cái. Phù hợp khi gửi thiệp giấy qua đường bưu điện hoặc phát tận tay.",
    thumb: "envelope",
    tone: { bg: "#FBEDEE", ink: "#B5485D" },
    variants: [
      { id: "50", label: "50 phong bì", price: 175000 },
      { id: "100", label: "100 phong bì", price: 320000 },
    ],
    shipping: "ship",
    leadTime: "3 đến 5 ngày làm việc",
    highlights: ["In tên từ danh sách khách mời", "Hai màu giấy để chọn", "Có thể kèm con dấu"],
    specs: [
      { label: "Kích thước", value: "13 x 18 cm" },
      { label: "Chất liệu", value: "Giấy kraft hoặc giấy trắng 120 gsm" },
    ],
  },
  {
    slug: "hop-qua-cam-on",
    name: "Hộp quà cảm ơn",
    category: "print",
    summary: "Hộp nhỏ đựng quà tặng khách, in lời cảm ơn và mã QR sổ lưu bút.",
    description:
      "Món quà nhỏ cuối buổi tiệc. Nắp hộp in lời cảm ơn của gia đình và mã QR dẫn đến album ảnh hoặc sổ lưu bút, để khách còn có chỗ xem lại ảnh sau sự kiện.",
    thumb: "gift",
    tone: { bg: "#E6F3F3", ink: "#1F7373" },
    variants: [
      { id: "50", label: "50 hộp", price: 650000 },
      { id: "100", label: "100 hộp", price: 1190000 },
    ],
    shipping: "ship",
    leadTime: "7 đến 10 ngày làm việc",
    highlights: ["Hộp giấy cứng gấp sẵn", "In lời cảm ơn theo nội dung của bạn", "Mã QR dẫn đến album"],
    specs: [
      { label: "Kích thước", value: "9 x 9 x 5 cm" },
      { label: "Chất liệu", value: "Giấy cứng 350 gsm" },
    ],
  },
  {
    slug: "standee-qr",
    name: "Standee đón khách có mã QR",
    category: "onsite",
    summary: "Standee đặt ở cửa tiệc để khách quét mã, xem sơ đồ bàn và gửi lời chúc.",
    description:
      "Đặt ở lối vào, standee có tên hai họ, ảnh cưới và mã QR dẫn đến trang sự kiện. Khách quét để xem sơ đồ chỗ ngồi, chụp ảnh chung và viết sổ lưu bút.",
    thumb: "standee",
    tone: { bg: "#FFF1DF", ink: "#9A5A12" },
    variants: [
      { id: "a3", label: "Khổ A3 để bàn", price: 290000 },
      { id: "a1", label: "Khổ A1 đứng", price: 690000 },
    ],
    shipping: "ship",
    leadTime: "3 đến 5 ngày làm việc",
    highlights: ["In UV bền màu", "Chân đứng gấp gọn", "Mã QR dẫn đến trang sự kiện"],
    specs: [
      { label: "Chất liệu", value: "Foam và decal in UV" },
      { label: "Kèm theo", value: "Chân đứng, túi vận chuyển" },
    ],
  },
  {
    slug: "the-qr-khach-moi",
    name: "Thẻ QR cho từng khách",
    category: "onsite",
    summary: "Thẻ nhỏ có mã QR riêng, khách đưa ở cửa để check-in nhanh.",
    description:
      "Mỗi thẻ gắn với một khách trong danh sách. Khi quét, hệ thống đánh dấu khách đã đến và hiện tên bàn. Thẻ có thể kẹp vào thiệp giấy hoặc phát tại bàn đón khách.",
    thumb: "qr",
    tone: { bg: "#EAF4EE", ink: "#1D5B35" },
    variants: [
      { id: "100", label: "100 thẻ", price: 350000 },
      { id: "300", label: "300 thẻ", price: 890000 },
    ],
    shipping: "ship",
    leadTime: "4 đến 6 ngày làm việc",
    highlights: ["In tên và số bàn của từng khách", "Dùng với tính năng check-in QR", "Giấy dày, không nhàu"],
    specs: [
      { label: "Kích thước", value: "5,5 x 9 cm" },
      { label: "Chất liệu", value: "Giấy 300 gsm, cán mờ" },
    ],
  },
  {
    slug: "goi-tin-zalo",
    name: "Gói tin nhắn gửi thiệp",
    category: "digital",
    summary: "Mua trước lượt gửi link thiệp qua Zalo hoặc SMS cho khách mời.",
    description:
      "Mỗi lượt gửi là một tin nhắn có link thiệp mang tên riêng của khách. Gói được cộng vào tài khoản ngay sau khi thanh toán, dùng cho bất kỳ sự kiện nào của bạn.",
    thumb: "message",
    tone: { bg: "#EEEAFB", ink: "#5B43B8" },
    variants: [
      { id: "500", label: "500 tin", price: 250000 },
      { id: "1000", label: "1.000 tin", price: 450000 },
      { id: "3000", label: "3.000 tin", price: 1200000 },
    ],
    shipping: "digital",
    leadTime: "Cộng vào tài khoản ngay",
    highlights: ["Không giới hạn thời gian sử dụng", "Dùng được cho nhiều sự kiện", "Xem được ai đã mở thiệp"],
    specs: [
      { label: "Kênh gửi", value: "Zalo và SMS" },
      { label: "Hiệu lực", value: "Không hết hạn" },
    ],
  },
];

export function getProducts(category?: ShopCategoryId): Product[] {
  return category ? PRODUCTS.filter((p) => p.category === category) : PRODUCTS;
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getVariant(product: Product, variantId: string): Variant | undefined {
  return product.variants.find((v) => v.id === variantId);
}

export function priceFrom(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}

export function getRelatedProducts(slug: string, limit = 3): Product[] {
  const current = getProduct(slug);
  if (!current) return [];
  const same = PRODUCTS.filter((p) => p.slug !== slug && p.category === current.category);
  const rest = PRODUCTS.filter((p) => p.slug !== slug && p.category !== current.category);
  return [...same, ...rest].slice(0, limit);
}

export function isShopCategory(value: string | undefined): value is ShopCategoryId {
  return SHOP_CATEGORIES.some((c) => c.id === value);
}
