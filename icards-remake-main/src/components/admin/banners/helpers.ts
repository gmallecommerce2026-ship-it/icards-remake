import { BANNER_LAYOUTS, type BannerGroupData, type BannerItemData, type BannerLayout, type BannerPage, type BannerSlot } from "@/lib/banner-groups";

/** Trang có vị trí banner, đường dẫn để xem trước, và các vị trí được phép trên từng trang. */
export const PAGE_META: Record<BannerPage, { label: string; path: string; slots: BannerSlot[] }> = {
  home: { label: "Trang chủ", path: "/", slots: ["top", "bottom"] },
  shop: { label: "Cửa hàng", path: "/shop", slots: ["top"] },
  services: { label: "Dịch vụ", path: "/services", slots: ["top"] },
  professional: { label: "Chuyên nghiệp", path: "/professional", slots: ["top", "bottom"] },
};

export const SLOT_META: Record<BannerSlot, { label: string; hint: string }> = {
  top: { label: "Đầu trang", hint: "Hiển thị ngay dưới menu, phía trên nội dung chính." },
  bottom: { label: "Cuối trang", hint: "Hiển thị gần cuối trang, phía trên phần chân trang." },
};

export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function newBanner(): BannerItemData {
  return {
    id: newId("b"),
    name: "Banner mới",
    eyebrow: "",
    title: "Tiêu đề banner",
    text: "",
    ctaLabel: "Xem thêm",
    imgSrc: null,
    link: "",
    isEnabled: true,
  };
}

/* Băng chuyền và xếp dọc hợp với vị trí đầu trang; lưới hợp với vị trí cuối trang. Admin đổi được ngay sau khi thêm. */
export function newGroup(page: BannerPage, slot: BannerSlot, countInSlot: number): BannerGroupData {
  return {
    id: newId("grp"),
    name: `Nhóm ${countInSlot + 1}`,
    page,
    slot,
    layout: slot === "top" ? "slider" : "stack",
    isEnabled: true,
    banners: [newBanner()],
  };
}

/** Thay các nhóm thoả điều kiện bằng danh sách mới theo đúng thứ tự, giữ nguyên vị trí các nhóm còn lại. */
export function replaceSubset(all: BannerGroupData[], match: (g: BannerGroupData) => boolean, next: BannerGroupData[]) {
  const queue = [...next];
  return all.flatMap((g) => (match(g) ? (queue.length ? [queue.shift()!] : []) : [g]));
}

/** Nhãn vị trí của một banner trong bố cục, để admin thấy banner sẽ nằm ở đâu. */
export function positionLabel(layout: BannerLayout, index: number): string {
  const spec = BANNER_LAYOUTS[layout];
  if (spec.carousel) return `Slide ${index + 1}`;
  if (spec.cols === 1) return `Hàng ${index + 1}`;
  const span = spec.spans[index % spec.spans.length];
  return `Ô ${index + 1} · ${span === spec.cols ? "cả hàng" : `${span}/${spec.cols} hàng`}`;
}

/** Chỉ chấp nhận đường dẫn nội bộ (/...) hoặc https://. Rỗng nghĩa là không có liên kết. */
export const isValidLink = (v: string | undefined) => !v || (v.startsWith("/") && !v.startsWith("//")) || /^https:\/\/\S+$/i.test(v);
