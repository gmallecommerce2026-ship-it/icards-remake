// NỘI DUNG MẪU: Dữ liệu hệ sinh thái dịch vụ đi kèm của iCards. Cần thay thế bằng số liệu thật.

export type Service = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  tone: { bg: string; ink: string };
  highlights: string[];
  process: { title: string; desc: string }[];
  faqIds: string[]; // Trỏ tới id trong faq.ts
};

export const SERVICES: Service[] = [
  {
    slug: "ten-mien-rieng",
    name: "Tên miền sự kiện riêng",
    summary: "Nâng tầm đẳng cấp với đường dẫn thiệp mang tên riêng của bạn (vd: damcuoi-tuan-lan.vn).",
    description: "Thay vì sử dụng đường dẫn mặc định của hệ thống, bạn có thể gắn tên miền cá nhân hóa cho thiệp cưới. Tên miền giúp thiệp trở nên trang trọng, dễ nhớ và tạo ấn tượng mạnh mẽ với khách mời ngay từ khi nhận link.",
    tone: { bg: "#E8EEF6", ink: "#27548A" }, // Kế thừa màu xanh để đồng nhất một số tính năng tech
    highlights: [
      "Định dạng tên miền đa dạng (.vn, .com, .online)",
      "Thiết lập kỹ thuật trong 2 giờ",
      "Duy trì tên miền 1 năm làm kỷ niệm",
      "Tích hợp chứng chỉ bảo mật SSL miễn phí",
    ],
    process: [
      { title: "Chọn tên miền", desc: "Bạn cung cấp 2-3 tên miền mong muốn, hệ thống sẽ kiểm tra tình trạng khả dụng." },
      { title: "Đăng ký và trỏ IP", desc: "iCards thực hiện thủ tục đăng ký và cấu hình kỹ thuật vào thiệp của bạn." },
      { title: "Gửi khách mời", desc: "Đường link mới đã sẵn sàng để gửi đến toàn bộ khách mời." },
    ],
    faqIds: ["chi-phi", "phuong-thuc-thanh-toan"],
  },
  {
    slug: "nhap-danh-sach",
    name: "Hỗ trợ nhập liệu khách mời",
    summary: "Chuyển đổi danh sách khách mời từ file Excel hoặc giấy viết tay lên hệ thống an toàn.",
    description: "Quản lý hàng trăm khách mời có thể gây bối rối. Đội ngũ iCards hỗ trợ bạn chuẩn hóa file danh sách, nhập liệu lên hệ thống để phân lô, đánh số bàn và tạo mã QR check-in đồng bộ, chuẩn xác.",
    tone: { bg: "#FBF3E5", ink: "#9A5A12" }, // Tone gold/amber
    highlights: [
      "Xử lý dữ liệu lên đến 2000 khách",
      "Hỗ trợ phân rã theo nhóm (nhà trai, nhà gái, đối tác)",
      "Chuẩn hóa xưng hô (Kính mời Anh/Chị, Cô/Chú...)",
      "Cam kết bảo mật thông tin tuyệt đối",
    ],
    process: [
      { title: "Gửi danh sách gốc", desc: "Bạn cung cấp danh sách dưới dạng Excel, Word hoặc ảnh chụp sổ tay." },
      { title: "Chuẩn hóa dữ liệu", desc: "Đội ngũ xử lý, lọc trùng lặp và phân chia nhóm khách." },
      { title: "Cập nhật hệ thống", desc: "Toàn bộ danh sách xuất hiện trong bảng quản lý thiệp của bạn, sẵn sàng tạo link riêng." },
    ],
    faqIds: ["gui-cho-khach", "xac-nhan-tham-du"],
  },
  {
    slug: "goi-tin-nhan",
    name: "Gửi tin nhắn Zalo/SMS tự động",
    summary: "Gửi thiệp hàng loạt mang tên riêng từng khách chỉ với một lần bấm nút.",
    description: "Tiết kiệm hàng giờ đồng hồ copy-paste. iCards cung cấp hệ thống gửi tin nhắn SMS brandname hoặc Zalo ZNS kèm link thiệp định danh đến từng người, đảm bảo tính lịch sự và tỷ lệ mở thiệp cao nhất.",
    tone: { bg: "#FBEDEE", ink: "#B5485D" }, // Tone lacquer nhẹ
    highlights: [
      "Cá nhân hóa nội dung tin nhắn (Chào Anh Nam, Chào Chú Hùng...)",
      "Thống kê trạng thái: Đã nhận, Đã mở thiệp",
      "Tiết kiệm 90% thời gian so với gửi thủ công",
      "Chi phí tối ưu mua theo gói",
    ],
    process: [
      { title: "Chốt danh sách", desc: "Đảm bảo danh sách khách mời trên iCards đã đầy đủ số điện thoại." },
      { title: "Soạn mẫu tin nhắn", desc: "Viết lời chào kèm các biến tự động (Tên khách mời, Link thiệp)." },
      { title: "Kích hoạt gửi", desc: "Hệ thống tự động gửi hàng loạt và trả về báo cáo theo thời gian thực." },
    ],
    faqIds: ["gui-cho-khach", "khach-khong-co-tai-khoan"],
  }
];

export function getServices(): Service[] {
  return SERVICES;
}

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getRelatedServices(currentSlug: string, limit = 2): Service[] {
  return SERVICES.filter((s) => s.slug !== currentSlug).slice(0, limit);
}