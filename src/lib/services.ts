// Dữ liệu dịch vụ. Giá và thời gian là số liệu minh họa, thay bằng số liệu thật của bạn.

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

export const SERVICES: Service[] = [
  {
    slug: "thiet-ke-theo-yeu-cau",
    name: "Thiết kế thiệp theo yêu cầu",
    summary: "Nhà thiết kế làm riêng một mẫu thiệp theo màu sắc, ảnh và câu chuyện của bạn.",
    description:
      "Dành cho người muốn thiệp khác hẳn mẫu có sẵn. Bạn gửi ảnh, màu chủ đạo và vài ví dụ bạn thích, chúng tôi dựng thành thiệp online hoàn chỉnh và chỉnh theo góp ý của bạn.",
    priceFrom: 499000,
    duration: "3 đến 5 ngày",
    audience: "Đám cưới, tiệc lớn, sự kiện doanh nghiệp",
    includes: ["Trao đổi ý tưởng qua Zalo hoặc điện thoại", "1 bản thiết kế riêng", "3 lần chỉnh sửa", "Tối ưu hiển thị trên điện thoại", "Bàn giao link thiệp sẵn sàng gửi"],
  },
  {
    slug: "viet-loi-moi",
    name: "Viết lời mời và nội dung thiệp",
    summary: "Biên tập lời mời, lời cảm ơn và các đoạn giới thiệu cho đúng giọng của gia đình bạn.",
    description:
      "Nhiều người bí ở đoạn lời mời. Bạn kể ngắn về sự kiện và người nhận, chúng tôi viết vài phương án để bạn chọn, từ trang trọng đến thân mật.",
    priceFrom: 149000,
    duration: "1 ngày",
    audience: "Mọi loại sự kiện",
    includes: ["3 phương án lời mời", "Lời cảm ơn cuối thiệp", "Chỉnh sửa theo góp ý", "Phiên bản cho nhà trai, nhà gái nếu cần"],
  },
  {
    slug: "nhap-danh-sach-khach",
    name: "Nhập và phân nhóm khách mời",
    summary: "Chuyển danh sách từ sổ tay, Excel hoặc tin nhắn thành danh sách khách mời có phân nhóm.",
    description:
      "Gửi cho chúng tôi danh sách ở bất kỳ dạng nào. Chúng tôi làm sạch, loại trùng, phân nhóm (gia đình, bạn bè, đồng nghiệp) và nhập vào sự kiện của bạn để mỗi nhóm nhận đúng lời mời.",
    priceFrom: 199000,
    duration: "1 đến 2 ngày",
    audience: "Danh sách trên 100 khách",
    includes: ["Làm sạch và loại trùng", "Phân nhóm khách mời", "Nhập vào sự kiện của bạn", "File Excel bản sạch để lưu"],
  },
  {
    slug: "gui-thiep-hang-loat",
    name: "Gửi thiệp hàng loạt",
    summary: "Chúng tôi gửi link thiệp đến từng khách qua Zalo hoặc SMS, kèm tên riêng của họ.",
    description:
      "Mỗi khách nhận một link có tên riêng, nên bạn biết ai đã mở và ai đã trả lời. Bạn chọn thời điểm gửi và nội dung tin nhắn đi kèm.",
    priceFrom: 299000,
    duration: "Trong ngày bạn chọn",
    audience: "Danh sách từ 50 khách",
    includes: ["Link riêng cho từng khách", "Lên lịch gửi", "Báo cáo ai đã mở thiệp", "Nhắc lại khách chưa trả lời"],
  },
  {
    slug: "check-in-qr",
    name: "Check-in bằng mã QR tại sự kiện",
    summary: "Khách quét mã QR ở cửa, bạn thấy ngay ai đã đến và còn thiếu ai.",
    description:
      "Mỗi khách có mã QR riêng trong thiệp. Nhân viên của chúng tôi hoặc người nhà bạn quét bằng điện thoại, số liệu cập nhật ngay trên trang quản lý sự kiện.",
    priceFrom: 990000,
    duration: "Theo ngày tổ chức",
    audience: "Sự kiện từ 100 khách",
    includes: ["Mã QR riêng cho từng khách", "Ứng dụng quét trên điện thoại", "Bảng theo dõi khách đến theo thời gian thực", "Hướng dẫn trước ngày diễn ra"],
  },
];

export function getServices(): Service[] {
  return SERVICES;
}

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getRelatedServices(slug: string, limit = 2): Service[] {
  return SERVICES.filter((s) => s.slug !== slug).slice(0, limit);
}

export const PROCESS_STEPS = [
  { title: "Gửi yêu cầu", text: "Chọn dịch vụ và để lại số điện thoại. Chúng tôi liên hệ trong giờ làm việc." },
  { title: "Nhận báo giá", text: "Sau khi hỏi rõ nhu cầu, chúng tôi báo giá cụ thể và thời gian hoàn thành." },
  { title: "Làm và duyệt", text: "Bạn xem bản đầu, góp ý, chúng tôi chỉnh cho đến khi bạn ưng ý." },
  { title: "Bàn giao", text: "Thiệp và dữ liệu được đưa vào tài khoản của bạn, sẵn sàng gửi." },
];

// Endpoint nhận yêu cầu dịch vụ. Đổi theo API backend thật của bạn.
export const SERVICE_REQUEST_ENDPOINT = "/backend-api/service-requests";
