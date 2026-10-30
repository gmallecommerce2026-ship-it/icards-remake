// NỘI DUNG MẪU: Cần thay thế bằng các gói dịch vụ, quy trình và dự án thực tế của iCards

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

export const PROCESS_STEPS = [
  {
    title: "Tiếp nhận và tư vấn",
    description: "Lắng nghe câu chuyện, phong cách và yêu cầu đặc biệt của sự kiện để định hình ý tưởng chủ đạo.",
  },
  {
    title: "Lên ý tưởng thiết kế",
    description: "Đội ngũ sáng tạo phác thảo các concept nghệ thuật, kết hợp màu sắc, phông chữ và bố cục.",
  },
  {
    title: "Chỉnh sửa và hoàn thiện",
    description: "Cùng bạn tinh chỉnh chi tiết đến khi đạt độ hoàn hảo, áp dụng hiệu ứng chuyển động và âm thanh.",
  },
  {
    title: "Bàn giao và triển khai",
    description: "Bàn giao phiên bản điện tử bản quyền, thiết lập tên miền riêng và hỗ trợ vận hành trong ngày diễn ra sự kiện.",
  },
];

export const TIERS: Tier[] = [
  {
    id: "thiet-ke-rieng",
    name: "Thiết kế độc quyền",
    description: "Dành cho cá nhân muốn sở hữu bộ thiệp cưới mang đậm dấu ấn riêng không đụng hàng.",
    price: "Liên hệ báo giá",
    features: [
      "Thiết kế giao diện độc quyền (UI/UX) từ đầu",
      "Vẽ minh họa riêng theo yêu cầu",
      "Hiệu ứng chuyển động (Animation) phức tạp",
      "Tích hợp tên miền sự kiện riêng",
      "Bảo mật thiệp bằng mật khẩu",
    ],
    isPopular: true,
  },
  {
    id: "giai-phap-doanh-nghiep",
    name: "Giải pháp doanh nghiệp",
    description: "Dành cho các agency sự kiện, trung tâm tiệc cưới hoặc sự kiện ra mắt sản phẩm.",
    price: "Liên hệ báo giá",
    features: [
      "Giao diện tuân thủ chặt chẽ Brand Guideline",
      "Hệ thống check-in mã QR đa luồng",
      "Quản lý danh sách khách mời quy mô lớn (>1000 khách)",
      "Báo cáo thống kê tương tác theo thời gian thực",
      "Hỗ trợ kỹ thuật trực tiếp trong ngày sự kiện",
    ],
  },
];

export const PORTFOLIO: PortfolioItem[] = [
  { id: "p1", name: "Dạ tiệc Hoàng gia", client: "Sự kiện kỷ niệm", tone: { bg: "#FFF1DF", ink: "#9A5A12" } },
  { id: "p2", name: "Khu vườn cổ tích", client: "Tiệc cưới", tone: { bg: "#EAF4EE", ink: "#1D5B35" } },
  { id: "p3", name: "Đêm hội ngộ", client: "Gala Dinner", tone: { bg: "#EEEAFB", ink: "#5B43B8" } },
  { id: "p4", name: "Dấu ấn Á Đông", client: "Lễ Hằng thuận", tone: { bg: "#FBEDEE", ink: "#B5485D" } },
];