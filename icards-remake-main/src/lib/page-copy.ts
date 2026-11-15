/* Chữ hiển thị trên trang cửa hàng, dịch vụ, tin tức. Nội dung do admin quản lý (settings.pageCopy), không viết cứng trong code.
   Backend luôn trả về đủ trường; EMPTY_PAGE_COPY chỉ dùng khi không đọc được cấu hình (để trang không lỗi). */

export type PageCopy = {
  shop: { adTitle: string; adText: string; adCta: string; servicesHeading: string };
  services: {
    heroTitle: string;
    heroDescription: string;
    adTitle: string;
    adText: string;
    adCta: string;
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
  };
  blog: {
    eyebrow: string;
    title: string;
    description: string;
    searchPlaceholder: string;
    footerTagline: string;
    keywordGroups: { title: string; items: { keyword: string; blurb: string }[] }[];
  };
};

export const EMPTY_PAGE_COPY: PageCopy = {
  shop: { adTitle: "", adText: "", adCta: "", servicesHeading: "" },
  services: {
    heroTitle: "",
    heroDescription: "",
    adTitle: "",
    adText: "",
    adCta: "",
    ctaTitle: "",
    ctaText: "",
    ctaButton: "",
  },
  blog: { eyebrow: "", title: "", description: "", searchPlaceholder: "", footerTagline: "", keywordGroups: [] },
};
