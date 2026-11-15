/* Nhóm banner: mỗi trang có các nhóm ở đầu trang / cuối trang. Mỗi nhóm chọn một bố cục và chứa số banner không giới hạn.
   Danh sách trang và bố cục phải khớp với backend: src/settings/banner-layout.ts. */

export type BannerPage = "home" | "shop" | "services" | "professional";
export type BannerSlot = "top" | "bottom";
export type BannerLayout = "slider" | "stack" | "hero-pair" | "mosaic-2-1" | "grid-2" | "grid-3";

export type BannerItemData = {
  id: string;
  name: string;
  eyebrow?: string;
  title?: string;
  text?: string;
  ctaLabel?: string;
  imgSrc?: string | null;
  link?: string;
  isEnabled: boolean;
};

export type BannerGroupData = {
  id: string;
  name: string;
  page: BannerPage;
  slot: BannerSlot;
  layout: BannerLayout;
  isEnabled: boolean;
  banners: BannerItemData[];
};

export type LayoutSpec = {
  label: string;
  description: string;
  /** Số cột lưới trên máy tính (trên điện thoại luôn 1 cột). */
  cols: number;
  /** Số cột mỗi banner chiếm, lặp lại theo chu kỳ. Ví dụ [2, 1, 1]: banner 1 cả hàng, banner 2 và 3 cạnh nhau. */
  spans: number[];
  /** Băng chuyền xoay vòng thay vì lưới. */
  carousel?: boolean;
};

export const BANNER_LAYOUTS: Record<BannerLayout, LayoutSpec> = {
  slider: {
    label: "Băng chuyền",
    description: "Các banner xoay vòng tự động, mỗi banner chiếm cả chiều rộng.",
    cols: 1,
    spans: [1],
    carousel: true,
  },
  stack: {
    label: "Xếp dọc",
    description: "Mỗi banner một hàng, chiếm cả chiều rộng, không xoay vòng.",
    cols: 1,
    spans: [1],
  },
  "hero-pair": {
    label: "1 lớn + 2 nhỏ",
    description: "Banner đầu lớn cả hàng, hai banner kế tiếp nằm cạnh nhau bên dưới. Cứ 3 banner lại lặp lại.",
    cols: 2,
    spans: [2, 1, 1],
  },
  "mosaic-2-1": {
    label: "2 nhỏ + 1 lớn",
    description: "Hai banner nằm cạnh nhau, banner kế tiếp lớn cả hàng. Cứ 3 banner lại lặp lại.",
    cols: 2,
    spans: [1, 1, 2],
  },
  "grid-2": {
    label: "Lưới 2 cột",
    description: "Các banner xếp thành lưới hai cột đều nhau.",
    cols: 2,
    spans: [1],
  },
  "grid-3": {
    label: "Lưới 3 cột",
    description: "Các banner xếp thành lưới ba cột đều nhau.",
    cols: 3,
    spans: [1],
  },
};

export const LAYOUT_ORDER: BannerLayout[] = ["slider", "stack", "hero-pair", "mosaic-2-1", "grid-2", "grid-3"];

/** Kích thước một ô banner theo vị trí của nó trong bố cục. */
export function tileSize(layout: BannerLayout, index: number): "wide" | "half" | "third" {
  const spec = BANNER_LAYOUTS[layout];
  const span = spec.spans[index % spec.spans.length];
  if (spec.cols === 1 || span === spec.cols) return "wide";
  if (spec.cols === 2) return "half";
  return "third";
}

/** Lọc nhóm theo trang và vị trí, giữ thứ tự admin đã sắp xếp. */
export function groupsFor(all: BannerGroupData[] | undefined | null, page: BannerPage, slot: BannerSlot): BannerGroupData[] {
  return (all ?? []).filter((g) => g.page === page && g.slot === slot && g.isEnabled);
}
