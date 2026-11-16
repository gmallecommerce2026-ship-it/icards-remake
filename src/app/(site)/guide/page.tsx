import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui/Primitives";
import { SideAdsShell } from "@/components/ads/SideAdsShell";

export const metadata: Metadata = {
  title: "Hướng dẫn sử dụng iCards",
  description:
    "Hướng dẫn từng bước: tạo tài khoản, chọn mẫu thiệp, chỉnh sửa thiệp, quản lý khách mời, lời chúc, ngân sách và gửi thiệp cho khách.",
};

type Section = {
  id: string;
  title: string;
  path?: string;
  intro?: string;
  steps?: string[];
  bullets?: string[];
  images?: { src: string; alt: string; caption: string }[];
  note?: string;
};

const img = (file: string, alt: string, caption: string) => ({ src: `/guide/${file}`, alt, caption });

const SECTIONS: Section[] = [
  {
    id: "trang-chu",
    title: "Trang chủ",
    path: "/",
    intro: "Trang chủ giới thiệu các nhóm thiệp và mẫu nổi bật. Từ đây bạn có thể xem mẫu, lọc theo dịp hoặc đăng nhập.",
    bullets: [
      "Bấm “Xem mẫu thiệp” để vào danh sách mẫu.",
      "Bấm vào một nhóm trên thanh menu (thiệp cưới, sinh nhật, đầy tháng…) để xem mẫu theo nhóm.",
      "Bấm “Đăng ký” hoặc “Đăng nhập” ở góc phải trên cùng.",
    ],
    images: [img("01-trang-chu.png", "Trang chủ iCards", "Trang chủ")],
  },
  {
    id: "danh-sach-mau",
    title: "Danh sách mẫu thiệp",
    path: "/templates",
    intro: "Chọn nhóm ở thanh phía trên để lọc mẫu. Bạn có thể tìm theo tên hoặc phong cách, và sắp xếp theo mức độ phổ biến.",
    images: [img("02-danh-sach-mau.png", "Danh sách mẫu thiệp cưới", "Danh sách mẫu thiệp cưới")],
  },
  {
    id: "chi-tiet-mau",
    title: "Chi tiết một mẫu thiệp",
    path: "/templates/<tên-mẫu>",
    intro: "Bấm vào một mẫu để xem chi tiết. Khung xem trước có hai chế độ: Máy tính và Điện thoại. Kéo thanh cuộn bên trong khung để xem toàn bộ thiệp, kể cả hiệu ứng mở phong bì.",
    bullets: [
      "Cột trái: chia sẻ mẫu qua Facebook, Zalo, Messenger, email, sao chép link, mã QR…",
      "Cột phải: giá, số phần của thiệp, tính năng và nút “Dùng mẫu này”.",
      "Dưới cùng: 3 bước làm thiệp và các mẫu bạn có thể thích.",
    ],
    note: "Lưu ý: nội dung trong khung xem trước là dữ liệu mẫu. Thiệp của bạn sẽ hiển thị tên và thông tin do bạn nhập.",
  },
  {
    id: "dang-ky",
    title: "Đăng ký",
    path: "/sign-up",
    steps: ["Nhập Tên đăng nhập, Email và Mật khẩu (tối thiểu 8 ký tự).", "Bấm “Đăng ký”."],
    images: [img("03-dang-ky.png", "Form đăng ký", "Form đăng ký")],
  },
  {
    id: "dang-nhap",
    title: "Đăng nhập",
    path: "/sign-in",
    steps: ["Nhập Tên đăng nhập hoặc email và Mật khẩu.", "Bấm “Đăng nhập”."],
    bullets: ["Quên mật khẩu? Bấm “Quên mật khẩu” (xem mục bên dưới)."],
    images: [img("04-dang-nhap.png", "Form đăng nhập", "Form đăng nhập")],
  },
  {
    id: "quen-mat-khau",
    title: "Quên mật khẩu và đặt lại",
    path: "/forgot-password, /reset-password",
    steps: [
      "Ở trang đăng nhập, bấm “Quên mật khẩu”. Nhập email đã đăng ký rồi bấm “Gửi link đặt lại”.",
      "Mở email từ iCards và bấm vào link đặt lại mật khẩu. Nếu không thấy email, hãy kiểm tra mục thư rác.",
      "Nhập mật khẩu mới (tối thiểu 8 ký tự) hai lần rồi bấm “Đổi mật khẩu”. Sau đó đăng nhập bằng mật khẩu mới.",
    ],
    note: "Link đặt lại mật khẩu có thời hạn. Nếu báo link hết hạn, hãy yêu cầu link mới.",
  },
  {
    id: "tao-thiep",
    title: "Tạo thiệp: chỉnh sửa nội dung và phong bì",
    path: "/invitation-management/my-events/view",
    intro: "Đây là màn hình chỉnh sửa. Thiệp gồm hai phần: Thiệp (mặt ngoài, trang trái, trang phải, mặt sau) và Phong bì.",
    bullets: [
      "Thanh bên trái: Mẫu, Phần tử (hình khối, đồ họa, 3D, khung, lưới), Chữ, Nền, Thương hiệu, Tải lên ảnh của bạn, Công cụ, Vẽ, Ứng dụng.",
      "Phía trên: Hoàn tác, Làm lại; chuyển giữa Thiệp và Phong bì; chuyển giữa Chỉnh sửa và Xem thử.",
      "Kéo đối tượng để di chuyển. Giữ vùng trống rồi kéo sang trái hoặc phải để lật trang. Chạm vào phong bì phía sau để chỉnh phong bì.",
      "Khi xong, bấm “Tiếp theo” để sang bước cài đặt.",
    ],
    images: [img("05-chinh-sua-thiep.png", "Màn hình chỉnh sửa thiệp", "Màn hình chỉnh sửa: thanh công cụ bên trái, thiệp và phong bì ở giữa")],
  },
  {
    id: "kieu-trang",
    title: "Tạo thiệp: kiểu trang và cài đặt",
    intro: "Phần này quyết định cách trang xem hiển thị cho khách.",
    bullets: [
      "Kiểu trang: chọn kiểu chữ cho cả trang (Principal, Heritage, Plume…).",
      "Màu: chọn bảng màu ở cột bên phải, có thể đặt màu nền và màu nhấn riêng.",
      "Cài đặt: thông tin chủ tiệc, thời gian, địa điểm. Bấm trực tiếp vào từng dòng để sửa.",
      "Sửa nội dung và Thêm khối ở thanh trái để thêm phần mới cho trang.",
      "Phía trên: Xem trước để xem như khách, Lưu để lưu, Thêm khách mời.",
    ],
    images: [img("06-cai-dat-kieu-trang.png", "Chọn kiểu trang và màu", "Chọn kiểu trang, màu sắc và nội dung hiển thị")],
  },
  {
    id: "quan-ly-thiep",
    title: "Quản lý thiệp mời",
    path: "/invitation-management",
    intro: "Trang này liệt kê tất cả thiệp của bạn. Mỗi thẻ hiển thị tên, ngày diễn ra, số khách đã trả lời và trạng thái.",
    bullets: [
      "Đang công khai: khách đã mở được link thiệp.",
      "Bản nháp: thiệp chưa xuất bản, khách chưa mở được.",
      "Bấm “Tạo thiệp mới” để bắt đầu. Bấm vào thẻ để mở trang quản lý của thiệp đó.",
    ],
    images: [img("07-quan-ly-thiep.png", "Danh sách thiệp", "Danh sách thiệp đã tạo")],
  },
  {
    id: "khach-moi",
    title: "Khách mời",
    path: "/invitation-management/<id>/guests",
    bullets: [
      "Thêm khách: bấm “+ Thêm khách mời”, hoặc “Thêm từ danh bạ” để lấy từ danh bạ đã lưu.",
      "Nhóm khách: bấm “Quản lí nhóm” để tạo nhóm, ví dụ “Gia đình nhà trai”.",
      "Nhập từ Excel: tải “Tải file mẫu”, điền khách rồi nhập lại. “Xuất danh sách” để tải danh sách hiện tại.",
      "Thống kê: tổng khách, tham dự, từ chối, chưa trả lời, tổng người đi và tiền mừng.",
      "Lọc: tìm theo tên hoặc email, lọc theo trạng thái và trạng thái email.",
    ],
    images: [
      img("08-khach-moi.png", "Tab khách mời", "Tab Khách mời (chưa có khách)"),
      img("09-khach-moi-vi-du.png", "Tab khách mời của thiệp khác", "Tab Khách mời của một thiệp khác"),
    ],
  },
  {
    id: "loi-chuc",
    title: "Lời chúc",
    path: "/invitation-management/<id>/wishes",
    intro: "Lời chúc khách gửi trên trang thiệp sẽ hiện ở đây. Bạn có thể lọc theo Tất cả, Chờ duyệt hoặc Đang hiển thị.",
    bullets: ["Bấm “Tải lại” để cập nhật danh sách.", "“Tạo thiệp cảm ơn” để tạo thiệp gửi lời cảm ơn sau sự kiện."],
    images: [img("10-loi-chuc.png", "Tab lời chúc", "Tab Lời chúc")],
  },
  {
    id: "su-kien",
    title: "Sự kiện và nhắc lịch",
    path: "/invitation-management/<id>/events",
    steps: [
      "Chọn “Thời gian diễn ra sự kiện”. Hệ thống dùng mốc này để tính ngày gửi email nhắc.",
      "Thêm lịch nhắc: nhập số ngày trước sự kiện (ví dụ 7) rồi bấm “Thêm lịch nhắc”.",
      "Bấm “Lưu thiết lập sự kiện”.",
    ],
    note: "Email nhắc chỉ gửi cho khách chưa xác nhận tham dự và có email, lúc 08:00 sáng theo giờ Việt Nam.",
    images: [img("11-su-kien.png", "Tab sự kiện", "Tab Sự kiện và lịch nhắc")],
  },
  {
    id: "ke-hoach",
    title: "Kế hoạch cưới",
    path: "/invitation-management/<id>/planner",
    intro: "Ghi lại các việc cần làm trước ngày cưới. Nhập Nhóm (ví dụ “Đặt tiệc”), Công việc và Hạn, rồi bấm “Thêm”. Thanh tiến độ hiển thị tỷ lệ việc đã xong.",
    images: [img("12-ke-hoach-cuoi.png", "Kế hoạch cưới", "Tab Kế hoạch cưới")],
  },
  {
    id: "ngan-sach",
    title: "Ngân sách",
    path: "/invitation-management/<id>/budget",
    steps: [
      "Nhập “Tổng ngân sách (VND)” rồi bấm “Lưu ngân sách”.",
      "Thêm hạng mục (ví dụ “Thiệp cưới”), nhập Dự kiến, Thực tế, Đã thanh toán và ghi chú trong bảng.",
      "Bấm “Lưu ngân sách” để lưu tất cả thay đổi trong bảng.",
    ],
    intro: "Các thẻ phía trên tự cập nhật: ngân sách tổng, dự kiến, thực tế và còn lại.",
    images: [img("13-ngan-sach.png", "Ngân sách", "Tab Ngân sách")],
  },
  {
    id: "cai-dat-thiep",
    title: "Cài đặt thiệp",
    path: "/invitation-management/<id>/settings",
    bullets: [
      "Email gửi khách mời: chủ đề và nội dung. Có thể dùng biến tự thay như {TênKháchMời}, {LờiXưngHô}, {EmailKháchMời}.",
      "Lời xưng hô: chọn kiểu hiển thị (ví dụ “Thân gửi”). Chọn “Dùng cài đặt này cho tất cả khách” nếu muốn ghi đè theo nhóm.",
      "Khu vực lời chúc: tiêu đề, mô tả, cho phép gửi lời chúc, và bật “Duyệt lời chúc trước khi hiện”.",
      "Xác nhận tham dự (RSVP): cho phép khách xác nhận, hiện danh sách khách, số người đi cùng tối đa và hạn xác nhận.",
    ],
    steps: ["Bấm “Lưu thông tin” sau khi chỉnh sửa."],
    images: [img("14-cai-dat-thiep.png", "Cài đặt thiệp", "Tab Cài đặt")],
  },
  {
    id: "xoa-thiep",
    title: "Xoá thiệp",
    path: "/invitation-management/<id>/delete",
    intro: "Xoá thiệp là vĩnh viễn: thiệp, toàn bộ khách mời, nhóm khách và lời chúc sẽ bị xoá, và link đã gửi không còn mở được.",
    steps: ["Gõ đúng tên thiệp vào ô xác nhận.", "Bấm “Xoá thiệp này”."],
    images: [img("15-xoa-thiep.png", "Xoá thiệp", "Tab Xoá thiệp")],
  },
  {
    id: "trang-khach",
    title: "Trang thiệp dành cho khách",
    path: "/events/view?id=…&guestId=…",
    intro: "Đây là trang khách nhận được qua link. Khách có thể xem thông tin sự kiện, xác nhận tham dự và gửi lời chúc.",
    bullets: [
      "Chọn “Tôi sẽ đến” hoặc “Không đến được”, nhập số người đi cùng và lời nhắn, rồi bấm “Gửi xác nhận”.",
      "Viết lời chúc trong Sổ lưu bút rồi bấm “Gửi lời chúc”. Lời chúc sẽ hiện ở tab Lời chúc của chủ thiệp.",
    ],
    images: [img("16-trang-thiep-khach.png", "Trang thiệp dành cho khách", "Trang thiệp khách mở ra")],
  },
  {
    id: "tai-khoan",
    title: "Cài đặt tài khoản",
    path: "/account-settings",
    intro: "Bấm vào ảnh đại diện để đổi ảnh (nên dùng ảnh vuông, tối đa 2MB). Bạn có thể sửa Họ và tên, Số điện thoại rồi bấm “Lưu thay đổi”.",
    note: "Email đăng nhập không tự đổi được. Cần đổi email thì liên hệ hỗ trợ.",
    images: [img("17-cai-dat-tai-khoan.png", "Cài đặt tài khoản", "Trang Cài đặt tài khoản")],
  },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-porcelain">
      <SideAdsShell
        hero={
          <PageHero
            eyebrow="Hướng dẫn"
            title="Hướng dẫn sử dụng iCards"
            description="Từ lúc đăng ký đến khi gửi thiệp và theo dõi khách mời, mọi bước đều có hướng dẫn kèm hình ảnh."
          />
        }
      >
        <Container className="py-12 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
            <nav aria-label="Mục lục hướng dẫn" className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-sm font-semibold text-ink">Mục lục</p>
              <ol className="mt-4 space-y-2 text-sm">
                {SECTIONS.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-muted transition-colors hover:text-[#27548A]">
                      {i + 1}. {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="min-w-0 space-y-14">
              {SECTIONS.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-28 border-t border-line pt-10">
                  <h2 className="text-2xl font-bold text-ink">
                    {i + 1}. {s.title}
                  </h2>
                  {s.path && <p className="mt-1 font-mono text-xs text-muted">{s.path}</p>}
                  {s.intro && <p className="mt-4 leading-relaxed text-slate-600">{s.intro}</p>}

                  {s.steps && (
                    <ol className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed text-slate-700">
                      {s.steps.map((t) => <li key={t}>{t}</li>)}
                    </ol>
                  )}
                  {s.bullets && (
                    <ul className="mt-4 space-y-2 leading-relaxed text-slate-700">
                      {s.bullets.map((t) => (
                        <li key={t} className="flex gap-3">
                          <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#27548A]" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.note && (
                    <p className="mt-5 border-l-4 border-[#27548A] bg-white px-4 py-3 text-sm leading-relaxed text-slate-600">{s.note}</p>
                  )}

                  {s.images?.map((m) => (
                    <figure key={m.src} className="mt-6 border border-line bg-white p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.src} alt={m.alt} loading="lazy" className="block h-auto w-full border border-line" />
                      <figcaption className="mt-2 text-center text-xs text-muted">{m.caption}</figcaption>
                    </figure>
                  ))}
                </section>
              ))}

              <section className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-[#E8EEF6] p-8 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Còn thắc mắc?</h2>
                  <p className="mt-1 text-slate-600">Xem câu hỏi thường gặp hoặc liên hệ chúng tôi để được hỗ trợ.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/faq" className="rounded-full border border-[#27548A] px-6 py-3 font-semibold text-[#27548A] transition-colors hover:bg-[#27548A] hover:text-white">Hỏi đáp</Link>
                  <Link href="/contact" className="rounded-full bg-[#27548A] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#1f4472]">Liên hệ hỗ trợ</Link>
                </div>
              </section>
            </div>
          </div>
        </Container>
      </SideAdsShell>
    </main>
  );
}
