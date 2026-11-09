import type { Metadata } from "next";
import { LegalPage, P, UL, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | iCards",
  description: "Điều khoản khi sử dụng dịch vụ thiệp mời online, quản lý khách mời và cửa hàng của iCards.",
};

const sections: LegalSection[] = [
  {
    id: "chap-nhan",
    title: "Chấp nhận điều khoản",
    body: (
      <P>
        Khi truy cập hoặc sử dụng iCards, bạn đồng ý tuân thủ các điều khoản này. Nếu bạn không đồng ý, vui lòng ngừng sử dụng dịch vụ.
        Điều khoản áp dụng cho mọi người truy cập website, người dùng đã đăng ký và khách mời xem thiệp.
      </P>
    ),
  },
  {
    id: "tai-khoan",
    title: "Tài khoản người dùng",
    body: (
      <>
        <UL
          items={[
            "Bạn cần cung cấp thông tin chính xác và cập nhật khi cần thiết.",
            "Bạn chịu trách nhiệm bảo mật mật khẩu và mọi hoạt động diễn ra dưới tài khoản của mình.",
            "Thông báo ngay cho chúng tôi nếu phát hiện tài khoản bị truy cập trái phép.",
            "Mỗi người chỉ nên sử dụng một tài khoản cho mục đích cá nhân hoặc tổ chức đã đăng ký.",
          ]}
        />
      </>
    ),
  },
  {
    id: "dich-vu",
    title: "Dịch vụ iCards",
    body: (
      <>
        <P>iCards cung cấp các công cụ để bạn:</P>
        <UL
          items={[
            "Chọn mẫu và thiết kế thiệp mời online, có thể đăng tải ảnh, nội dung và nhạc.",
            "Công khai thiệp qua link và quản lý danh sách khách mời, xác nhận tham dự, lời chúc.",
            "Gửi thư mời và thông báo qua email đến khách mời bạn chỉ định.",
            "Mua sản phẩm in ấn, dịch vụ tại sự kiện hoặc dịch vụ kỹ thuật số trong cửa hàng.",
          ]}
        />
        <P>Chúng tôi có thể thêm, thay đổi hoặc ngừng một số tính năng để cải thiện dịch vụ, và sẽ thông báo trước khi có thay đổi lớn.</P>
      </>
    ),
  },
  {
    id: "noi-dung",
    title: "Nội dung của bạn",
    body: (
      <>
        <P>
          Bạn giữ quyền sở hữu đối với nội dung bạn tạo ra và tải lên, như ảnh cưới, lời nhắn và thông tin sự kiện. Bạn cấp cho iCards
          giấy phép không độc quyền, có phạm vi toàn cầu, để lưu trữ, hiển thị và xử lý nội dung đó nhằm cung cấp dịch vụ cho bạn.
        </P>
        <P>Bạn cam kết nội dung của mình không:</P>
        <UL
          items={[
            "Xâm phạm quyền sở hữu trí tuệ, quyền hình ảnh hoặc quyền riêng tư của người khác.",
            "Chứa nội dung khiêu dâm, bạo lực, lừa đảo, kỳ thị hoặc vi phạm pháp luật.",
            "Dùng để phát tán tin rác, giả mạo người khác hoặc gây hại cho hệ thống.",
          ]}
        />
      </>
    ),
  },
  {
    id: "khach-moi",
    title: "Gửi thư mời và dữ liệu khách mời",
    body: (
      <P>
        Bạn chịu trách nhiệm về danh sách khách mời và việc gửi thư mời. Chỉ gửi thư mời đến người bạn có quan hệ hợp lý và không dùng
        công cụ gửi email của iCards cho mục đích quảng cáo, spam hay thu thập thông tin trái phép.
      </P>
    ),
  },
  {
    id: "thanh-toan",
    title: "Thanh toán và đơn hàng",
    body: (
      <>
        <UL
          items={[
            "Giá sản phẩm và dịch vụ được hiển thị trước khi bạn xác nhận đơn hàng.",
            "Đơn hàng được xác nhận khi thanh toán hoàn tất hoặc khi iCards gửi xác nhận, tuỳ theo từng loại sản phẩm.",
            "Chính sách đổi trả, hoàn tiền và thời gian giao nhận được hiển thị tại từng sản phẩm hoặc dịch vụ.",
          ]}
        />
      </>
    ),
  },
  {
    id: "goi-dich-vu",
    title: "Thay đổi giá và gói dịch vụ",
    body: (
      <P>
        Chúng tôi có thể điều chỉnh giá hoặc các gói dịch vụ. Thay đổi sẽ không ảnh hưởng đến đơn hàng đã xác nhận và sẽ được thông báo
        trước khi áp dụng cho các giao dịch tiếp theo.
      </P>
    ),
  },
  {
    id: "so-huu-tri-tue",
    title: "Sở hữu trí tuệ",
    body: (
      <P>
        Logo, giao diện, mã nguồn, bộ mẫu thiệp và nội dung do iCards xây dựng thuộc quyền sở hữu của iCards. Bạn được phép sử dụng mẫu
        thiệp để tạo thiệp cho sự kiện của mình, nhưng không được sao chép, bán lại hoặc phân phối các mẫu này dưới dạng sản phẩm riêng.
      </P>
    ),
  },
  {
    id: "gioi-han-trach-nhiem",
    title: "Giới hạn trách nhiệm",
    body: (
      <P>
        Dịch vụ được cung cấp trên cơ sở hiện có. Trong phạm vi pháp luật cho phép, iCards không chịu trách nhiệm đối với thiệt hại gián
        tiếp hoặc phát sinh do gián đoạn kết nối, lỗi thiết bị của người dùng hay việc khách mời không nhận được thư mời do địa chỉ
        email sai hoặc bị hộp thư lọc thư rác.
      </P>
    ),
  },
  {
    id: "cham-dut",
    title: "Tạm ngưng và chấm dứt",
    body: (
      <P>
        Bạn có thể xoá tài khoản bất cứ lúc nào. iCards có quyền tạm ngưng hoặc chấm dứt tài khoản nếu phát hiện vi phạm điều khoản hoặc
        pháp luật, sau khi đã cố gắng thông báo cho bạn khi điều đó là khả thi.
      </P>
    ),
  },
  {
    id: "thay-doi",
    title: "Thay đổi điều khoản",
    body: (
      <P>
        Chúng tôi có thể cập nhật điều khoản này. Khi có thay đổi quan trọng, iCards sẽ thông báo trên website hoặc qua email. Việc tiếp
        tục sử dụng dịch vụ sau thời điểm thay đổi được coi là bạn chấp nhận điều khoản mới.
      </P>
    ),
  },
  {
    id: "phap-luat",
    title: "Luật áp dụng và giải quyết tranh chấp",
    body: (
      <P>
        Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp trước hết sẽ được các bên thương lượng trên tinh thần
        thiện chí. Nếu không đạt được thoả thuận, tranh chấp sẽ được đưa ra cơ quan có thẩm quyền tại Việt Nam giải quyết.
      </P>
    ),
  },
  {
    id: "lien-he",
    title: "Liên hệ",
    body: (
      <P>
        Nếu có thắc mắc về điều khoản sử dụng, vui lòng gửi email tới <a className="font-semibold text-lacquer underline underline-offset-4" href="mailto:hello@icards.vn">hello@icards.vn</a>.
      </P>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Điều khoản sử dụng"
      current="Điều khoản sử dụng"
      updated="10/11/2026"
      lead="Các quy định khi bạn sử dụng iCards để tạo thiệp mời, quản lý khách mời và mua sản phẩm. Đọc kỹ trước khi bắt đầu."
      summary={[
        "Bạn chịu trách nhiệm về nội dung thiệp và danh sách khách mời của mình.",
        "Không dùng iCards để gửi tin rác, lừa đảo hoặc đăng nội dung vi phạm pháp luật.",
        "Bạn giữ quyền sở hữu nội dung của mình; mẫu thiệp và giao diện thuộc về iCards.",
        "Giá, thanh toán và đổi trả được hiển thị rõ tại từng sản phẩm trước khi mua.",
      ]}
      sections={sections}
    />
  );
}
