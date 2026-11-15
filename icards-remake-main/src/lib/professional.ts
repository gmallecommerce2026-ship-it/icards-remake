// Kiểu cho trang chuyên nghiệp. Dữ liệu thật lấy từ API (GET /public/content/professional.*).

export type PortfolioItem = {
  id: string;
  name: string;
  client: string;
  tone: { bg: string; ink: string };
};

export type Tier = {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  isPopular?: boolean;
};

export type ProfessionalProcessStep = { title: string; description: string };
