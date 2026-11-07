// Kiểu và hàm thuần cho dịch vụ. Dữ liệu thật lấy từ API (xem lib/catalog.ts).

export type Service = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  priceFrom: number;
  duration: string;
  audience: string;
  includes: string[];
};

export type ProcessStep = { title: string; text: string };

export function getRelatedServices(list: Service[], slug: string, limit = 2): Service[] {
  return list.filter((s) => s.slug !== slug).slice(0, limit);
}
