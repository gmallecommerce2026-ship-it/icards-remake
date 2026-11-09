import type { Slide } from "@/components/ui/Carousel";

/* Nội dung banner. Sửa tiêu đề / đường dẫn ở đây; mỗi trang dùng một bộ riêng. */

export const HOME_BANNERS: Slide[] = [
  { id: "home-1", eyebrow: "Mẫu thiệp mới", title: "Thiệp mở ra như một lá thư thật", text: "Phong bì, lớp lót và tem đều có thể tuỳ chỉnh để thiệp của bạn thật riêng.", href: "/templates", cta: "Xem mẫu thiệp", tone: "from-lacquer-soft via-white to-porcelain" },
  { id: "home-2", eyebrow: "Khách mời", title: "Theo dõi xác nhận tham dự theo thời gian thực", text: "Danh sách khách và lời chúc được cập nhật ngay khi khách phản hồi.", href: "/sign-up", cta: "Bắt đầu miễn phí", tone: "from-porcelain via-white to-lacquer-soft" },
  { id: "home-3", eyebrow: "Dịch vụ", title: "In ấn và quà tặng cho ngày trọng đại", text: "Chọn thêm thiệp in, bảng đón khách hay quà lưu niệm từ cửa hàng iCards.", href: "/shop", cta: "Xem cửa hàng", tone: "from-white via-porcelain to-lacquer-soft" },
];

/* 2 banner cuối trang chủ, nằm phía trên khối "Về chúng tôi". */
/* 3 banner cuối trang: 2 banner đầu xếp cạnh nhau, banner thứ 3 rộng toàn chiều ngang.
   Ảnh nền: thêm image: "https://..." cho từng banner nếu có. Không có thì dùng nền tối. */
export const HOME_BOTTOM_BANNERS: Slide[] = [
  { id: "home-bottom-1", eyebrow: "Thiệp cưới", title: "Trọn bộ thiệp cưới từ mẫu đến in ấn", text: "Chọn mẫu, cá nhân hoá nội dung và đặt in thiệp cùng phong bì đồng bộ.", href: "/templates", cta: "Chọn mẫu cưới", tone: "from-lacquer-soft via-white to-porcelain" },
  { id: "home-bottom-2", eyebrow: "Sự kiện", title: "Quản lý khách mời gọn gàng cho mọi buổi tiệc", text: "Theo dõi xác nhận tham dự, lời chúc và chi phí trong một nơi duy nhất.", href: "/sign-up", cta: "Dùng thử miễn phí", tone: "from-porcelain via-white to-lacquer-soft" },
  { id: "home-bottom-3", eyebrow: "Dịch vụ", title: "Đội ngũ iCards hỗ trợ bạn từ A đến Z", text: "Từ tư vấn ý tưởng đến in ấn và giao hàng tận nơi.", href: "/services", cta: "Xem dịch vụ", tone: "from-white via-porcelain to-lacquer-soft" },
];

export const SHOP_BANNERS: Slide[] = [
  { id: "shop-1", eyebrow: "Ưu đãi", title: "Bộ in thiệp cưới trọn gói", text: "Thiệp in, phong bì và tem đồng bộ với mẫu bạn đã chọn.", href: "/shop", cta: "Khám phá", tone: "from-lacquer-soft via-white to-porcelain" },
  { id: "shop-2", eyebrow: "Mới", title: "Bảng đón khách và quà lưu niệm", text: "Thiết kế theo màu thiệp để không gian tiệc thống nhất từ đầu đến cuối.", href: "/shop", cta: "Xem sản phẩm", tone: "from-porcelain via-white to-lacquer-soft" },
];

export const SERVICES_BANNERS: Slide[] = [
  { id: "svc-1", eyebrow: "Dịch vụ", title: "Đội ngũ iCards hỗ trợ bạn từ A đến Z", text: "Từ tư vấn ý tưởng đến in ấn và giao hàng tận nơi.", href: "/services", cta: "Xem dịch vụ", tone: "from-lacquer-soft via-white to-porcelain" },
  { id: "svc-2", eyebrow: "Tư vấn", title: "Đặt lịch trao đổi về thiệp riêng của bạn", text: "Chúng tôi lắng nghe câu chuyện của hai bạn để phác thảo thiệp độc bản.", href: "/contact", cta: "Liên hệ", tone: "from-white via-porcelain to-lacquer-soft" },
];

export const PROFESSIONAL_BANNERS: Slide[] = [
  { id: "pro-1", eyebrow: "Chuyên nghiệp", title: "Thiết kế bản sắc riêng cho sự kiện của bạn", text: "Đồng hành cùng cá nhân cao cấp, doanh nghiệp và agency sự kiện.", href: "/contact", cta: "Liên hệ tư vấn", tone: "from-lacquer-soft via-white to-porcelain" },
  { id: "pro-2", eyebrow: "Danh mục", title: "Những dự án đã được kiến tạo", text: "Xem các bộ thiệp và trải nghiệm sự kiện từ đội ngũ iCards.", href: "#portfolio", cta: "Xem dự án", tone: "from-porcelain via-white to-lacquer-soft" },
];
