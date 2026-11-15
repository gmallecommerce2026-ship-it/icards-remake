// src/lib/faq.ts
// Kiểu và hàm thuần cho FAQ. Dữ liệu thật lấy từ API (GET /pages/faq).

export type FaqGroup = { slug: string; label: string };
export type FaqItem = { id: string; group: string; q: string; a: string };

/** Bỏ dấu + hạ chữ thường để tìm "thiep" khớp "thiệp". */
export function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}
