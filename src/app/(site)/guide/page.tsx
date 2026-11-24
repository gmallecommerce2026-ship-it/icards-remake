import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui/Primitives";
import { SideAdsShell } from "@/components/ads/SideAdsShell";
import { GuideStage, type Hotspot } from "@/components/guide/GuideStage";
import { GuideSectionNav } from "@/components/guide/GuideSectionNav";

export const metadata: Metadata = {
  title: "Hướng dẫn sử dụng iCards",
  description:
    "Hướng dẫn từng bước: tạo tài khoản, chọn mẫu thiệp, chỉnh sửa thiệp, quản lý khách mời, lời chúc, ngân sách và gửi thiệp cho khách.",
};

type Image = { src: string; alt: string; caption: string; hotspots?: Hotspot[] };
type Section = {
  id: string;
  title: string;
  path?: string;
  intro?: string;
  steps?: string[];
  bullets?: string[];
  images?: Image[];
  note?: string;
};

const img = (file: string, alt: string, caption: string, hotspots?: Hotspot[]): Image => ({
  src: `/guide/${file}`,
  alt,
  caption,
  hotspots,
});

/* Toạ độ (%) tính trên ảnh gốc: x theo chiều rộng, y theo chiều cao. */

const EDITOR_SPOTS: Hotspot[] = [
  { x: 2.9, y: 29, title: "Thanh công cụ bên trái", text: "Mẫu, Phần tử, Chữ, Nền, Thương hiệu, Tải lên ảnh, Công cụ, Vẽ, Ứng dụng." },
  { x: 16.9, y: 11, title: "Chọn mặt cần sửa", text: "Mặt ngoài, Trang trái, Trang phải hoặc Mặt sau." },
  { x: 64, y: 3.4, title: "Hoàn tác, làm lại", text: "Quay lại hoặc làm lại thao tác vừa thực hiện." },
  { x: 73.7, y: 3.4, title: "Thiệp và Phong bì", text: "Chuyển giữa chỉnh sửa thiệp và chỉnh phong bì." },
  { x: 58.9, y: 49, title: "Di chuyển đối tượng", text: "Kéo để di chuyển. Giữ vùng trống rồi kéo sang trái hoặc phải để lật trang." },
  { x: 84.6, y: 3.4, title: "Chỉnh sửa và Xem thử", text: "Chỉnh sửa để làm thiệp, Xem thử để xem như khách." },
  { x: 96.1, y: 3.4, title: "Tiếp theo", text: "Khi xong, bấm để sang bước cài đặt." },
];

const TEMPLATE_SPOTS: Hotspot[] = [
  { x: 3.9, y: 11.6, title: "Phóng to", text: "Xem thiệp lớn hơn. Nhấn Esc để đóng." },
  { x: 3.9, y: 17.1, title: "Tự động lật", text: "Thiệp tự chuyển sang mặt tiếp theo." },
  { x: 3.9, y: 22, title: "Xem lại", text: "Quay về phong bì để xem lại từ đầu." },
  { x: 37.5, y: 64.5, title: "Xem từng mặt", text: "Bấm tên mặt, chấm tròn, nút ‹ › hoặc vuốt trên điện thoại." },
  { x: 57, y: 36.7, title: "Khung xem thiệp", text: "Xem trước thiệp mẫu. Thiệp của bạn sẽ hiện thông tin do bạn nhập." },
  { x: 78.5, y: 27.5, title: "Dùng mẫu này", text: "Tạo thiệp mới từ mẫu này." },
  { x: 90.6, y: 27.5, title: "Xem mẫu khác", text: "Quay lại danh sách để chọn mẫu khác." },
  { x: 73.6, y: 40, title: "Chia sẻ mẫu", text: "Facebook, Messenger, Zalo, WhatsApp, sao chép link hoặc lấy mã QR." },
  { x: 75.9, y: 60, title: "Thông tin mẫu", text: "Số phần của thiệp, số lượt đã dùng và ngày phát hành." },
  { x: 75, y: 68, title: "Tính năng", text: "Danh sách tính năng có trong mẫu này." },
];

const GUEST_SPOTS: Hotspot[] = [
  { x: 23.1, y: 46.3, title: "+ Thêm khách mời", text: "Thêm một khách mời thủ công." },
  { x: 33.6, y: 46.3, title: "Thêm từ danh bạ", text: "Lấy khách từ danh bạ đã lưu." },
  { x: 43, y: 46.3, title: "Quản lí nhóm", text: "Tạo nhóm khách, ví dụ “Gia đình nhà trai”." },
  { x: 51.7, y: 46.3, title: "Nhập từ Excel", text: "Tải file mẫu, điền khách rồi nhập lại." },
  { x: 61, y: 46.3, title: "Xuất danh sách", text: "Tải danh sách khách hiện tại về máy." },
  { x: 69.8, y: 46.3, title: "Tải file mẫu", text: "File Excel mẫu để điền danh sách khách." },
  { x: 43, y: 58, title: "Thống kê", text: "Tổng khách, tham dự, từ chối, chưa trả lời, tổng người đi và tiền mừng." },
  { x: 27, y: 65.6, title: "Tìm kiếm", text: "Tìm theo tên hoặc email." },
  { x: 44, y: 65.6, title: "Lọc", text: "Lọc theo trạng thái khách và trạng thái email." },
];

const SETTINGS_SPOTS: Hotspot[] = [
  { x: 23.5, y: 25.6, title: "Email gửi khách mời", text: "Chủ đề và nội dung. Có thể dùng biến như {TênKháchMời}." },
  { x: 30.5, y: 51.1, title: "Lời xưng hô", text: "Chọn kiểu hiển thị, ví dụ “Thân gửi”." },
  { x: 50.9, y: 76.5, title: "Duyệt lời chúc", text: "Bật để lời chúc phải được bạn duyệt trước khi hiện." },
  { x: 18.5, y: 84.2, title: "Cho phép xác nhận (RSVP)", text: "Đặt số người đi cùng tối đa và hạn xác nhận." },
  { x: 20.7, y: 93.9, title: "Lưu thông tin", text: "Bấm sau khi chỉnh sửa để lưu." },
];

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
    intro: "Bấm vào một mẫu để xem chi tiết. Bên trái là khung xem thiệp, bên phải là thông tin và các nút hành động. Bấm vào từng số trên ảnh để xem chi tiết.",
    bullets: ["Dưới cùng: 3 bước làm thiệp và các mẫu bạn có thể thích."],
    images: [
      img("02b-chi-tiet-mau.png", "Trang chi tiết mẫu thiệp Sớm Mai", "Chi tiết mẫu thiệp Sớm Mai", TEMPLATE_SPOTS),
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
    intro: "Đây là màn hình chỉnh sửa. Thiệp gồm hai phần: Thiệp (mặt ngoài, trang trái, trang phải, mặt sau) và Phong bì. Bấm vào từng số trên ảnh để xem chức năng.",
    images: [img("05-chinh-sua-thiep.png", "Màn hình chỉnh sửa thiệp", "Màn hình chỉnh sửa thiệp", EDITOR_SPOTS)],
    note: "Khi xong, bấm “Tiếp theo” để sang bước cài đặt.",
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
    intro: "Bấm vào từng số trên ảnh để xem chức năng của nút đó.",
    bullets: [
      "Gửi thiệp qua email: bấm “Gửi” ở từng khách, hoặc chọn nhiều khách rồi bấm “Gửi email”. Khách có email sẽ nhận thư mời kèm nút “Xem thiệp mời & xác nhận tham dự”.",
    ],
    images: [
      img("08-khach-moi.png", "Tab khách mời", "Tab Khách mời", GUEST_SPOTS),
      img("09-khach-moi-vi-du.png", "Tab khách mời của thiệp khác", "Tab Khách mời của một thiệp khác"),
      img("08b-email-thiep-moi.png", "Email thiệp mời gửi tới khách", "Email thiệp mời khách nhận được, bấm nút để mở thiệp và xác nhận tham dự"),
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
    images: [
      img("11-su-kien.png", "Tab sự kiện", "Tab Sự kiện và lịch nhắc"),
      img("11b-email-nhac-lich.png", "Email nhắc xác nhận tham dự", "Email nhắc lịch gửi tới khách còn 7 ngày nữa đến sự kiện"),
    ],
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
    intro: "Các thẻ phía trên tự cập nhật: ngân sách tổng, dự kiến, thực tế và còn lại.",
    steps: [
      "Nhập “Tổng ngân sách (VND)” rồi bấm “Lưu ngân sách”.",
      "Thêm hạng mục (ví dụ “Thiệp cưới”), nhập Dự kiến, Thực tế, Đã thanh toán và ghi chú trong bảng.",
      "Bấm “Lưu ngân sách” để lưu tất cả thay đổi trong bảng.",
    ],
    images: [img("13-ngan-sach.png", "Ngân sách", "Tab Ngân sách")],
  },
  {
    id: "cai-dat-thiep",
    title: "Cài đặt thiệp",
    path: "/invitation-management/<id>/settings",
    intro: "Bấm vào từng số trên ảnh để xem nội dung cần điền.",
    images: [img("14-cai-dat-thiep.png", "Cài đặt thiệp", "Tab Cài đặt", SETTINGS_SPOTS)],
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

const NAV_ITEMS = SECTIONS.map((s) => ({ id: s.id, label: s.title }));
const QUICK = [
  { id: "tao-thiep", label: "Tạo thiệp" },
  { id: "khach-moi", label: "Khách mời" },
  { id: "cai-dat-thiep", label: "Cài đặt" },
  { id: "su-kien", label: "Nhắc lịch" },
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
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">Đi nhanh tới:</span>
              {QUICK.map((q) => (
                <a
                  key={q.id}
                  href={`#${q.id}`}
                  className="rounded-full border border-line bg-white px-3.5 py-1.5 font-medium text-ink transition-colors hover:border-[#27548A] hover:text-[#27548A]"
                >
                  {q.label}
                </a>
              ))}
            </div>
          </PageHero>
        }
      >
        <Container className="py-12 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
            <GuideSectionNav items={NAV_ITEMS} />

            <div className="min-w-0 space-y-16">
              {SECTIONS.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-28 border-t border-line pt-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#27548A]">Phần {i + 1}</p>
                  <h2 className="mt-2 text-2xl font-bold text-ink">{s.title}</h2>
                  {s.path && <p className="mt-1 font-mono text-xs text-muted">{s.path}</p>}
                  {s.intro && <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">{s.intro}</p>}

                  {s.steps && (
                    <ol className="mt-5 space-y-3">
                      {s.steps.map((t, n) => (
                        <li key={t} className="flex gap-3 leading-relaxed text-slate-700">
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#27548A] text-xs font-bold text-white">{n + 1}</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {s.bullets && (
                    <ul className="mt-5 space-y-2.5 leading-relaxed text-slate-700">
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

                  <div className="mt-8 space-y-8">
                    {s.images?.map((m) =>
                      m.hotspots ? (
                        <div key={m.src}>
                          <p className="mb-4 text-sm text-muted">Bấm số trên ảnh hoặc chọn một bước bên trái để xem phần đó.</p>
                          <GuideStage src={m.src} alt={m.alt} caption={m.caption} hotspots={m.hotspots} />
                        </div>
                      ) : (
                        <figure key={m.src}>
                          {/* Ảnh dài được cuộn trong khung, không kéo dài cả trang */}
                          <div className="max-h-[560px] overflow-auto border border-line bg-white p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={m.src} alt={m.alt} loading="lazy" className="block h-auto w-full" />
                          </div>
                          <figcaption className="mt-2 text-center text-xs text-muted">
                            {m.caption} ·{" "}
                            <a href={m.src} target="_blank" rel="noreferrer" className="font-medium text-[#27548A] underline underline-offset-2">
                              Xem ảnh đầy đủ
                            </a>
                          </figcaption>
                        </figure>
                      ),
                    )}
                  </div>
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
