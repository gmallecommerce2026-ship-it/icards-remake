// src/lib/faq.ts
// NỘI DUNG MẪU: hãy sửa lại cho đúng chính sách, giá và tính năng thật của bạn.

export type FaqGroup = { slug: string; label: string };
export type FaqItem = { id: string; group: string; q: string; a: string };

export const FAQ_GROUPS: FaqGroup[] = [
  { slug: "bat-dau", label: "Bắt đầu" },
  { slug: "thiep-moi", label: "Thiệp mời" },
  { slug: "khach-moi", label: "Khách mời & RSVP" },
  { slug: "thanh-toan", label: "Thanh toán" },
  { slug: "tai-khoan", label: "Tài khoản" },
];

export const FAQS: FaqItem[] = [
  // Bắt đầu
  {
    id: "thiep-online-la-gi",
    group: "bat-dau",
    q: "Thiệp mời online là gì?",
    a: "Thiệp mời online là thiệp điện tử có đường link riêng. Bạn gửi link qua Zalo, Messenger hay tin nhắn, khách mở bằng điện thoại để xem thông tin, bản đồ và xác nhận tham dự.",
  },
  {
    id: "mat-bao-lau",
    group: "bat-dau",
    q: "Tạo một thiệp mất bao lâu?",
    a: "Thông thường chỉ vài phút. Bạn chọn mẫu, điền tên, ngày giờ, địa điểm, thêm ảnh và nhạc rồi xuất bản.",
  },
  {
    id: "can-biet-thiet-ke",
    group: "bat-dau",
    q: "Tôi có cần biết thiết kế không?",
    a: "Không. Mẫu thiệp đã có sẵn bố cục, bạn chỉ thay nội dung trong trình chỉnh sửa.",
  },
  // Thiệp mời
  {
    id: "sua-sau-khi-gui",
    group: "thiep-moi",
    q: "Tôi có sửa được thiệp sau khi đã gửi không?",
    a: "Có. Khi bạn cập nhật, khách mở lại cùng đường link sẽ thấy nội dung mới nhất, nên không cần gửi lại.",
  },
  {
    id: "them-nhac-anh",
    group: "thiep-moi",
    q: "Tôi có thể thêm ảnh, nhạc và bản đồ không?",
    a: "Có. Bạn tải ảnh cưới lên, chọn nhạc nền và gắn địa chỉ để khách bấm chỉ đường ngay trong thiệp.",
  },
  {
    id: "thiep-giay",
    group: "thiep-moi",
    q: "Tôi có thể đặt in thiệp giấy không?",
    a: "Có. Bạn có thể đặt in theo mẫu ở mục In thiệp giấy, chọn số lượng và loại giấy phù hợp.",
  },
  // Khách mời
  {
    id: "gui-cho-khach",
    group: "khach-moi",
    q: "Làm sao để gửi thiệp cho khách?",
    a: "Sao chép link hoặc mã QR của thiệp rồi gửi qua ứng dụng nhắn tin. Bạn cũng có thể gửi riêng từng khách để xưng hô đúng vai vế.",
  },
  {
    id: "xac-nhan-tham-du",
    group: "khach-moi",
    q: "Làm sao biết khách có đến hay không?",
    a: "Khách bấm nút xác nhận trong thiệp. Danh sách trả lời được cập nhật trong trang quản lý sự kiện của bạn.",
  },
  {
    id: "khach-khong-co-tai-khoan",
    group: "khach-moi",
    q: "Khách mời có cần tài khoản để xem thiệp không?",
    a: "Không. Khách chỉ cần mở link trên điện thoại hoặc máy tính.",
  },
  // Thanh toán
  {
    id: "chi-phi",
    group: "thanh-toan",
    q: "Chi phí tạo thiệp là bao nhiêu?",
    a: "Chi phí phụ thuộc vào gói bạn chọn. Bạn xem bảng giá chi tiết tại trang Bảng giá.",
  },
  {
    id: "phuong-thuc-thanh-toan",
    group: "thanh-toan",
    q: "Tôi có thể thanh toán bằng cách nào?",
    a: "Bạn thanh toán ở trang thanh toán khi đặt hàng. Các phương thức hiện có được hiển thị tại đó.",
  },
  {
    id: "xem-don-hang",
    group: "thanh-toan",
    q: "Tôi xem lại đơn hàng ở đâu?",
    a: "Đăng nhập và vào mục Đơn hàng trong trang tài khoản để xem trạng thái và lịch sử.",
  },
  // Tài khoản
  {
    id: "dang-ky",
    group: "tai-khoan",
    q: "Tôi đăng ký tài khoản như thế nào?",
    a: "Bấm Đăng ký, nhập thông tin của bạn rồi xác nhận. Sau đó bạn có thể tạo và quản lý thiệp.",
  },
  {
    id: "quen-mat-khau",
    group: "tai-khoan",
    q: "Tôi quên mật khẩu thì làm sao?",
    a: "Vào trang Quên mật khẩu, nhập email đã đăng ký. Chúng tôi sẽ gửi liên kết để bạn đặt lại mật khẩu.",
  },
];

/** Bỏ dấu + hạ chữ thường để tìm "thiep" khớp "thiệp". */
export function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}