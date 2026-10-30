// src/lib/blog.ts
// Dữ liệu blog (tĩnh). Sau này có thể thay bằng CMS / database mà không đổi UI.
// NỘI DUNG MẪU: hãy thay bằng bài viết thật của bạn.

export type BlogCategory = { slug: string; label: string };

export type Block =
  | { t: "h2"; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "tip"; text: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string; // slug của BlogCategory
  date: string; // ISO yyyy-mm-dd
  readMinutes: number;
  author: string;
  tone: { bg: string; ink: string };
  content: Block[];
};

export const BLOG_CATEGORIES: BlogCategory[] = [
  { slug: "thiep-cuoi", label: "Thiệp cưới" },
  { slug: "su-kien", label: "Sự kiện" },
  { slug: "huong-dan", label: "Hướng dẫn" },
  { slug: "meo-hay", label: "Mẹo hay" },
];

export const POSTS: Post[] = [
  {
    slug: "cach-tao-thiep-cuoi-online-trong-5-phut",
    title: "Cách tạo thiệp cưới online trong 5 phút",
    excerpt:
      "Chọn mẫu, điền thông tin, thêm nhạc và ảnh rồi gửi link cho khách. Đây là quy trình gọn nhất cho cặp đôi bận rộn.",
    category: "huong-dan",
    date: "2026-10-20",
    readMinutes: 4,
    author: "Đội ngũ iCards",
    tone: { bg: "#E8EEF6", ink: "#27548A" },
    content: [
      {
        t: "p",
        text: "Thiệp cưới online giúp bạn gửi lời mời tới hàng trăm khách chỉ bằng một đường link. Bạn không cần thiết kế, không cần in ấn, và có thể sửa thông tin bất cứ lúc nào.",
      },
      { t: "h2", text: "Bước 1: Chọn mẫu thiệp phù hợp" },
      {
        t: "p",
        text: "Hãy bắt đầu từ phong cách của đám cưới: truyền thống, tối giản hay hiện đại. Mẫu thiệp đã có sẵn bố cục, bạn chỉ cần thay nội dung.",
      },
      { t: "h2", text: "Bước 2: Điền thông tin sự kiện" },
      {
        t: "ul",
        items: [
          "Tên cô dâu, chú rể và tên hai họ",
          "Ngày giờ (dương lịch và âm lịch nếu cần)",
          "Địa điểm kèm bản đồ chỉ đường",
          "Ảnh cưới, nhạc nền, lời mời",
        ],
      },
      { t: "h2", text: "Bước 3: Gửi và theo dõi" },
      {
        t: "p",
        text: "Sao chép link hoặc mã QR, gửi qua Zalo, Messenger hay tin nhắn. Bạn xem được ai đã mở thiệp và ai xác nhận tham dự.",
      },
      {
        t: "tip",
        text: "Gửi thử cho một người thân trước để kiểm tra giờ, địa chỉ và hiển thị trên điện thoại.",
      },
    ],
  },
  {
    slug: "cach-ghi-thiep-moi-cho-tung-doi-tuong-khach",
    title: "Cách ghi lời mời phù hợp cho từng đối tượng khách",
    excerpt:
      "Họ hàng, bạn bè, đồng nghiệp mỗi nhóm cần một cách xưng hô khác nhau. Gợi ý để lời mời vừa lịch sự vừa gần gũi.",
    category: "thiep-cuoi",
    date: "2026-10-12",
    readMinutes: 5,
    author: "Đội ngũ iCards",
    tone: { bg: "#F3EAE4", ink: "#8A4B27" },
    content: [
      {
        t: "p",
        text: "Cách xưng hô thể hiện sự chu đáo của gia chủ. Với người Việt, vai vế trong gia đình đôi khi quan trọng hơn tuổi tác, nên hãy nhờ bố mẹ kiểm tra danh sách trước khi gửi.",
      },
      { t: "h2", text: "Họ hàng và người lớn tuổi" },
      {
        t: "p",
        text: "Dùng lời mời trang trọng, gọi đúng vai vế (cô, dì, chú, bác, cậu, mợ). Nên có thêm lời nhắn riêng nếu có thể.",
      },
      { t: "h2", text: "Bạn bè và đồng nghiệp" },
      {
        t: "p",
        text: "Giọng văn thân mật hơn, ngắn gọn và rõ thông tin. Một câu mời chân thành thường hiệu quả hơn một đoạn văn dài.",
      },
      {
        t: "tip",
        text: "Với thiệp online, bạn có thể tạo nhiều phiên bản lời mời cho từng nhóm khách chỉ với một mẫu thiệp.",
      },
    ],
  },
  {
    slug: "checklist-truoc-khi-gui-thiep-cuoi",
    title: "Checklist 8 điều cần kiểm tra trước khi gửi thiệp cưới",
    excerpt:
      "Sai giờ, sai địa chỉ hay thiếu bản đồ là những lỗi hay gặp nhất. Rà soát nhanh trước khi bấm gửi.",
    category: "meo-hay",
    date: "2026-10-05",
    readMinutes: 3,
    author: "Đội ngũ iCards",
    tone: { bg: "#E6F1EC", ink: "#1F6B4F" },
    content: [
      {
        t: "p",
        text: "Khi đã gửi cho hàng trăm người, việc sửa lỗi sẽ rất phiền. Dành năm phút kiểm tra sẽ giúp bạn tránh được những nhầm lẫn đáng tiếc.",
      },
      { t: "h2", text: "Danh sách cần kiểm tra" },
      {
        t: "ul",
        items: [
          "Tên cô dâu, chú rể và hai họ viết đúng chính tả",
          "Ngày giờ đúng, ghi rõ dương lịch hay âm lịch",
          "Tên sảnh, địa chỉ và bản đồ đã mở thử được",
          "Ảnh hiển thị rõ trên điện thoại",
          "Nhạc nền không tự phát quá lớn",
          "Nút xác nhận tham dự hoạt động",
          "Link mở được trên cả iPhone và Android",
          "Thông tin liên hệ của gia chủ",
        ],
      },
      {
        t: "tip",
        text: "Nhờ hai người khác nhau đọc lại thiệp. Lỗi chính tả thường dễ bị bỏ sót khi tự kiểm tra.",
      },
    ],
  },
  {
    slug: "thiep-moi-su-kien-cong-ty-can-co-gi",
    title: "Thiệp mời sự kiện công ty cần có những gì?",
    excerpt:
      "Từ lễ kỷ niệm đến hội nghị khách hàng, một thiệp mời rõ ràng giúp tăng tỷ lệ tham dự và giảm số cuộc gọi xác nhận.",
    category: "su-kien",
    date: "2026-09-28",
    readMinutes: 4,
    author: "Đội ngũ iCards",
    tone: { bg: "#EAE8F4", ink: "#4B3F9A" },
    content: [
      {
        t: "p",
        text: "Thiệp mời sự kiện doanh nghiệp cần chuyên nghiệp nhưng vẫn dễ đọc. Khách mời thường chỉ lướt qua trong vài giây, nên thông tin quan trọng phải nằm ở đầu.",
      },
      { t: "h2", text: "Thông tin bắt buộc" },
      {
        t: "ul",
        items: [
          "Tên sự kiện và đơn vị tổ chức",
          "Thời gian, địa điểm, hướng dẫn gửi xe",
          "Chương trình tóm tắt",
          "Dress code (nếu có)",
          "Hạn xác nhận tham dự",
        ],
      },
      { t: "h2", text: "Quản lý khách mời" },
      {
        t: "p",
        text: "Dùng mã QR check-in để đối chiếu danh sách nhanh tại cửa và thống kê số lượng khách thực tế.",
      },
    ],
  },
  {
    slug: "thiep-giay-hay-thiep-online-nen-chon-loai-nao",
    title: "Thiệp giấy hay thiệp online: nên chọn loại nào?",
    excerpt:
      "Mỗi loại có điểm mạnh riêng. Nhiều cặp đôi chọn kết hợp: thiệp online cho số đông, thiệp giấy cho người lớn tuổi.",
    category: "thiep-cuoi",
    date: "2026-09-18",
    readMinutes: 4,
    author: "Đội ngũ iCards",
    tone: { bg: "#F6EEDC", ink: "#7A5A12" },
    content: [
      {
        t: "p",
        text: "Không có lựa chọn đúng cho mọi đám cưới. Điều quan trọng là khách mời nhận được lời mời đúng cách mà họ quen thuộc.",
      },
      { t: "h2", text: "Khi nào nên dùng thiệp giấy" },
      {
        t: "p",
        text: "Với ông bà, cô chú lớn tuổi hoặc những người bạn muốn trao tận tay, thiệp giấy thể hiện sự trân trọng.",
      },
      { t: "h2", text: "Khi nào nên dùng thiệp online" },
      {
        t: "p",
        text: "Thiệp online phù hợp với bạn bè, đồng nghiệp và khách ở xa. Bạn tiết kiệm chi phí, sửa được thông tin và biết ai đã xác nhận.",
      },
      {
        t: "tip",
        text: "Kết hợp cả hai: in số lượng ít cho người thân quan trọng, còn lại gửi thiệp online.",
      },
    ],
  },
  {
    slug: "y-tuong-thiep-moi-sinh-nhat-tan-gia",
    title: "Ý tưởng thiệp mời sinh nhật, tân gia và liên hoan",
    excerpt:
      "Các buổi tiệc nhỏ cũng đáng có một tấm thiệp đẹp. Gợi ý nội dung ngắn gọn, vui và dễ chia sẻ.",
    category: "su-kien",
    date: "2026-09-08",
    readMinutes: 3,
    author: "Đội ngũ iCards",
    tone: { bg: "#F8E9EE", ink: "#A12D55" },
    content: [
      {
        t: "p",
        text: "Với tiệc nhỏ, thiệp nên ngắn, vui và có đủ thông tin để khách đến đúng giờ, đúng nơi.",
      },
      { t: "h2", text: "Nội dung nên có" },
      {
        t: "ul",
        items: [
          "Dịp tổ chức và tên chủ tiệc",
          "Giờ bắt đầu, địa chỉ, cách đi",
          "Lời nhắn ngắn, thân mật",
          "Nút xác nhận để chuẩn bị số lượng",
        ],
      },
    ],
  },
];

/* ---------------- helpers ---------------- */

export function getCategory(slug?: string) {
  return BLOG_CATEGORIES.find((c) => c.slug === slug);
}

export function getPosts(category?: string) {
  const list = category ? POSTS.filter((p) => p.category === category) : POSTS;
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

export function getRelated(post: Post, limit = 3) {
  const same = POSTS.filter((p) => p.slug !== post.slug && p.category === post.category);
  const rest = POSTS.filter((p) => p.slug !== post.slug && p.category !== post.category);
  return [...same, ...rest].slice(0, limit);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}