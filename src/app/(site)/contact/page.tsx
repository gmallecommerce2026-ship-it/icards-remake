import type { Metadata } from "next";
import { PageHero, Container } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "Liên hệ | iCards",
  description: "Liên hệ với đội ngũ iCards để được tư vấn thiết kế thiệp, báo giá in ấn số lượng lớn hoặc hỗ trợ kỹ thuật.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-porcelain">
      <PageHero
        title="Liên hệ với chúng tôi"
        description="Bạn cần tư vấn thiết kế riêng, báo giá in ấn số lượng lớn hay hỗ trợ kỹ thuật? Đội ngũ iCards luôn sẵn sàng lắng nghe và giải đáp."
      />

      <Container className="py-12 lg:py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 lg:gap-16">
          
          {/* Cột thông tin liên hệ */}
          <section aria-labelledby="contact-info-heading" className="flex flex-col justify-center">
            <h2 id="contact-info-heading" className="text-2xl font-bold text-slate-900 mb-6">
              Thông tin liên hệ
            </h2>
            <div className="space-y-6 text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-900">Địa chỉ văn phòng</h3>
                <p className="mt-1">Tầng 3, Tòa nhà Innovation, Khu Công nghệ cao<br />Quận 9, TP. Hồ Chí Minh</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900">Điện thoại & Zalo</h3>
                <p className="mt-1">
                  <a href="tel:0901234567" className="hover:text-[#27548A] transition-colors">090 123 4567</a>
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900">Email</h3>
                <p className="mt-1">
                  <a href="mailto:hello@icards.vn" className="hover:text-[#27548A] transition-colors">hello@icards.vn</a>
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">Giờ làm việc</h3>
                <p className="mt-1">Thứ 2 - Thứ 6: 08:30 - 18:00<br />Thứ 7: 08:30 - 12:00</p>
              </div>
            </div>

            {/* Khối block màu xanh mượn style từ banner của trang shop */}
            <div className="mt-10 rounded-3xl bg-[#E8EEF6] p-6 text-[#27548A]">
              <p className="font-medium text-lg">Hợp tác & Đại lý</p>
              <p className="mt-2 text-sm text-slate-700">
                Nếu bạn là studio chụp ảnh, đơn vị tổ chức sự kiện muốn hợp tác cung cấp giải pháp thiệp online, hãy gửi email trực tiếp cho chúng tôi để nhận chính sách đối tác.
              </p>
            </div>
          </section>

          {/* Cột Form liên hệ */}
          <section aria-labelledby="contact-form-heading" className="rounded-3xl border border-[#DDE4EE] bg-white p-8 shadow-sm sm:p-10">
            <h2 id="contact-form-heading" className="sr-only">Gửi tin nhắn cho iCards</h2>
            <form action="#" method="POST" className="flex flex-col gap-5">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Nhập tên của bạn"
                  className="w-full rounded-xl border border-[#DDE4EE] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#27548A] focus:ring-4 focus:ring-[#27548A]/10"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email hoặc Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  required
                  placeholder="Để chúng tôi có thể liên lạc lại"
                  className="w-full rounded-xl border border-[#DDE4EE] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#27548A] focus:ring-4 focus:ring-[#27548A]/10"
                />
              </div>

              <div>
                <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Chủ đề quan tâm
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full rounded-xl border border-[#DDE4EE] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#27548A] focus:ring-4 focus:ring-[#27548A]/10"
                >
                  <option value="tu-van-thiet-ke">Tư vấn thiết kế riêng</option>
                  <option value="bao-gia-in-an">Báo giá in ấn số lượng</option>
                  <option value="ho-tro-ky-thuat">Hỗ trợ kỹ thuật / Lỗi website</option>
                  <option value="hop-tac">Hợp tác kinh doanh</option>
                  <option value="khac">Vấn đề khác</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nội dung lời nhắn <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  placeholder="Hãy chia sẻ chi tiết yêu cầu của bạn..."
                  className="w-full resize-y rounded-xl border border-[#DDE4EE] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#27548A] focus:ring-4 focus:ring-[#27548A]/10"
                ></textarea>
              </div>

              <button
                type="submit"
                className="mt-2 rounded-full bg-[#27548A] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e4270] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27548A]"
              >
                Gửi tin nhắn
              </button>
            </form>
          </section>

        </div>
      </Container>
    </main>
  );
}