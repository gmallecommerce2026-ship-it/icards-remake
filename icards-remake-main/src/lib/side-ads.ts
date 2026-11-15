import type { SideAd } from "@/components/ads/AdSkyscraper";

/**
 * Bật/tắt banner dọc hai bên trên toàn site.
 * Đặt `false` để ẩn tạm thời; đặt lại `true` để hiện lại.
 */
export const SHOW_SIDE_ADS = false;

/** Nội dung banner hai bên (placeholder). Thay bằng quảng cáo thật hoặc thêm imgSrc (160×600). */
export const SIDE_ADS: { left: SideAd; right: SideAd } = {
  left: {
    title: "Bộ sưu tập thiệp cưới mới",
    text: "Mẫu thiệp được cập nhật thường xuyên cho mọi dịp.",
    cta: "Xem mẫu thiệp",
    href: "/templates",
  },
  right: {
    title: "Phong bì và hộp quà đồng bộ thiệp",
    text: "Chọn bộ sản phẩm đồng bộ cho ngày trọng đại.",
    cta: "Xem sản phẩm",
    href: "/shop",
  },
};
