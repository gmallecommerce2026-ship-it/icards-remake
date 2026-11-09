import type { Metadata } from "next";
import { LegalPage, P, UL, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | iCards",
  description: "Cách iCards thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn và khách mời.",
};

const sections: LegalSection[] = [
  {
    id: "gioi-thieu",
    title: "Giới thiệu",
    body: (
      <>
        <P>
          Chính sách này giải thích cách iCards thu thập, sử dụng, lưu trữ và bảo vệ thông tin khi bạn truy cập website, tạo tài
          khoản, thiết kế thiệp mời hoặc quản lý khách mời trên nền tảng của chúng tôi.
        </P>
        <P>Bằng việc sử dụng iCards, bạn đồng ý với các nội dung được mô tả trong chính sách này.</P>
      </>
    ),
  },
  {
    id: "du-lieu-thu-thap",
    title: "Thông tin chúng tôi thu thập",
    body: (
      <>
        <P>Tùy cách bạn sử dụng dịch vụ, chúng tôi có thể thu thập các nhóm thông tin sau:</P>
        <UL
          items={[
            <><strong className="font-semibold text-ink">Thông tin tài khoản:</strong> họ tên, địa chỉ email và mật khẩu (được lưu dưới dạng đã mã hoá).</>,
            <><strong className="font-semibold text-ink">Thông tin thiệp:</strong> tên cô dâu, chú rể hoặc chủ sự kiện, ngày giờ, địa điểm, lời nhắn và ảnh bìa bạn tải lên.</>,
            <><strong className="font-semibold text-ink">Thông tin khách mời do bạn nhập:</strong> họ tên, email, số điện thoại, nhóm khách, phản hồi tham dự và lời chúc.</>,
            <><strong className="font-semibold text-ink">Thông tin đơn hàng:</strong> sản phẩm, dịch vụ bạn mua và thông tin giao nhận cần thiết để hoàn tất đơn.</>,
            <><strong className="font-semibold text-ink">Thông tin kỹ thuật:</strong> địa chỉ IP, loại trình duyệt, thiết bị và dữ liệu cookie phục vụ việc vận hành và bảo mật.</>,
          ]}
        />
      </>
    ),
  },
  {
    id: "muc-dich",
    title: "Mục đích sử dụng thông tin",
    body: (
      <>
        <P>Chúng tôi sử dụng thông tin để:</P>
        <UL
          items={[
            "Tạo và vận hành tài khoản, cho phép bạn đăng nhập và khôi phục mật khẩu.",
            "Hiển thị thiệp mời, xử lý xác nhận tham dự và lưu lời chúc gửi đến bạn.",
            "Gửi thư mời, thông báo và email hỗ trợ khi bạn yêu cầu hoặc khi cần thiết cho dịch vụ.",
            "Xử lý thanh toán, đơn hàng và chăm sóc khách hàng.",
            "Cải thiện sản phẩm, phát hiện gian lận và bảo vệ hệ thống khỏi lạm dụng.",
            "Tuân thủ nghĩa vụ pháp lý khi có yêu cầu từ cơ quan có thẩm quyền.",
          ]}
        />
      </>
    ),
  },
  {
    id: "khach-moi",
    title: "Dữ liệu khách mời",
    body: (
      <>
        <P>
          Thông tin về khách mời (tên, email, số điện thoại, lời chúc, phản hồi) do bạn đưa vào hệ thống. Trong trường hợp này,
          bạn là bên quyết định mục đích sử dụng dữ liệu, còn iCards chỉ xử lý dữ liệu đó để cung cấp dịch vụ cho bạn.
        </P>
        <P>
          Bạn có trách nhiệm đảm bảo đã có sự đồng ý phù hợp hoặc căn cứ hợp pháp khi đưa thông tin của người khác vào thiệp và
          danh sách khách mời. Chúng tôi không dùng dữ liệu khách mời cho mục đích quảng cáo của bên thứ ba.
        </P>
      </>
    ),
  },
  {
    id: "tai-khoan-ngan-hang",
    title: "Thông tin nhận mừng",
    body: (
      <P>
        Nếu bạn bật tính năng nhận mừng trên thiệp, thông tin tài khoản ngân hàng và mã QR bạn cung cấp sẽ được hiển thị cho khách
        mời xem trên thiệp của bạn. Thông tin này chỉ xuất hiện khi bạn bật tính năng và có thể tắt hoặc chỉnh sửa bất cứ lúc nào.
      </P>
    ),
  },
  {
    id: "chia-se",
    title: "Chia sẻ thông tin",
    body: (
      <>
        <P>iCards không bán dữ liệu cá nhân. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp sau:</P>
        <UL
          items={[
            "Với đơn vị cung cấp hạ tầng lưu trữ, máy chủ và gửi email, chỉ trong phạm vi cần thiết để vận hành dịch vụ.",
            "Với cổng thanh toán và đơn vị vận chuyển, khi bạn đặt đơn hàng.",
            "Với khách mời, khi bạn chia sẻ link thiệp: họ sẽ xem được nội dung thiệp bạn đã công khai.",
            "Với cơ quan nhà nước có thẩm quyền, khi pháp luật yêu cầu.",
          ]}
        />
      </>
    ),
  },
  {
    id: "cookie",
    title: "Cookie và công nghệ tương tự",
    body: (
      <P>
        Chúng tôi dùng cookie và bộ nhớ trình duyệt để ghi nhớ phiên đăng nhập, lựa chọn giao diện và duy trì trạng thái làm việc.
        Bạn có thể xoá hoặc chặn cookie trong cài đặt trình duyệt, nhưng một số tính năng có thể không hoạt động đầy đủ.
      </P>
    ),
  },
  {
    id: "bao-mat",
    title: "Bảo mật dữ liệu",
    body: (
      <P>
        Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp như mã hoá mật khẩu, kết nối được mã hoá khi truyền dữ liệu và
        kiểm soát quyền truy cập nội bộ. Không có hệ thống nào an toàn tuyệt đối, vì vậy bạn cũng nên dùng mật khẩu mạnh và không
        chia sẻ thông tin đăng nhập.
      </P>
    ),
  },
  {
    id: "luu-tru",
    title: "Thời gian lưu trữ",
    body: (
      <P>
        Chúng tôi lưu dữ liệu trong thời gian cần thiết để cung cấp dịch vụ và thực hiện nghĩa vụ pháp lý. Khi bạn xoá thiệp hoặc
        yêu cầu xoá tài khoản, dữ liệu liên quan sẽ bị xoá hoặc ẩn danh trong thời gian hợp lý, trừ dữ liệu buộc phải giữ theo quy
        định pháp luật, ví dụ hồ sơ giao dịch.
      </P>
    ),
  },
  {
    id: "quyen-cua-ban",
    title: "Quyền của bạn",
    body: (
      <>
        <P>Bạn có quyền:</P>
        <UL
          items={[
            "Truy cập và xem thông tin cá nhân chúng tôi đang lưu về bạn.",
            "Yêu cầu chỉnh sửa thông tin chưa chính xác.",
            "Yêu cầu xoá tài khoản hoặc dữ liệu cá nhân.",
            "Rút lại sự đồng ý đã cho trước đó, trong phạm vi pháp luật cho phép.",
            "Khiếu nại nếu cho rằng quyền riêng tư của bạn bị vi phạm.",
          ]}
        />
        <P>Để thực hiện các quyền trên, vui lòng liên hệ qua email được nêu ở mục cuối cùng.</P>
      </>
    ),
  },
  {
    id: "tre-em",
    title: "Trẻ em",
    body: (
      <P>
        iCards không nhằm phục vụ trực tiếp trẻ em dưới 16 tuổi. Nếu bạn phát hiện một trẻ em đã cung cấp thông tin cá nhân mà không có
        sự đồng ý của cha mẹ hoặc người giám hộ, vui lòng liên hệ để chúng tôi xoá dữ liệu đó.
      </P>
    ),
  },
  {
    id: "thay-doi",
    title: "Thay đổi chính sách",
    body: (
      <P>
        Chúng tôi có thể cập nhật chính sách này theo thời gian. Khi có thay đổi quan trọng, chúng tôi sẽ thông báo trên website hoặc
        qua email. Ngày cập nhật ở đầu trang cho biết phiên bản hiện hành.
      </P>
    ),
  },
  {
    id: "lien-he",
    title: "Liên hệ",
    body: (
      <P>
        Nếu có câu hỏi về chính sách bảo mật, bạn có thể liên hệ với chúng tôi qua email <a className="font-semibold text-lacquer underline underline-offset-4" href="mailto:hello@icards.vn">hello@icards.vn</a>.
      </P>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Chính sách bảo mật"
      current="Chính sách bảo mật"
      updated="10/11/2026"
      lead="iCards chỉ thu thập thông tin cần thiết để vận hành thiệp mời và quản lý khách mời. Trang này giải thích rõ chúng tôi làm gì với dữ liệu của bạn."
      summary={[
        "Chúng tôi không bán dữ liệu cá nhân của bạn hay khách mời.",
        "Thông tin khách mời do bạn nhập và bạn là bên quyết định cách dùng.",
        "Thông tin ngân hàng nhận mừng chỉ hiển thị khi bạn bật tính năng.",
        "Bạn có thể truy cập, chỉnh sửa hoặc xoá dữ liệu của mình bất cứ lúc nào.",
      ]}
      sections={sections}
    />
  );
}
